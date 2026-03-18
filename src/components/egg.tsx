"use client";

import { motion } from "framer-motion";

interface EggProps {
  color?: string;
  colorDark?: string;
  size?: number;
  cracked?: boolean;
  rainbow?: boolean;
  className?: string;
}

export default function Egg({
  color = "#D5F5E3",
  colorDark = "#A9DFBF",
  size = 120,
  cracked = false,
  rainbow = false,
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
          <path
            d="M20 85 C20 45 35 10 60 10 L60 75 L45 72 L55 80 L40 85 L50 90 Z"
            fill={rainbow ? "url(#rainbowCrack)" : color}
            stroke={rainbow ? "#E8C9A0" : colorDark}
            strokeWidth="2"
          />
          <path
            d="M100 85 C100 45 85 10 60 10 L60 75 L75 72 L65 80 L80 85 L70 90 Z"
            fill={rainbow ? "url(#rainbowCrack)" : color}
            stroke={rainbow ? "#E8C9A0" : colorDark}
            strokeWidth="2"
          />
          <path
            d="M30 88 Q60 130 90 88 L85 95 Q60 125 35 95 Z"
            fill={rainbow ? "url(#rainbowCrack)" : color}
            stroke={rainbow ? "#E8C9A0" : colorDark}
            strokeWidth="2"
          />
          {rainbow && (
            <defs>
              <linearGradient id="rainbowCrack" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF9AA2" />
                <stop offset="25%" stopColor="#FFDAC1" />
                <stop offset="50%" stopColor="#B5EAD7" />
                <stop offset="75%" stopColor="#C7CEEA" />
                <stop offset="100%" stopColor="#E2B0FF" />
              </linearGradient>
            </defs>
          )}
        </svg>
      </motion.div>
    );
  }

  if (rainbow) {
    return (
      <div className={className} style={{ width: size, height: size * 1.2, position: "relative" }}>
        {/* Glow effect behind the egg */}
        <motion.div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: size * 1.3,
            height: size * 1.3,
            marginLeft: -size * 0.65,
            marginTop: -size * 0.65,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,182,193,0.35) 0%, rgba(186,220,255,0.25) 40%, rgba(200,160,255,0.15) 70%, transparent 100%)",
            filter: "blur(8px)",
          }}
          animate={{
            scale: [1, 1.12, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Sparkle particles */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const angle = (i / 6) * Math.PI * 2;
          const r = size * 0.55;
          const x = Math.cos(angle) * r + size / 2;
          const y = Math.sin(angle) * r + (size * 1.2) / 2;
          return (
            <motion.div
              key={i}
              style={{
                position: "absolute",
                left: x - 3,
                top: y - 3,
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: ["#FFD700", "#FF9AA2", "#B5EAD7", "#C7CEEA", "#FFDAC1", "#E2B0FF"][i],
              }}
              animate={{
                scale: [0, 1.2, 0],
                opacity: [0, 0.9, 0],
                y: [0, -8, -16],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.25,
                ease: "easeOut",
              }}
            />
          );
        })}

        <svg
          viewBox="0 0 120 144"
          width={120 * scale}
          height={144 * scale}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: "relative", zIndex: 1 }}
        >
          <defs>
            <linearGradient id="rainbowEgg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF9AA2" />
              <stop offset="20%" stopColor="#FFDAC1" />
              <stop offset="40%" stopColor="#FFFFD8" />
              <stop offset="60%" stopColor="#B5EAD7" />
              <stop offset="80%" stopColor="#C7CEEA" />
              <stop offset="100%" stopColor="#E2B0FF" />
            </linearGradient>
            <linearGradient id="rainbowStroke" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F08080" />
              <stop offset="25%" stopColor="#E8B480" />
              <stop offset="50%" stopColor="#7EC8A0" />
              <stop offset="75%" stopColor="#8EA8D0" />
              <stop offset="100%" stopColor="#C08ADB" />
            </linearGradient>
          </defs>

          {/* Egg shape */}
          <ellipse cx="60" cy="72" rx="44" ry="56" fill="url(#rainbowEgg)" />
          <ellipse cx="60" cy="72" rx="44" ry="56" stroke="url(#rainbowStroke)" strokeWidth="2.5" />

          {/* Shine highlight */}
          <ellipse
            cx="45" cy="50" rx="12" ry="18"
            fill="white" opacity="0.45"
            transform="rotate(-15 45 50)"
          />
          {/* Extra shimmer */}
          <ellipse
            cx="70" cy="60" rx="5" ry="8"
            fill="white" opacity="0.25"
            transform="rotate(10 70 60)"
          />

          {/* Small star decorations */}
          <path d="M72 90 l1.5 3 3.5 0.5 -2.5 2.5 0.5 3.5 -3-1.5 -3 1.5 0.5-3.5 -2.5-2.5 3.5-0.5z" fill="white" opacity="0.5" />
          <path d="M42 80 l1 2 2.5 0.4 -1.8 1.8 0.4 2.5 -2.1-1.1 -2.1 1.1 0.4-2.5 -1.8-1.8 2.5-0.4z" fill="white" opacity="0.4" />
        </svg>
      </div>
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
        <ellipse cx="60" cy="72" rx="44" ry="56" fill={color} />
        <ellipse cx="60" cy="72" rx="44" ry="56" stroke={colorDark} strokeWidth="2" />
        <ellipse
          cx="45" cy="50" rx="12" ry="18"
          fill="white" opacity="0.35"
          transform="rotate(-15 45 50)"
        />
        <circle cx="50" cy="90" r="3" fill={colorDark} opacity="0.3" />
        <circle cx="70" cy="85" r="2.5" fill={colorDark} opacity="0.3" />
        <circle cx="55" cy="55" r="2" fill={colorDark} opacity="0.2" />
      </svg>
    </div>
  );
}
