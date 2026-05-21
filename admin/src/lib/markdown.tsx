import type { ReactNode } from 'react';

// Minimal markdown for description previews: **bold**, *italic*, line breaks.
// No nesting beyond bold-or-italic-not-both; no links; no headings; no lists.
// Just enough to make descriptions readable without an HTML editor.

const TOKEN = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;

export function renderInlineMarkdown(text: string | null | undefined): ReactNode {
  if (!text) return null;
  const lines = text.split(/\r?\n/);
  return lines.map((line, lineIdx) => {
    const parts = line.split(TOKEN).filter(Boolean);
    const nodes = parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return <em key={i}>{part.slice(1, -1)}</em>;
      }
      return <span key={i}>{part}</span>;
    });
    return (
      <span key={lineIdx}>
        {nodes}
        {lineIdx < lines.length - 1 && <br />}
      </span>
    );
  });
}
