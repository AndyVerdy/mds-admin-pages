import { useState, useCallback } from "react";
import { Check, Copy } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./tooltip";

// ── shared clipboard utility ─────────────────────────────────────────
export async function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  // Fallback for non-secure contexts (e.g. HTTP)
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand("copy");
    return true;
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}

// ── hook for copy state ──────────────────────────────────────────────
export function useCopyToClipboard(timeout = 1500) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text) => {
      const ok = await copyToClipboard(text);
      if (ok) {
        setCopied(true);
        setTimeout(() => setCopied(false), timeout);
      }
      return ok;
    },
    [timeout]
  );

  return { copied, copy };
}

// ── CopyButton component ────────────────────────────────────────────
/**
 * Shared copy-to-clipboard icon button.
 *
 * @param {string}  text       - The text to copy
 * @param {string}  [className]
 * @param {number}  [iconSize=14] - Width/height of the icon in px
 * @param {string}  [tooltip]  - Custom tooltip text (default: "Copy to clipboard")
 * @param {function} [onCopy]  - Optional callback after successful copy
 */
export default function CopyButton({
  text,
  className = "",
  iconSize = 14,
  tooltip,
  onCopy,
}) {
  const { copied, copy } = useCopyToClipboard();

  const handleClick = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    const ok = await copy(text);
    if (ok) onCopy?.(text);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={handleClick}
          className={`p-1 rounded transition-colors ${
            copied
              ? "text-green-600"
              : "text-muted-foreground hover:text-foreground"
          } ${className}`}
        >
          {copied ? (
            <Check style={{ width: iconSize, height: iconSize }} />
          ) : (
            <Copy style={{ width: iconSize, height: iconSize }} />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" arrow={false}>
        <span className="text-sm text-white">
          {copied ? "Copied!" : tooltip || "Copy to clipboard"}
        </span>
      </TooltipContent>
    </Tooltip>
  );
}
