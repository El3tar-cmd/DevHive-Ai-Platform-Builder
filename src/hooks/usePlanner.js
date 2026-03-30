/* ══════════════════════════════════════════════════════
   usePlanner — Dynamic Project Planner Orchestrator
   ══════════════════════════════════════════════════════ */

import { useCallback } from "react";
import { useForge } from "../context/ForgeContext.jsx";
import { FILE_PLANS } from "../config/constants.js";
import { chatCompletion } from "../services/providerRouter.js";
import { buildPlannerPrompt, PLANNER_SYSTEM_MESSAGE } from "../config/prompts.js";
import { getApiKey } from "../utils/apiKey.js";

/**
 * Orchestrates the intelligent planning phase before generation.
 * Asks the LLM to output a JSON array of required files.
 */
export function usePlanner() {
  const { state, dispatch, Actions, addStep, abortRef } = useForge();

  const runPlanner = useCallback(async () => {
    if (!state.prompt.trim() || !state.model || !state.connected || state.loading) return null;

    dispatch({ type: Actions.START_PLANNING });
    abortRef.current = new AbortController();
    const { signal } = abortRef.current;

    const basePlan = FILE_PLANS[state.appType] || [];
    const appTypeLabel = state.appType;

    addStep("info", `تخطيط ذكي لـ ${appTypeLabel}`, "يتم تحليل الفكرة وبناء هيكل الملفات...");

    try {
      const prompt = buildPlannerPrompt(
        appTypeLabel, 
        state.prompt, 
        state.features, 
        basePlan
      );

      const apiKey = getApiKey(state);
      const content = await chatCompletion(
        state.provider,
        [PLANNER_SYSTEM_MESSAGE, { role: "user", content: prompt }],
        state.model,
        { temperature: 0.1, top_p: 0.9 },
        signal,
        apiKey
      );

      // Robust JSON extraction (finds array between [ and ])
      const jsonStart = content.indexOf("[");
      const jsonEnd = content.lastIndexOf("]");
      
      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error("الموديل لم يقم بإرجاع مصفوفة JSON صالحة.");
      }

      let jsonString = content.substring(jsonStart, jsonEnd + 1);
      
      // Basic sanitization for common LLM JSON errors:
      // 1. Remove trailing commas before ] or }
      jsonString = jsonString.replace(/,\s*([\]}])/g, "$1");
      // 2. Remove unescaped newlines inside strings (very basic fix)
      jsonString = jsonString.replace(/\n/g, "");

      let dynamicPlan;
      try {
        dynamicPlan = JSON.parse(jsonString);
      } catch (parseErr) {
        console.error("Raw Invalid JSON:", jsonString);
        throw new Error("فشل في قراءة مخرجات الذكاء الاصطناعي (Invalid JSON Format). حاول مرة أخرى أو استخدم موديل أقوى.");
      }

      if (!Array.isArray(dynamicPlan) || dynamicPlan.length === 0) {
        throw new Error("خطة الملفات المرجعة فارغة أو غير صالحة.");
      }

      dispatch({ type: Actions.PLANNING_DONE, payload: dynamicPlan });

      // Show the full plan in the steps timeline so user can review it
      addStep(
        "think",
        `✅ خطة ذكية — ${dynamicPlan.length} ملف`,
        dynamicPlan.map(f => `${f.icon ?? "📄"} ${f.path} (${f.role})`).join(" · ")
      );

      return dynamicPlan;

    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Planner Error:", err);
        dispatch({ type: Actions.PLANNING_ERROR });
        addStep("error", "فشل التخطيط الذكي", err.message);
      }
      return null;
    }
  }, [
    state.prompt, state.model, state.connected, state.loading,
    state.provider, state.geminiApiKey, state.openRouterApiKey,
    state.appType, state.features,
    dispatch, Actions, addStep, abortRef
  ]);

  return { runPlanner };
}
