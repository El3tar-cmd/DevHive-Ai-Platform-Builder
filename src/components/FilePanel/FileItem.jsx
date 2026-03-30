/* ── FileItem — Single file row in tree ── */

import { memo } from "react";
import { ROLE_COLORS } from "../../config/constants.js";

const STATUS_ICONS = {
  pending:  { icon: "○",  color: "var(--mu)"  },
  gen:      { icon: "◉",  color: "var(--c)",  pulse: true },
  done:     { icon: "✓",  color: "var(--g)"   },
  err:      { icon: "✕",  color: "var(--r)"   },
};

function FileItem({ file, status, isSelected, hasContent, onSelect }) {
  const roleColor = ROLE_COLORS[file.role] || "#6b7280";
  const st = STATUS_ICONS[status] || {};

  const classNames = [
    "file-item",
    isSelected         && "selected",
    status === "gen"   && "generating",
    status === "done"  && "done",
    status === "pending" && "pending",
    status === "err"   && "errored",
  ].filter(Boolean).join(" ");

  return (
    <div
      className={classNames}
      onClick={() => { if (hasContent) onSelect(file.path); }}
      title={file.desc}
    >
      <span className="fi-icon">{file.icon}</span>
      <div className="fi-info">
        <div className="fi-path">{file.path}</div>
        <div className="fi-desc" style={{ color: roleColor }}>{file.role}</div>
      </div>
      {/* Role badge */}
      <span className="fi-role" style={{ color: roleColor, borderColor: roleColor + "44", background: roleColor + "11" }}>
        {file.role}
      </span>
      {/* Status indicator */}
      {st.icon && (
        <div
          className="fi-status"
          style={{
            color: st.color,
            animation: st.pulse ? "blink .5s infinite" : "none",
          }}
        >
          {st.icon}
        </div>
      )}
    </div>
  );
}

// Only re-render when props that affect visuals change
export default memo(FileItem, (prev, next) =>
  prev.status    === next.status &&
  prev.isSelected === next.isSelected &&
  prev.hasContent === next.hasContent &&
  prev.file.path  === next.file.path
);
