import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search as SearchIcon, Trash2, FileText, Mail, ListChecks, Search, MessageSquare, RotateCcw } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { AiResult } from "@/components/ai-result";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { clearHistory, removeHistoryEntry, useHistory, type HistoryEntry } from "@/lib/history-store";
import type { ToolKind } from "@/lib/ai-service";

export const Route = createFileRoute("/history")({ component: HistoryPage });

const toolMeta: Record<ToolKind, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  email: { label: "Email", icon: Mail },
  summary: { label: "Summary", icon: FileText },
  tasks: { label: "Tasks", icon: ListChecks },
  research: { label: "Research", icon: Search },
  chat: { label: "Chat", icon: MessageSquare },
};

function HistoryPage() {
  const entries = useHistory();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<HistoryEntry | null>(null);
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (filter !== "all" && e.tool !== filter) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return e.title.toLowerCase().includes(q) || e.prompt.toLowerCase().includes(q) || e.output.toLowerCase().includes(q);
    });
  }, [entries, query, filter]);

  const reuse = (e: HistoryEntry) => {
    if (e.tool === "chat") {
      void navigate({ to: "/assistant" });
    } else {
      void navigate({ to: "/tools", search: { tab: e.tool } });
    }
  };

  return (
    <AppLayout title="History">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">History</h2>
            <p className="text-sm text-muted-foreground">Every AI activity you've run, saved locally in your browser.</p>
          </div>
          {entries.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => { clearHistory(); setSelected(null); }}>
              <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Clear all
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search history…" className="pl-9" />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tools</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="summary">Summary</SelectItem>
              <SelectItem value="tasks">Tasks</SelectItem>
              <SelectItem value="research">Research</SelectItem>
              <SelectItem value="chat">Chat</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {entries.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <SearchIcon className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium">No history yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Your AI-generated outputs will appear here as you use the tools.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
            <div className="space-y-2">
              {filtered.length === 0 && (
                <p className="text-sm text-muted-foreground">No matches for your search.</p>
              )}
              {filtered.map((e) => {
                const meta = toolMeta[e.tool];
                const isSelected = selected?.id === e.id;
                return (
                  <button
                    key={e.id}
                    onClick={() => setSelected(e)}
                    className={`w-full rounded-lg border p-3 text-left transition hover:border-primary/40 hover:bg-accent/30 ${
                      isSelected ? "border-primary/60 bg-accent/40" : "bg-card"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-primary">
                        <meta.icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{meta.label}</span>
                      <span className="ml-auto text-[10px] text-muted-foreground">
                        {new Date(e.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-2 truncate text-sm font-medium">{e.title}</div>
                    <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{e.prompt}</div>
                  </button>
                );
              })}
            </div>
            <div className="space-y-3">
              {selected ? (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">{toolMeta[selected.tool].label}</div>
                      <div className="truncate font-medium">{selected.title}</div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="outline" size="sm" onClick={() => reuse(selected)}>
                        <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reuse
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { removeHistoryEntry(selected.id); setSelected(null); }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <AiResult output={selected.output} timestamp={selected.createdAt} />
                </>
              ) : (
                <Card className="flex h-full items-center justify-center border-dashed">
                  <CardContent className="py-12 text-center text-sm text-muted-foreground">
                    Select an item on the left to view its output.
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}