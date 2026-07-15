import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Mail,
  Users,
  ClipboardList,
  Search,
  BarChart3,
  LayoutTemplate,
  ArrowRight,
} from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CATEGORY_META,
  CATEGORY_ORDER,
  TEMPLATES,
  type Template,
  type TemplateCategory,
} from "@/lib/templates";

export const Route = createFileRoute("/_authenticated/templates")({
  component: TemplatesPage,
});

const CATEGORY_ICONS: Record<TemplateCategory, typeof Mail> = {
  email: Mail,
  meetings: Users,
  project: ClipboardList,
  research: Search,
  reporting: BarChart3,
};

function TemplatesPage() {
  const [active, setActive] = useState<TemplateCategory | "all">("all");
  const filtered =
    active === "all" ? TEMPLATES : TEMPLATES.filter((t) => t.category === active);

  return (
    <AppLayout title="Prompt Templates">
      <div className="mx-auto max-w-6xl space-y-8">
        <section
          className="rounded-2xl border p-6 md:p-8 text-primary-foreground"
          style={{
            background: "var(--gradient-primary)",
            boxShadow: "var(--shadow-elegant)",
          }}
        >
          <div className="flex items-center gap-2 text-xs opacity-90">
            <LayoutTemplate className="h-3.5 w-3.5" /> Prompt library
          </div>
          <h2 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight">
            Launch a template. Ship in minutes.
          </h2>
          <p className="mt-2 max-w-2xl text-sm opacity-90">
            Curated, professional workplace prompts pre-wired to the right tool —
            emails, meeting agendas, project updates, research briefs, and reports.
          </p>
        </section>

        <div className="flex flex-wrap gap-2">
          <CategoryChip
            label="All"
            active={active === "all"}
            onClick={() => setActive("all")}
            count={TEMPLATES.length}
          />
          {CATEGORY_ORDER.map((c) => (
            <CategoryChip
              key={c}
              label={CATEGORY_META[c].label}
              active={active === c}
              onClick={() => setActive(c)}
              count={TEMPLATES.filter((t) => t.category === c).length}
              Icon={CATEGORY_ICONS[c]}
            />
          ))}
        </div>

        {active !== "all" && (
          <p className="-mt-4 text-sm text-muted-foreground">
            {CATEGORY_META[active].description}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <TemplateCard key={t.id} template={t} />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
  count,
  Icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  count: number;
  Icon?: typeof Mail;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition " +
        (active
          ? "border-primary bg-primary text-primary-foreground"
          : "bg-card text-foreground hover:border-primary/40")
      }
    >
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      <span>{label}</span>
      <span
        className={
          "rounded-full px-1.5 text-[10px] " +
          (active ? "bg-primary-foreground/20" : "bg-muted text-muted-foreground")
        }
      >
        {count}
      </span>
    </button>
  );
}

const TOOL_LABEL: Record<Template["tool"], string> = {
  email: "Email Generator",
  summary: "Notes Summarizer",
  tasks: "Task Planner",
  research: "Research Assistant",
};

function TemplateCard({ template }: { template: Template }) {
  const Icon = CATEGORY_ICONS[template.category];
  return (
    <Card className="group relative overflow-hidden transition hover:shadow-lg hover:border-primary/40">
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${template.accent} opacity-60`}
      />
      <CardContent className="relative flex h-full flex-col gap-4 p-5">
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background/80 text-primary backdrop-blur">
            <Icon className="h-5 w-5" />
          </div>
          <span className="rounded-full bg-background/70 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground backdrop-blur">
            {CATEGORY_META[template.category].label}
          </span>
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold leading-tight">{template.title}</h3>
          <p className="text-xs text-muted-foreground">{template.description}</p>
        </div>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-[11px] text-muted-foreground">
            Opens in {TOOL_LABEL[template.tool]}
          </span>
          <Button asChild size="sm" variant="secondary">
            <Link
              to="/tools"
              search={{ tab: template.tool, template: template.id }}
            >
              Use template
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}