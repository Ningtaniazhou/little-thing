// OpenAI LLM Provider
import OpenAI from "openai";
import type { LLMProvider } from "./adapter";
import type { Task } from "./types";
import { SYSTEM_PROMPT, USER_PROMPT } from "./prompt";

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI;
  private model: string;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.LLM_API_KEY,
      baseURL: process.env.LLM_BASE_URL || undefined,
    });
    this.model = process.env.LLM_MODEL || "gpt-4o";
  }

  async generateTask(): Promise<Task> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      temperature: parseFloat(process.env.LLM_TEMPERATURE || "0.8"),
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: USER_PROMPT },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from LLM");
    }

    const parsed = JSON.parse(content);

    return {
      id: Date.now(),
      category: parsed.category || "放松",
      text: parsed.text || "对自己说一句温柔的话。",
      minutes: parsed.minutes || "2–5",
      soft: parsed.soft || "你已经很棒了。",
    };
  }
}
