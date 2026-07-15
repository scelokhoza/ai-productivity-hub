import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Mail,
  FileText,
  ListChecks,
  Search,
  Sparkles,
  Zap,
  TrendingUp,
  Clock,
  LayoutTemplate,
  ArrowRight,
  Users,
  ClipboardList,
  BarChart3,
} from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHistory } from "@/lib/history-store";
import { TEMPLATES, CATEGORY_META, type Template } from "@/lib/templates";

export const Route = createFileRoute("/_authenticated/")({ component: Dashboard });

const quickActions = [
  { title: "Generate Email", desc: "Draft a professional email in seconds", icon: Mail, to: "/tools", tab: "email" },
  { title: "Summarize Notes", desc: "Turn raw notes into a clean summary", icon: FileText, to: "/tools", tab: "summary" },
  { title: "Plan Tasks", desc: "Prioritize and schedule your workload", icon: ListChecks, to: "/tools", tab: "tasks" },
  { title: "Research Topic", desc: "Get structured insights on any topic", icon: Search, to: "/tools", tab: "research" },
] as const;

const toolLabels: Record<string, string> = {
  email: "Email Generator",
  summary: "Notes Summarizer",
  tasks: "Task Planner",
  research: "Research Assistant",
  chat: "AI Assistant",
};

function Dashboard() {
  const history = useHistory();
  const today = new Date().setHours(0, 0, 0, 0);
  const todayCount = history.filter((h) => h.createdAt >= today).length;
  const weekAgo = Date.now() - 7 * 86400_000;
  const weekCount = history.filter((h) => h.createdAt >= weekAgo).length;

  const stats = [
    { label: "Actions today", value: todayCount, icon: Zap, hint: "AI runs since midnight" },
    { label: "This week", value: weekCount, icon: TrendingUp, hint: "Rolling 7 days" },
    { label: "Total saved", value: history.length, icon: Clock, hint: "In your history" },
  ];

  const featuredIds = [
    "client-follow-up",
    "weekly-status-report",
    "meeting-agenda",
    "project-update",
    "risk-assessment",
    "research-brief",
  ];
  const featured = featuredIds
    .map((id) => TEMPLATES.find((t) => t.id === id))
    .filter((t): t is Template => Boolean(t));
  const categoryIcons = {
    email: Mail,
    meetings: Users,
    project: ClipboardList,
    research: Search,
    reporting: BarChart3,
  } as const;

  return (
    <AppLayout title="Dashboard">
      <div className="mx-auto max-w-6xl space-y-8">
        <section
          className="rounded-2xl border p-6 md:p-8 text-primary-foreground"
          style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-elegant)" }}
        >
          <div className="flex items-center gap-2 text-xs opacity-90">
            <Sparkles className="h-3.5 w-3.5" /> Welcome back
          </div>
          <h2 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight">
            What would you like to get done today?
          </h2>
          <p className="mt-2 max-w-2xl text-sm opacity-90">
            Draft emails, summarize meetings, plan your day, and research topics — powered by AI, built for professionals.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link to="/assistant">Open AI Assistant</Link>
            </Button>
            <Button asChild variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground/40 hover:bg-primary-foreground/10 hover:text-primary-foreground">
              <Link to="/tools">Explore Tools</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {stats.map((s) => (
            <Card key={s.label}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-semibold">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label} · {s.hint}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="text-base font-semibold">Quick actions</h3>
            <Link to="/tools" className="text-xs text-primary hover:underline">All tools →</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((q) => (
              <Link
                key={q.title}
                to={q.to}
                search={{ tab: q.tab }}
                className="group rounded-xl border bg-card p-4 transition hover:border-primary/40 hover:shadow-md"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition">
                  <q.icon className="h-5 w-5" />
                </div>
                <div className="text-sm font-semibold">{q.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">{q.desc}</div>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <div>
              <h3 className="text-base font-semibold flex items-center gap-2">
                <LayoutTemplate className="h-4 w-4 text-primary" />
                Prompt templates
              </h3>
              <p className="text-xs text-muted-foreground">
                Launch a professional workflow with one click.
              </p>
            </div>
            <Link to="/templates" className="text-xs text-primary hover:underline">
              Browse all →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((t) => {
              const Icon = categoryIcons[t.category];
              return (
                <Link
                  key={t.id}
                  to="/tools"
                  search={{ tab: t.tool, template: t.id }}
                  className="group relative overflow-hidden rounded-xl border bg-card p-4 transition hover:border-primary/40 hover:shadow-md"
                >
                  <div
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${t.accent} opacity-60`}
                  />
                  <div className="relative">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background/80 text-primary backdrop-blur">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="rounded-full bg-background/70 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground backdrop-blur">
                        {CATEGORY_META[t.category].label}
                      </span>
                    </div>
                    <div className="text-sm font-semibold">{t.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {t.description}
                    </div>
                    <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-primary opacity-0 transition group-hover:opacity-100">
                      Use template <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="text-base font-semibold">Recent activity</h3>
            <Link to="/history" className="text-xs text-primary hover:underline">View all →</Link>
          </div>
          {history.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">No activity yet</CardTitle>
                <CardDescription>Run your first AI action and it will appear here.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild size="sm"><Link to="/tools">Get started</Link></Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {history.slice(0, 5).map((h) => (
                <Card key={h.id}>
                  <CardContent className="flex items-center justify-between gap-4 p-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                          {toolLabels[h.tool] ?? h.tool}
                        </span>
                        <span className="truncate text-sm font-medium">{h.title}</span>
                      </div>
                      <div className="mt-1 line-clamp-1 text-xs text-muted-foreground">{h.prompt}</div>
                    </div>
                    <div className="text-xs text-muted-foreground shrink-0">
                      {new Date(h.createdAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
