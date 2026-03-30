/* ── AppTypeGrid — 6 app type selection cards ── */

import { useForge } from "../../context/useForge.js";
import { APP_TYPES } from "../../config/constants.js";

export default function AppTypeGrid() {
  const { state, dispatch, Actions } = useForge();
  const { appType } = state;

  return (
    <div>
      <div className="fl">نوع التطبيق</div>
      <div className="type-grid">
        {APP_TYPES.map(t => (
          <div
            key={t.id}
            className={`type-card ${appType === t.id ? "sel-card" : ""}`}
            style={appType === t.id ? { borderColor: t.color, background: `${t.color}10` } : {}}
            onClick={() => dispatch({ type: Actions.SET_APP_TYPE, payload: t.id })}
          >
            <div className="type-icon">{t.icon}</div>
            <div className="type-label" style={appType === t.id ? { color: t.color } : {}}>{t.label}</div>
            <div className="type-desc">{t.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
