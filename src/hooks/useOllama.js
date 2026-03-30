/* ══════════════════════════════════════════════════════
   useOllama — Connection & model fetching
   Auto-retries if Ollama is offline (local provider only).
   ══════════════════════════════════════════════════════ */

import { useEffect, useCallback, useRef } from "react";
import { useForge } from "../context/ForgeContext.jsx";
import { listModels as fetchProviderModels } from "../services/providerRouter.js";
import { getApiKey, getProviderLabel } from "../utils/apiKey.js";

/** Retry interval (ms) when Ollama is offline. Does not apply to cloud providers. */
const OLLAMA_RETRY_INTERVAL_MS = 10_000;

/**
 * Manages LLM server connection and model discovery based on active provider.
 * For Ollama (local), automatically retries on failure every 10 seconds.
 */
export function useOllama() {
  const { state, dispatch, Actions, addStep } = useForge();
  const retryTimerRef = useRef(null);

  const fetchModels = useCallback(async () => {
    try {
      const apiKey = getApiKey(state);
      const list = await fetchProviderModels(state.provider, apiKey);

      dispatch({ type: Actions.SET_MODELS, payload: list });

      // Auto-select first model if current selection is no longer valid
      if (list.length && !list.includes(state.model)) {
        dispatch({ type: Actions.SET_MODEL, payload: list[0] });
      }

      dispatch({ type: Actions.SET_CONNECTED, payload: true });
      addStep("info", `${getProviderLabel(state.provider)} متصل`, `${list.length} نموذج متاح`);

      // Clear any pending retry on success
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    } catch (err) {
      dispatch({ type: Actions.SET_CONNECTED, payload: false });
      dispatch({ type: Actions.SET_MODELS, payload: [] });

      if (state.provider === "gemini" && !state.geminiApiKey) {
        addStep("warn", "مفتاح API مفقود", "يرجى إدخال مفتاح Gemini API");
      } else if (state.provider === "openrouter" && !state.openRouterApiKey) {
        addStep("warn", "مفتاح API مفقود", "يرجى إدخال مفتاح OpenRouter API");
      } else {
        addStep("error", "فشل الاتصال", err.message);

        // Auto-retry only for local Ollama (cloud providers need user action for key issues)
        if (state.provider === "ollama") {
          retryTimerRef.current = setTimeout(() => {
            fetchModels();
          }, OLLAMA_RETRY_INTERVAL_MS);
        }
      }
    }
  }, [state.provider, state.geminiApiKey, state.openRouterApiKey, state.model, dispatch, Actions, addStep]);

  // Re-fetch when provider or API key changes
  useEffect(() => {
    fetchModels();

    // Cleanup retry timer on unmount or when dependencies change
    return () => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    };
  }, [fetchModels, state.provider, state.geminiApiKey, state.openRouterApiKey]);

  return { fetchModels };
}
