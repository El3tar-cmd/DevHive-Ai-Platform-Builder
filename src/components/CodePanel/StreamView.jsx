/* ── StreamView — Live streaming tokens ── */

import { useEffect, useRef, useMemo } from "react";
import { useForge } from "../../context/ForgeContext.jsx";
import { tokenColor } from "../../utils/tokenColor.js";

export default function StreamView() {
  const { state } = useForge();
  const { streamTokens, loading } = state;
  const containerRef = useRef(null);
  const endRef = useRef(null);
  const autoScroll = useRef(true);

  const lines = useMemo(() => {
    const res = [];
    let currentLine = [];
    for (const t of streamTokens) {
      if (t.text.includes("\n")) {
        const parts = t.text.split("\n");
        for (let i = 0; i < parts.length; i++) {
          if (parts[i]) {
            currentLine.push({ id: t.id + "-" + i, text: parts[i], color: tokenColor(parts[i]) });
          }
          if (i < parts.length - 1) {
            res.push(currentLine);
            currentLine = [];
          }
        }
      } else {
        currentLine.push({ id: t.id, text: t.text, color: tokenColor(t.text) });
      }
    }
    res.push(currentLine);
    return res;
  }, [streamTokens]);

  const gutterWidth = String(lines.length).length * 9 + 20;

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    autoScroll.current = scrollHeight - scrollTop - clientHeight < 60;
  };

  useEffect(() => {
    if (autoScroll.current) {
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [streamTokens]);

  return (
    <div style={{ display: "flex", flex: 1, overflow: "auto", background: "var(--bg)", height: "100%" }} ref={containerRef} onScroll={handleScroll}>
      {/* ── Gutter ── */}
      <div
        aria-hidden="true"
        style={{
          width: gutterWidth, minWidth: gutterWidth,
          padding: "14px 8px 14px 0", textAlign: "right",
          fontFamily: "var(--fm)", fontSize: 11, lineHeight: "1.85",
          color: "var(--di)", background: "var(--s1)", borderRight: "1px solid var(--bd)",
          userSelect: "none", flexShrink: 0, overflowY: "hidden"
        }}
      >
        {lines.map((_, i) => (
          <div key={i} style={{ paddingRight: 8 }}>{i + 1}</div>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="stream-tokens" style={{ flex: 1, overflowY: "visible", overflowX: "auto" }}>
        {lines.map((lineTokens, li) => (
          <div key={li}>
            {lineTokens.map(tok => (
              <span key={tok.id} className={`tk ${tok.color}`}>{tok.text}</span>
            ))}
            {loading && li === lines.length - 1 && <span className="cursor" />}
            {"\n"}
          </div>
        ))}
        <div ref={endRef} style={{ height: 1 }} />
      </div>
    </div>
  );
}
