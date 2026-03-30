/* ══════════════════════════════════════════════════════
   useOllama — Connection & model fetching
   Auto-retries if Ollama is offline (local provider only).
   ══════════════════════════════════════════════════════ */

import { useEffect, useRef } from "react";
import { useForge } from "../context/useForge.js";
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
  const { provider, model, geminiApiKey, openRouterApiKey } = state;

  // Re-fetch when provider or API key changes
  useEffect(() => {
    let cancelled = false;

    const fetchModels = async () => {
      try {
        const apiKey = getApiKey({ provider, geminiApiKey, openRouterApiKey });
        const list = await fetchProviderModels(provider, apiKey);

        if (cancelled) return;

        dispatch({ type: Actions.SET_MODELS, payload: list });

        if (list.length && !list.includes(model)) {
          dispatch({ type: Actions.SET_MODEL, payload: list[0] });
        }

        dispatch({ type: Actions.SET_CONNECTED, payload: true });
        addStep("info", `${getProviderLabel(provider)} متصل`, `${list.length} نموذج متاح`);

        if (retryTimerRef.current) {
          clearTimeout(retryTimerRef.current);
          retryTimerRef.current = null;
        }
      } catch (err) {
        if (cancelled) return;

        dispatch({ type: Actions.SET_CONNECTED, payload: false });
        dispatch({ type: Actions.SET_MODELS, payload: [] });

        if (provider === "gemini" && !geminiApiKey) {
          addStep("warn", "مفتاح API مفقود", "يرجى إدخال مفتاح Gemini API");
          return;
        }

        if (provider === "openrouter" && !openRouterApiKey) {
          addStep("warn", "مفتاح API مفقود", "يرجى إدخال مفتاح OpenRouter API");
          return;
        }

        addStep("error", "فشل الاتصال", err.message);

        if (provider === "ollama") {
          retryTimerRef.current = setTimeout(() => {
            void fetchModels();
          }, OLLAMA_RETRY_INTERVAL_MS);
        }
      }
    };

    void fetchModels();

    // Cleanup retry timer on unmount or when dependencies change
    return () => {
      cancelled = true;
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    };
  }, [provider, model, geminiApiKey, openRouterApiKey, dispatch, Actions, addStep]);

  return {};
}
