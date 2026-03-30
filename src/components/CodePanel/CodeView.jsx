/* ── CodeView — Syntax-highlighted code viewer with line numbers ── */

import { useMemo, memo } from "react";

/* ── Tokenizer rules ── */
const RULES = [
  { re: /^(\/\/[^\n]*)/, cls: "tk-cm" },
  { re: /^(\/\*[\s\S]*?\*\/)/, cls: "tk-cm" },
  { re: /^(#[^\n]*)/, cls: "tk-cm" },
  { re: /^(`(?:[^`\\]|\\.)*`)/, cls: "tk-str" },
  { re: /^("(?:[^"\\]|\\.)*")/, cls: "tk-str" },
  { re: /^('(?:[^'\\]|\\.)*')/, cls: "tk-str" },
  { re: /^(\b\d+\.?\d*\b)/, cls: "tk-num" },
  { re: /^(\b(?:true|false|null|undefined|NaN|Infinity)\b)/, cls: "tk-bool" },
  { re: /^(\b(?:const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|class|extends|import|export|default|from|async|await|try|catch|finally|throw|new|typeof|instanceof|in|of|delete|void|static|get|set|interface|type|enum|implements|declare|abstract|override|readonly|public|private|protected)\b)/, cls: "tk-kw" },
  { re: /^(<\/?[A-Za-z][A-Za-z0-9.]*(?:\s|\/?>|>)?)/, cls: "tk-tag" },
  { re: /^(\b[A-Z][a-zA-Z0-9_]*\b)/, cls: "tk-cls" },
  { re: /^(\b[a-z_$][a-zA-Z0-9_$]*(?=\())/, cls: "tk-fn" },
  { re: /^(=>|===|!==|==|!=|<=|>=|&&|\|\||[+\-*/%=!<>&|^~.,;:?])/, cls: "tk-op" },
];

function tokenizeLine(line) {
  const tokens = [];
  let pos = 0;
  while (pos < line.length) {
    let matched = false;
    const slice = line.slice(pos);
    for (const { re, cls } of RULES) {
      const m = slice.match(re);
      if (m) {
        tokens.push({ text: m[1], cls });
        pos += m[1].length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      if (tokens.length && tokens[tokens.length - 1].cls === "tk-plain") {
        tokens[tokens.length - 1].text += line[pos];
      } else {
        tokens.push({ text: line[pos], cls: "tk-plain" });
      }
      pos++;
    }
  }
  return tokens;
}

function CodeView({ content }) {
  if (!content) return null;

  const lines = useMemo(() => {
    const raw = content.split("\n");
    const visible = raw.length > 1500 ? raw.slice(0, 1500) : raw;
    return visible.map((line) => tokenizeLine(line));
  }, [content]);

  const totalLines = content.split("\n").length;
  const isTruncated = totalLines > 1500;
  // Width of the gutter depends on total line count digits
  const gutterWidth = String(Math.min(totalLines, 1500)).length * 9 + 20;

  return (
    <div style={{ display: "flex", flex: 1, overflow: "auto", background: "var(--bg)" }}>
      {/* ── Gutter: Line Numbers ── */}
      <div
        aria-hidden="true"
        style={{
          width: gutterWidth,
          minWidth: gutterWidth,
          padding: "14px 8px 14px 0",
          textAlign: "right",
          fontFamily: "var(--fm)",
          fontSize: 11,
          lineHeight: "1.85",
          color: "var(--di)",
          background: "var(--s1)",
          borderRight: "1px solid var(--bd)",
          userSelect: "none",
          flexShrink: 0,
          overflowY: "hidden",
        }}
      >
        {lines.map((_, i) => (
          <div key={i} style={{ paddingRight: 8 }}>
            {i + 1}
          </div>
        ))}
        {isTruncated && <div style={{ color: "var(--mu)" }}>…</div>}
      </div>

      {/* ── Code Content ── */}
      <div
        className="code-area"
        style={{ flex: 1, padding: "14px 16px", overflowY: "visible", overflowX: "auto" }}
      >
        {lines.map((tokens, li) => (
          <div key={li}>
            {tokens.map((tok, ti) => (
              <span key={ti} className={`tk ${tok.cls}`}>{tok.text}</span>
            ))}
            {"\n"}
          </div>
        ))}
        {isTruncated && (
          <div style={{ color: "var(--mu)", fontStyle: "italic", paddingTop: 8 }}>
            … (الملف كبير جداً — أول 1500 سطر معروضة)
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(CodeView);
