import { useEffect, useState, useCallback } from "react";
import type { ToolKind } from "./ai-service";

export type TaskStatus = "todo" | "in_progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  initials: string;
  color: string;
}

export interface SharedOutput {
  id: string;
  tool: ToolKind;
  title: string;
  content: string;
  creatorId: string;
  createdAt: number;
}

export interface Comment {
  id: string;
  outputId: string;
  authorId: string;
  body: string;
  createdAt: number;
}

export interface TeamTask {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string; // ISO yyyy-mm-dd
  assigneeId: string;
  status: TaskStatus;
  createdAt: number;
}

export type ActivityKind =
  | "shared_output"
  | "commented"
  | "task_created"
  | "task_completed";

export interface Activity {
  id: string;
  kind: ActivityKind;
  actorId: string;
  summary: string;
  detail?: string;
  createdAt: number;
  refId?: string;
}

interface TeamState {
  currentUserId: string;
  members: TeamMember[];
  outputs: SharedOutput[];
  comments: Comment[];
  tasks: TeamTask[];
  activity: Activity[];
}

const KEY = "flowmind:team:v1";
const EVT = "flowmind:team";

const DEFAULT_MEMBERS: TeamMember[] = [
  { id: "u_you", name: "You", role: "Product Lead", initials: "YO", color: "#6366f1" },
  { id: "u_amelia", name: "Amelia Chen", role: "Design Lead", initials: "AC", color: "#ec4899" },
  { id: "u_marcus", name: "Marcus Reid", role: "Engineering Manager", initials: "MR", color: "#0ea5e9" },
  { id: "u_priya", name: "Priya Shah", role: "Marketing", initials: "PS", color: "#10b981" },
  { id: "u_diego", name: "Diego Alvarez", role: "Customer Success", initials: "DA", color: "#f59e0b" },
];

function seed(): TeamState {
  const now = Date.now();
  const d = (h: number) => now - h * 3600_000;
  return {
    currentUserId: "u_you",
    members: DEFAULT_MEMBERS,
    outputs: [
      {
        id: "o_seed_1",
        tool: "summary",
        title: "Q3 planning kickoff — meeting summary",
        content:
          "Executive summary\n\nThe Q3 kickoff aligned the leadership team on three priorities: AI onboarding, enterprise readiness, and retention.\n\nKey decisions\n- Ship the new onboarding flow by Aug 15\n- Pilot the enterprise SSO rollout with two design partners\n- Freeze scope on non-critical features through end of quarter\n\nAction items\n- Amelia: finalize onboarding wireframes (Fri)\n- Marcus: staff the SSO working group (Mon)\n- Priya: draft the launch narrative (next week)",
        creatorId: "u_amelia",
        createdAt: d(30),
      },
      {
        id: "o_seed_2",
        tool: "research",
        title: "Research: Enterprise AI adoption in 2026",
        content:
          "Landscape\n\nEnterprise AI adoption has shifted from experimentation to production. Buyers now expect measurable ROI within two quarters.\n\nKey insights\n- Procurement is the #1 blocker in mid-market deals\n- Security review cycles average 6-8 weeks\n- Native integrations beat generic APIs by 3x in stickiness\n\nRecommendations\n- Invest in a security & compliance one-pager\n- Prioritize the three integrations that appear in every deal\n- Move to usage-based pricing to lower the initial commitment",
        creatorId: "u_marcus",
        createdAt: d(52),
      },
    ],
    comments: [
      {
        id: "c_seed_1",
        outputId: "o_seed_1",
        authorId: "u_marcus",
        body: "Nice recap. Can we add a line about the SSO owner rotation?",
        createdAt: d(28),
      },
      {
        id: "c_seed_2",
        outputId: "o_seed_1",
        authorId: "u_priya",
        body: "Happy to own the launch narrative draft — will circulate by Wednesday.",
        createdAt: d(20),
      },
      {
        id: "c_seed_3",
        outputId: "o_seed_2",
        authorId: "u_amelia",
        body: "The integrations point is spot on. Let's align on the shortlist next standup.",
        createdAt: d(40),
      },
    ],
    tasks: [
      {
        id: "t_seed_1",
        title: "Draft onboarding narrative",
        description: "Write the top-of-funnel narrative for the new onboarding flow.",
        priority: "high",
        dueDate: isoDate(2),
        assigneeId: "u_priya",
        status: "in_progress",
        createdAt: d(48),
      },
      {
        id: "t_seed_2",
        title: "Review Q3 risk assessment",
        description: "Read the risk brief and file mitigations for the top 3 items.",
        priority: "medium",
        dueDate: isoDate(5),
        assigneeId: "u_you",
        status: "todo",
        createdAt: d(36),
      },
      {
        id: "t_seed_3",
        title: "Ship SSO working group charter",
        description: "Publish the charter, membership, and cadence.",
        priority: "high",
        dueDate: isoDate(-1),
        assigneeId: "u_marcus",
        status: "completed",
        createdAt: d(72),
      },
      {
        id: "t_seed_4",
        title: "Interview 3 enterprise design partners",
        description: "Schedule and run discovery interviews. Sync notes here.",
        priority: "medium",
        dueDate: isoDate(9),
        assigneeId: "u_diego",
        status: "todo",
        createdAt: d(24),
      },
    ],
    activity: [
      {
        id: "a_seed_1",
        kind: "shared_output",
        actorId: "u_amelia",
        summary: "shared a meeting summary",
        detail: "Q3 planning kickoff — meeting summary",
        createdAt: d(30),
        refId: "o_seed_1",
      },
      {
        id: "a_seed_2",
        kind: "commented",
        actorId: "u_marcus",
        summary: "commented on Q3 planning kickoff",
        createdAt: d(28),
        refId: "o_seed_1",
      },
      {
        id: "a_seed_3",
        kind: "task_created",
        actorId: "u_priya",
        summary: "created a task",
        detail: "Draft onboarding narrative",
        createdAt: d(48),
      },
      {
        id: "a_seed_4",
        kind: "shared_output",
        actorId: "u_marcus",
        summary: "shared a research report",
        detail: "Enterprise AI adoption in 2026",
        createdAt: d(52),
        refId: "o_seed_2",
      },
      {
        id: "a_seed_5",
        kind: "task_completed",
        actorId: "u_marcus",
        summary: "completed a task",
        detail: "Ship SSO working group charter",
        createdAt: d(6),
      },
    ],
  };
}

function isoDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function read(): TeamState {
  if (typeof window === "undefined") return seed();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      const s = seed();
      window.localStorage.setItem(KEY, JSON.stringify(s));
      return s;
    }
    return JSON.parse(raw) as TeamState;
  } catch {
    return seed();
  }
}

function write(state: TeamState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(EVT));
}

function mutate(fn: (s: TeamState) => TeamState) {
  write(fn(read()));
}

function uid(prefix: string) {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}

const TOOL_LABEL: Record<ToolKind, string> = {
  email: "an email",
  summary: "a meeting summary",
  tasks: "a task plan",
  research: "a research report",
  chat: "an AI conversation",
};

export function shareOutput(input: {
  tool: ToolKind;
  title: string;
  content: string;
}): SharedOutput {
  const state = read();
  const item: SharedOutput = {
    id: uid("o"),
    tool: input.tool,
    title: input.title,
    content: input.content,
    creatorId: state.currentUserId,
    createdAt: Date.now(),
  };
  const activity: Activity = {
    id: uid("a"),
    kind: "shared_output",
    actorId: state.currentUserId,
    summary: `shared ${TOOL_LABEL[input.tool]}`,
    detail: input.title,
    createdAt: Date.now(),
    refId: item.id,
  };
  write({
    ...state,
    outputs: [item, ...state.outputs],
    activity: [activity, ...state.activity].slice(0, 100),
  });
  return item;
}

export function removeSharedOutput(id: string) {
  mutate((s) => ({
    ...s,
    outputs: s.outputs.filter((o) => o.id !== id),
    comments: s.comments.filter((c) => c.outputId !== id),
  }));
}

export function addComment(outputId: string, body: string): Comment | null {
  if (!body.trim()) return null;
  const state = read();
  const target = state.outputs.find((o) => o.id === outputId);
  const item: Comment = {
    id: uid("c"),
    outputId,
    authorId: state.currentUserId,
    body: body.trim(),
    createdAt: Date.now(),
  };
  const activity: Activity = {
    id: uid("a"),
    kind: "commented",
    actorId: state.currentUserId,
    summary: target ? `commented on ${target.title}` : "commented",
    createdAt: Date.now(),
    refId: outputId,
  };
  write({
    ...state,
    comments: [...state.comments, item],
    activity: [activity, ...state.activity].slice(0, 100),
  });
  return item;
}

export function createTask(input: Omit<TeamTask, "id" | "createdAt" | "status"> & { status?: TaskStatus }): TeamTask {
  const state = read();
  const item: TeamTask = {
    ...input,
    status: input.status ?? "todo",
    id: uid("t"),
    createdAt: Date.now(),
  };
  const activity: Activity = {
    id: uid("a"),
    kind: "task_created",
    actorId: state.currentUserId,
    summary: "created a task",
    detail: item.title,
    createdAt: Date.now(),
  };
  write({
    ...state,
    tasks: [item, ...state.tasks],
    activity: [activity, ...state.activity].slice(0, 100),
  });
  return item;
}

export function updateTaskStatus(id: string, status: TaskStatus) {
  const state = read();
  const task = state.tasks.find((t) => t.id === id);
  if (!task) return;
  const next: TeamState = {
    ...state,
    tasks: state.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
  };
  if (status === "completed" && task.status !== "completed") {
    next.activity = [
      {
        id: uid("a"),
        kind: "task_completed",
        actorId: state.currentUserId,
        summary: "completed a task",
        detail: task.title,
        createdAt: Date.now(),
      },
      ...state.activity,
    ].slice(0, 100);
  }
  write(next);
}

export function deleteTask(id: string) {
  mutate((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }));
}

export function useTeam() {
  const [state, setState] = useState<TeamState>(() => seed());
  const refresh = useCallback(() => setState(read()), []);
  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener(EVT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVT, handler);
      window.removeEventListener("storage", handler);
    };
  }, [refresh]);
  return state;
}

export function memberById(state: TeamState, id: string): TeamMember {
  return state.members.find((m) => m.id === id) ?? state.members[0];
}

export const TOOL_META: Record<ToolKind, { label: string; short: string }> = {
  email: { label: "Email", short: "Email" },
  summary: { label: "Meeting Summary", short: "Summary" },
  tasks: { label: "Task Plan", short: "Tasks" },
  research: { label: "Research Report", short: "Research" },
  chat: { label: "AI Conversation", short: "Chat" },
};

export function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(ts).toLocaleDateString();
}