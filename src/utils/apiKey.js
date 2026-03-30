/* ══════════════════════════════════════════════════════
   apiKey — Centralized API key resolver
   DRY helper — replaces 5+ duplicated conditionals.
   ══════════════════════════════════════════════════════ */

/**
 * Resolves the correct API key based on the active provider.
 * Ollama is local and needs no key → returns undefined.
 *
 * @param {{ provider: string, geminiApiKey: string, openRouterApiKey: string }} state
 * @returns {string|undefined}
 */
export function getApiKey(state) {
  if (state.provider === "openrouter") return state.openRouterApiKey || undefined;
  if (state.provider === "gemini")     return state.geminiApiKey     || undefined;
  return undefined; // Ollama local — no key needed
}

/**
 * Maps provider IDs to human-readable labels.
 * @param {string} provider
 */
export function getProviderLabel(provider) {
  const labels = { ollama: "Ollama", gemini: "Gemini", openrouter: "OpenRouter" };
  return labels[provider] ?? provider;
}
