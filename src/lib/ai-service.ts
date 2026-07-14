// AI service — calls a real LLM through the Lovable AI Gateway via a
// TanStack server function. UI-facing signatures are unchanged.

import { runAi } from "./ai.functions";

export type ToolKind = "email" | "summary" | "tasks" | "research" | "chat";

export const DISCLAIMER = "AI-generated content may require human review.";

async function run(system: string, user: string): Promise<string> {
  const { text } = await runAi({
    data: {
      system,
      messages: [{ role: "user", content: user }],
    },
  });
  return text.trim();
}

export interface EmailInput {
  purpose: string;
  audience: string;
  tone: string;
  keyPoints: string;
}

export async function generateEmail(input: EmailInput): Promise<string> {
  const system =
    "You are an expert workplace communication assistant. Draft a professional email based on the user's brief. " +
    "Output plain text starting with 'Subject: <subject>' on the first line, followed by a blank line and the email body. " +
    "Match the requested tone. Keep it concise, clear, and ready to send. Do not add commentary before or after the email.";
  const user = `Purpose: ${input.purpose}
Audience: ${input.audience}
Tone: ${input.tone}
Key points:
${input.keyPoints}`;
  return run(system, user);
}

export async function summarizeNotes(notes: string): Promise<string> {
  const system =
    "You are a meeting notes summarizer. Given raw notes, produce a structured markdown summary with these H2 sections in this order: " +
    "'Executive Summary', 'Key Discussion Points', 'Action Items' (with owners where possible), 'Deadlines', 'Risks / Blockers'. " +
    "Use concise bullet points. Do not invent facts that aren't supported by the notes; if a section has no content, write '  • None identified'.";
  return run(system, `Meeting notes:\n${notes}`);
}

export interface TasksInput {
  tasks: string;
  deadlines: string;
  context: string;
}

export async function planTasks(input: TasksInput): Promise<string> {
  const system =
    "You are an AI task planner. Given a list of tasks, deadlines, and context, produce a markdown plan with H2 sections: " +
    "'Prioritized Tasks' (each item prefixed with a priority tag P0 — Urgent / P1 — High / P2 — Medium / P3 — Low), " +
    "'Suggested Schedule' (time-blocked across a work day), 'Urgent Items', and 'Recommendations'. " +
    "Be pragmatic and specific. Do not restate the raw input.";
  const user = `Tasks:\n${input.tasks}\n\nDeadlines / constraints:\n${input.deadlines || "(none provided)"}\n\nContext:\n${input.context || "(none provided)"}`;
  return run(system, user);
}

export interface ResearchInput {
  topic: string;
  goal: string;
  outcome: string;
}

export async function researchTopic(input: ResearchInput): Promise<string> {
  const system =
    "You are a research assistant for busy professionals. Given a topic, goal, and desired outcome, produce a markdown briefing with H2 sections: " +
    "'Key Insights on \"<topic>\"', 'Summary', 'Recommendations', 'Next Steps'. " +
    "Prefer concrete, actionable insights over generic statements. Be honest about uncertainty and do not fabricate citations.";
  const user = `Topic: ${input.topic}\nGoal: ${input.goal}\nDesired outcome: ${input.outcome}`;
  return run(system, user);
}

export async function chatReply(
  message: string,
  history: { role: string; content: string }[],
): Promise<string> {
  const system =
    "You are FlowMind, an AI workplace productivity assistant. Help with drafting emails, summarizing notes, planning tasks, and quick research. " +
    "Be concise and practical. Use markdown formatting (headings, bullets) when it aids clarity. Never invent facts about the user's company or data.";
  const cleaned = history
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
  const { text } = await runAi({
    data: {
      system,
      messages: [...cleaned, { role: "user", content: message }],
    },
  });
  return text.trim();
}