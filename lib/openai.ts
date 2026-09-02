import OpenAI from "openai";

export class MissingApiKeyError extends Error {
  constructor() {
    super("OpenAI API Key가 설정되지 않았습니다. .env.local에 OPENAI_API_KEY를 설정해주세요.");
    this.name = "MissingApiKeyError";
  }
}

export function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new MissingApiKeyError();
  return new OpenAI({ apiKey });
}

export function getOpenAIModel(): string {
  return process.env.OPENAI_MODEL || "gpt-5.6";
}
