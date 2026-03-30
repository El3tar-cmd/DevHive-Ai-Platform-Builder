/* ══════════════════════════════════════════════════════
   CommandPalette — ⌘K quick-action modal
   ══════════════════════════════════════════════════════ */

 import { useState, useCallback } from "react";

const STATIC_COMMANDS = [
  { id: "generate", label: "توليد المشروع",  icon: "⚡", kbd: "Ctrl+Enter", group: "أفعال" },
  { id: "stop",     label: "إيقاف التوليد",  icon: "⏹", kbd: "Ctrl+.",     group: "أفعال" },
  { id: "download", label: "تحميل ZIP",       icon: "📦", kbd: "Ctrl+D",    group: "أفعال" },
  { id: "new",      label: "مشروع جديد",      icon: "✨", kbd: "Ctrl+N",    group: "مشروع" },
  { id: "projects", label: "كل المشاريع",     icon: "🗂️", kbd: null,       group: "مشروع" },
];

/**
 * Command Palette — opened via Ctrl+K.
 * @param {{ open, onClose, handlers }} props
 */
export default function CommandPalette({ open, onClose, handlers }) {
  const [query,   setQuery]   = useState("");
  const [cursor,  setCursor]  = useState(0);

  const filtered = STATIC_COMMANDS.filter(c =>
    c.label.includes(query) || c.id.includes(query.toLowerCase())
  );

  const run = useCallback((cmd) => {
    onClose();
    switch (cmd.id) {
      case "generate":  handlers.generate?.();   break;
      case "stop":      handlers.stop?.();        break;
      case "download":  handlers.download?.();    break;
      case "new":       handlers.newProject?.();  break;
      case "projects":  handlers.openProjects?.(); break;
      default: break;
    }
  }, [handlers, onClose]);

  // Keyboard navigation inside palette
  function handleKey(e) {
    if (e.key === "ArrowDown")  { e.preventDefault(); setCursor(c => Math.min(c + 1, filtered.length - 1)); }
    if (e.key === "ArrowUp")    { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)); }
    if (e.key === "Enter")      { if (filtered[cursor]) run(filtered[cursor]); }
    if (e.key === "Escape")     { onClose(); }
  }

  if (!open) return null;

  // Group commands by group label
  const groups = [...new Set(filtered.map(c => c.group))];

  return (
    <div className="palette-overlay" onClick={onClose}>
      <div className="palette-box" onClick={e => e.stopPropagation()}>
        {/* Search input */}
        <div className="palette-input-wrap">
          <span className="palette-icon">⌘</span>
          <input
            className="palette-input"
            placeholder="ابحث عن إجراء..."
            value={query}
            autoFocus
            onChange={e => { setQuery(e.target.value); setCursor(0); }}
            onKeyDown={handleKey}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              style={{ background: "none", border: "none", color: "var(--mu)", cursor: "pointer", fontSize: 14 }}
            >✕</button>
          )}
        </div>

        {/* Command list */}
        <div className="palette-list">
          {filtered.length === 0 && (
            <div className="steps-empty">لا توجد نتائج لـ "{query}"</div>
          )}

          {groups.map(group => (
            <div key={group}>
              <div className="palette-sep">{group}</div>
              {filtered.filter(c => c.group === group).map((cmd) => {
                const globalIdx = filtered.indexOf(cmd);
                return (
                  <div
                    key={cmd.id}
                    className={`palette-item ${globalIdx === cursor ? "active" : ""}`}
                    onClick={() => run(cmd)}
                    onMouseEnter={() => setCursor(globalIdx)}
                  >
                    <span className="palette-item-icon">{cmd.icon}</span>
                    <span className="palette-item-label">{cmd.label}</span>
                    {cmd.kbd && <span className="palette-item-kbd">{cmd.kbd}</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer hints */}
        <div className="palette-footer">
          <span><kbd>↑↓</kbd> تنقل</span>
          <span><kbd>Enter</kbd> تنفيذ</span>
          <span><kbd>Esc</kbd> إغلاق</span>
        </div>
      </div>
    </div>
  );
}
