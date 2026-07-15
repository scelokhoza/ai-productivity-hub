import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, User, Info } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { chatReply, DISCLAIMER } from "@/lib/ai-service";
import { addHistoryEntry } from "@/lib/history-store";

export const Route = createFileRoute("/_authenticated/assistant")({ component: AssistantPage });

interface Msg { id: string; role: "user" | "assistant"; content: string; ts: number }

const suggested = [
  "Write a client follow-up email",
  "Summarize these notes",
  "Create a project plan",
  "Research this business topic",
];

function AssistantPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;
    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", content: trimmed, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);
    try {
      const reply = await chatReply(
        trimmed,
        messages.map((m) => ({ role: m.role, content: m.content })),
      );
      const assistantMsg: Msg = { id: crypto.randomUUID(), role: "assistant", content: reply, ts: Date.now() };
      setMessages((m) => [...m, assistantMsg]);
      addHistoryEntry({ tool: "chat", title: trimmed.slice(0, 60), prompt: trimmed, output: reply });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "AI request failed.";
      toast.error(msg);
    } finally {
      setTyping(false);
    }
  };

  return (
    <AppLayout title="AI Assistant">
      <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-4xl flex-col gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">AI Assistant</h2>
          <p className="text-sm text-muted-foreground">Ask anything about your workplace productivity tasks.</p>
        </div>

        <Card className="flex flex-1 flex-col overflow-hidden py-0 gap-0">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div
                  className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-primary-foreground"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">How can I help you today?</h3>
                <p className="mb-6 mt-1 text-sm text-muted-foreground">Try one of the suggestions below or type your own.</p>
                <div className="grid w-full max-w-lg gap-2 sm:grid-cols-2">
                  {suggested.map((s) => (
                    <button
                      key={s}
                      onClick={() => void send(s)}
                      className="rounded-lg border bg-card p-3 text-left text-sm transition hover:border-primary/40 hover:bg-accent/40"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((m) => (
                  <MessageBubble key={m.id} msg={m} />
                ))}
                {typing && (
                  <div className="flex gap-3">
                    <Avatar role="assistant" />
                    <div className="flex items-center gap-1 rounded-2xl bg-muted px-4 py-3">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="border-t bg-background p-3">
            <div className="flex items-end gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(input); } }}
                placeholder="Ask FlowMind anything about work…"
                rows={1}
                className="min-h-[44px] resize-none"
              />
              <Button onClick={() => void send(input)} disabled={!input.trim() || typing} size="icon" className="h-11 w-11 shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Info className="h-3 w-3" /> {DISCLAIMER}
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}

function Avatar({ role }: { role: "user" | "assistant" }) {
  if (role === "user") {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
        <User className="h-4 w-4" />
      </div>
    );
  }
  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-primary-foreground"
      style={{ background: "var(--gradient-primary)" }}
    >
      <Sparkles className="h-4 w-4" />
    </div>
  );
}

function MessageBubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <Avatar role={msg.role} />
      <div className={`max-w-[80%] ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        <div
          className={`whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
          }`}
        >
          {msg.content}
        </div>
        <span className="mt-1 px-1 text-[10px] text-muted-foreground">
          {new Date(msg.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}