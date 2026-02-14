"use client";

import { motion } from "framer-motion";

interface EggProps {
  color?: string;
  colorDark?: string;
  size?: number;
  cracked?: boolean;
  className?: string;
}

export default function Egg({
  color = "#D5F5E3",
  colorDark = "#A9DFBF",
  size = 120,
  cracked = false,
  className = "",
}: EggProps) {
  const scale = size / 120;

  if (cracked) {
    return (
      <motion.div
        className={className}
        style={{ width: size, height: size * 1.2 }}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.05, 0] }}
        transition={{ duration: 0.6, times: [0, 0.3, 1] }}
      >
        <svg
          viewBox="0 0 120 144"
          width={120 * scale}
          height={144 * scale}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Left half of cracked egg */}
          <path
            d="M20 85 C20 45 35 10 60 10 L60 75 L45 72 L55 80 L40 85 L50 90 Z"
            fill={color}
            stroke={colorDark}
            strokeWidth="2"
          />
          {/* Right half of cracked egg */}
          <path
            d="M100 85 C100 45 85 10 60 10 L60 75 L75 72 L65 80 L80 85 L70 90 Z"
            fill={color}
            stroke={colorDark}
            strokeWidth="2"
          />
          {/* Bottom shell pieces */}
          <path
            d="M30 88 Q60 130 90 88 L85 95 Q60 125 35 95 Z"
            fill={color}
            stroke={colorDark}
            strokeWidth="2"
          />
        </svg>
      </motion.div>
    );
  }

  return (
    <div className={className} style={{ width: size, height: size * 1.2 }}>
      <svg
        viewBox="0 0 120 144"
        width={120 * scale}
        height={144 * scale}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Egg shape - smooth Easter egg oval, no seam */}
        <ellipse cx="60" cy="72" rx="44" ry="56" fill={color} />
        <ellipse
          cx="60"
          cy="72"
          rx="44"
          ry="56"
          stroke={colorDark}
          strokeWidth="2"
        />
        {/* Shine highlight */}
        <ellipse
          cx="45"
          cy="50"
          rx="12"
          ry="18"
          fill="white"
          opacity="0.35"
          transform="rotate(-15 45 50)"
        />
        {/* Small decorative dots */}
        <circle cx="50" cy="90" r="3" fill={colorDark} opacity="0.3" />
        <circle cx="70" cy="85" r="2.5" fill={colorDark} opacity="0.3" />
        <circle cx="55" cy="55" r="2" fill={colorDark} opacity="0.2" />
      </svg>
    </div>
  );
}
