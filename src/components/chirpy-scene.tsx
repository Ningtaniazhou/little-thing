"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { ChirpyAudio } from "@/lib/chirpy-audio";
import { CHIRPY_THEMES } from "@/lib/chirpy-themes";
import { animationDelta, createChirpyPlayback } from "@/lib/chirpy-animation";
import { createBirdAccessories } from "@/lib/chirpy-accessories";
import { startBirdCelebration } from "@/lib/chirpy-celebration";

export const DURATION = 8;
export const PHASES = [
  { name: "转动旋钮", hint: "一颗小惊喜，正在路上", start: 0, end: 1.6 },
  { name: "彩蛋滚出", hint: "咕噜——接住这颗彩蛋", start: 1.6, end: 3.1 },
  { name: "轻轻晃动", hint: "嘘，里面好像有动静", start: 3.1, end: 4.1 },
  { name: "破壳探头", hint: "再使一点劲……啾！", start: 4.1, end: 5.7 },
  { name: "啾啾见面", hint: "今天，和我做一件小事吧", start: 5.7, end: 8 },
];

export type SceneHandle = {
  play: (restart?: boolean) => void;
  celebrate: (message: string, host: HTMLElement) => void;
  pause: () => void;
  seek: (time: number) => void;
  reset: () => void;
  sound: (enabled: boolean) => void;
  color: (index: number) => void;
};

type Props = {
  modelUrl: string;
  onReady: (handle: SceneHandle) => void;
  onProgress: (time: number, playing: boolean) => void;
  onTwist: () => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
};

const PALETTE = CHIRPY_THEMES.map(theme => theme.color);

