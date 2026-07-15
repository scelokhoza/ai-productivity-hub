import type { EmailInput, ResearchInput, TasksInput } from "./ai-service";

export type TemplateCategory =
  | "email"
  | "meetings"
  | "project"
  | "research"
  | "reporting";

export type TemplateTool = "email" | "summary" | "tasks" | "research";

export interface Template {
  id: string;
  title: string;
  description: string;
  category: TemplateCategory;
  tool: TemplateTool;
  accent: string; // tailwind gradient classes for card accent
  prefill: {
    email?: Partial<EmailInput>;
    summary?: { notes: string };
    tasks?: Partial<TasksInput>;
    research?: Partial<ResearchInput>;
  };
}

export const CATEGORY_META: Record<
  TemplateCategory,
  { label: string; description: string }
> = {
  email: {
    label: "Email Templates",
    description: "Polished, on-brand messages for every workplace scenario.",
  },
  meetings: {
    label: "Meetings",
    description: "Agendas, summaries, and follow-ups that keep teams aligned.",
  },
  project: {
    label: "Project Management",
    description: "Plans, updates, and risk assessments to move work forward.",
  },
  research: {
    label: "Research",
    description: "Structured briefs and insight scans for informed decisions.",
  },
  reporting: {
    label: "Reporting",
    description: "Executive-ready status, metrics, and performance summaries.",
  },
};

export const CATEGORY_ORDER: TemplateCategory[] = [
  "email",
  "meetings",
  "project",
  "research",
  "reporting",
];

