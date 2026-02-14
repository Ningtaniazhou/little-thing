// API Route: Generate a task via LLM with local fallback
import { NextResponse } from "next/server";
import { getProvider } from "@/lib/llm/adapter";
import { getRandomTask } from "@/lib/tasks";

export async function POST() {
  try {
    const provider = await getProvider();

    if (provider) {
      try {
        const task = await provider.generateTask();
        return NextResponse.json({ task, source: "llm" });
      } catch (error) {
        console.error("LLM generation failed, falling back:", error);
        // Fall through to local fallback
      }
    }

    // Fallback to local task pool
    const task = getRandomTask();
    return NextResponse.json({ task, source: "local" });
  } catch (error) {
    console.error("Task generation error:", error);
    const task = getRandomTask();
    return NextResponse.json({ task, source: "local" });
  }
}
