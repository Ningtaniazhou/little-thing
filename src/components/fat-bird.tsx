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
  const vbX = 18;
  const vbW = 200 - vbX;
  const vbH = 230;
  const scale = size / vbW;

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
      style={{ width: size, height: Math.round(vbH * scale) }}
      animate={idleAnimation}
    >
      <svg
        viewBox={`${vbX} 0 ${vbW} ${vbH}`}
        width={size}
        height={Math.round(vbH * scale)}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="bodyGrad" cx="40%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#FFFDFB" />
            <stop offset="58%" stopColor="#FDF1E1" />
            <stop offset="100%" stopColor="#EFD9BF" />
          </radialGradient>
          <radialGradient id="bellyGrad" cx="50%" cy="36%" r="70%">
            <stop offset="0%" stopColor="#FFF9EC" />
            <stop offset="100%" stopColor="#F0DDC6" />
          </radialGradient>
          <filter id="fluffShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2.4" />
            <feOffset dx="0" dy="2" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.15" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.2" />
          </filter>
        </defs>

        {/* Ground shadow */}
        <ellipse cx="100" cy="178" rx="60" ry="12" fill="#2E2116" opacity="0.08" filter="url(#softBlur)" />

        {/* Body */}
        <path d={mochiBody} fill="url(#bodyGrad)" />
        <path
          d={fluffyMochiPath()}
          fill="url(#bodyGrad)"
          stroke="#CBB499"
          strokeWidth="2.2"
        />
        <ellipse cx="98" cy="136" rx="36" ry="24" fill="url(#bellyGrad)" opacity="0.95" />

        {/* Volume highlights */}
        <ellipse cx="76" cy="82" rx="28" ry="38" fill="white" opacity="0.16" transform="rotate(-16 76 82)" />
        <ellipse cx="128" cy="132" rx="20" ry="26" fill="#EED7BF" opacity="0.35" transform="rotate(24 128 132)" />

        {/* Tiny feather details */}
        <path d="M80 50 Q85 44 91 49" stroke="#E7D6C4" strokeWidth="1.4" strokeLinecap="round" fill="none" />
        <path d="M107 48 Q112 42 118 47" stroke="#E7D6C4" strokeWidth="1.4" strokeLinecap="round" fill="none" />
        <path d="M44 110 Q48 106 52 111" stroke="#E7D6C4" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        <path d="M148 112 Q152 108 156 113" stroke="#E7D6C4" strokeWidth="1.2" strokeLinecap="round" fill="none" />

        {/* Wings */}
        <g filter="url(#fluffShadow)">
          <path
            d="M36 90 Q18 100 24 120 Q30 136 50 132 Q42 122 42 110 Q42 98 50 92"
            fill="#FAEEDC"
            stroke="#CCB79E"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M31 108 Q38 111 36 120" stroke="#E7D6C4" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        </g>
        <g filter="url(#fluffShadow)">
          <path
            d="M164 90 Q182 100 176 120 Q170 136 150 132 Q158 122 158 110 Q158 98 150 92"
            fill="#FAEEDC"
            stroke="#CCB79E"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M169 108 Q162 111 164 120" stroke="#E7D6C4" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        </g>

        {/* Tail tuft */}
        <path d="M124 40 Q132 22 130 38" stroke="#CBB499" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M130 42 Q142 26 136 43" stroke="#CBB499" strokeWidth="1.7" strokeLinecap="round" fill="none" />
        <path d="M118 43 Q126 28 123 42" stroke="#CBB499" strokeWidth="1.5" strokeLinecap="round" fill="none" />

        {/* Cheeks */}
        <ellipse cx="66" cy={faceY + 12} rx="11" ry="8" fill="#F9B6A8" opacity="0.34" />
        <ellipse cx="134" cy={faceY + 12} rx="11" ry="8" fill="#F9B6A8" opacity="0.34" />

        {/* Eyes: sclera + pupils + lids for richer expression */}
        <ellipse cx="82" cy={faceY} rx="7.2" ry="6.8" fill="#FFFDF8" />
        <ellipse cx="118" cy={faceY} rx="7.2" ry="6.8" fill="#FFFDF8" />
        <ellipse cx="82" cy={faceY + 0.4} rx="5.3" ry="5.5" fill="#2A2A2A" />
        <ellipse cx="118" cy={faceY + 0.4} rx="5.3" ry="5.5" fill="#2A2A2A" />
        <circle cx="84" cy={faceY - 1.5} r="2.1" fill="#FFFFFF" />
        <circle cx="120" cy={faceY - 1.5} r="2.1" fill="#FFFFFF" />
        <circle cx="81" cy={faceY + 2.1} r="1" fill="#FFFFFF" opacity="0.5" />
        <circle cx="117" cy={faceY + 2.1} r="1" fill="#FFFFFF" opacity="0.5" />
        {/* 上眼睑阴影：淡一点，避免小尺寸下被看成「粗黑眉」 */}
        <path
          d={`M75 ${faceY - 3.5} Q82 ${faceY - 6.6} 89 ${faceY - 3.6}`}
          stroke="#C4B5A8"
          strokeWidth="0.85"
          strokeLinecap="round"
          fill="none"
          opacity="0.28"
        />
        <path
          d={`M111 ${faceY - 3.5} Q118 ${faceY - 6.6} 125 ${faceY - 3.6}`}
          stroke="#C4B5A8"
          strokeWidth="0.85"
          strokeLinecap="round"
          fill="none"
          opacity="0.28"
        />

        {/* 眉毛：略靠上；单侧一条平滑弧线呈 >< 感；棕灰 */}
        <path
          d={`M72.5 ${faceY - 17.2} Q80.5 ${faceY - 20.6} 88 ${faceY - 16.4}`}
          stroke="#6E6259"
          strokeWidth="1.65"
          strokeLinecap="round"
          fill="none"
          opacity="0.92"
        />
        <path
          d={`M127.5 ${faceY - 17.2} Q119.5 ${faceY - 20.6} 112 ${faceY - 16.4}`}
          stroke="#6E6259"
          strokeWidth="1.65"
          strokeLinecap="round"
          fill="none"
          opacity="0.92"
        />

        {/* Beak */}
        <path
          d={`M92 ${faceY + 10} L100 ${faceY + 22} L108 ${faceY + 10} Z`}
          fill="#F6B432"
          stroke="#D08E20"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d={`M95 ${faceY + 14} Q100 ${faceY + 17} 105 ${faceY + 14}`} stroke="#D08E20" strokeWidth="1.2" fill="none" />
        <path d={`M96 ${faceY + 23} Q100 ${faceY + 25} 104 ${faceY + 23}`} stroke="#B8873D" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.8" />

        {/* 腿爪：略深橘褐；踝上接身体；腿+趾整体为上一版长度的 80%；侧趾仍短于中趾 */}
        <g strokeLinecap="round" strokeLinejoin="round">
          <line x1="77" y1="171" x2="77" y2="190" stroke="#8A4818" strokeWidth="4.2" opacity="0.34" />
          <line x1="77" y1="171" x2="77" y2="190" stroke="#D17A36" strokeWidth="3.6" />
          <line x1="77" y1="190" x2="64" y2="200" stroke="#D17A36" strokeWidth="3.15" />
          <line x1="77" y1="190" x2="77" y2="204" stroke="#D17A36" strokeWidth="3.35" />
          <line x1="77" y1="190" x2="88" y2="200" stroke="#D17A36" strokeWidth="3.1" />
          <line x1="123" y1="171" x2="123" y2="190" stroke="#8A4818" strokeWidth="4.2" opacity="0.34" />
          <line x1="123" y1="171" x2="123" y2="190" stroke="#D17A36" strokeWidth="3.6" />
          <line x1="123" y1="190" x2="136" y2="200" stroke="#D17A36" strokeWidth="3.15" />
          <line x1="123" y1="190" x2="123" y2="204" stroke="#D17A36" strokeWidth="3.35" />
          <line x1="123" y1="190" x2="112" y2="200" stroke="#D17A36" strokeWidth="3.1" />
        </g>

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

        {accessory === "pencil" && (
          <g>
            {/* Pencil body held by right wing — angled */}
            <line x1="170" y1="72" x2="190" y2="112" stroke={accent} strokeWidth="5" strokeLinecap="round" />
            {/* Pencil wood tip */}
            <line x1="190" y1="112" x2="194" y2="122" stroke="#F5CBA7" strokeWidth="4" strokeLinecap="round" />
            {/* Pencil point */}
            <line x1="194" y1="122" x2="196" y2="128" stroke="#333" strokeWidth="2" strokeLinecap="round" />
            {/* Eraser */}
            <line x1="170" y1="72" x2="167" y2="66" stroke="#F4A6A0" strokeWidth="5" strokeLinecap="round" />
            {/* Metal band */}
            <line x1="169" y1="69" x2="171" y2="74" stroke="#C0C0C0" strokeWidth="6" strokeLinecap="butt" />
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

        {accessory === "duster" && (
          <g>
            {/* Handle — held by left wing */}
            <line x1="42" y1="98" x2="28" y2="54" stroke={accent} strokeWidth="4" strokeLinecap="round" />
            {/* Feathers — fluffy top */}
            <ellipse cx="26" cy="46" rx="10" ry="8" fill={accent} opacity="0.35" transform="rotate(-15 26 46)" />
            <ellipse cx="30" cy="40" rx="9" ry="7" fill={accent} opacity="0.3" transform="rotate(10 30 40)" />
            <ellipse cx="22" cy="52" rx="8" ry="6" fill={accent} opacity="0.25" transform="rotate(-20 22 52)" />
            <ellipse cx="34" cy="48" rx="7" ry="6" fill={accent} opacity="0.25" transform="rotate(15 34 48)" />
            <ellipse cx="28" cy="34" rx="8" ry="6" fill={accent} opacity="0.3" transform="rotate(5 28 34)" />
            {/* Handle ring */}
            <circle cx="40" cy="64" r="3" fill="none" stroke={accent} strokeWidth="1.5" opacity="0.6" />
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

        {accessory === "heart" && (
          <g>
            {/* 善意：胸前单颗粉红心（仅一条 path，避免重复渲染叠成两颗） */}
            <path
              d={`M100 ${faceY + 32} C95 ${faceY + 22} 80 ${faceY + 20} 80 ${faceY + 30} C80 ${faceY + 40} 100 ${faceY + 52} 100 ${faceY + 52} C100 ${faceY + 52} 120 ${faceY + 40} 120 ${faceY + 30} C120 ${faceY + 20} 105 ${faceY + 22} 100 ${faceY + 32} Z`}
              fill="#FF9EB5"
              stroke="#E56B86"
              strokeWidth="1.15"
              strokeLinejoin="round"
            />
          </g>
        )}

        {accessory === "open-book" && (
          <g>
            {/* Book cover — inverted V tent shape, spine on top */}
            {/* Left cover */}
            <path d="M100 22 L62 42 L62 34 L100 14 Z" fill={accent} opacity="0.8" stroke={accent} strokeWidth="1" strokeLinejoin="round" />
            {/* Right cover */}
            <path d="M100 22 L138 42 L138 34 L100 14 Z" fill={accent} opacity="0.8" stroke={accent} strokeWidth="1" strokeLinejoin="round" />
            {/* Inner pages visible — left */}
            <path d="M100 22 L66 40 L66 34 L100 16 Z" fill="white" stroke={accent} strokeWidth="0.8" strokeLinejoin="round" opacity="0.9" />
            {/* Inner pages visible — right */}
            <path d="M100 22 L134 40 L134 34 L100 16 Z" fill="white" stroke={accent} strokeWidth="0.8" strokeLinejoin="round" opacity="0.9" />
            {/* Spine — thick ridge at top */}
            <line x1="100" y1="13" x2="100" y2="23" stroke={accent} strokeWidth="3" strokeLinecap="round" />
            {/* Page edge lines — left */}
            <line x1="70" y1="36" x2="96" y2="19" stroke={accent} strokeWidth="0.6" opacity="0.15" />
            <line x1="68" y1="38" x2="96" y2="21" stroke={accent} strokeWidth="0.6" opacity="0.15" />
            {/* Page edge lines — right */}
            <line x1="130" y1="36" x2="104" y2="19" stroke={accent} strokeWidth="0.6" opacity="0.15" />
            <line x1="132" y1="38" x2="104" y2="21" stroke={accent} strokeWidth="0.6" opacity="0.15" />
          </g>
        )}

        {accessory === "sweatband" && (
          <g>
            <path d="M42 70 Q100 58 158 70" stroke={accent} strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d="M42 70 Q100 58 158 70" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.3" />
          </g>
        )}

        {accessory === "sprout" && (
          <g>
            <line x1="100" y1="38" x2="100" y2="20" stroke="#6B8E5A" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M100 25 Q90 12 80 18 Q88 28 100 25" fill={accent} opacity="0.9" />
            <path d="M100 20 Q110 8 120 14 Q112 24 100 20" fill={accent} opacity="0.75" />
          </g>
        )}

        {accessory === "chef" && (
          <g>
            {/* Hat band — the stiff bottom rim */}
            <rect x="64" y="34" width="72" height="12" rx="3" fill="white" stroke="#DDD8D0" strokeWidth="1.5" />
            {/* Puffy top — large billowy shape */}
            <ellipse cx="100" cy="22" rx="38" ry="18" fill="white" stroke="#DDD8D0" strokeWidth="1.2" />
            {/* Puff folds */}
            <path d="M72 28 Q78 12 92 18" stroke="#E8E0D6" strokeWidth="1" fill="none" strokeLinecap="round" />
            <path d="M92 18 Q100 8 110 16" stroke="#E8E0D6" strokeWidth="1" fill="none" strokeLinecap="round" />
            <path d="M110 16 Q120 10 130 26" stroke="#E8E0D6" strokeWidth="1" fill="none" strokeLinecap="round" />
          </g>
        )}

        {accessory === "scissors" && (
          <g transform="translate(168, 88) rotate(25)">
            {/* Finger holes */}
            <ellipse cx="-4" cy="18" rx="6" ry="5" fill="none" stroke={accent} strokeWidth="2.5" />
            <ellipse cx="4" cy="18" rx="6" ry="5" fill="none" stroke={accent} strokeWidth="2.5" />
            {/* Blades */}
            <line x1="-4" y1="13" x2="-10" y2="-18" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
            <line x1="4" y1="13" x2="10" y2="-18" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
            {/* Pivot */}
            <circle cx="0" cy="10" r="2.5" fill={accent} />
          </g>
        )}

        {accessory === "desk-calendar" && (
          <g>
            {/* Calendar base — slightly tilted back */}
            <path d="M74 38 L72 20 L128 20 L126 38 Z" fill="white" stroke={accent} strokeWidth="1.5" strokeLinejoin="round" />
            {/* Top header bar */}
            <path d="M72 20 L74 12 L126 12 L128 20 Z" fill={accent} opacity="0.75" />
            {/* Ring holes */}
            <circle cx="82" cy="12" r="2.5" fill={accent} stroke={accent} strokeWidth="1" />
            <circle cx="92" cy="12" r="2.5" fill={accent} stroke={accent} strokeWidth="1" />
            <circle cx="108" cy="12" r="2.5" fill={accent} stroke={accent} strokeWidth="1" />
            <circle cx="118" cy="12" r="2.5" fill={accent} stroke={accent} strokeWidth="1" />
            {/* Ring arcs */}
            <path d="M82 12 Q82 6 84 6" stroke={accent} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7" />
            <path d="M92 12 Q92 6 94 6" stroke={accent} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7" />
            <path d="M108 12 Q108 6 110 6" stroke={accent} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7" />
            <path d="M118 12 Q118 6 120 6" stroke={accent} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7" />
            {/* Date number */}
            <text x="100" y="34" textAnchor="middle" fontSize="14" fill={accent} fontWeight="700" fontFamily="system-ui">01</text>
          </g>
        )}

        {accessory === "sparkle" && (
          <g>
            {/* Rainbow crown / tiara */}
            <defs>
              <linearGradient id="sparkleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF9AA2" />
                <stop offset="20%" stopColor="#FFDAC1" />
                <stop offset="40%" stopColor="#FFFFD8" />
                <stop offset="60%" stopColor="#B5EAD7" />
                <stop offset="80%" stopColor="#C7CEEA" />
                <stop offset="100%" stopColor="#E2B0FF" />
              </linearGradient>
            </defs>
            {/* Crown base */}
            <path d="M68 44 L76 22 L88 38 L100 18 L112 38 L124 22 L132 44 Z" fill="url(#sparkleGrad)" stroke="white" strokeWidth="1.5" />
            {/* Jewels on crown points */}
            <circle cx="76" cy="22" r="3" fill="#FFD700" />
            <circle cx="100" cy="18" r="4" fill="#FF6F61" />
            <circle cx="124" cy="22" r="3" fill="#FFD700" />
            {/* Floating sparkles around the bird */}
            <path d="M42 52 l2 4 4 0.5 -3 3 0.5 4.5 -3.5-2 -3.5 2 0.5-4.5 -3-3 4-0.5z" fill="#FFD700" opacity="0.7" />
            <path d="M158 48 l1.5 3 3 0.4 -2.2 2.2 0.4 3 -2.7-1.4 -2.7 1.4 0.4-3 -2.2-2.2 3-0.4z" fill="#FF9AA2" opacity="0.7" />
            <path d="M50 130 l1 2 2.5 0.3 -1.8 1.8 0.3 2.5 -2-1.1 -2 1.1 0.3-2.5 -1.8-1.8 2.5-0.3z" fill="#B5EAD7" opacity="0.6" />
            <path d="M152 125 l1 2 2.5 0.3 -1.8 1.8 0.3 2.5 -2-1.1 -2 1.1 0.3-2.5 -1.8-1.8 2.5-0.3z" fill="#C7CEEA" opacity="0.6" />
            {/* Cheek sparkle highlights */}
            <circle cx="62" cy={faceY + 8} r="2" fill="#FFD700" opacity="0.5" />
            <circle cx="138" cy={faceY + 8} r="2" fill="#FFD700" opacity="0.5" />
          </g>
        )}
      </svg>
    </motion.div>
  );
}
