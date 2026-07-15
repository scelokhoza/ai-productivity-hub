import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, FileText, ListChecks, Search, Sparkles, Zap, TrendingUp, Clock } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHistory } from "@/lib/history-store";

export const Route = createFileRoute("/")({ component: Dashboard });

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
