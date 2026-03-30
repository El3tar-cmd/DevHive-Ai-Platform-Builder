/* ── MetricsGrid — 6 metric cards with speed bar ── */

import { memo } from "react";
import { useForge } from "../../context/useForge.js";

const METRICS = [
  { key: "tokens",  label: "توكنز",     color: "var(--c)",  fmt: v => v.toLocaleString(), bar: v => Math.min(100, v / 5000 * 100) },
  { key: "tps",     label: "token/sec", color: "var(--p)",  fmt: v => v,                  bar: v => Math.min(100, v / 15 * 100)   },
  { key: "elapsed", label: "وقت",       color: "var(--a)",  fmt: v => v.toFixed(1) + "s", bar: null },
  { key: "chars",   label: "حرف",       color: "var(--g)",  fmt: v => (v / 1000).toFixed(1) + "k", bar: null },
];

function MetricsGrid() {
  const { state, doneCount } = useForge();
  const { metrics, progress } = state;

  return (
    <div className="metrics">
      {METRICS.map(({ key, label, color, fmt, bar }) => (
        <div key={key} className="metric">
          <div className="metric-v" style={{ color }}>{fmt(metrics[key])}</div>
          <div className="metric-l">{label}</div>
          {bar && (
            <div className="spd">
              <div className="spd-f" style={{ width: `${bar(metrics[key])}%` }} />
            </div>
          )}
        </div>
      ))}

      <div className="metric">
        <div className="metric-v" style={{ color: "var(--pk)" }}>{doneCount}</div>
        <div className="metric-l">ملفات</div>
      </div>
      <div className="metric">
        <div className="metric-v" style={{ color: "var(--c)" }}>{progress.toFixed(0)}%</div>
        <div className="metric-l">تقدم</div>
      </div>
    </div>
  );
}

export default memo(MetricsGrid);
