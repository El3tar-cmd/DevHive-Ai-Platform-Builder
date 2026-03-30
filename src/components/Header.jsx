/* ══════════════════════════════════════════════════════
   Header v2 — Glassmorphic top bar
   ══════════════════════════════════════════════════════ */

import { useForge } from "../context/useForge.js";
import { PHASE_COLORS, PHASE_LABELS } from "../config/constants.js";
import { createNewProject } from "../utils/projectStore.js";

export default function Header({ onOpenPalette }) {
  const { state, dispatch, Actions, plan, doneCount } = useForge();
  const { connected, loading, metrics, phase } = state;

  const handleNewProject = () => {
    const newId = createNewProject();
    dispatch({ type: Actions.NEW_PROJECT, payload: newId });
  };

  return (
    <header className="hdr">
      {/* Logo */}
      <div className="logo">
        <small>DEVHIVE</small>
        <em>AI Platform</em>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: 6, alignItems: "center", marginLeft: 4 }}>
        <button
          className="hdr-btn projects"
          onClick={() => dispatch({ type: Actions.TOGGLE_PROJECTS_DRAWER })}
        >
          🗂️ مشاريعي
        </button>
        <button className="hdr-btn new" onClick={handleNewProject}>
          ✨ جديد
        </button>
        <button
          className="hdr-btn"
          onClick={onOpenPalette}
          title="Command Palette (Ctrl+K)"
          style={{ borderColor: "rgba(0,212,255,0.2)" }}
        >
          ⌘K
        </button>
      </div>

      {/* Status Pills */}
      <div className="hdr-pills">
        <div className="hdr-pill">
          <div className={`dot ${loading ? "active" : connected ? "on" : "off"}`} />
          <b>{connected ? (loading ? "يولّد" : "متصل") : "منفصل"}</b>
        </div>
        <div className="hdr-pill">
          <b style={{ color: "var(--c)" }}>{metrics.tokens.toLocaleString()}</b>&nbsp;توكن
        </div>
        <div className="hdr-pill">
          <b style={{ color: "var(--a)" }}>{metrics.tps}</b>&nbsp;t/s
        </div>
        <div className="hdr-pill">
          <b style={{ color: "var(--g)" }}>{doneCount}/{(state.dynamicPlan || plan).length}</b>&nbsp;ملف
        </div>
        {phase && PHASE_LABELS[phase] && (
          <div className="hdr-pill" style={{ color: `var(--${PHASE_COLORS[phase] || "mu"})` }}>
            {PHASE_LABELS[phase]}
          </div>
        )}
      </div>
    </header>
  );
}
