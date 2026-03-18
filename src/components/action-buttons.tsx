"use client";

import { motion } from "framer-motion";

interface ActionButtonsProps {
  onSwap: () => void;
  onDone: () => void;
  themeColor?: string;
  disabled?: boolean;
}

export default function ActionButtons({
  onSwap,
  onDone,
  themeColor = "#D5F5E3",
  disabled = false,
}: ActionButtonsProps) {
  const isSurprise = themeColor === "rainbow";
  const doneBackground = isSurprise
    ? "linear-gradient(135deg, #FF8FB1 0%, #FFB980 22%, #FFE08A 42%, #97D6A3 62%, #8FC7FF 82%, #C6A2FF 100%)"
    : themeColor;

  return (
    <motion.div
      className="flex w-full max-w-[380px] gap-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
    >
      <motion.button
        onClick={onSwap}
        disabled={disabled}
        className="flex-1 cursor-pointer rounded-2xl border-2 bg-white px-4 py-3.5 text-[15px] font-medium text-[#5C5347] shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        style={{ borderColor: "#E9E1D8" }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        换一颗蛋 🔄
      </motion.button>

      <motion.button
        onClick={onDone}
        disabled={disabled}
        className="flex-1 cursor-pointer rounded-2xl px-4 py-3.5 text-[15px] font-medium text-white shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          background: doneBackground,
          border: "none",
          color: isSurprise ? "#4D3A3A" : "#4A4040",
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        我去做了 ✓
      </motion.button>
    </motion.div>
  );
}
