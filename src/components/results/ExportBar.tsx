import { useState } from "react";
import { Check, Download, Link2, Loader2, Share2 } from "lucide-react";
import type { AnalyzeResponse } from "@/lib/types";
import { downloadReportPdf } from "@/lib/pdf";
import { buildShareUrl, setHash } from "@/lib/share";
import { Button } from "../ui/button";

export function ExportBar({ result }: { result: AnalyzeResponse }) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const shareUrl = async () => {
    const url = await buildShareUrl(result);
    // Reflect the shareable state in the address bar so a refresh keeps it too.
    const token = url.split("#r=")[1];
    if (token) setHash(token);
    return url;
  };

  const downloadPdf = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      await downloadReportPdf(result.report);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  const copyLink = async () => {
    try {
      const url = await shareUrl();
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const share = async () => {
    const url = await shareUrl();
    const data = {
      title: `${result.report.businessName} — AI Growth Audit`,
      text: `AI growth audit for ${result.report.businessName}`,
      url,
    };
    if (navigator.share) {
      try {
        await navigator.share(data);
        setShared(true);
        window.setTimeout(() => setShared(false), 1800);
      } catch {
        /* user cancelled */
      }
    } else {
      await copyLink();
    }
  };

  return (
    <div className="no-print flex flex-wrap items-center justify-center gap-3">
      <Button variant="primary" size="md" onClick={downloadPdf} disabled={downloading}>
        {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        {downloading ? "Preparing PDF…" : "Download PDF"}
      </Button>
      <Button variant="secondary" size="md" onClick={share}>
        {shared ? <Check className="h-4 w-4 text-sage-700" /> : <Share2 className="h-4 w-4" />}
        Share Report
      </Button>
      <Button variant="secondary" size="md" onClick={copyLink}>
        {copied ? <Check className="h-4 w-4 text-sage-700" /> : <Link2 className="h-4 w-4" />}
        {copied ? "Link copied" : "Copy Link"}
      </Button>
    </div>
  );
}
