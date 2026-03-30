/* ── MobileNav — Bottom navigation for mobile ── */

import { useForge } from "../context/ForgeContext.jsx";
import { MOBILE_TABS } from "../config/constants.js";

export default function MobileNav() {
  const { state, dispatch, Actions, doneCount } = useForge();
  const { mobileTab } = state;

  return (
    <nav className="mob-nav">
      {MOBILE_TABS.map(t => (
        <button
          key={t.id}
          className={`nav-tab ${mobileTab === t.id ? "active" : ""}`}
          onClick={() => dispatch({ type: Actions.SET_MOBILE_TAB, payload: t.id })}
          style={{ position: "relative" }}
        >
          {t.id === "files" && doneCount > 0 && (
            <span className="nav-badge">{doneCount}</span>
          )}
          <span className="nav-tab-icon">{t.icon}</span>
          {t.label}
        </button>
      ))}
    </nav>
  );
}
