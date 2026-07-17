# FlowMind — AI Workplace Productivity Assistant

FlowMind is a modern, responsive SaaS-style web application that helps professionals boost workplace productivity through AI-assisted tools. It pairs a polished component-based frontend with a real LLM backend, Supabase authentication, and lightweight team collaboration.

> **Note:** AI-generated content may require human review before use.

---

## ✨ Features

### 🏠 Dashboard
- Productivity stats overview
- Quick-action navigation to all tools
- Recent AI activity feed

### 🛠️ Productivity Tools
A unified tabbed interface with four AI-powered tools:

1. **Smart Email Generator** — Draft professional emails from a purpose, audience, tone, and key points.
2. **Meeting Notes Summarizer** — Turn raw notes into structured summaries with key points, action items, deadlines, and risks.
3. **AI Task Planner** — Prioritize tasks (P0–P3), generate schedules, and surface urgent items.
4. **AI Research Assistant** — Get key insights, summaries, recommendations, and next steps on any topic.

### 💬 AI Assistant
- Conversational chatbot interface
- Suggested prompts for quick starts
- Context-aware LLM responses with full message history

### 📚 Prompt Templates Library
- Curated professional templates across Email, Meetings, Project Management, Research, and Reporting
- One-click launch that pre-configures the relevant tool with the template's prompt

### 👥 Team Workspace
- Team members, shared AI outputs, threaded comments, and a Kanban task board
- Activity feed of shares, comments, and task updates
- Persisted locally via `localStorage` (MVP)

### 📤 Export
Every AI result can be copied, downloaded as TXT, or exported as PDF (via `jspdf`).

### 🔐 Authentication
- Supabase email + password auth (combined sign-in / sign-up page)
- Route protection via a `_authenticated` layout
- Logout from the sidebar

### 🕘 History
- Persistent local history of every AI activity (via `localStorage`)
- Full-text search across prompts and outputs
- Filter by tool type
- Reuse previous prompts with one click
- View and copy past outputs

---

## 🧱 Tech Stack

| Layer          | Technology                                     |
| -------------- | ---------------------------------------------- |
| Framework      | [TanStack Start](https://tanstack.com/start) (React 19, SSR) |
| Routing        | TanStack Router (file-based)                   |
| Build Tool     | Vite 7                                         |
| Styling        | Tailwind CSS v4 + custom design tokens (oklch) |
| UI Components  | [shadcn/ui](https://ui.shadcn.com/) (Radix + Tailwind) |
| Icons          | Lucide React                                   |
| State / Data   | TanStack Query, React hooks, `localStorage`    |
| Auth / DB      | Supabase (via Lovable Cloud)                   |
| AI             | Lovable AI Gateway (`google/gemini-3-flash-preview`) via Vercel AI SDK |
| Export         | `jspdf` for PDF downloads                      |
| Language       | TypeScript (strict)                            |

---

## 📂 Project Structure

```text
src/
├── components/
│   ├── ai-result.tsx        # Reusable AI output display
│   ├── app-layout.tsx       # App shell with sidebar
│   ├── app-sidebar.tsx      # Navigation sidebar
│   └── ui/                  # shadcn/ui primitives
├── integrations/
│   └── supabase/            # Auth client, middleware, generated types
├── lib/
│   ├── ai-service.ts        # Client-side wrapper around the AI server function
│   ├── ai.functions.ts      # TanStack server function calling the AI Gateway
│   ├── ai-gateway.server.ts # Lovable AI Gateway provider
│   ├── templates.ts         # Prompt template catalog
│   ├── team-store.ts        # Team collaboration store (localStorage)
│   ├── history-store.ts     # localStorage-backed history
│   └── utils.ts
├── routes/
│   ├── __root.tsx           # Root layout + SEO metadata
│   ├── auth.tsx             # Sign in / sign up
│   └── _authenticated/      # Protected routes
│       ├── route.tsx        # Auth gate
│       ├── index.tsx        # Dashboard
│       ├── tools.tsx        # Productivity Tools (tabbed)
│       ├── assistant.tsx    # AI chatbot
│       ├── templates.tsx    # Prompt Templates gallery
│       ├── team.tsx         # Team workspace
│       └── history.tsx      # Activity history
└── styles.css               # Design tokens & global styles
```

---

## 🚀 Getting Started

### Prerequisites
- [Bun](https://bun.sh/) (recommended) or Node.js 20+

### Install & Run

```bash
# Install dependencies
bun install

# Start the dev server
bun run dev
```

The app will be available at [http://localhost:8080](http://localhost:8080).

### Build for Production

```bash
bun run build
bun run start
```

---

## 🎨 Design System

FlowMind uses a fully token-based design system defined in `src/styles.css`:

- **Colors** — all values use `oklch` for perceptual uniformity
- **Semantic tokens** — `primary`, `secondary`, `accent`, `muted`, `sidebar-*`, etc.
- **Gradients & shadows** — `--gradient-primary`, `--shadow-elegant`
- **Dark mode** — full parity via `.dark` class overrides
- **Radius scale** — `--radius-sm` through `--radius-4xl`

All components consume tokens through Tailwind utilities (`bg-primary`, `text-muted-foreground`, etc.) — no hardcoded colors.

---

## 🧠 How the "AI" Works

FlowMind calls a real LLM through the **Lovable AI Gateway**. The client-side helpers in `src/lib/ai-service.ts` (`generateEmail`, `summarizeNotes`, `planTasks`, `researchTopic`, `chatReply`) invoke a TanStack server function (`runAi` in `src/lib/ai.functions.ts`), which forwards the request to the gateway using the Vercel AI SDK (`@ai-sdk/openai-compatible` + `ai`).

- Model: `google/gemini-3-flash-preview`
- Each tool has its own system prompt tailored to the output format (structured markdown for summaries, plans, and research; plain-text emails).
- The `LOVABLE_API_KEY` environment variable is read server-side; no keys are exposed to the browser.
- Rate-limit (429) and credit-exhausted (402) errors are surfaced with friendly messages.

---

## ♿ Accessibility

- Semantic HTML throughout
- Keyboard-navigable forms, tabs, and dialogs (Radix primitives)
- Visible focus rings via `--ring` token
- ARIA labels on icon-only buttons
- Responsive layout down to mobile viewports

---

## 📄 License

This project is an academic prototype and is provided as-is for educational and demonstration purposes.

---

## 🙏 Acknowledgements

- [shadcn/ui](https://ui.shadcn.com/) for the component system
- [TanStack](https://tanstack.com/) for Router, Query, and Start
- [Lucide](https://lucide.dev/) for icons
- Built on [Lovable](https://lovable.dev/)