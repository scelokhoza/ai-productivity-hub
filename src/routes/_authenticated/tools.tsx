import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Mail, FileText, ListChecks, Search } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/app-layout";
import { AiResult } from "@/components/ai-result";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  generateEmail,
  summarizeNotes,
  planTasks,
  researchTopic,
  type EmailInput,
  type TasksInput,
  type ResearchInput,
  type ToolKind,
} from "@/lib/ai-service";
import { addHistoryEntry } from "@/lib/history-store";
import { getTemplate, type TemplateTool } from "@/lib/templates";

const search = z.object({
  tab: z.enum(["email", "summary", "tasks", "research"]).optional(),
  template: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/tools")({
  validateSearch: search,
  component: ToolsPage,
});

function ToolsPage() {
  const { tab } = Route.useSearch();
  const navigate = Route.useNavigate();
  const active = tab ?? "email";

  return (
    <AppLayout title="Productivity Tools">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Productivity Tools</h2>
          <p className="text-sm text-muted-foreground">
            Purpose-built AI tools for the most common workplace tasks.
          </p>
        </div>
        <Tabs
          value={active}
          onValueChange={(v) =>
            navigate({ search: { tab: v as never, template: undefined } })
          }
        >
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="email"><Mail className="mr-1.5 h-3.5 w-3.5" />Email</TabsTrigger>
            <TabsTrigger value="summary"><FileText className="mr-1.5 h-3.5 w-3.5" />Summarize</TabsTrigger>
            <TabsTrigger value="tasks"><ListChecks className="mr-1.5 h-3.5 w-3.5" />Tasks</TabsTrigger>
            <TabsTrigger value="research"><Search className="mr-1.5 h-3.5 w-3.5" />Research</TabsTrigger>
          </TabsList>
          <TabsContent value="email" className="mt-6"><EmailTool /></TabsContent>
          <TabsContent value="summary" className="mt-6"><SummaryTool /></TabsContent>
          <TabsContent value="tasks" className="mt-6"><TasksTool /></TabsContent>
          <TabsContent value="research" className="mt-6"><ResearchTool /></TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

interface Result { output: string; ts: number }

function useRunner<I>(kind: ToolKind, runner: (i: I) => Promise<string>, titleOf: (i: I) => string, promptOf: (i: I) => string) {
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastInput, setLastInput] = useState<I | null>(null);
  const run = async (input: I) => {
    setLoading(true);
    setLastInput(input);
    try {
      const output = await runner(input);
      const ts = Date.now();
      setResult({ output, ts });
      addHistoryEntry({ tool: kind, title: titleOf(input), prompt: promptOf(input), output });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "AI request failed.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };
  const regenerate = () => { if (lastInput) void run(lastInput); };
  return { result, loading, run, regenerate };
}

function useTemplatePrefill<T>(
  toolKind: TemplateTool,
  apply: (prefill: NonNullable<ReturnType<typeof getPrefillFor>>) => void,
) {
  const { template } = Route.useSearch();
  useEffect(() => {
    if (!template) return;
    const t = getTemplate(template);
    if (!t || t.tool !== toolKind) return;
    const data = getPrefillFor(t, toolKind);
    if (data) apply(data as never);
  }, [template, toolKind, apply]);
}

function getPrefillFor(
  t: ReturnType<typeof getTemplate>,
  kind: TemplateTool,
): Record<string, string> | undefined {
  if (!t) return undefined;
  const p = t.prefill[kind];
  return p as Record<string, string> | undefined;
}

function EmailTool() {
  const [form, setForm] = useState<EmailInput>({ purpose: "", audience: "", tone: "Professional", keyPoints: "" });
  useTemplatePrefill("email", (data) =>
    setForm((prev) => ({ ...prev, ...(data as Partial<EmailInput>) })),
  );
  const { result, loading, run, regenerate } = useRunner<EmailInput>(
    "email",
    generateEmail,
    (i) => `Email: ${i.purpose || "Untitled"}`,
    (i) => `${i.purpose} → ${i.audience} (${i.tone})`,
  );
  const disabled = !form.purpose || !form.audience || loading;
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Smart Email Generator</CardTitle>
          <CardDescription>Draft a polished email tailored to your audience.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Email purpose"><Input placeholder="e.g. Follow up on the Q3 proposal" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} /></Field>
          <Field label="Audience"><Input placeholder="e.g. Sarah, VP of Marketing" value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} /></Field>
          <Field label="Tone">
            <Select value={form.tone} onValueChange={(v) => setForm({ ...form, tone: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Professional", "Formal", "Friendly", "Persuasive", "Concise"].map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Key points"><Textarea rows={4} placeholder="One per line" value={form.keyPoints} onChange={(e) => setForm({ ...form, keyPoints: e.target.value })} /></Field>
          <Button className="w-full" disabled={disabled} onClick={() => run(form)}>
            {loading ? "Generating…" : "Generate email"}
          </Button>
        </CardContent>
      </Card>
      <ResultPane loading={loading} result={result} onRegenerate={regenerate} placeholder="Fill in the details and generate a draft email." />
    </div>
  );
}

function SummaryTool() {
  const [notes, setNotes] = useState("");
  useTemplatePrefill("summary", (data) => {
    const d = data as { notes?: string };
    if (d.notes) setNotes(d.notes);
  });
  const { result, loading, run, regenerate } = useRunner<string>(
    "summary",
    summarizeNotes,
    () => `Notes summary (${new Date().toLocaleDateString()})`,
    (n) => n.slice(0, 120),
  );
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Meeting Notes Summarizer</CardTitle>
          <CardDescription>Turn raw notes into a structured summary with action items.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Meeting notes"><Textarea rows={12} placeholder="Paste your notes here…" value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
          <Button className="w-full" disabled={!notes.trim() || loading} onClick={() => run(notes)}>
            {loading ? "Summarizing…" : "Summarize notes"}
          </Button>
        </CardContent>
      </Card>
      <ResultPane loading={loading} result={result} onRegenerate={regenerate} placeholder="Paste your meeting notes to get a clean executive summary." />
    </div>
  );
}

function TasksTool() {
  const [form, setForm] = useState<TasksInput>({ tasks: "", deadlines: "", context: "" });
  useTemplatePrefill("tasks", (data) =>
    setForm((prev) => ({ ...prev, ...(data as Partial<TasksInput>) })),
  );
  const { result, loading, run, regenerate } = useRunner<TasksInput>(
    "tasks",
    planTasks,
    () => `Task plan (${new Date().toLocaleDateString()})`,
    (i) => i.tasks.slice(0, 120),
  );
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>AI Task Planner</CardTitle>
          <CardDescription>Prioritize your workload and get a suggested schedule.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Tasks (one per line)"><Textarea rows={6} placeholder="e.g. Finish quarterly report" value={form.tasks} onChange={(e) => setForm({ ...form, tasks: e.target.value })} /></Field>
          <Field label="Deadlines"><Input placeholder="e.g. Report due Friday" value={form.deadlines} onChange={(e) => setForm({ ...form, deadlines: e.target.value })} /></Field>
          <Field label="Priority context"><Textarea rows={3} placeholder="e.g. CEO reviewing Thursday" value={form.context} onChange={(e) => setForm({ ...form, context: e.target.value })} /></Field>
          <Button className="w-full" disabled={!form.tasks.trim() || loading} onClick={() => run(form)}>
            {loading ? "Planning…" : "Plan my day"}
          </Button>
        </CardContent>
      </Card>
      <ResultPane loading={loading} result={result} onRegenerate={regenerate} placeholder="Add your tasks to generate a prioritized plan." />
    </div>
  );
}

function ResearchTool() {
  const [form, setForm] = useState<ResearchInput>({ topic: "", goal: "", outcome: "" });
  useTemplatePrefill("research", (data) =>
    setForm((prev) => ({ ...prev, ...(data as Partial<ResearchInput>) })),
  );
  const { result, loading, run, regenerate } = useRunner<ResearchInput>(
    "research",
    researchTopic,
    (i) => `Research: ${i.topic || "Untitled"}`,
    (i) => `${i.topic} — ${i.goal}`,
  );
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>AI Research Assistant</CardTitle>
          <CardDescription>Get structured insights, recommendations, and next steps.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Topic"><Input placeholder="e.g. Enterprise AI adoption in 2025" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} /></Field>
          <Field label="Goal"><Input placeholder="e.g. Inform a board presentation" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} /></Field>
          <Field label="Desired outcome"><Textarea rows={3} placeholder="e.g. Decide whether to invest in an internal AI team" value={form.outcome} onChange={(e) => setForm({ ...form, outcome: e.target.value })} /></Field>
          <Button className="w-full" disabled={!form.topic.trim() || loading} onClick={() => run(form)}>
            {loading ? "Researching…" : "Research topic"}
          </Button>
        </CardContent>
      </Card>
      <ResultPane loading={loading} result={result} onRegenerate={regenerate} placeholder="Enter a topic and goal to generate research insights." />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      {children}
    </div>
  );
}

function ResultPane({
  loading,
  result,
  onRegenerate,
  placeholder,
  share,
}: {
  loading: boolean;
  result: Result | null;
  onRegenerate: () => void;
  placeholder: string;
  share?: { tool: "email" | "summary" | "tasks" | "research"; title: string };
}) {
  if (loading || result) {
    return (
      <AiResult
        loading={loading}
        output={result?.output ?? ""}
        timestamp={result?.ts ?? Date.now()}
        onRegenerate={onRegenerate}
        share={share}
      />
    );
  }
  return (
    <Card className="flex items-center justify-center border-dashed">
      <CardContent className="py-12 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Search className="h-5 w-5" />
        </div>
        <p className="text-sm text-muted-foreground">{placeholder}</p>
      </CardContent>
    </Card>
  );
}