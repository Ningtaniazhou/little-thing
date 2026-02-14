"use client";

import { motion, AnimatePresence } from "framer-motion";

const FEEDBACK_MESSAGES = [
  "做得很好。",
  "一点点也算前进。",
  "你已经在照顾自己了。",
  "世界在慢慢向你打开。",
  "今天的你很勇敢。",
  "这就够了。",
  "小肥鸟为你感到骄傲！",
  "每一件小事都有意义。",
];

interface FeedbackToastProps {
  show: boolean;
  message?: string;
}

export function getRandomFeedback(): string {
  return FEEDBACK_MESSAGES[
    Math.floor(Math.random() * FEEDBACK_MESSAGES.length)
  ];
}

export default function FeedbackToast({ show, message }: FeedbackToastProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 rounded-2xl border border-[#E9E1D8] bg-white px-6 py-3 text-sm text-[#5C5347] shadow-lg"
        >
          {message || "做得很好。"}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
