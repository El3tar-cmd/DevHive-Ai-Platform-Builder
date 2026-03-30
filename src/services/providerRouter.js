/* ══════════════════════════════════════════════════════
   Provider Router — Routes LLM requests gracefully
   ══════════════════════════════════════════════════════ */

import * as ollamaService from "./ollamaService.js";
import * as geminiService from "./geminiService.js";
import * as openRouterService from "./openRouterService.js";

/**
 * Fetches available models for the currently selected provider.
 * 
 * @param {string} provider - "ollama" | "gemini" | "openrouter"
 * @param {string} apiKey   - Required for Gemini or OpenRouter
 * @returns {Promise<string[]>} List of model names
 */
export async function listModels(provider, apiKey) {
  if (provider === "openrouter") {
    return openRouterService.listModels(apiKey);
  } else if (provider === "gemini") {
    return geminiService.listModels(apiKey);
  } else {
    return ollamaService.listModels();
  }
}

/**
 * Sends a non-streaming chat completion request.
 * 
 * @param {string} provider - "ollama" | "gemini" | "openrouter"
 * @param {Array} messages  - [{ role, content }]
 * @param {string} model    - Model name
 * @param {object} options  - { temperature, top_p }
 * @param {AbortSignal} signal 
 * @param {string} apiKey   - Required for Gemini or OpenRouter
 * @returns {Promise<string>}
 */
export async function chatCompletion(provider, messages, model, options, signal, apiKey) {
  if (provider === "openrouter") {
    return openRouterService.chatCompletion(messages, model, options, signal, apiKey);
  } else if (provider === "gemini") {
    return geminiService.chatCompletion(messages, model, options, signal, apiKey);
  } else {
    return ollamaService.chatCompletion(messages, model, options, signal);
  }
}

/**
 * Sends a streaming chat completion request.
 * 
 * @param {string} provider - "ollama" | "gemini" | "openrouter"
 * @param {Array} messages  - [{ role, content }]
 * @param {string} model    - Model name
 * @param {object} options  - { temperature, top_p }
 * @param {AbortSignal} signal 
 * @param {Function} onToken - Callback for stream chunks
 * @param {string} apiKey   - Required for Gemini or OpenRouter
 * @returns {Promise<string>}
 */
export async function chatStream(provider, messages, model, options, signal, onToken, apiKey) {
  if (provider === "openrouter") {
    return openRouterService.chatStream(messages, model, options, signal, onToken, apiKey);
  } else if (provider === "gemini") {
    return geminiService.chatStream(messages, model, options, signal, onToken, apiKey);
  } else {
    return ollamaService.chatStream(messages, model, options, signal, onToken);
  }
}
