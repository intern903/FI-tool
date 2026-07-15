import { useState } from "react";
import { Check, Download, Link2, Share2 } from "lucide-react";
import { Button } from "../ui/button";

export function ExportBar({ businessName }: { businessName: string }) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  const share = async () => {
    const data = {
      title: `${businessName} — AI Growth Audit`,
      text: `AI growth audit for ${businessName}`,
      url: window.location.href,
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
      copyLink();
    }
  };

  return (
    <div className="no-print flex flex-wrap items-center justify-center gap-3">
      <Button variant="primary" size="md" onClick={() => window.print()}>
        <Download className="h-4 w-4" />
        Download PDF
      </Button>
      <Button variant="secondary" size="md" onClick={share}>
        {shared ? <Check className="h-4 w-4 text-sage-700" /> : <Share2 className="h-4 w-4" />}
        Share Report
      </Button>
      <Button variant="secondary" size="md" onClick={copyLink}>
        {copied ? <Check className="h-4 w-4 text-sage-700" /> : <Link2 className="h-4 w-4" />}
        {copied ? "Copied" : "Copy Link"}
      </Button>
    </div>
  );
}
