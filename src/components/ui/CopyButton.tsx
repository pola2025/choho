"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";

export function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert(`${label} 복사에 실패했습니다.`);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-primary hover:bg-primary/5 rounded transition-colors"
      title="복사하기"
    >
      {copied ? (
        <>
          <Check className="w-3 h-3 text-green-500" />
          <span className="text-green-500">복사됨</span>
        </>
      ) : (
        <>
          <Copy className="w-3 h-3" />
          복사
        </>
      )}
    </button>
  );
}
