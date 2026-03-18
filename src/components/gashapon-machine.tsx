"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { themes } from "@/lib/themes";

interface GashaponMachineProps {
  shaking?: boolean;
  onHandleClick?: () => void;
  selectedCategories?: string[];
}

const EGG_POSITIONS = [
  [76, 122], [108, 117], [140, 120], [168, 124],
  [68, 100], [100, 93], [135, 95], [162, 102],
  [88, 74], [120, 68], [150, 76],
];

const SVG_W = 240;
const SVG_H = 280;
const RENDER_W = 280;
const RENDER_H = Math.round((RENDER_W / SVG_W) * SVG_H);

const sx = RENDER_W / SVG_W;
const sy = RENDER_H / SVG_H;

const KNOB_CX = 120;
const KNOB_CY = 206;
const KNOB_R = 24;
const KNOB_SIZE = Math.round(KNOB_R * 2 * sx);

export default function GashaponMachine({
  shaking = false,
  onHandleClick,
  selectedCategories = [],
}: GashaponMachineProps) {
  const [knobTurned, setKnobTurned] = useState(false);

  const eggColors = useMemo(() => {
    const source =
      selectedCategories.length > 0
        ? selectedCategories.map((cat) => themes[cat]).filter(Boolean)
        : Object.values(themes).filter((t) => t.key !== "惊喜");

    const colors: string[] = [];
    for (let i = 0; i < EGG_POSITIONS.length; i++) {
      colors.push(source[i % source.length].eggColor);
    }
    return colors;
  }, [selectedCategories]);

  const handleClick = () => {
    if (knobTurned) return;
    setKnobTurned(true);
    onHandleClick?.();
    setTimeout(() => setKnobTurned(false), 900);
  };

  return (
    <motion.div
      className="relative"
      style={{ width: RENDER_W, height: RENDER_H }}
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
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={RENDER_W}
        height={RENDER_H}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Machine base/body */}
        <path
          d="M42 165 L42 232 Q42 250 62 250 L178 250 Q198 250 198 232 L198 165 Z"
          fill="#FFF8F0"
          stroke="#E8C9A0"
          strokeWidth="2.5"
        />
        <rect
          x="52" y="174" width="136" height="68" rx="12"
          fill="#FFFCF8" opacity="0.4"
        />

        {/* Glass dome */}
        <path
          d="M42 165 Q42 34 120 26 Q198 34 198 165 Z"
          fill="#F5F1EC"
          stroke="#E8C9A0"
          strokeWidth="2.5"
        />
        <path
          d="M48 165 Q48 40 120 32 Q192 40 192 165 Z"
          fill="white" opacity="0.15"
        />
        <path
          d="M62 132 Q68 66 108 48"
          stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.5"
        />
        <path
          d="M70 104 Q74 80 92 68"
          stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.3"
        />

        {/* Cap on top */}
        <ellipse cx="120" cy="28" rx="28" ry="8" fill="#E8C9A0" stroke="#D4B088" strokeWidth="1.5" />
        <ellipse cx="120" cy="24" rx="20" ry="6" fill="#F0DCC6" />
        <ellipse cx="120" cy="20" rx="8" ry="4" fill="#D4B088" />

        {/* Eggs inside dome */}
        {eggColors.map((color, i) => {
          if (i >= EGG_POSITIONS.length) return null;
          const [x, y] = EGG_POSITIONS[i];
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

        {/* Band between dome and body */}
        <rect x="38" y="162" width="164" height="8" rx="2" fill="#F0A882" />

        {/* Knob base (static ring — visible behind the animated overlay) */}
        <circle cx={KNOB_CX} cy={KNOB_CY} r={KNOB_R} fill="#F5EDE4" stroke="#D4B088" strokeWidth="2" />

        {/* Dispensing slot */}
        <rect x="88" y="232" width="64" height="14" rx="7" fill="#5C4A3A" opacity="0.1" />
        <rect x="96" y="235" width="48" height="8" rx="4" fill="#3D2E22" opacity="0.06" />

        {/* Bottom strip */}
        <rect x="38" y="248" width="164" height="6" rx="3" fill="#F0A882" />

        {/* Feet */}
        <rect x="52" y="256" width="32" height="10" rx="5" fill="#E8C9A0" />
        <rect x="156" y="256" width="32" height="10" rx="5" fill="#E8C9A0" />
      </svg>

      {/* Animated knob overlay — position calculated from SVG coordinates */}
      <motion.div
        className="absolute cursor-pointer"
        style={{
          left: Math.round(KNOB_CX * sx - KNOB_SIZE / 2),
          top: Math.round(KNOB_CY * sy - KNOB_SIZE / 2),
          width: KNOB_SIZE,
          height: KNOB_SIZE,
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
        <svg viewBox="0 0 48 48" width={KNOB_SIZE} height={KNOB_SIZE} fill="none">
          <circle cx="24" cy="24" r="18" fill="#FFF8F0" stroke="#E8C9A0" strokeWidth="1.5" />
          <line x1="24" y1="10" x2="24" y2="38" stroke="#D4B088" strokeWidth="2" strokeLinecap="round" />
          <line x1="10" y1="24" x2="38" y2="24" stroke="#D4B088" strokeWidth="2" strokeLinecap="round" />
          <circle cx="24" cy="24" r="4" fill="#D4896A" />
          <circle cx="24" cy="11" r="2.5" fill="#F0A882" />
        </svg>
      </motion.div>
    </motion.div>
  );
}
