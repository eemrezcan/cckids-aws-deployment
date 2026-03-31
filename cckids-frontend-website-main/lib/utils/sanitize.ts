// lib/utils/sanitize.ts
const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "ul",
  "ol",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "blockquote",
  "code",
  "pre",
  "span",
  "a",
]);

export function sanitizeHtmlBasic(input?: string | null): string {
  if (!input) return "";

  let html = String(input);

  // remove scripts/styles
  html = html.replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, "");
  html = html.replace(/<\s*style[^>]*>[\s\S]*?<\s*\/\s*style\s*>/gi, "");

  // remove on* handlers (onclick, onerror...)
  html = html.replace(/\son\w+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, "");

  // neutralize javascript: in href/src
  html = html.replace(/\s(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi, ` $1="#"`);

  // strip tags not in allowlist (keep inner text)
  html = html.replace(/<\/?([a-z0-9-]+)(\s[^>]*)?>/gi, (m, tagName) => {
    const t = String(tagName).toLowerCase();
    if (!ALLOWED_TAGS.has(t)) return "";
    return m;
  });

  return html;
}
