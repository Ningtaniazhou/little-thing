/** Gesture-unlocked original lullaby and arcade cues, with separate music mixing. */
export class ChirpyAudio {
  private context: AudioContext | null = null;
  private voices = new Set<OscillatorNode>();
  private musicBus: GainNode | null = null;
  private musicVoices = new Set<OscillatorNode>();
  private musicTimer: ReturnType<typeof setInterval> | null = null;
  private nextNote = 0;
  private step = 0;
  private ducked = false;
  enabled = true;

  setDucked(ducked: boolean) {
    this.ducked = ducked;
    if (this.context && this.musicBus) {
      this.musicBus.gain.setTargetAtTime((ducked ? .3 : 2.1) * 1.5, this.context.currentTime, ducked ? .04 : .7);
    }
  }

  private startMusic() {
    const ctx = this.context;
    if (!this.enabled || !ctx || ctx.state !== "running" || this.musicTimer) return;
    this.musicBus ??= ctx.createGain();
    this.musicBus.disconnect();
    this.musicBus.connect(ctx.destination);
    this.musicBus.gain.setValueAtTime(0, ctx.currentTime);
    this.setDucked(this.ducked);
    this.nextNote = ctx.currentTime + .06;
    // Slow Cmaj7 / Am7 / Fmaj7 / G6, with a sparse pentatonic melody.
    const chords = [[48, 55, 59, 64], [45, 52, 55, 60], [41, 48, 52, 57], [43, 50, 55, 59]];
    const melody = [72, null, 76, 79, 76, null, 74, null, 72, null, 69, 72, 76, null, 74, null,
      69, null, 72, 76, 74, null, 72, null, 67, null, 69, 74, 72, null, null, null];
    const schedule = () => {
      if (ctx.state !== "running") return;
      if (this.nextNote < ctx.currentTime) this.nextNote = ctx.currentTime + .06;
      while (this.nextNote < ctx.currentTime + .3) {
        const chord = chords[Math.floor(this.step / 8) % 4];
        this.musicNote(chord[this.step % 4], this.nextNote, 2.1, .009);
        const note = melody[this.step % melody.length];
        if (note !== null) this.musicNote(note, this.nextNote, 1.8, .014);
        this.step++; this.nextNote += .625;
      }
    };
    schedule();
    this.musicTimer = setInterval(schedule, 100);
  }

  private musicNote(midi: number, start: number, duration: number, volume: number) {
    const ctx = this.context!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 440 * 2 ** ((midi - 69) / 12);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume, start + .035);
    gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    osc.connect(gain).connect(this.musicBus!);
    this.musicVoices.add(osc);
    osc.onended = () => { this.musicVoices.delete(osc); osc.disconnect(); gain.disconnect(); };
    osc.start(start); osc.stop(start + duration + .03);
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (enabled) this.unlock(); else this.silence();
  }

  private silence() {
    this.stop();
    if (this.musicTimer) clearInterval(this.musicTimer);
    this.musicTimer = null;
    for (const voice of this.musicVoices) { try { voice.stop(); } catch { /* already stopped */ } }
    this.musicVoices.clear();
  }

  suspend() { this.silence(); void this.context?.suspend(); }
  resume() { if (this.context && this.enabled) this.unlock(); }

  unlock() {
    if (!this.enabled) return;
    this.context ??= new AudioContext();
    void this.context.resume().then(() => this.startMusic()).catch(() => { /* Retry on the next gesture. */ });
  }

  private tone(frequency: number, delay: number, duration: number, type: OscillatorType = "sine", end?: number) {
    const ctx = this.context;
    if (!this.enabled || !ctx || ctx.state !== "running") return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = ctx.currentTime + delay;
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, start);
    if (end) osc.frequency.exponentialRampToValueAtTime(end, start + duration);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(.11, start + .008);
    gain.gain.exponentialRampToValueAtTime(.001, start + duration);
    osc.connect(gain).connect(ctx.destination);
    this.voices.add(osc);
    osc.onended = () => { this.voices.delete(osc); osc.disconnect(); gain.disconnect(); };
    osc.start(start);
    osc.stop(start + duration + .02);
  }

  cue(name: "turn" | "roll" | "land" | "crack" | "chirp") {
    if (name === "turn") [523, 659, 784, 1047].forEach((f, i) => this.tone(f, i * .14, .09, "triangle"));
    if (name === "roll") [180, 145, 110].forEach((f, i) => this.tone(f, i * .12, .1, "triangle", f * .65));
    if (name === "land") this.tone(135, 0, .12, "sine", 65);
    if (name === "crack") { this.tone(740, 0, .035, "triangle", 180); this.tone(1000, .07, .04, "triangle", 220); }
    if (name === "chirp") { this.tone(1550, 0, .13, "sine", 2450); this.tone(2200, .17, .18, "sine", 1350); }
  }

  cheer() {
    this.unlock();
    [0, .32, .66].forEach((delay, i) => this.tone(1500 + i * 180, delay, .18, "sine", 2350 + i * 120));
    [659, 784, 1047].forEach((frequency, i) => this.tone(frequency, .18 + i * .17, .2, "triangle"));
  }

  stop() {
    for (const voice of this.voices) { try { voice.stop(); } catch { /* already stopped */ } }
    this.voices.clear();
  }

  dispose() { this.enabled = false; this.silence(); this.musicBus?.disconnect(); this.musicBus = null; void this.context?.close(); this.context = null; }
}
