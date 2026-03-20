"use client";

import { useEffect, useRef, useState } from "react";

/** 先试站点根（本地 build:static），再试 GitHub Pages 子路径 */
const TRACK_PATHS = [
  "/audio/smooth-calm-inspiring-acoustic-ukulele-background-117288.mp3",
  "audio/smooth-calm-inspiring-acoustic-ukulele-background-117288.mp3",
  "./audio/smooth-calm-inspiring-acoustic-ukulele-background-117288.mp3",
  "/little-thing/audio/smooth-calm-inspiring-acoustic-ukulele-background-117288.mp3",
];

export default function BackgroundMusic() {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioReady, setAudioReady] = useState(true);
  const pathIndexRef = useRef(0);

  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0.28;
    audioRef.current = audio;

    const applyPath = (idx: number) => {
      if (idx >= TRACK_PATHS.length) {
        setAudioReady(false);
        return;
      }
      pathIndexRef.current = idx;
      audio.src = TRACK_PATHS[idx];
      audio.load();
    };

    const onError = () => {
      applyPath(pathIndexRef.current + 1);
    };
    const onCanPlay = () => {
      setAudioReady(true);
    };

    audio.addEventListener("error", onError);
    audio.addEventListener("canplay", onCanPlay);
    applyPath(0);

    return () => {
      audio.pause();
      audio.src = "";
      audio.removeEventListener("error", onError);
      audio.removeEventListener("canplay", onCanPlay);
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      void audio.play().catch(() => {
        setPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [playing]);

  return (
    <div className="mt-2 flex flex-col items-center gap-1">
      <button
        onClick={() => setPlaying((v) => !v)}
        className="rounded-full border border-[#EEDFC9] bg-[#FFF9F0] px-3 py-1 text-xs text-[#9A8E7E] transition-colors hover:bg-[#FFF1DD]"
        type="button"
      >
        {playing ? "🎵 背景音乐：开" : "🎵 背景音乐：关"}
      </button>
      {!audioReady && (
        <p className="text-[10px] text-[#B0A494]">
          音乐加载失败，请刷新页面后重试
        </p>
      )}
    </div>
  );
}
