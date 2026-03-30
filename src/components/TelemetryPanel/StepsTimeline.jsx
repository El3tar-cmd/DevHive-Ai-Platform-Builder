/* ── StepsTimeline — Steps log with windowing + TPS sparkline ── */

import { useEffect, useRef, memo, useMemo } from "react";
import { useForge } from "../../context/ForgeContext.jsx";
import { STEP_ICONS } from "../../config/constants.js";

/** Max steps visible in DOM at once (virtual windowing) */
const MAX_VISIBLE = 80;

/** Renders a mini SVG sparkline of recent TPS values */
function TpsSparkline({ history }) {
  if (history.length < 2) return null;
  const W = 80, H = 24;
  const max = Math.max(...history, 1);
  const pts = history.map((v, i) => {
    const x = (i / (history.length - 1)) * W;
    const y = H - (v / max) * H;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={W} height={H} style={{ overflow: "visible", opacity: 0.7 }}>
      <polyline
        points={pts}
        fill="none"
        stroke="var(--c)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Latest dot */}
      <circle
        cx={(history.length - 1) / (history.length - 1) * W}
        cy={H - (history[history.length - 1] / max) * H}
        r="2.5"
        fill="var(--c)"
      />
    </svg>
  );
}

function StepsTimeline() {
  const { state } = useForge();
  const { steps, metrics } = state;
  const endRef  = useRef(null);
  const tpsHist = useRef([]);

  // Track TPS history for sparkline (max 40 points)
  useEffect(() => {
    if (metrics.tps > 0) {
      tpsHist.current = [...tpsHist.current.slice(-39), metrics.tps];
    }
  }, [metrics.tps]);

  // Auto-scroll to newest step
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [steps.length]);

  // Windowing: only render last MAX_VISIBLE steps
  const visibleSteps = useMemo(
    () => steps.length > MAX_VISIBLE ? steps.slice(-MAX_VISIBLE) : steps,
    [steps]
  );

  return (
    <div className="steps">
      {/* TPS Sparkline header */}
      {tpsHist.current.length > 1 && (
        <div className="spark-header">
          <span style={{ fontSize: 9, color: "var(--mu)", fontFamily: "var(--fm)" }}>TPS</span>
          <TpsSparkline history={tpsHist.current} />
          <span style={{ fontSize: 9, color: "var(--c)", fontFamily: "var(--fm)" }}>
            {tpsHist.current[tpsHist.current.length - 1]}
          </span>
        </div>
      )}

      {visibleSteps.length === 0 && (
        <div className="steps-empty">الخطوات ستظهر هنا أثناء التوليد...</div>
      )}

      {steps.length > MAX_VISIBLE && (
        <div className="steps-clipped">
          ↑ {steps.length - MAX_VISIBLE} خطوة سابقة مخفية
        </div>
      )}

      {visibleSteps.map((s, i) => (
        <div key={steps.length - visibleSteps.length + i} className={`step s-${s.type}`}>
          <div className="step-ic">{STEP_ICONS[s.type] || "•"}</div>
          <div className="step-bd">
            <div className="step-t">{s.title}</div>
            {s.detail && <div className="step-d">{s.detail}</div>}
            <div className="step-ts">+{s.ts}s</div>
          </div>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}

export default memo(StepsTimeline);
