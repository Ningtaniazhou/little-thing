import { NextResponse } from "next/server";
import { getProvider } from "@/lib/llm/adapter";
import { getRandomTask } from "@/lib/tasks";

export async function POST(request: Request) {
  try {
    let categories: string[] | undefined;
    try {
      const body = await request.json();
      if (Array.isArray(body.categories) && body.categories.length > 0) {
        categories = body.categories;
      }
    } catch {
      // no body or invalid JSON — use all categories
    }

    const provider = await getProvider();

    if (provider) {
      try {
        const task = await provider.generateTask();
        if (!categories || categories.includes(task.category)) {
          return NextResponse.json({ task, source: "llm" });
        }
      } catch (error) {
        console.error("LLM generation failed, falling back:", error);
      }
    }

    const task = getRandomTask(categories);
    return NextResponse.json({ task, source: "local" });
  } catch (error) {
    console.error("Task generation error:", error);
    const task = getRandomTask();
    return NextResponse.json({ task, source: "local" });
  }
}
