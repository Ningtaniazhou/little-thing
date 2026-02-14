"use client";

import { motion } from "framer-motion";

interface WeeklyCounterProps {
  count: number;
}

export default function WeeklyCounter({ count }: WeeklyCounterProps) {
  return (
    <div className="flex w-full max-w-[360px] items-center justify-between px-2 text-xs text-[#A09888]">
      <div className="flex items-center gap-1">
        本周完成：
        <motion.span
          key={count}
          initial={{ scale: 1.5, color: "#E8943A" }}
          animate={{ scale: 1, color: "#A09888" }}
          className="font-medium"
        >
          {count}
        </motion.span>
        次
      </div>
      <div>记录仅保存在本设备</div>
    </div>
  );
}
