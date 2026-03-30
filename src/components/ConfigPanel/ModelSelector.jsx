/* ── ModelSelector — Provider & Model dropdown ── */

import { useForge } from "../../context/ForgeContext.jsx";
import { PROVIDERS } from "../../config/constants.js";

export default function ModelSelector() {
  const { state, dispatch, Actions } = useForge();
  const { provider, geminiApiKey, openRouterApiKey, models, model } = state;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "8px" }}>
      {/* Provider Toggle */}
      <div>
        <div className="fl">المزود (Provider)</div>
        <div style={{ display: "flex", gap: "8px" }}>
          {PROVIDERS.map(p => (
            <button
              key={p.id}
              onClick={() => dispatch({ type: Actions.SET_PROVIDER, payload: p.id })}
              style={{
                flex: "1",
                padding: "8px",
                borderRadius: "var(--rad)",
                border: `1px solid ${provider === p.id ? "var(--accent)" : "var(--bd)"}`,
                background: provider === p.id ? "var(--bg-card)" : "transparent",
                color: provider === p.id ? "var(--fg)" : "var(--fg-m)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                fontFamily: "var(--fm)",
                fontSize: "13px",
                transition: "all 0.2s"
              }}
            >
              <span>{p.icon}</span> {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* API Key Input (if Gemini is selected) */}
      {provider === "gemini" && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <div className="fl">Gemini API Key</div>
          <input
            type="password"
            className="inp"
            value={geminiApiKey}
            onChange={e => dispatch({ type: Actions.SET_GEMINI_KEY, payload: e.target.value })}
            placeholder="AIzaSy..."
            style={{ width: "100%", boxSizing: "border-box" }}
          />
          {!geminiApiKey && (
            <div style={{ fontSize: "11px", color: "#f59e0b", marginTop: "4px" }}>
              مطلوب مفتاح API لتشغيل نماذج Gemini
            </div>
          )}
        </div>
      )}

      {/* API Key Input (if OpenRouter is selected) */}
      {provider === "openrouter" && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <div className="fl">OpenRouter API Key</div>
          <input
            type="password"
            className="inp"
            value={openRouterApiKey}
            onChange={e => dispatch({ type: Actions.SET_OPENROUTER_KEY, payload: e.target.value })}
            placeholder="sk-or-v1-..."
            style={{ width: "100%", boxSizing: "border-box" }}
          />
          {!openRouterApiKey && (
            <div style={{ fontSize: "11px", color: "#f59e0b", marginTop: "4px" }}>
              مطلوب مفتاح API للوصول للنماذج المجانية والقوية (احصل عليه من openrouter.ai)
            </div>
          )}
        </div>
      )}

      {/* Model Selection */}
      <div>
        <div className="fl">النموذج</div>
        <select
          className="sel"
          value={model}
          onChange={e => dispatch({ type: Actions.SET_MODEL, payload: e.target.value })}
          disabled={!models.length}
        >
          {!models.length && <option>لا توجد نماذج</option>}
          {models.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
    </div>
  );
}
