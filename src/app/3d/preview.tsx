"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { DURATION, PHASES, type SceneHandle } from "@/components/chirpy-scene";
import { CHIRPY_THEMES, drawChirpyTask } from "@/lib/chirpy-themes";
import { getRandomFeedback } from "@/lib/chirpy-feedback";
import type { Task } from "@/lib/llm/types";
import "./preview.css";

const Scene = dynamic(() => import("@/components/chirpy-scene"), { ssr: false });

export default function ChirpyPreview({ modelUrl }: { modelUrl: string }) {
  const main = useRef<HTMLElement>(null);
  const message = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const card = message.current;
    if (!card) return;
    const observer = new ResizeObserver(() => {
      main.current?.style.setProperty("--message-height", `${card.getBoundingClientRect().height}px`);
    });
    observer.observe(card);
    return () => observer.disconnect();
  }, []);
  const dialog = useRef<HTMLDialogElement>(null);
  const celebrationHost = useRef<HTMLDivElement>(null);
  const celebrationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const [liked, setLiked] = useState(false);
  const [feedback, setFeedback] = useState("");
  useEffect(() => () => { if (celebrationTimer.current) clearTimeout(celebrationTimer.current); }, []);
  const goDoIt = () => {
    if (celebrating) return;
    setCelebrating(true);
    setLiked(false);
    const words = getRandomFeedback();
    setFeedback(words);
    window.scrollTo({top:0,behavior:"instant"});
    dialog.current?.showModal();
    if (celebrationHost.current) scene.current?.celebrate(words, celebrationHost.current);
  };
  const scene = useRef<SceneHandle | null>(null);
  const [ready, setReady] = useState(false);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [sound, setSound] = useState(true);
  const [themeKey, setThemeKey] = useState<string | null>(null);
  const [task, setTask] = useState<Task | null>(null);
  const onReady = useCallback((handle: SceneHandle) => { scene.current = handle; setReady(true); }, []);
  const onProgress = useCallback((t: number, p: boolean) => { setTime(t); setPlaying(p); }, []);
  const phase = PHASES.findIndex((p, i) => time >= p.start && (time < p.end || i === 4));
  const revealed = time >= 5.7 && task !== null;
  const prepareTwist = useCallback(() => {
    const draw = drawChirpyTask(themeKey);
    setTask(draw.task);
    scene.current?.color(draw.colorIndex);
  }, [themeKey]);
  const start = () => {
    if (playing) return;
    if (time >= DURATION || time === 0) prepareTwist();
    scene.current?.play(time >= DURATION);
  };
  const closeCelebration = () => {
    if (celebrationTimer.current) clearTimeout(celebrationTimer.current);
    setCelebrating(false);
    setLiked(false);
    setTask(null);
    scene.current?.reset();
  };
  const likeCelebration = () => {
    if (liked) return;
    setLiked(true);
    celebrationTimer.current = setTimeout(() => dialog.current?.close(), 700);
  };
  const toggleSound = useCallback(() => {
    const next = !sound;
    setSound(next);
    scene.current?.sound(next);
  }, [sound]);

  return <main ref={main} className="chirpy-preview">
    <div className="chirpy-layout">
      <section className="chirpy-machine-area" aria-label="啾啾扭蛋机">
        <div className="chirpy-stage">
          <Scene modelUrl={modelUrl} onReady={onReady} onProgress={onProgress} onTwist={prepareTwist} soundEnabled={sound} onSoundToggle={toggleSound} />
        </div>
        <div className="stage-actions">
        {revealed && <button className="stage-twist stage-done" disabled={playing || celebrating} onClick={goDoIt}>我去做了 <span aria-hidden="true">✓</span></button>}
        <button className="stage-twist" disabled={!ready || playing || celebrating} onClick={start} aria-busy={playing}>
          <span aria-hidden="true" className={playing ? "turning" : ""}>↻</span>
          {!ready ? "准备中…" : playing ? "扭蛋中…" : time >= DURATION ? "再扭一颗" : time > 0 ? "继续" : "扭一下"}
        </button>
        </div>
      </section>
      <aside className="chirpy-panel">
        <h1>一颗彩蛋 · 一件小事</h1>
        <div ref={message} className={`chirpy-message ${revealed ? "is-revealed" : ""}`} aria-live="polite" aria-atomic="true">
          {revealed ? <><span className="message-label">{task.category}</span><p>{task.text}</p><small>{task.soft}</small></> : <><p>{time > 0 ? PHASES[phase].hint : "今天会遇见什么颜色的惊喜呢？"}</p>{time === 0 && <small>每颗蛋里，都藏着一个小小的开始。</small>}</>}
        </div>
        <fieldset className="theme-selector" disabled={!ready || playing}>
          <legend>想做点什么？</legend>
          <div className="theme-options">
            <button className="theme-option random-theme" type="button" aria-pressed={themeKey === null} onClick={() => setThemeKey(null)}>
              <span className="theme-egg" aria-hidden="true">✦</span>
              <span><strong>随便扭扭</strong><small>所有主题</small></span>
              <span className="theme-check" aria-hidden="true">✓</span>
            </button>
            {CHIRPY_THEMES.map((theme, i) => <button key={theme.key} type="button" className={`theme-option theme-${i}`} aria-pressed={themeKey === theme.key} onClick={() => setThemeKey(theme.key)}>
              <span className="theme-egg" style={{ backgroundColor: theme.color }} aria-hidden="true">✦</span>
              <span><strong>{theme.label}</strong><small>{theme.categories.map((category, index) => <span className="theme-category" key={category}>{index > 0 ? " · " : ""}{category}</span>)}</small></span>
              <span className="theme-check" aria-hidden="true">✓</span>
            </button>)}
          </div>
        </fieldset>
      </aside>
    </div>
    <dialog ref={dialog} className="cheer-dialog cheer-flight" aria-labelledby="cheer-title" onClose={closeCelebration}>
      <div ref={celebrationHost} className="cheer-flight-scene" />
        <button className="cheer-close" aria-label="关闭鼓励弹窗" onClick={() => dialog.current?.close()}>×</button>
        <h2 id="cheer-title" className="sr-only">{feedback}</h2>

        <button className={`cheer-like ${liked ? "is-liked" : ""}`} aria-label={liked ? "已点赞" : "点赞"} aria-pressed={liked} disabled={liked} onClick={likeCelebration}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 10v11H4V10h4Zm0 1 5-8c2-1 3 1 2.5 3L15 9h4a2 2 0 0 1 2 2l-1.4 8a2 2 0 0 1-2 2H8" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
          <span className="like-burst" aria-hidden="true">✦</span>
        </button>
    </dialog>
  </main>;
}
