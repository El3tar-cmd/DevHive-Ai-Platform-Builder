/* ── PromptInput — Project name + description textarea ── */

import { useForge } from "../../context/ForgeContext.jsx";
import { sanitizeProjectName } from "../../utils/sanitize.js";

export default function PromptInput({ onGenerate }) {
  const { state, dispatch, Actions } = useForge();
  const { projName, prompt } = state;

  return (
    <>
      {/* Project name */}
      <div>
        <div className="fl">اسم المشروع</div>
        <input
          className="inp"
          style={{ fontFamily: "var(--fm)", fontSize: 12, direction: "ltr" }}
          value={projName}
          onChange={e => dispatch({
            type: Actions.SET_PROJ_NAME,
            payload: sanitizeProjectName(e.target.value),
          })}
          placeholder="my-app"
        />
      </div>

      {/* Description */}
      <div>
        <div className="fl">وصف التطبيق</div>
        <textarea
          className="ta"
          rows={4}
          placeholder="اوصف تطبيقك بالتفصيل: هدفه، المستخدمين، الوظائف الأساسية..."
          value={prompt}
          onChange={e => dispatch({ type: Actions.SET_PROMPT, payload: e.target.value })}
          onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) onGenerate?.(); }}
        />
      </div>
    </>
  );
}
