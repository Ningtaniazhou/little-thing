"use client";

import { useEffect, useRef, useState } from "react";

const TRACK_URL =
  "audio/smooth-calm-inspiring-acoustic-ukulele-background-117288.mp3";

export default function BackgroundMusic() {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioReady, setAudioReady] = useState(true);

  useEffect(() => {
    const audio = new Audio(TRACK_URL);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0.28;
    audioRef.current = audio;

    const onError = () => setAudioReady(false);
    audio.addEventListener("error", onError);

    return () => {
      audio.pause();
      audio.src = "";
      audio.removeEventListener("error", onError);
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
          未找到音乐文件，请把选中曲目放到 `public/audio/` 目录
        </p>
      )}
    </div>
  );
}
