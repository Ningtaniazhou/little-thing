"use client";

import { motion } from "framer-motion";
import type { Task } from "@/lib/llm/types";

interface TaskBubbleProps {
  task: Task;
  themeColor?: string;
}

export default function TaskBubble({
  task,
  themeColor = "#D5F5E3",
}: TaskBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="relative mx-auto w-full max-w-[360px]"
    >
      {/* Bubble tail (pointing down toward bird) */}
      <div className="flex justify-center">
        <div
          className="relative rounded-[24px] border-2 px-6 py-5 shadow-sm"
          style={{
            background: "white",
            borderColor: themeColor,
          }}
        >
          {/* Category + time badge */}
          <div className="mb-3 flex items-center gap-2">
            <span
              className="rounded-full px-3 py-1 text-xs font-medium"
              style={{
                background: themeColor,
                color: "#4A4A4A",
              }}
            >
              {task.category} · {task.minutes}分钟
            </span>
          </div>

          {/* Task text */}
          <p className="mb-3 text-lg leading-relaxed text-[#2B2B2B]">
            {task.text}
          </p>

          {/* Soft encouraging message */}
          {task.soft && (
            <p className="text-sm text-[#9B9489]">{task.soft}</p>
          )}
        </div>
      </div>

      {/* Tail triangle */}
      <div className="flex justify-center">
        <svg width="24" height="12" viewBox="0 0 24 12">
          <path d="M0 0 L12 12 L24 0" fill="white" />
          <path
            d="M0 0 L12 12 L24 0"
            fill="none"
            stroke={themeColor}
            strokeWidth="2"
          />
          {/* Cover the top stroke */}
          <rect x="1" y="0" width="22" height="2" fill="white" />
        </svg>
      </div>
    </motion.div>
  );
}
