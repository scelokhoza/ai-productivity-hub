import { useState } from "react";
import { Copy, RefreshCw, Check, Info, FileText, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DISCLAIMER } from "@/lib/ai-service";
import { toast } from "sonner";

interface Props {
  output: string;
  timestamp: number;
  loading?: boolean;
  onRegenerate?: () => void;
}

export function AiResult({ output, timestamp, loading, onRegenerate }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 1500);
  };

  const filenameBase = () => {
    const d = new Date(timestamp);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `flowmind-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
  };

  const downloadTxt = () => {
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filenameBase()}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Downloaded as TXT");
  };

  const downloadPdf = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 48;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxWidth = pageWidth - margin * 2;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("FlowMind AI Output", margin, margin);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Generated ${new Date(timestamp).toLocaleString()}`, margin, margin + 16);

    doc.setTextColor(20);
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(output, maxWidth);
    let y = margin + 40;
    const lineHeight = 15;
    for (const line of lines) {
      if (y + lineHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += lineHeight;
    }

    doc.save(`${filenameBase()}.pdf`);
    toast.success("Downloaded as PDF");
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex gap-1">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" style={{ animationDelay: "0ms" }} />
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" style={{ animationDelay: "150ms" }} />
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" style={{ animationDelay: "300ms" }} />
          </div>
          Generating with AI…
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-2">
        <span className="text-xs text-muted-foreground">
          Generated {new Date(timestamp).toLocaleString()}
        </span>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={copy}>
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="ml-1.5">{copied ? "Copied" : "Copy"}</span>
          </Button>
          <Button size="sm" variant="ghost" onClick={downloadTxt}>
            <FileText className="h-3.5 w-3.5" />
            <span className="ml-1.5">TXT</span>
          </Button>
          <Button size="sm" variant="ghost" onClick={() => void downloadPdf()}>
            <FileDown className="h-3.5 w-3.5" />
            <span className="ml-1.5">PDF</span>
          </Button>
          {onRegenerate && (
            <Button size="sm" variant="ghost" onClick={onRegenerate}>
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="ml-1.5">Regenerate</span>
            </Button>
          )}
        </div>
      </div>
      <div className="p-5">
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">{output}</pre>
      </div>
      <div className="flex items-center gap-2 border-t bg-accent/40 px-4 py-2 text-xs text-accent-foreground">
        <Info className="h-3.5 w-3.5" />
        {DISCLAIMER}
      </div>
    </Card>
  );
}