export const TEMPLATES: Template[] = [
  // Email
  {
    id: "client-follow-up",
    title: "Client Follow-Up Email",
    description: "Re-engage a client after a proposal, meeting, or demo.",
    category: "email",
    tool: "email",
    accent: "from-sky-500/20 to-indigo-500/10",
    prefill: {
      email: {
        purpose: "Follow up with a client after our recent conversation",
        audience: "Client contact who has gone quiet since our last touchpoint",
        tone: "Professional",
        keyPoints:
          "Reference the previous conversation and any commitments made\nRestate the value we can deliver for their goals\nPropose a concrete next step (short call, revised proposal, timeline)\nInvite questions and offer availability this week and next",
      },
    },
  },
  {
    id: "internal-announcement",
    title: "Internal Announcement",
    description: "Share a company-wide update with the right context and tone.",
    category: "email",
    tool: "email",
    accent: "from-emerald-500/20 to-teal-500/10",
    prefill: {
      email: {
        purpose: "Announce an important internal update to the whole company",
        audience: "All employees across departments",
        tone: "Friendly",
        keyPoints:
          "What is changing and why it matters now\nWho is affected and what actions they need to take\nTimeline and key dates\nWhere to ask questions or read more",
      },
    },
  },
  {
    id: "cold-outreach",
    title: "Cold Outreach Email",
    description: "Introduce yourself to a prospect and open a real conversation.",
    category: "email",
    tool: "email",
    accent: "from-fuchsia-500/20 to-purple-500/10",
    prefill: {
      email: {
        purpose: "Introduce our product and book a discovery call",
        audience: "Head of Operations at a mid-market SaaS company",
        tone: "Persuasive",
        keyPoints:
          "Personalized opener referencing their company or recent news\nOne-sentence description of what we do and the outcome we drive\nOne concrete result or metric from a similar customer\nClear ask: a 20-minute call next week",
      },
    },
  },

  // Meetings
  {
    id: "meeting-agenda",
    title: "Meeting Agenda",
    description: "Draft a focused agenda so the meeting stays on track.",
    category: "meetings",
    tool: "tasks",
    accent: "from-amber-500/20 to-orange-500/10",
    prefill: {
      tasks: {
        tasks:
          "Kickoff and objectives (5 min)\nStatus updates from each workstream (15 min)\nKey decisions needed today (15 min)\nRisks and blockers (10 min)\nAction items and owners (10 min)\nQ&A and next meeting (5 min)",
        deadlines: "60-minute meeting starting at 10:00 AM",
        context:
          "Turn this into a structured agenda with clear time blocks, desired outcomes for each item, and a facilitator note per section. Optimize the order for engagement and decision-making.",
      },
    },
  },
  {
    id: "meeting-summary",
    title: "Meeting Summary",
    description: "Turn raw meeting notes into a shareable recap with actions.",
    category: "meetings",
    tool: "summary",
    accent: "from-blue-500/20 to-cyan-500/10",
    prefill: {
      summary: {
        notes:
          "Paste your raw meeting notes here. Include attendees, key discussion points, decisions, action items with owners, and any deadlines mentioned.",
      },
    },
  },
  {
    id: "one-on-one-agenda",
    title: "1:1 Meeting Agenda",
    description: "A thoughtful agenda for a manager–report weekly check-in.",
    category: "meetings",
    tool: "tasks",
    accent: "from-rose-500/20 to-pink-500/10",
    prefill: {
      tasks: {
        tasks:
          "Check-in and personal update\nWins and progress since last 1:1\nCurrent priorities and blockers\nFeedback in both directions\nCareer growth and development\nAction items for the week ahead",
        deadlines: "30-minute weekly 1:1",
        context:
          "Turn this into a warm, structured 1:1 agenda with suggested prompts for each section. Balance operational updates with growth and wellbeing.",
      },
    },
  },

  // Project management
  {
    id: "project-update",
    title: "Project Update",
    description: "Communicate progress, risks, and next steps to stakeholders.",
    category: "project",
    tool: "email",
    accent: "from-indigo-500/20 to-blue-500/10",
    prefill: {
      email: {
        purpose: "Send a stakeholder project status update",
        audience: "Executive sponsors and cross-functional partners",
        tone: "Professional",
        keyPoints:
          "Overall status (on track / at risk / off track) with one-line rationale\nProgress since the last update — highlights and milestones hit\nCurrent risks or blockers and how we are addressing them\nUpcoming milestones and dates\nAsks or decisions needed from stakeholders",
      },
    },
  },
  {
    id: "risk-assessment",
    title: "Risk Assessment",
    description: "Identify, rank, and plan mitigations for project risks.",
    category: "project",
    tool: "tasks",
    accent: "from-red-500/20 to-orange-500/10",
    prefill: {
      tasks: {
        tasks:
          "Identify top delivery risks (scope, timeline, dependencies)\nAssess likelihood and impact for each risk\nDefine mitigation and contingency plans\nAssign a risk owner\nSchedule review cadence\nEscalation criteria and thresholds",
        deadlines: "Assessment needed before the next steering committee",
        context:
          "Produce a structured risk assessment with priority tags, an owner column, and specific mitigation actions. Call out any risks that need executive attention.",
      },
    },
  },
  {
    id: "sprint-plan",
    title: "Sprint Planning",
    description: "Prioritize a realistic sprint backlog with clear ownership.",
    category: "project",
    tool: "tasks",
    accent: "from-violet-500/20 to-purple-500/10",
    prefill: {
      tasks: {
        tasks:
          "Carryover work from previous sprint\nTop customer-facing bugs\nHighest-impact roadmap items\nTech debt and reliability work\nDocumentation and enablement",
        deadlines: "Two-week sprint starting Monday",
        context:
          "Turn this into a prioritized sprint plan with a suggested capacity split, must-haves vs. stretch goals, and a note on dependencies between items.",
      },
    },
  },

  // Research
  {
    id: "research-brief",
    title: "Research Brief",
    description: "A structured briefing on any topic with insights and next steps.",
    category: "research",
    tool: "research",
    accent: "from-cyan-500/20 to-sky-500/10",
    prefill: {
      research: {
        topic: "Enterprise AI adoption in 2026",
        goal: "Understand where enterprises are investing and what's working",
        outcome:
          "A concise brief I can share with leadership to inform our AI strategy and roadmap for next year",
      },
    },
  },
  {
    id: "competitive-scan",
    title: "Competitive Landscape Scan",
    description: "Compare competitors' positioning, strengths, and gaps.",
    category: "research",
    tool: "research",
    accent: "from-teal-500/20 to-emerald-500/10",
    prefill: {
      research: {
        topic: "Competitive landscape in our category",
        goal: "Map key competitors, their positioning, and where they are winning",
        outcome:
          "A comparative view of 3–5 competitors including differentiators, pricing signals, and clear gaps we can exploit",
      },
    },
  },
  {
    id: "market-trends",
    title: "Market Trends Overview",
    description: "Surface the trends shaping a market and what they imply.",
    category: "research",
    tool: "research",
    accent: "from-lime-500/20 to-emerald-500/10",
    prefill: {
      research: {
        topic: "Emerging trends in our target market",
        goal: "Identify the top shifts that will affect our customers in the next 12 months",
        outcome:
          "A prioritized list of trends with 'so what' implications and specific recommendations for our product and GTM",
      },
    },
  },

  // Reporting
  {
    id: "weekly-status-report",
    title: "Weekly Status Report",
    description: "A clean weekly recap of progress, priorities, and blockers.",
    category: "reporting",
    tool: "summary",
    accent: "from-orange-500/20 to-amber-500/10",
    prefill: {
      summary: {
        notes:
          "This week — key accomplishments across workstreams:\n- \n\nMetrics / KPIs to highlight:\n- \n\nBlockers or risks:\n- \n\nNext week — top priorities:\n- \n\nDecisions or help needed:\n- ",
      },
    },
  },
  {
    id: "monthly-business-review",
    title: "Monthly Business Review",
    description: "Executive-ready MBR summary with themes and asks.",
    category: "reporting",
    tool: "summary",
    accent: "from-slate-500/20 to-zinc-500/10",
    prefill: {
      summary: {
        notes:
          "Headline results and key metrics vs. plan:\n- \n\nWhat drove performance (positive and negative):\n- \n\nCustomer highlights, wins, and losses:\n- \n\nProduct and operational updates:\n- \n\nRisks and mitigations:\n- \n\nAsks for the leadership team:\n- ",
      },
    },
  },
  {
    id: "quarterly-goal-review",
    title: "Quarterly Goal Review",
    description: "Retrospective on the quarter's goals with clear takeaways.",
    category: "reporting",
    tool: "summary",
    accent: "from-yellow-500/20 to-amber-500/10",
    prefill: {
      summary: {
        notes:
          "Quarterly goals and target outcomes:\n- \n\nActual results and status for each goal:\n- \n\nWhat went well:\n- \n\nWhat we would do differently:\n- \n\nCarryover into next quarter:\n- ",
      },
    },
  },
];

export function getTemplate(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

export function templatesByCategory(cat: TemplateCategory): Template[] {
  return TEMPLATES.filter((t) => t.category === cat);
}