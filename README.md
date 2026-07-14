# FlowMind — AI Workplace Productivity Assistant

FlowMind is a modern, responsive SaaS-style web application that helps professionals boost workplace productivity through AI-assisted tools. Built as an academic MVP prototype, it demonstrates a polished, component-based frontend with simulated AI responses — no backend integrations required.

> **Note:** AI-generated content may require human review. All AI responses in this prototype are simulated for demonstration purposes.

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
- Context-aware simulated responses

### 📚 History
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
├── lib/
│   ├── ai-service.ts        # Simulated AI response engine
│   ├── history-store.ts     # localStorage-backed history
│   └── utils.ts
├── routes/
│   ├── __root.tsx           # Root layout + SEO metadata
│   ├── index.tsx            # Dashboard
│   ├── tools.tsx            # Productivity Tools (tabbed)
│   ├── assistant.tsx        # AI chatbot
│   └── history.tsx          # Activity history
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

This is an **academic prototype** — there is no LLM call. `src/lib/ai-service.ts` provides deterministic, templated responses with realistic latency (700–1900 ms) to simulate an AI backend. Each tool has its own response generator:

- `generateEmail()` — templated professional emails
- `summarizeNotes()` — structured meeting summaries
- `planTasks()` — prioritized task plans
- `researchTopic()` — insights + recommendations
- `chatReply()` — intent-matched conversational replies

Swapping the mock for a real AI backend requires only replacing these functions with API calls — the UI contract stays identical.

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