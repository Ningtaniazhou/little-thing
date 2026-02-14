"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GashaponMachine from "@/components/gashapon-machine";
import FatBird from "@/components/fat-bird";
import Egg from "@/components/egg";
import TaskBubble from "@/components/task-bubble";
import ActionButtons from "@/components/action-buttons";
import WeeklyCounter from "@/components/weekly-counter";
import FeedbackToast, { getRandomFeedback } from "@/components/feedback-toast";
import { getTheme } from "@/lib/themes";
import { getRandomTask } from "@/lib/tasks";
import { getWeekCount, incrementWeekCount } from "@/lib/storage";
import type { Task } from "@/lib/llm/types";

type AppState = "idle" | "shaking" | "egg-out" | "hatching" | "task-shown" | "done";

export default function Home() {
  const [state, setState] = useState<AppState>("idle");
  const [task, setTask] = useState<Task | null>(null);
  const [weekCount, setWeekCount] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Initialize week count from localStorage
  useEffect(() => {
    setWeekCount(getWeekCount());
  }, []);

  const theme = task ? getTheme(task.category) : null;

  // Fetch a task - try API first, fallback to local
  const fetchTask = useCallback(async (): Promise<Task> => {
    try {
      const res = await fetch("/api/generate-task", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        return data.task;
      }
    } catch {
      // Silently fall back to local
    }
    return getRandomTask();
  }, []);

  // Main action: twist the gashapon
  const handleTwist = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    setState("shaking");

    // Start fetching task in parallel with animation
    const taskPromise = fetchTask();

    // Shaking animation: 1s
    await sleep(1000);
    setState("egg-out");

    // Wait for task data
    const newTask = await taskPromise;
    setTask(newTask);

    // Egg rolls out and bounces: 2s (let user see the colored egg)
    await sleep(2000);
    setState("hatching");

    // Egg wobbles and cracks: 1.2s
    await sleep(1200);
    setState("task-shown");

    setLoading(false);
  }, [fetchTask, loading]);

  // Swap: get a new egg
  const handleSwap = useCallback(async () => {
    setState("idle");
    setTask(null);
    // Small delay then auto-twist
    await sleep(300);
    handleTwist();
  }, [handleTwist]);

  // Done: mark task complete
  const handleDone = useCallback(() => {
    setState("done");
    const n = incrementWeekCount();
    setWeekCount(n);

    const msg = getRandomFeedback();
    setToastMessage(msg);
    setShowToast(true);

    // Reset after celebration
    setTimeout(() => {
      setShowToast(false);
      setTimeout(() => {
        setState("idle");
        setTask(null);
      }, 500);
    }, 2500);
  }, []);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 py-8">
      <div className="flex w-full max-w-[420px] flex-col items-center gap-4">
        {/* Header */}
        <motion.div
          className="mb-2 text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="mb-1 text-2xl font-semibold text-[#5C5347]">
            啾啾小事
          </h1>
          <p className="text-sm text-[#A09888]">
            你可以轻松做到。
          </p>
        </motion.div>

        {/* Main interaction area */}
        <div className="relative flex min-h-[420px] w-full flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {/* IDLE: Show gashapon machine */}
            {(state === "idle" || state === "shaking") && (
              <motion.div
                key="machine"
                className="flex flex-col items-center gap-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
              >
                <div className="relative">
                  <GashaponMachine
                    shaking={state === "shaking"}
                    onHandleClick={handleTwist}
                  />
                  {/* Bird standing next to machine */}
                  <div className="absolute -right-6 bottom-4">
                    <FatBird size={72} animate="idle" />
                  </div>
                </div>

                <motion.button
                  onClick={handleTwist}
                  disabled={loading}
                  className="mt-2 cursor-pointer rounded-full border-2 border-[#F0A882] bg-white px-8 py-3 text-base font-medium text-[#C4784A] shadow-md transition-all hover:bg-[#FFF8F0] disabled:cursor-not-allowed disabled:opacity-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {loading ? "扭蛋中..." : "扭一下 🎯"}
                </motion.button>
              </motion.div>
            )}

            {/* EGG OUT: Egg rolling out with bounce */}
            {state === "egg-out" && theme && (
              <motion.div
                key="egg-out"
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: -80, rotate: -15 }}
                animate={{
                  opacity: 1,
                  y: [null, 10, -6, 3, 0],
                  rotate: [null, 5, -3, 1, 0],
                }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  duration: 1,
                  ease: "easeOut",
                  y: { duration: 1, times: [0, 0.4, 0.6, 0.8, 1] },
                }}
              >
                <Egg
                  color={theme.eggColor}
                  colorDark={theme.eggColorDark}
                  size={160}
                />
              </motion.div>
            )}

            {/* HATCHING: Egg wobbles then cracks */}
            {state === "hatching" && theme && (
              <motion.div
                key="hatching"
                className="flex flex-col items-center"
                initial={{ scale: 1, rotate: 0 }}
                animate={{
                  scale: [1, 1.05, 0.98, 1.08, 1.02, 1.12, 0],
                  rotate: [0, -4, 4, -6, 6, -3, 0],
                }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
              >
                <Egg
                  color={theme.eggColor}
                  colorDark={theme.eggColorDark}
                  size={160}
                />
              </motion.div>
            )}

            {/* TASK SHOWN: Bird + bubble + buttons */}
            {(state === "task-shown" || state === "done") && task && theme && (
              <motion.div
                key="task-shown"
                className="flex w-full flex-col items-center gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Task bubble */}
                <TaskBubble task={task} themeColor={theme.eggColor} />

                {/* Fat bird */}
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

                {/* Action buttons */}
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

        {/* Weekly counter */}
        <WeeklyCounter count={weekCount} />
      </div>

      {/* Feedback toast */}
      <FeedbackToast show={showToast} message={toastMessage} />
    </div>
  );
}

// Simple sleep helper
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
