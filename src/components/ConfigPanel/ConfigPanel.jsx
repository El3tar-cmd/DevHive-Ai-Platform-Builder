/* ══════════════════════════════════════════════════════
   ConfigPanel v2 — Tabbed configuration sidebar
   ══════════════════════════════════════════════════════ */

import { useState } from "react";
import { useForge } from "../../context/useForge.js";
import ModelSelector from "./ModelSelector.jsx";
import AppTypeGrid from "./AppTypeGrid.jsx";
import FeatureSelector from "./FeatureSelector.jsx";
import PromptInput from "./PromptInput.jsx";

const TABS = [
  { id: "ai",      label: "AI",    icon: "🤖" },
  { id: "type",    label: "النوع",  icon: "📦" },
  { id: "plan",    label: "الخطة",  icon: "🗂️" },
  { id: "options", label: "⚙️",    icon: "⚙️" },
];

export default function ConfigPanel({ onGenerate, onStop, onRetry }) {
  const { state, plan: basePlan, selectedAppType } = useForge();
  const { connected, model, prompt, loading, mobileTab, phase, dynamicPlan, fileStatuses } = state;
  const [activeTab, setActiveTab] = useState("ai");

  const currentPlan = dynamicPlan || basePlan;
  const hasPlan = currentPlan.length > 0;
  const failedCount = Object.values(fileStatuses).filter(s => s === "err" || s === "pending").length;
  const hasFailedFiles = failedCount > 0 && !loading && (phase === "stopped" || phase === "done" || phase === "error");

  return (
    <div
      className={`tab-content ${mobileTab === "config" ? "active" : ""}`}
      style={{ borderLeft: "none", borderRight: "1px solid var(--bd)", flexDirection: "column", overflow: "hidden" }}
    >
      {/* Panel header */}
      <div className="ph">
        <span className="pt">الإعدادات</span>
        <span className={`pbg ${connected ? "pbg-g" : "pbg-r"}`}>
          {connected ? `متصل · ${state.models.length}` : "منفصل"}
        </span>
      </div>

      {/* Tabs */}
      <div className="cfg-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`cfg-tab ${activeTab === t.id ? "active" : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Scrollable content */}
      <div className="pc">
        {/* ── TAB: AI ── */}
        <div className={`cfg-tab-content ${activeTab === "ai" ? "active" : ""}`}>
          <ModelSelector />
          <PromptInput onGenerate={onGenerate} />
        </div>

        {/* ── TAB: Type ── */}
        <div className={`cfg-tab-content ${activeTab === "type" ? "active" : ""}`}>
          <AppTypeGrid />
          {selectedAppType && (
            <div>
              <div className="fl">Stack التقنيات</div>
              <div className="chips">
                {selectedAppType.stack.map(s => (
                  <span
                    key={s}
                    className="chip stack-chip"
                    style={{ borderColor: selectedAppType.color + "55", color: selectedAppType.color }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── TAB: Plan ── */}
        <div className={`cfg-tab-content ${activeTab === "plan" ? "active" : ""}`}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="fl">{currentPlan.length} ملف {dynamicPlan ? "🧠 ذكي" : "أساسي"}</div>
            {dynamicPlan && <span className="pbg pbg-p" style={{ fontSize: 9 }}>AI Plan</span>}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {currentPlan.map((f) => {
              const st = fileStatuses[f.path] || "pending";
              const stColor = st === "done" ? "var(--g)" : st === "gen" ? "var(--c)" : st === "err" ? "var(--r)" : "var(--di)";
              const stIcon  = st === "done" ? "✓" : st === "gen" ? "◉" : st === "err" ? "✕" : "○";
              return (
                <div key={f.path} style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "5px 8px", borderRadius: 6,
                  background: st === "done" ? "rgba(16,185,129,0.05)" : st === "gen" ? "rgba(0,212,255,0.06)" : "var(--s2)",
                  border: `1px solid ${st === "done" ? "rgba(16,185,129,0.15)" : st === "gen" ? "rgba(0,212,255,0.2)" : "var(--bd)"}`,
                  animation: st === "gen" ? "gen-pulse 0.9s infinite" : "none",
                }}>
                  <span style={{ fontSize: 9, color: stColor, width: 12, flexShrink: 0 }}>{stIcon}</span>
                  <span style={{ fontFamily: "var(--fm)", fontSize: 9, direction: "ltr", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--tx2)" }}>
                    {f.path}
                  </span>
                  <span style={{ fontSize: 8, color: stColor, fontFamily: "var(--fm)", background: stColor + "15", border: `1px solid ${stColor}33`, padding: "1px 4px", borderRadius: 3, flexShrink: 0 }}>
                    {f.role}
                  </span>
                </div>
              );
            })}
          </div>

          {!hasPlan && (
            <div className="empty" style={{ padding: 20 }}>
              <div className="empty-icon">🗂️</div>
              <div className="empty-t">لا توجد خطة بعد</div>
              <div className="empty-d">الخطة ستظهر هنا بعد الضغط على توليد</div>
            </div>
          )}
        </div>

        {/* ── TAB: Options ── */}
        <div className={`cfg-tab-content ${activeTab === "options" ? "active" : ""}`}>
          <FeatureSelector />
          {/* Keyboard shortcuts hint */}
          <div style={{ marginTop: 8 }}>
            <div className="fl">اختصارات لوحة المفاتيح</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {[
                ["Ctrl+Enter", "توليد المشروع"],
                ["Ctrl+.",     "إيقاف التوليد"],
                ["Ctrl+D",     "تحميل ZIP"],
                ["Ctrl+N",     "مشروع جديد"],
                ["Ctrl+K",     "قائمة الأوامر"],
              ].map(([kbd, lbl]) => (
                <div key={kbd} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: "var(--mu)" }}>{lbl}</span>
                  <span style={{ fontFamily: "var(--fm)", fontSize: 9, color: "var(--c)", background: "var(--s3)", border: "1px solid var(--bd)", padding: "2px 6px", borderRadius: 4 }}>
                    {kbd}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Buttons (always visible) ── */}
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
          {loading
            ? (
              <button className="sbtn" onClick={onStop}>
                {phase === "planning" ? "🧠 إيقاف التخطيط" : "⏹ إيقاف التوليد"}
              </button>
            ) : (
              <button
                className="gbtn"
                onClick={onGenerate}
                disabled={!prompt.trim() || !model || !connected}
              >
                ⚡ توليد المشروع
              </button>
            )
          }
          {hasFailedFiles && (
            <button
              className="gbtn"
              onClick={onRetry}
              style={{ background: "linear-gradient(135deg, var(--a), var(--r))", fontSize: 12 }}
            >
              ♻️ إعادة توليد {failedCount} ملف فاشل
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
