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
        <defs>
          <linearGradient id="machineBody" x1="42" y1="165" x2="198" y2="250" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFF8F0" />
            <stop offset="100%" stopColor="#F2E0CC" />
          </linearGradient>
          <linearGradient id="glassTint" x1="42" y1="30" x2="198" y2="165" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.62" />
            <stop offset="100%" stopColor="#EAE7F7" stopOpacity="0.32" />
          </linearGradient>
          <linearGradient id="trimMetal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F8BA95" />
            <stop offset="100%" stopColor="#D88764" />
          </linearGradient>
          <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="160%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#8E6C50" floodOpacity="0.2" />
          </filter>
        </defs>

        <ellipse cx="120" cy="268" rx="86" ry="10" fill="#523925" opacity="0.1" />

        {/* Machine base/body */}
        <path
          d="M42 165 L42 232 Q42 250 62 250 L178 250 Q198 250 198 232 L198 165 Z"
          fill="url(#machineBody)"
          stroke="#D9B289"
          strokeWidth="3"
          filter="url(#dropShadow)"
        />
        <rect
          x="50" y="174" width="140" height="70" rx="14"
          fill="#FFFDF9" opacity="0.5"
        />

        {/* Glass dome */}
        <path
          d="M42 165 Q42 34 120 26 Q198 34 198 165 Z"
          fill="url(#glassTint)"
          stroke="#D9B289"
          strokeWidth="3"
        />
        <path
          d="M48 165 Q48 40 120 32 Q192 40 192 165 Z"
          fill="white" opacity="0.2"
        />
        <path
          d="M58 144 Q64 68 108 46"
          stroke="white" strokeWidth="7" strokeLinecap="round" opacity="0.42"
        />
        <path
          d="M68 110 Q75 76 95 62"
          stroke="white" strokeWidth="3.8" strokeLinecap="round" opacity="0.32"
        />

        {/* Cap on top */}
        <ellipse cx="120" cy="28" rx="30" ry="9" fill="#EAC9A3" stroke="#D0A077" strokeWidth="1.8" />
        <ellipse cx="120" cy="23.5" rx="22" ry="6.5" fill="#F5DFC6" />
        <ellipse cx="120" cy="19.5" rx="8.5" ry="4.5" fill="#CA9568" />

        {/* Eggs inside dome */}
        {eggColors.map((color, i) => {
          if (i >= EGG_POSITIONS.length) return null;
          const [x, y] = EGG_POSITIONS[i];
          return (
            <ellipse
              key={i}
              cx={x}
              cy={y}
              rx="14.5"
              ry="17.5"
              fill={color}
              stroke={color === "#FEF9E7" ? "#E8D88E" : "#FFFFFF"}
              strokeOpacity={color === "#FEF9E7" ? 1 : 0.2}
              strokeWidth="1.2"
              opacity="0.96"
            />
          );
        })}

        {/* Band between dome and body */}
        <rect x="36" y="161" width="168" height="10" rx="3" fill="url(#trimMetal)" />

        {/* Knob base (static ring — visible behind the animated overlay) */}
        <circle cx={KNOB_CX} cy={KNOB_CY} r={KNOB_R + 4} fill="#EBD8C6" opacity="0.6" />
        <circle cx={KNOB_CX} cy={KNOB_CY} r={KNOB_R} fill="#FDF5EB" stroke="#CF9F75" strokeWidth="2.5" />

        {/* 投币口（旋钮左侧）：略向左，与机身奶油色 + 棕描边一致 */}
        <g filter="url(#dropShadow)">
          <rect
            x="64"
            y="189"
            width="24"
            height="36"
            rx="7"
            fill="#FFF9F3"
            stroke="#D9B289"
            strokeWidth="2"
          />
          <rect x="68" y="193" width="16" height="28" rx="5" fill="#F2E6DA" opacity="0.85" />
          {/* 投币竖缝 */}
          <rect x="76.5" y="198" width="3.2" height="18" rx="1.2" fill="#2C2119" opacity="0.88" />
          <line x1="78.1" y1="199.5" x2="78.1" y2="214" stroke="#5C4A3E" strokeWidth="0.6" opacity="0.35" />
          <rect x="75.8" y="197.2" width="4.8" height="3" rx="1" fill="#CF9F75" opacity="0.35" />
        </g>

        {/* 出货口（旋钮右侧）：约 1:1 比例拱形，够一颗蛋通过 */}
        <g filter="url(#dropShadow)">
          {/* 外框：圆角 + 上半拱，整体接近正方形 */}
          <path
            d="M 150 220 L 150 201 Q 158 190 166 190 Q 174 190 182 201 L 182 220 Z"
            fill="#FDF5EB"
            stroke="#CF9F75"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path
            d="M 153 217 L 153 203 Q 159 194 166 194 Q 173 194 179 203 L 179 217 Z"
            fill="#E8D4C4"
            opacity="0.45"
          />
          {/* 内腔（深色洞口） */}
          <path
            d="M 155 216 L 155 204 Q 160 197 166 197 Q 172 197 177 204 L 177 216 Z"
            fill="#1A1210"
            opacity="0.42"
          />
          <path
            d="M 156.5 214 L 156.5 205 Q 160 200 166 200 Q 172 200 175.5 205 L 175.5 214 Z"
            fill="#3D2E26"
            opacity="0.55"
          />
          {/* 上沿高光 */}
          <path
            d="M 154 200 Q 166 192 178 200"
            stroke="#FFFFFF"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.22"
          />
        </g>

        {/* Bottom strip */}
        <rect x="36" y="248" width="168" height="7" rx="3.5" fill="url(#trimMetal)" />

        {/* Feet */}
        <rect x="52" y="256" width="32" height="10" rx="5" fill="#DFC09B" />
        <rect x="156" y="256" width="32" height="10" rx="5" fill="#DFC09B" />
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
