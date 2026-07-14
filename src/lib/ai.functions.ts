import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";

const MODEL_ID = "google/gemini-3-flash-preview";

const ChatMsg = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string(),
});

const RunInput = z.object({
  system: z.string(),
  messages: z.array(ChatMsg).min(1),
});

export const runAi = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => RunInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) {
      throw new Error(
        "AI service is not configured. LOVABLE_API_KEY is missing.",
      );
    }
    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway(MODEL_ID);
    try {
      const { text } = await generateText({
        model,
        system: data.system,
        messages: data.messages.map((m) => ({ role: m.role, content: m.content })),
      });
      return { text };
    } catch (err) {
      const e = err as { statusCode?: number; message?: string };
      const status = e.statusCode;
      if (status === 429) {
        throw new Error("Rate limit reached — please wait a moment and try again.");
      }
      if (status === 402) {
        throw new Error("AI credits exhausted. Please add credits to your workspace.");
      }
      throw new Error(e.message ?? "AI request failed.");
    }
  });