"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { themes, type ThemeKey } from "@/lib/themes";

const NORMAL_CATEGORIES: ThemeKey[] = [
  "读诗", "读书", "艺术", "写作", "音乐",
  "冥想", "身体", "探索", "自然", "整理",
  "饮食", "学习", "善意", "手工", "生活",
];

interface CategorySelectorProps {
  selected: string[];
  onChange: (categories: string[]) => void;
}

export default function CategorySelector({
  selected,
  onChange,
}: CategorySelectorProps) {
  const [open, setOpen] = useState(false);

  const allSelected = selected.length === 0;

  const toggleCategory = (cat: string) => {
    if (selected.includes(cat)) {
      onChange(selected.filter((c) => c !== cat));
    } else {
      onChange([...selected, cat]);
    }
  };

  const selectAll = () => onChange([]);

  return (
    <div className="w-full max-w-[380px]">
      <motion.button
        onClick={() => setOpen(!open)}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-[#E9E1D8] bg-white/80 px-4 py-2.5 text-sm text-[#5C5347] shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
        whileTap={{ scale: 0.98 }}
      >
        <span className="text-base">🥚</span>
        <span>
          {allSelected
            ? "挑选你想要的小事种类"
            : `已选 ${selected.length} 种蛋`}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-xs text-[#A09888]"
        >
          ▼
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-2 rounded-2xl border-2 border-[#E9E1D8] bg-white/90 p-4 shadow-sm backdrop-blur-sm">
              {/* Select all / random toggle */}
              <motion.button
                onClick={selectAll}
                className="relative mb-3 w-full cursor-pointer overflow-hidden rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
                style={{
                  background: allSelected ? "#FFF0E5" : "#F5F1EC",
                  color: allSelected ? "#C4784A" : "#A09888",
                  borderWidth: 2,
                  borderColor: allSelected ? "#F0A882" : "transparent",
                }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <motion.span
                    animate={allSelected ? { rotate: [0, 360] } : { rotate: 0 }}
                    transition={allSelected ? { duration: 2, repeat: Infinity, ease: "linear" } : { duration: 0.3 }}
                  >
                    🎲
                  </motion.span>
                  {allSelected ? "已开启全部随机" : "全部随机"}
                  {allSelected && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-xs"
                    >
                      ✓
                    </motion.span>
                  )}
                </span>
              </motion.button>

              {/* Category grid */}
              <div className="grid grid-cols-3 gap-2">
                {NORMAL_CATEGORIES.map((cat) => {
                  const theme = themes[cat];
                  if (!theme) return null;
                  const isActive = selected.includes(cat);

                  return (
                    <motion.button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className="relative flex cursor-pointer flex-col items-center gap-1.5 rounded-xl px-2 py-2.5 text-xs font-medium transition-colors"
                      style={{
                        background: isActive ? theme.eggColor : "#F9F6F2",
                        color: isActive ? "#4A4040" : "#A09888",
                        borderWidth: 2,
                        borderColor: isActive ? theme.eggColorDark : "transparent",
                      }}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                    >
                      {/* Mini egg icon */}
                      <svg width="20" height="24" viewBox="0 0 20 24" fill="none">
                        <ellipse
                          cx="10"
                          cy="12"
                          rx="8"
                          ry="10"
                          fill={isActive ? theme.eggColorDark : "#DDD8D2"}
                        />
                        <ellipse
                          cx="8"
                          cy="9"
                          rx="2.5"
                          ry="3.5"
                          fill="white"
                          opacity="0.35"
                          transform="rotate(-15 8 9)"
                        />
                      </svg>
                      <span>{cat}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
