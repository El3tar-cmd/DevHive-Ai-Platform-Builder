/* ── FileStatusGrid — Colored dot grid for file statuses ── */

import { useForge } from "../../context/useForge.js";

export default function FileStatusGrid() {
  const { state, dispatch, Actions, plan } = useForge();
  const { files, fileStatuses } = state;

  function handleDotClick(path) {
    if (!files[path]) return;
    dispatch({ type: Actions.SELECT_FILE, payload: path });
    dispatch({ type: Actions.SET_CODE_VIEW, payload: "code" });
    dispatch({ type: Actions.SET_MOBILE_TAB, payload: "files" });
  }

  return (
    <div style={{ padding: "6px 8px", borderBottom: "1px solid var(--bd)", flexShrink: 0 }}>
      <div style={{
        fontSize: 9, fontFamily: "var(--fm)", color: "var(--mu)",
        marginBottom: 5, letterSpacing: "1px", textTransform: "uppercase"
      }}>
        حالة الملفات
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
        {plan.map(f => {
          const s = fileStatuses[f.path] || "pending";
          const col = s === "done" ? "var(--g)"
            : s === "gen" ? "var(--c)"
            : s === "err" ? "var(--r)"
            : "var(--mu)";
          return (
            <div
              key={f.path}
              title={f.path}
              style={{
                width: 8, height: 8, borderRadius: 2, background: col,
                ...(s === "gen" ? { animation: "blink .5s infinite" } : {}),
                cursor: "pointer",
              }}
              onClick={() => handleDotClick(f.path)}
            />
          );
        })}
      </div>
    </div>
  );
}
