"use client";

import { motion } from "framer-motion";

interface FatBirdProps {
  size?: number;
  accent?: string;
  accessory?: string;
  className?: string;
  animate?: "idle" | "hatch" | "happy" | "none";
}

export default function FatBird({
  size = 160,
  accent = "#58B075",
  accessory = "leaf",
  className = "",
  animate = "none",
}: FatBirdProps) {
  const scale = size / 200;

  const idleAnimation =
    animate === "idle"
      ? {
          rotate: [-2, 2, -2],
          transition: { duration: 2, repeat: Infinity, ease: "easeInOut" as const },
        }
      : animate === "happy"
        ? {
            y: [0, -12, 0],
            rotate: [-3, 3, -3],
            transition: {
              duration: 0.5,
              repeat: 3,
              ease: "easeInOut" as const,
            },
          }
        : {};

  // Mochi/dumpling body path: narrow top, wide bottom, slightly flat at the base
  // Like a soft rice ball sitting down — top is rounded, sides bulge out, bottom is gently flattened
  const mochiBody =
    "M100 32 " +
    "C62 32 30 62 28 100 " + // left side curves out
    "C26 130 42 158 65 166 " + // left bottom bulge
    "Q82 172 100 172 " + // flat-ish bottom center
    "Q118 172 135 166 " + // right bottom
    "C158 158 174 130 172 100 " + // right side
    "C170 62 138 32 100 32Z"; // top curves back

  // Generate fluffy bumps along the mochi body path
  // We create an outer bumpy path by sampling points on the body and adding tiny outward bumps
  const fluffyMochiPath = () => {
    const cx = 100, cyTop = 32, cyBot = 172;
    const points = 40;
    const bumpSize = 3.5;
    let path = "";

    for (let i = 0; i <= points; i++) {
      const t = i / points;
      const angle = t * Math.PI * 2 - Math.PI / 2;

      // Parametric mochi shape: wider at bottom
      const topBias = Math.sin(angle) < 0 ? 0.85 : 1.0; // narrower at top
      const rxBase = 72 * topBias;
      const ryBase = 70;
      const cyCenter = (cyTop + cyBot) / 2;

      const x = cx + rxBase * Math.cos(angle);
      const y = cyCenter + ryBase * Math.sin(angle);

      if (i === 0) {
        path += `M${x.toFixed(1)} ${y.toFixed(1)}`;
      } else {
        const prevT = (i - 1) / points;
        const prevAngle = prevT * Math.PI * 2 - Math.PI / 2;
        const midAngle = (angle + prevAngle) / 2;

        const midTopBias = Math.sin(midAngle) < 0 ? 0.85 : 1.0;
        const midRx = (72 * midTopBias) + bumpSize;
        const midRy = ryBase + bumpSize;

        const bx = cx + midRx * Math.cos(midAngle);
        const by = cyCenter + midRy * Math.sin(midAngle);
        path += ` Q${bx.toFixed(1)} ${by.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
      }
    }
    path += "Z";
    return path;
  };

  // Face center Y position — shifted up from body center for mochi look
  const faceY = 88;

  return (
    <motion.div
      className={className}
      style={{ width: size, height: size * 1.15 }}
      animate={idleAnimation}
    >
      <svg
        viewBox="0 0 200 230"
        width={200 * scale}
        height={230 * scale}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="bodyGrad" cx="45%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFFDF8" />
            <stop offset="60%" stopColor="#FFF5EA" />
            <stop offset="100%" stopColor="#F5EADB" />
          </radialGradient>
          <filter id="fluffShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
            <feOffset dx="0" dy="2" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.08" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ====== Body — mochi/dumpling shape ====== */}
        {/* Smooth base fill */}
        <path d={mochiBody} fill="url(#bodyGrad)" />
        {/* Fluffy bumpy outline */}
        <path
          d={fluffyMochiPath()}
          fill="url(#bodyGrad)"
          stroke="#D4C8B8"
          strokeWidth="1.8"
        />

        {/* Belly warmth — lower and wider for mochi shape */}
        <ellipse cx="100" cy="138" rx="35" ry="24" fill="#FFF0E0" opacity="0.3" />

        {/* ====== Fluff texture lines ====== */}
        {/* Top */}
        <path d="M82 46 Q85 42 89 46" stroke="#E8DDD0" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        <path d="M108 44 Q112 40 115 45" stroke="#E8DDD0" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        {/* Left side */}
        <path d="M40 80 Q44 76 47 81" stroke="#E8DDD0" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        <path d="M34 110 Q38 106 41 111" stroke="#E8DDD0" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        <path d="M40 138 Q43 134 47 139" stroke="#E8DDD0" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        {/* Right side */}
        <path d="M155 78 Q158 74 161 79" stroke="#E8DDD0" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        <path d="M160 108 Q163 104 166 109" stroke="#E8DDD0" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        <path d="M155 140 Q158 136 161 141" stroke="#E8DDD0" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        {/* Bottom */}
        <path d="M78 162 Q81 158 85 163" stroke="#E8DDD0" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        <path d="M115 164 Q118 160 122 165" stroke="#E8DDD0" strokeWidth="1.2" strokeLinecap="round" fill="none" />

        {/* ====== Wings — fluffy, feathery ====== */}
        <g filter="url(#fluffShadow)">
          <path
            d="M32 82 Q20 90 22 102 Q24 114 36 116 Q31 110 32 102 Q33 93 40 88"
            fill="#FFF5EA"
            stroke="#D4C8B8"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M26 94 Q30 97 28 103" stroke="#E8DDD0" strokeWidth="1" strokeLinecap="round" fill="none" />
          <path d="M30 89 Q34 92 32 98" stroke="#E8DDD0" strokeWidth="1" strokeLinecap="round" fill="none" />
        </g>
        <g filter="url(#fluffShadow)">
          <path
            d="M168 82 Q180 90 178 102 Q176 114 164 116 Q169 110 168 102 Q167 93 160 88"
            fill="#FFF5EA"
            stroke="#D4C8B8"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M174 94 Q170 97 172 103" stroke="#E8DDD0" strokeWidth="1" strokeLinecap="round" fill="none" />
          <path d="M170 89 Q166 92 168 98" stroke="#E8DDD0" strokeWidth="1" strokeLinecap="round" fill="none" />
        </g>

        {/* ====== Tail feathers — small tuft at back-top ====== */}
        <path d="M128 40 Q136 26 133 38" stroke="#D4C8B8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M124 43 Q130 28 128 40" stroke="#D4C8B8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M132 43 Q140 30 136 42" stroke="#D4C8B8" strokeWidth="1.2" strokeLinecap="round" fill="none" />

        {/* ====== Cheek blush ====== */}
        <ellipse cx="68" cy={faceY + 12} rx="10" ry="7" fill="#FFD4C4" opacity="0.3" />
        <ellipse cx="132" cy={faceY + 12} rx="10" ry="7" fill="#FFD4C4" opacity="0.3" />

        {/* ====== Eyes — positioned in upper part of body ====== */}
        <circle cx="82" cy={faceY} r="5" fill="#2B2B2B" />
        <circle cx="118" cy={faceY} r="5" fill="#2B2B2B" />
        <circle cx="84" cy={faceY - 2} r="2" fill="#FFFFFF" />
        <circle cx="120" cy={faceY - 2} r="2" fill="#FFFFFF" />

        {/* ====== Beak — small, just below eyes ====== */}
        <path
          d={`M94 ${faceY + 12} L100 ${faceY + 21} L106 ${faceY + 12} Z`}
          fill="#A0B4BF"
          stroke="#8FA3AE"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* ====== Legs with split toes ====== */}
        <line x1="82" y1="170" x2="82" y2="200" stroke="#A0B4BF" strokeWidth="3" strokeLinecap="round" />
        <line x1="82" y1="200" x2="72" y2="212" stroke="#A0B4BF" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="82" y1="200" x2="90" y2="212" stroke="#A0B4BF" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="82" y1="202" x2="78" y2="208" stroke="#A0B4BF" strokeWidth="2" strokeLinecap="round" />

        <line x1="118" y1="170" x2="118" y2="200" stroke="#A0B4BF" strokeWidth="3" strokeLinecap="round" />
        <line x1="118" y1="200" x2="110" y2="212" stroke="#A0B4BF" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="118" y1="200" x2="128" y2="212" stroke="#A0B4BF" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="118" y1="202" x2="122" y2="208" stroke="#A0B4BF" strokeWidth="2" strokeLinecap="round" />

        {/* ====== Accessories ====== */}
        {accessory === "scarf" && (
          <g>
            <path d="M40 108 Q100 128 160 108" stroke={accent} strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d="M145 108 L155 128 L148 126" fill={accent} opacity="0.8" />
          </g>
        )}

        {accessory === "beret" && (
          <g>
            <ellipse cx="100" cy="36" rx="34" ry="13" fill={accent} />
            <circle cx="100" cy="26" r="4.5" fill={accent} opacity="0.7" />
          </g>
        )}

        {accessory === "bowtie" && (
          <g>
            <path d={`M88 ${faceY + 26} L80 ${faceY + 18} L80 ${faceY + 34} Z`} fill={accent} opacity="0.9" />
            <path d={`M112 ${faceY + 26} L120 ${faceY + 18} L120 ${faceY + 34} Z`} fill={accent} opacity="0.9" />
            <circle cx="100" cy={faceY + 26} r="4" fill={accent} />
          </g>
        )}

        {accessory === "headphones" && (
          <g>
            <path d={`M38 ${faceY - 5} Q38 ${faceY - 48} 100 ${faceY - 52} Q162 ${faceY - 48} 162 ${faceY - 5}`} stroke={accent} strokeWidth="5" fill="none" strokeLinecap="round" />
            <rect x="28" y={faceY - 12} width="16" height="22" rx="8" fill={accent} />
            <rect x="156" y={faceY - 12} width="16" height="22" rx="8" fill={accent} />
          </g>
        )}

        {accessory === "leaf" && (
          <g>
            <path d="M100 34 Q108 16 118 27 Q112 38 100 34" fill={accent} opacity="0.85" />
            <path d="M100 34 Q110 20 115 28" stroke={accent} strokeWidth="1" fill="none" opacity="0.5" />
            <line x1="100" y1="34" x2="100" y2="38" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
          </g>
        )}

        {accessory === "star" && (
          <g>
            <path
              d="M100 16 L103 26 L112 26 L105 31 L108 40 L100 35 L92 40 L95 31 L88 26 L97 26 Z"
              fill={accent}
              opacity="0.9"
            />
          </g>
        )}

        {accessory === "apron" && (
          <g>
            <path d="M68 120 Q100 112 132 120 L128 160 Q100 166 72 160 Z" fill={accent} opacity="0.25" stroke={accent} strokeWidth="2" />
            <rect x="88" y="128" width="24" height="18" rx="4" fill={accent} opacity="0.3" stroke={accent} strokeWidth="1.5" />
          </g>
        )}

        {accessory === "heart" && (
          <g>
            <path
              d={`M100 ${faceY + 28} C95 ${faceY + 18} 80 ${faceY + 16} 80 ${faceY + 26} C80 ${faceY + 36} 100 ${faceY + 48} 100 ${faceY + 48} C100 ${faceY + 48} 120 ${faceY + 36} 120 ${faceY + 26} C120 ${faceY + 16} 105 ${faceY + 18} 100 ${faceY + 28} Z`}
              fill={accent}
              opacity="0.65"
            />
          </g>
        )}

        {accessory === "glasses" && (
          <g>
            <circle cx="80" cy={faceY} r="14" fill="none" stroke={accent} strokeWidth="2.5" />
            <circle cx="120" cy={faceY} r="14" fill="none" stroke={accent} strokeWidth="2.5" />
            <line x1="94" y1={faceY} x2="106" y2={faceY} stroke={accent} strokeWidth="2" />
            <line x1="66" y1={faceY - 2} x2="55" y2={faceY - 6} stroke={accent} strokeWidth="2" strokeLinecap="round" />
            <line x1="134" y1={faceY - 2} x2="145" y2={faceY - 6} stroke={accent} strokeWidth="2" strokeLinecap="round" />
          </g>
        )}

        {accessory === "wings-glow" && (
          <g>
            <ellipse cx="32" cy="98" rx="20" ry="14" fill={accent} opacity="0.2" transform="rotate(-10 32 98)" />
            <ellipse cx="168" cy="98" rx="20" ry="14" fill={accent} opacity="0.2" transform="rotate(10 168 98)" />
          </g>
        )}
      </svg>
    </motion.div>
  );
}
