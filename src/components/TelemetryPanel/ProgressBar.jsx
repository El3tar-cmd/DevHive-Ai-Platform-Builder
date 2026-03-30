/* ── ProgressBar — Overall generation progress ── */

import { useForge } from "../../context/ForgeContext.jsx";

export default function ProgressBar() {
  const { state, plan, doneCount } = useForge();
  const { progress, dynamicPlan, phase } = state;
  const currentPlan = dynamicPlan || plan;

  const phaseLabels = {
    idle: "",
    planning: "⏳ يتم التخطيط...",
    generating: "⚙️ يتم التوليد...",
    verifying: "🔍 يتم الفحص التجميعي...",
    compile_error: "⚠️ خطأ بناء — بانتظار الإصلاح",
    healing: "🛠️ إصلاح ذاتي جارٍ...",
    done: "✅ مكتمل",
    stopped: "⏸ متوقف",
    error: "❌ خطأ",
  };

  const isHealing = phase === "verifying" || phase === "healing" || phase === "compile_error";
  const barColor = isHealing
    ? "linear-gradient(90deg, #f59e0b, #ef4444)"
    : "linear-gradient(90deg, var(--c), var(--p))";

  return (
    <div style={{ padding: "6px 8px", borderBottom: "1px solid var(--bd)", flexShrink: 0 }}>
      <div style={{
        display: "flex", justifyContent: "space-between", marginBottom: 4,
        fontSize: 10, fontFamily: "var(--fm)", color: "var(--mu)"
      }}>
        <span>{phaseLabels[phase] || "التقدم الكلي"}</span>
        <span style={{ color: "var(--c)" }}>{doneCount}/{currentPlan.length} ملف</span>
      </div>
      <div style={{ height: 4, background: "var(--bd)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${progress}%`,
          background: barColor,
          borderRadius: 2,
          transition: "width .4s",
          animation: isHealing ? "pulse 1.5s ease-in-out infinite" : "none",
        }} />
      </div>
    </div>
  );
}