export default function ChirpyScene({ modelUrl, onReady, onProgress, onTwist, soundEnabled, onSoundToggle }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const soundButton = useRef<HTMLButtonElement>(null);
  const callbacks = useRef({ onReady, onProgress, onTwist });
  useEffect(() => { callbacks.current = { onReady, onProgress, onTwist }; }, [onReady, onProgress, onTwist]);
  const [load, setLoad] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let disposed = false;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" }); }
    catch { queueMicrotask(() => setError(true)); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = .93;
    renderer.domElement.setAttribute("aria-label", "可旋转的啾啾扭蛋机三维场景");
    renderer.domElement.setAttribute("role", "img");
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, .1, 100);
    const fullPosition = new THREE.Vector3(0, 4.1, 12.3);
    const fullTarget = new THREE.Vector3(0, 2.6, 0);
    camera.position.copy(fullPosition);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(fullTarget);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.minDistance = 4;
    controls.maxDistance = 17;
    controls.minPolarAngle = .65;
    controls.maxPolarAngle = 1.6;
    controls.minAzimuthAngle = -Math.PI * .7;
    controls.maxAzimuthAngle = Math.PI * .7;
    controls.update();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const env = pmrem.fromScene(room, .04);
    scene.environment = env.texture;
    scene.environmentIntensity = .55;
    room.dispose();
    scene.add(new THREE.HemisphereLight(0xe7f6ff, 0xa77952, .75));
    const sun = new THREE.DirectionalLight(0xffe3b2, 2.1);
    sun.position.set(-3, 8, 5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 8, bottom: -3, near: .1, far: 25 });
    sun.shadow.normalBias = .035;
    sun.shadow.bias = -.0002;
    sun.shadow.radius = 3;
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xbde4ff, .8);
    fill.position.set(5, 4, -3); scene.add(fill);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ opacity: .17 }));
    ground.rotation.x = -Math.PI / 2; ground.position.y = -.03; ground.receiveShadow = true; scene.add(ground);
    const glow = new THREE.PointLight(0xffd375, 0, 2.5, 2);
    glow.position.set(.73, 1.4, 1.8); scene.add(glow);
    const audio = new ChirpyAudio();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let playback: ReturnType<typeof createChirpyPlayback> | undefined;
    let model: THREE.Group | undefined;
    let accessories: ReturnType<typeof createBirdAccessories> | undefined;
    let celebration: ReturnType<typeof startBirdCelebration> | undefined;
    let time = 0;
    let playing = false;
    let cheerTime = -1;
    let previous: number | null = null;
    let lastReport = 0;
    let soundAnchor: THREE.Object3D | undefined;
    const anchorPosition = new THREE.Vector3();
    const anchorNormal = new THREE.Vector3();
    const anchorRotation = new THREE.Quaternion();
    const toCamera = new THREE.Vector3();
    const bulbs: { material: THREE.MeshStandardMaterial; star: boolean; index: number }[] = [];
    const shells = new Set<THREE.MeshStandardMaterial>();
    const cues = [
      { time: .12, name: "turn" as const }, { time: 1.72, name: "roll" as const },
      { time: 2.7, name: "land" as const }, { time: 4.18, name: "crack" as const },
      { time: 5.4, name: "chirp" as const },
    ];

    function report() { callbacks.current.onProgress(time, playing); }
    function applyTime() { playback?.seek(time); }
    const handle: SceneHandle = {
      celebrate(message, host) {
        if (playing || time < DURATION || cheerTime >= 0) return;
        const bird = model?.getObjectByName("Bird_Root");
        if (!bird) return;
        controls.enabled = false;
        celebration = startBirdCelebration(bird, camera, renderer.domElement, host, message, scene.environment, reducedMotion);
        cheerTime = 0; audio.setDucked(true); audio.cheer();
      },
      play(restart = false) {
        if (!playback || playing || cheerTime >= 0) return;
        cheerTime = -1;
        if (restart || time >= DURATION) { time = 0; audio.stop(); playback.reset(); }
        audio.setDucked(true); audio.unlock(); playing = true; previous = null; report();
      },
      pause() { playing = false; audio.setDucked(false); audio.stop(); report(); },
      seek(t) { playing = false; audio.setDucked(false); audio.stop(); time = THREE.MathUtils.clamp(t, 0, DURATION); applyTime(); report(); },
      reset() { celebration?.dispose(); celebration = undefined; cheerTime = -1; controls.enabled = true; playing = false; audio.setDucked(false); audio.stop(); time = 0; playback?.reset(); camera.position.copy(fullPosition); controls.target.copy(fullTarget); report(); },
      sound(enabled) { audio.setEnabled(enabled); },
      color(index) {
        shells.forEach(m => m.color.set(PALETTE[index % PALETTE.length]));
        accessories?.select(index);
      },
    };
    function disposeObject(object: THREE.Object3D) {
      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      object.traverse(o => {
        if (!(o instanceof THREE.Mesh)) return;
        geometries.add(o.geometry);
        (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => materials.add(m));
      });
      geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose());
    }

    new GLTFLoader().load(modelUrl, gltf => {
      if (disposed) { disposeObject(gltf.scene); return; }
      model = gltf.scene;
      const idleBird = model.getObjectByName("Idle_Bird");
      if (idleBird) idleBird.visible = false;
      const originalMaterials = new Set<THREE.Material>();
      model.traverse(o => {
        if (!(o instanceof THREE.Mesh)) return;
        o.castShadow = !o.name.startsWith("Glass_") && !o.name.includes("fleece");
        o.receiveShadow = true;
        if (o.name.startsWith("Glass_")) {
          // Thin clear panes: transparency keeps overlapping eggs legible on mobile.
          originalMaterials.add(o.material as THREE.Material);
          o.material = new THREE.MeshPhysicalMaterial({ color: 0xd7f0f7, roughness: .08, metalness: .05, transparent: true, opacity: .095, depthWrite: false, side: THREE.DoubleSide });
          o.castShadow = false; o.receiveShadow = false;
        }
        if (o.name.startsWith("Bulb_")) {
          o.material = (o.material as THREE.MeshStandardMaterial).clone();
          bulbs.push({ material: o.material as THREE.MeshStandardMaterial, star: o.name.startsWith("Bulb_Star"), index: Number(o.name.match(/\d+$/)?.[0] ?? 0) });
          o.castShadow = false;
        }
        if (o.name.startsWith("Egg_Upper_Shell") || o.name.startsWith("Egg_Lower_Shell") || o.name.startsWith("Shell_Chip")) {
          o.material = (o.material as THREE.MeshStandardMaterial).clone();
          shells.add(o.material as THREE.MeshStandardMaterial);
        }
      });
      originalMaterials.forEach(m => m.dispose());
      const birdBody = model.getObjectByName("Bird_Body_Pivot");
      if (birdBody) accessories = createBirdAccessories(birdBody);
      scene.add(model);
      soundAnchor = model.getObjectByName("Sound_Button_Anchor");
      playback = createChirpyPlayback(model, gltf.animations);
      applyTime();
      setLoad(100);
      callbacks.current.onReady(handle);
      report();
    }, event => {
      if (!disposed && event.total) setLoad(Math.min(95, Math.round(event.loaded / event.total * 95)));
    }, () => { if (!disposed) setError(true); });

    const raycaster = new THREE.Raycaster();
    let down = { x: 0, y: 0 };
    const pointerDown = (e: PointerEvent) => { down = { x: e.clientX, y: e.clientY }; };
    const pointerUp = (e: PointerEvent) => {
      if (!model || playing || cheerTime >= 0 || Math.hypot(e.clientX-down.x, e.clientY-down.y) > 7) return;
      const bounds = renderer.domElement.getBoundingClientRect();
      raycaster.setFromCamera(new THREE.Vector2((e.clientX-bounds.left)/bounds.width*2-1, -(e.clientY-bounds.top)/bounds.height*2+1), camera);
      const hit = raycaster.intersectObject(model, true)[0];
      if (!hit) return;
      let object: THREE.Object3D | null = hit.object;
      while (object) {
        if (object.name === "Knob_Pivot") { callbacks.current.onTwist(); handle.play(true); break; }
        object = object.parent;
      }
    };
    renderer.domElement.addEventListener("pointerdown", pointerDown);
    renderer.domElement.addEventListener("pointerup", pointerUp);
    const resize = () => {
      const { width, height } = el.getBoundingClientRect();
      renderer.setSize(width, height);
      camera.aspect = width / Math.max(height, 1);
      camera.fov = camera.aspect < .72 ? 43 : 34;
      fullTarget.y = camera.aspect < .72 ? 2.15 : 2.6;
      controls.target.copy(fullTarget);
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize); observer.observe(el); resize();
    const onVisibility = () => {
      if (document.hidden) { playing = false; audio.setDucked(false); audio.suspend(); report(); }
      else audio.resume();
      previous = null;
    };
    const unlockAudio = () => audio.unlock();
    document.addEventListener("pointerdown", unlockAudio);
    document.addEventListener("keydown", unlockAudio);
    document.addEventListener("visibilitychange", onVisibility);
    const onContextLost = (event: Event) => { event.preventDefault(); playing = false; audio.setDucked(false); audio.stop(); setError(true); };
    renderer.domElement.addEventListener("webglcontextlost", onContextLost);
    renderer.setAnimationLoop(now => {
      const dt = animationDelta(now, previous); previous = now;
      if (playing && playback) {
        const before = time;
        time = Math.min(DURATION, time + dt);
        for (const cue of cues) if (before < cue.time && time >= cue.time) audio.cue(cue.name);
        applyTime();
        if (time >= DURATION) { playing = false; audio.setDucked(false); report(); }
      }
      if (celebration) {
        celebration.update(dt);
        if (cheerTime < 2.1 && cheerTime + dt >= 2.1) audio.setDucked(false);
        cheerTime += dt;
      }
      const active = time > 0 && time < 5.7;
      bulbs.forEach(({ material, star, index }) => {
        const phase = playing || time > 0 ? time : now / 1000;
        const chase = ((index - Math.floor(phase * 12)) % (star ? 30 : 11) + (star ? 30 : 11)) % (star ? 30 : 11);
        material.emissiveIntensity = active && !reducedMotion ? (chase < 5 ? 4 : .35) : .7 + .25 * Math.sin(phase * 1.4);
      });
      glow.intensity = time > 4.1 && time < 5.7 ? .8 : .08;
      controls.update(); renderer.render(scene, camera);
      if (soundAnchor && soundButton.current) {
        soundAnchor.getWorldPosition(anchorPosition);
        soundAnchor.getWorldQuaternion(anchorRotation);
        // Blender's -Y front is converted to +Z in the exported glTF.
        anchorNormal.set(0, 0, 1).applyQuaternion(anchorRotation);
        toCamera.copy(camera.position).sub(anchorPosition);
        const facing = anchorNormal.dot(toCamera) > 0;
        anchorPosition.project(camera);
        const button = soundButton.current;
        button.style.left = `${(anchorPosition.x * .5 + .5) * el.clientWidth}px`;
        button.style.top = `${(-anchorPosition.y * .5 + .5) * el.clientHeight}px`;
        button.style.visibility = facing && Math.abs(anchorPosition.x) < 1 && Math.abs(anchorPosition.y) < 1 ? "visible" : "hidden";
      }
      if (playing && now-lastReport > 80) { lastReport = now; report(); }
    });

    return () => {
      disposed = true; observer.disconnect(); renderer.setAnimationLoop(null); audio.dispose(); controls.dispose();
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("pointerdown", unlockAudio);
      document.removeEventListener("keydown", unlockAudio);
      renderer.domElement.removeEventListener("pointerdown", pointerDown);
      renderer.domElement.removeEventListener("pointerup", pointerUp);
      renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
      celebration?.dispose(); playback?.dispose();
      disposeObject(scene); env.dispose(); pmrem.dispose(); renderer.dispose(); renderer.domElement.remove();
    };
  }, [modelUrl]);

  return <div ref={host} className="chirpy-canvas">
    <button ref={soundButton} className="star-sound" disabled={load < 100 || error} aria-label={soundEnabled ? "关闭音乐和音效" : "开启音乐和音效"} aria-pressed={soundEnabled} onClick={onSoundToggle}>
      <span className="star-sound-disc"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 17V6l11-2v11M9 9l11-2" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/><ellipse cx="6" cy="18" rx="3.5" ry="2.6" fill="currentColor"/><ellipse cx="17" cy="16" rx="3.5" ry="2.6" fill="currentColor"/>{!soundEnabled && <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round"/>}</svg></span>
    </button>
    {load < 100 && !error && <div className="scene-loading" role="status"><span className="loading-star">✦</span><p>正在唤醒小鸟…</p><small>{load}%</small></div>}
    {error && <div className="scene-loading" role="alert"><p>这次没能打开三维场景</p><button onClick={() => window.location.reload()}>重新加载</button><a href="../">回到啾啾小事</a></div>}
  </div>;
}
