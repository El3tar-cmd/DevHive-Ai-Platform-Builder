/* ── FeatureSelector — Feature checkboxes ── */

import { useForge } from "../../context/useForge.js";
import { FEATURES_LIST } from "../../config/constants.js";

export default function FeatureSelector() {
  const { state, dispatch, Actions } = useForge();
  const { features } = state;

  return (
    <div>
      <div className="fl">الميزات المطلوبة</div>
      <div className="feat-grid">
        {FEATURES_LIST.map(f => (
          <div
            key={f}
            className={`feat-item ${features.includes(f) ? "on" : ""}`}
            onClick={() => dispatch({ type: Actions.TOGGLE_FEATURE, payload: f })}
          >
            <div className="feat-check">{features.includes(f) ? "✓" : ""}</div>
            <span className="feat-label">{f}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
