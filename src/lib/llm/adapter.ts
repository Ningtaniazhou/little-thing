// LLM Adapter - abstracts away the specific LLM provider
import type { Task } from "./types";

export interface LLMProvider {
  generateTask(): Promise<Task>;
}

// Registry of available providers
const providers: Record<string, () => Promise<LLMProvider>> = {
  openai: async () => {
    const { OpenAIProvider } = await import("./openai");
    return new OpenAIProvider();
  },
};

export async function getProvider(): Promise<LLMProvider | null> {
  const providerName = process.env.LLM_PROVIDER || "openai";
  const apiKey = process.env.LLM_API_KEY;

  if (!apiKey) {
    return null; // No API key configured, will use fallback
  }

  const factory = providers[providerName];
  if (!factory) {
    console.warn(`Unknown LLM provider: ${providerName}, falling back`);
    return null;
  }

  return factory();
}
