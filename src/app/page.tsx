"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GashaponMachine from "@/components/gashapon-machine";
import FatBird from "@/components/fat-bird";
import Egg from "@/components/egg";
import TaskBubble from "@/components/task-bubble";
import ActionButtons from "@/components/action-buttons";
import WeeklyCounter from "@/components/weekly-counter";
import CategorySelector from "@/components/category-selector";
import FeedbackToast, { getRandomFeedback } from "@/components/feedback-toast";
import { getTheme } from "@/lib/themes";
import { getRandomTask } from "@/lib/tasks";
import {
  getWeekCount,
  incrementWeekCount,
  saveCategories,
  loadCategories,
} from "@/lib/storage";
import type { Task } from "@/lib/llm/types";

const SURPRISE_PROBABILITY = 0.08;

type AppState = "idle" | "shaking" | "egg-out" | "task-shown" | "done";

export default function Home() {
  const [state, setState] = useState<AppState>("idle");
  const [task, setTask] = useState<Task | null>(null);
  const [weekCount, setWeekCount] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    setWeekCount(getWeekCount());
    setSelectedCategories(loadCategories());
  }, []);

  const handleCategoryChange = useCallback((cats: string[]) => {
    setSelectedCategories(cats);
    saveCategories(cats);
  }, []);

  const theme = task ? getTheme(task.category) : null;
  const isSurprise = task?.category === "惊喜";

  const fetchTask = useCallback(async (categories: string[]): Promise<Task> => {
    if (Math.random() < SURPRISE_PROBABILITY) {
      return getRandomTask(["惊喜"]);
    }

    try {
      const res = await fetch("/api/generate-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.task;
      }
    } catch {
      // fall back to local
    }
    return getRandomTask(categories.length > 0 ? categories : undefined);
  }, []);

  const handleTwist = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    setState("shaking");

    const taskPromise = fetchTask(selectedCategories);

    await sleep(1600);
    setState("egg-out");

    const newTask = await taskPromise;
    setTask(newTask);

    await sleep(2800);
    setState("task-shown");

    setLoading(false);
  }, [fetchTask, loading, selectedCategories]);

  const handleSwap = useCallback(async () => {
    setState("idle");
    setTask(null);
    await sleep(300);
    handleTwist();
  }, [handleTwist]);

  const handleDone = useCallback(() => {
    setState("done");
    const n = incrementWeekCount();
    setWeekCount(n);

    const msg = getRandomFeedback();
    setToastMessage(msg);
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
      setTimeout(() => {
        setState("idle");
        setTask(null);
      }, 500);
    }, 2500);
  }, []);

  const isIdle = state === "idle" || state === "shaking";

  return (
    <div className="flex min-h-svh flex-col items-center px-4 pt-[12vh]">
      <div className="flex w-full max-w-[420px] flex-col items-center gap-4">
        {/* Header — always in the same position */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="mb-1 text-2xl font-semibold text-[#5C5347]">
            啾啾小事
          </h1>
          <p className="text-sm text-[#A09888]">你可以轻松做到 ❤️</p>
        </motion.div>

        {/* Main interaction area — fixed height to prevent layout shift */}
        <div className="relative flex h-[440px] w-full flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {/* IDLE: Show gashapon machine */}
            {isIdle && (
              <motion.div
                key="machine"
                className="flex flex-col items-center gap-3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
              >
                <div className="relative">
                  <GashaponMachine
                    shaking={state === "shaking"}
                    onHandleClick={handleTwist}
                    selectedCategories={selectedCategories}
                  />
                  <div className="absolute -right-14 bottom-3">
                    <FatBird size={88} animate="idle" />
                  </div>
                </div>

                <motion.button
                  onClick={handleTwist}
                  disabled={loading}
                  className="cursor-pointer rounded-full border-2 border-[#F0A882] bg-white px-8 py-3 text-base font-medium text-[#C4784A] shadow-md transition-all hover:bg-[#FFF8F0] disabled:cursor-not-allowed disabled:opacity-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {loading ? "扭蛋中..." : "扭一下 🎯"}
                </motion.button>
              </motion.div>
            )}

            {/* EGG OUT — drops in, pauses, wobbles, then shrinks away */}
            {state === "egg-out" && theme && (
              <motion.div
                key="egg-out"
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: -80, rotate: -15 }}
                animate={{
                  opacity: [0, 1, 1, 1, 1, 1, 0],
                  y: [-80, 10, -6, 0, 0, 0, 0],
                  rotate: [-15, 5, -3, 0, -5, 5, 0],
                  scale: [1, 1, 1, 1, 1.05, 1.08, 0],
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 3.2,
                  times: [0, 0.25, 0.32, 0.38, 0.75, 0.88, 1],
                  ease: "easeInOut",
                }}
              >
                <Egg
                  color={theme.eggColor}
                  colorDark={theme.eggColorDark}
                  size={160}
                  rainbow={isSurprise}
                />
              </motion.div>
            )}

            {/* TASK SHOWN */}
            {(state === "task-shown" || state === "done") && task && theme && (
              <motion.div
                key="task-shown"
                className="flex w-full flex-col items-center gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                <TaskBubble task={task} themeColor={theme.eggColor} isSurprise={isSurprise} />

                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 15,
                    delay: 0.15,
                  }}
                >
                  <FatBird
                    size={120}
                    accent={theme.accent}
                    accessory={theme.accessory}
                    animate={state === "done" ? "happy" : "idle"}
                  />
                </motion.div>

                {state === "task-shown" && (
                  <ActionButtons
                    onSwap={handleSwap}
                    onDone={handleDone}
                    themeColor={theme.eggColor}
                    disabled={loading}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Category selector — opacity-controlled to preserve layout space */}
        <div
          className="flex w-full justify-center transition-opacity duration-300"
          style={{
            opacity: isIdle ? 1 : 0,
            pointerEvents: isIdle ? "auto" : "none",
          }}
        >
          <CategorySelector
            selected={selectedCategories}
            onChange={handleCategoryChange}
          />
        </div>

        {/* Weekly counter */}
        <WeeklyCounter count={weekCount} />
      </div>

      {/* Feedback toast */}
      <FeedbackToast show={showToast} message={toastMessage} />
    </div>
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
