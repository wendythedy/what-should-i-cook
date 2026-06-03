import OpenAI from "openai";
import { SYSTEM_PROMPT, USER_PROMPT } from "./prompts";
import type { AnalyzeResult } from "@/types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzePhoto(imageUrl: string): Promise<AnalyzeResult> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "image_url", image_url: { url: imageUrl } },
          { type: "text", text: USER_PROMPT },
        ],
      },
    ],
    max_tokens: 1500,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content ?? "{}";
  return JSON.parse(content) as AnalyzeResult;
}
