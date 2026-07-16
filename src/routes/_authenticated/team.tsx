import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Users,
  MessageSquare,
  ClipboardList,
  Activity as ActivityIcon,
  Share2,
  Mail,
  FileText,
  ListChecks,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  addComment,
  createTask,
  deleteTask,
  memberById,
  relativeTime,
  removeSharedOutput,
  TOOL_META,
  updateTaskStatus,
  useTeam,
  type ActivityKind,
  type SharedOutput,
  type TaskPriority,
  type TaskStatus,
  type TeamTask,
} from "@/lib/team-store";
import type { ToolKind } from "@/lib/ai-service";

export const Route = createFileRoute("/_authenticated/team")({ component: TeamPage });

const TOOL_ICON: Record<ToolKind, typeof Mail> = {
  email: Mail,
  summary: FileText,
  tasks: ListChecks,
  research: Search,
  chat: MessageSquare,
};

function TeamPage() {
  const state = useTeam();
  const [tab, setTab] = useState("overview");

  const openTasks = state.tasks.filter((t) => t.status !== "completed").length;
  const completedTasks = state.tasks.length - openTasks;

  return (
    <AppLayout title="Team">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight">Team Workspace</h2>
          <p className="text-sm text-muted-foreground">
            Share AI-generated work, discuss ideas, and coordinate on tasks with your team.
          </p>
        </header>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Team members" value={state.members.length} icon={Users} hint="Active collaborators" />
          <StatCard label="Shared outputs" value={state.outputs.length} icon={Share2} hint="AI results shared" />
          <StatCard label="Open tasks" value={openTasks} icon={ClipboardList} hint={`${completedTasks} completed`} />
          <StatCard label="Recent events" value={state.activity.length} icon={ActivityIcon} hint="Last 100 events" />
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="outputs">Shared outputs</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <OverviewTab onSeeAll={setTab} />
          </TabsContent>
          <TabsContent value="outputs" className="mt-6">
            <OutputsTab />
          </TabsContent>
          <TabsContent value="tasks" className="mt-6">
            <TasksTab />
          </TabsContent>
          <TabsContent value="activity" className="mt-6">
            <ActivityTab />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: number;
  icon: typeof Users;
  hint: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-2xl font-semibold">{value}</div>
          <div className="text-xs text-muted-foreground">
            {label} · {hint}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Avatar({ initials, color, size = 32 }: { initials: string; color: string; size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-full text-[11px] font-semibold text-white shrink-0"
      style={{ backgroundColor: color, width: size, height: size }}
    >
      {initials}
    </div>
  );
}

function OverviewTab({ onSeeAll }: { onSeeAll: (tab: string) => void }) {
  const state = useTeam();
  const recentOutputs = state.outputs.slice(0, 3);
  const recentActivity = state.activity.slice(0, 6);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Recently shared outputs</CardTitle>
            <CardDescription>AI results your team has saved to the workspace.</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onSeeAll("outputs")}>
            View all
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentOutputs.length === 0 ? (
            <EmptyRow text="No shared outputs yet. Generate something in Tools and click Share to team." />
          ) : (
            recentOutputs.map((o) => <OutputRow key={o.id} output={o} compact />)
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" /> Team members
          </CardTitle>
          <CardDescription>{state.members.length} collaborators</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {state.members.map((m) => (
            <div key={m.id} className="flex items-center gap-3">
              <Avatar initials={m.initials} color={m.color} />
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{m.name}</div>
                <div className="text-xs text-muted-foreground truncate">{m.role}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Recent team activity</CardTitle>
            <CardDescription>What your team has been up to.</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onSeeAll("activity")}>
            View all
          </Button>
        </CardHeader>
        <CardContent>
          <ActivityList items={recentActivity} />
        </CardContent>
      </Card>
    </div>
  );
}

function OutputRow({ output, compact }: { output: SharedOutput; compact?: boolean }) {
  const state = useTeam();
  const [open, setOpen] = useState(false);
  const creator = memberById(state, output.creatorId);
  const commentCount = state.comments.filter((c) => c.outputId === output.id).length;
  const Icon = TOOL_ICON[output.tool];
  const preview = output.content.replace(/\s+/g, " ").trim().slice(0, 180);

  return (
    <>
      <div className="rounded-lg border p-4 hover:border-primary/40 transition">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {TOOL_META[output.tool].short}
              </span>
              <span className="text-sm font-semibold truncate">{output.title}</span>
            </div>
            {!compact && (
              <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{preview}</p>
            )}
            {compact && (
              <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{preview}</p>
            )}
            <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
              <Avatar initials={creator.initials} color={creator.color} size={18} />
              <span>{creator.name}</span>
              <span>·</span>
              <span>{relativeTime(output.createdAt)}</span>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                <MessageSquare className="h-3 w-3" /> {commentCount}
              </span>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
            View
          </Button>
        </div>
      </div>
      <OutputDialog output={output} open={open} onOpenChange={setOpen} />
    </>
  );
}

function OutputDialog({
  output,
  open,
  onOpenChange,
}: {
  output: SharedOutput;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const state = useTeam();
  const creator = memberById(state, output.creatorId);
  const comments = state.comments
    .filter((c) => c.outputId === output.id)
    .sort((a, b) => a.createdAt - b.createdAt);
  const [draft, setDraft] = useState("");
  const Icon = TOOL_ICON[output.tool];

  const submit = () => {
    const res = addComment(output.id, draft);
    if (res) {
      setDraft("");
      toast.success("Comment added");
    }
  };

  const remove = () => {
    removeSharedOutput(output.id);
    onOpenChange(false);
    toast.success("Removed from team workspace");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-left truncate">{output.title}</DialogTitle>
              <DialogDescription className="text-left">
                {TOOL_META[output.tool].label} · Shared by {creator.name} · {relativeTime(output.createdAt)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="grid gap-4 md:grid-cols-5 overflow-y-auto min-h-0">
          <div className="md:col-span-3 rounded-lg border bg-muted/30 p-4">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{output.content}</pre>
          </div>
          <div className="md:col-span-2 flex flex-col gap-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Discussion ({comments.length})
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No comments yet. Start the discussion below.
                </p>
              ) : (
                comments.map((c) => {
                  const author = memberById(state, c.authorId);
                  return (
                    <div key={c.id} className="rounded-md border p-3">
                      <div className="flex items-center gap-2">
                        <Avatar initials={author.initials} color={author.color} size={22} />
                        <span className="text-xs font-medium">{author.name}</span>
                        <span className="text-[10px] text-muted-foreground">
                          · {relativeTime(c.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm text-foreground/90 whitespace-pre-wrap">{c.body}</p>
                    </div>
                  );
                })
              )}
            </div>
            <div className="space-y-2">
              <Textarea
                rows={3}
                placeholder="Leave a comment or suggestion…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              <Button size="sm" disabled={!draft.trim()} onClick={submit} className="w-full">
                Post comment
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter className="mt-2">
          <Button variant="outline" size="sm" onClick={remove}>
            <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function OutputsTab() {
  const state = useTeam();
  const [filter, setFilter] = useState<"all" | ToolKind>("all");
  const filtered = useMemo(
    () => (filter === "all" ? state.outputs : state.outputs.filter((o) => o.tool === filter)),
    [state.outputs, filter],
  );

  const filters: { key: "all" | ToolKind; label: string }[] = [
    { key: "all", label: "All" },
    { key: "email", label: "Emails" },
    { key: "summary", label: "Meeting summaries" },
    { key: "tasks", label: "Task plans" },
    { key: "research", label: "Research reports" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <Button
            key={f.key}
            size="sm"
            variant={filter === f.key ? "default" : "outline"}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </Button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No shared outputs yet. Generate an AI result in Tools and click Share to team.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((o) => (
            <OutputRow key={o.id} output={o} />
          ))}
        </div>
      )}
    </div>
  );
}

function TasksTab() {
  const state = useTeam();
  const columns: { status: TaskStatus; label: string; icon: typeof Circle }[] = [
    { status: "todo", label: "To do", icon: Circle },
    { status: "in_progress", label: "In progress", icon: Clock },
    { status: "completed", label: "Completed", icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Coordinate on team work with a simple card-based board.
        </p>
        <NewTaskDialog />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {columns.map((col) => {
          const items = state.tasks.filter((t) => t.status === col.status);
          return (
            <div key={col.status} className="rounded-xl border bg-muted/30 p-3">
              <div className="mb-3 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <col.icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm font-semibold">{col.label}</span>
                </div>
                <span className="rounded-full bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {items.length}
                </span>
              </div>
              <div className="space-y-2">
                {items.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                    No tasks
                  </div>
                ) : (
                  items.map((t) => <TaskCard key={t.id} task={t} />)
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  high: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  low: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
};

function TaskCard({ task }: { task: TeamTask }) {
  const state = useTeam();
  const assignee = memberById(state, task.assigneeId);
  const isOverdue =
    task.status !== "completed" && new Date(task.dueDate).getTime() < Date.now() - 86400_000;

  return (
    <div className="rounded-lg border bg-card p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm font-medium leading-snug">{task.title}</div>
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase ${PRIORITY_STYLES[task.priority]}`}
        >
          {task.priority}
        </span>
      </div>
      {task.description && (
        <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{task.description}</p>
      )}
      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Avatar initials={assignee.initials} color={assignee.color} size={20} />
          <span className="truncate max-w-[100px]">{assignee.name}</span>
        </div>
        <span className={isOverdue ? "text-red-500 font-medium" : ""}>
          {new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-1">
        <Select
          value={task.status}
          onValueChange={(v) => updateTaskStatus(task.id, v as TaskStatus)}
        >
          <SelectTrigger className="h-7 text-xs flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todo">To do</SelectItem>
            <SelectItem value="in_progress">In progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={() => {
            deleteTask(task.id);
            toast.success("Task deleted");
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

function NewTaskDialog() {
  const state = useTeam();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().slice(0, 10);
  });
  const [assigneeId, setAssigneeId] = useState(state.members[0]?.id ?? "u_you");

  const reset = () => {
    setTitle("");
    setDescription("");
    setPriority("medium");
  };

  const submit = () => {
    if (!title.trim()) return;
    createTask({
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate,
      assigneeId,
    });
    toast.success("Task created");
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-3.5 w-3.5 mr-1.5" /> New task
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create team task</DialogTitle>
          <DialogDescription>Assign work to a teammate with a clear due date.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Title</Label>
            <Input
              placeholder="e.g. Draft the launch narrative"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Description</Label>
            <Textarea
              rows={3}
              placeholder="Add context, links, or acceptance criteria"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Due date</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Assignee</Label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {state.members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={!title.trim()}>Create task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ActivityTab() {
  const state = useTeam();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Team activity feed</CardTitle>
        <CardDescription>Recent events across the workspace.</CardDescription>
      </CardHeader>
      <CardContent>
        <ActivityList items={state.activity} />
      </CardContent>
    </Card>
  );
}

const ACTIVITY_ICON: Record<ActivityKind, typeof Share2> = {
  shared_output: Share2,
  commented: MessageSquare,
  task_created: Plus,
  task_completed: CheckCircle2,
};

function ActivityList({ items }: { items: ReturnType<typeof useTeam>["activity"] }) {
  const state = useTeam();
  if (items.length === 0) {
    return <EmptyRow text="No activity yet." />;
  }
  return (
    <ol className="relative space-y-3">
      {items.map((a) => {
        const actor = memberById(state, a.actorId);
        const Icon = ACTIVITY_ICON[a.kind];
        return (
          <li key={a.id} className="flex items-start gap-3">
            <Avatar initials={actor.initials} color={actor.color} size={30} />
            <div className="min-w-0 flex-1 rounded-md border p-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">{actor.name}</span>
                <span className="text-muted-foreground">{a.summary}</span>
                <Icon className="h-3 w-3 text-muted-foreground" />
              </div>
              {a.detail && (
                <div className="mt-0.5 text-xs text-muted-foreground truncate">{a.detail}</div>
              )}
              <div className="mt-1 text-[11px] text-muted-foreground">{relativeTime(a.createdAt)}</div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}