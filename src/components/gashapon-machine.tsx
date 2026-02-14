"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { themes } from "@/lib/themes";

interface GashaponMachineProps {
  shaking?: boolean;
  onHandleClick?: () => void;
}

const eggColors = Object.values(themes).map((t) => t.eggColor);

export default function GashaponMachine({
  shaking = false,
  onHandleClick,
}: GashaponMachineProps) {
  const [knobTurned, setKnobTurned] = useState(false);

  const handleClick = () => {
    if (knobTurned) return;
    setKnobTurned(true);
    onHandleClick?.();
    setTimeout(() => setKnobTurned(false), 900);
  };

  return (
    <motion.div
      className="relative"
      style={{ width: 240, height: 360 }}
      animate={
        shaking
          ? {
              rotate: [-1.5, 1.5, -1.5, 1, -0.5, 0],
              transition: { duration: 0.6, ease: "easeInOut" },
            }
          : {}
      }
    >
      <svg
        viewBox="0 0 240 360"
        width="240"
        height="360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ====== Machine base/body ====== */}
        <path
          d="M42 175 L42 300 Q42 320 62 320 L178 320 Q198 320 198 300 L198 175 Z"
          fill="#FFF8F0"
          stroke="#E8C9A0"
          strokeWidth="2.5"
        />
        {/* Body inner subtle highlight */}
        <rect
          x="52"
          y="185"
          width="136"
          height="125"
          rx="12"
          fill="#FFFCF8"
          opacity="0.4"
        />

        {/* ====== Glass dome ====== */}
        {/* Dome shape - semicircular globe */}
        <path
          d="M42 175 Q42 38 120 30 Q198 38 198 175 Z"
          fill="#F5F1EC"
          stroke="#E8C9A0"
          strokeWidth="2.5"
        />
        {/* Glass transparency overlay */}
        <path
          d="M48 175 Q48 44 120 36 Q192 44 192 175 Z"
          fill="white"
          opacity="0.15"
        />
        {/* Glass shine streak */}
        <path
          d="M62 140 Q68 72 108 52"
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.5"
        />
        {/* Second smaller shine */}
        <path
          d="M70 110 Q74 85 92 72"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.3"
        />

        {/* ====== Cap on top of dome ====== */}
        <ellipse cx="120" cy="32" rx="28" ry="8" fill="#E8C9A0" stroke="#D4B088" strokeWidth="1.5" />
        <ellipse cx="120" cy="28" rx="20" ry="6" fill="#F0DCC6" />
        {/* Top knob on cap */}
        <ellipse cx="120" cy="24" rx="8" ry="4" fill="#D4B088" />

        {/* ====== Eggs inside the dome ====== */}
        {eggColors.map((color, i) => {
          // Arrange eggs more naturally - scattered in the dome
          const positions = [
            [76, 130], [108, 125], [140, 128], [168, 132],
            [68, 105], [100, 98], [135, 100], [162, 108],
            [88, 78], [120, 72], [150, 80],
          ];
          if (i >= positions.length) return null;
          const [x, y] = positions[i];
          return (
            <ellipse
              key={i}
              cx={x}
              cy={y}
              rx="14"
              ry="17"
              fill={color}
              stroke={color === "#FEF9E7" ? "#E8D88E" : "transparent"}
              strokeWidth="1"
              opacity="0.9"
            />
          );
        })}

        {/* ====== Band between dome and body ====== */}
        <rect x="38" y="172" width="164" height="8" rx="2" fill="#F0A882" />

        {/* ====== Center label ====== */}
        <rect
          x="68"
          y="192"
          width="104"
          height="36"
          rx="10"
          fill="white"
          stroke="#E8C9A0"
          strokeWidth="1.5"
        />
        <text
          x="120"
          y="216"
          textAnchor="middle"
          fontSize="16"
          fill="#C4956A"
          fontWeight="600"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          啾啾小事
        </text>

        {/* ====== Center rotating knob/dial ====== */}
        {/* Outer ring */}
        <circle cx="120" cy="262" r="24" fill="#F5EDE4" stroke="#D4B088" strokeWidth="2" />
        {/* Inner dial face */}
        <circle cx="120" cy="262" r="18" fill="#FFF8F0" stroke="#E8C9A0" strokeWidth="1.5" />
      </svg>

      {/* Animated knob overlay — rotates on click, positioned on top of the SVG knob */}
      <motion.div
        className="absolute cursor-pointer"
        style={{
          left: 96,
          top: 238,
          width: 48,
          height: 48,
        }}
        onClick={handleClick}
        animate={
          knobTurned
            ? { rotate: [0, 90, 180, 270, 360] }
            : { rotate: 0 }
        }
        transition={{ duration: 0.8, ease: "easeInOut" }}
        whileHover={{ scale: 1.08 }}
      >
        <svg viewBox="0 0 48 48" width="48" height="48" fill="none">
          {/* Dial face */}
          <circle cx="24" cy="24" r="18" fill="#FFF8F0" stroke="#E8C9A0" strokeWidth="1.5" />
          {/* Cross mark on dial to show rotation */}
          <line x1="24" y1="10" x2="24" y2="38" stroke="#D4B088" strokeWidth="2" strokeLinecap="round" />
          <line x1="10" y1="24" x2="38" y2="24" stroke="#D4B088" strokeWidth="2" strokeLinecap="round" />
          {/* Center dot */}
          <circle cx="24" cy="24" r="4" fill="#D4896A" />
          {/* Tiny pointer at top to indicate rotation direction */}
          <circle cx="24" cy="11" r="2.5" fill="#F0A882" />
        </svg>
      </motion.div>

      {/* ====== Dispensing slot (below knob, as part of SVG) ====== */}
      <svg
        className="absolute"
        style={{ left: 80, top: 290, width: 80, height: 36 }}
        viewBox="0 0 80 36"
        fill="none"
      >
        <rect x="8" y="0" width="64" height="32" rx="8" fill="#5C4A3A" opacity="0.1" />
        <rect x="16" y="6" width="48" height="20" rx="6" fill="#3D2E22" opacity="0.06" />
      </svg>

      {/* ====== Bottom accent strip & feet (SVG overlay) ====== */}
      <svg
        className="absolute"
        style={{ left: 0, top: 318, width: 240, height: 42 }}
        viewBox="0 0 240 42"
        fill="none"
      >
        <rect x="38" y="0" width="164" height="6" rx="3" fill="#F0A882" />
        <rect x="52" y="8" width="32" height="10" rx="5" fill="#E8C9A0" />
        <rect x="156" y="8" width="32" height="10" rx="5" fill="#E8C9A0" />
      </svg>
    </motion.div>
  );
}
