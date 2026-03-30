/* ══════════════════════════════════════════════════════
   Ollama Service — Local LLM Provider
   ══════════════════════════════════════════════════════ */

import { OLLAMA_BASE_URL } from "../config/constants.js";

/**
 * Fetches available models from local Ollama instance.
 * @returns {Promise<string[]>}
 */
export async function listModels() {
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      signal: AbortSignal.timeout(4000),
    });
    const data = await res.json();
    return (data.models || []).map(m => m.name);
  } catch {
    throw new Error("فشل الاتصال بـ Ollama. تأكد أنه يعمل على المنفذ 11434.");
  }
}

/**
 * Sends a non-streaming chat request to Ollama.
 * 
 * @param {Array<{role: string, content: string}>} messages 
 * @param {string} model 
 * @param {object} options - Generation options (temp, top_p)
 * @param {AbortSignal} signal 
 * @returns {Promise<string>}
 */
export async function chatCompletion(messages, model, options, signal) {
  const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal,
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      options,
    }),
  });

  if (!res.ok) throw new Error(`Ollama HTTP Error: ${res.status}`);

  const data = await res.json();
  return data.message?.content || "";
}

/**
 * Sends a streaming chat request to Ollama.
 * 
 * @param {Array<{role: string, content: string}>} messages 
 * @param {string} model 
 * @param {object} options 
 * @param {AbortSignal} signal 
 * @param {Function} onToken - Callback fired for each received token chunk
 * @returns {Promise<string>} Full concatenated response text
 */
export async function chatStream(messages, model, options, signal, onToken) {
  const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal,
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      options,
    }),
  });

  if (!res.ok) throw new Error(`Ollama HTTP Error: ${res.status}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullContent = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    
    // The last element might be an incomplete line
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const json = JSON.parse(line);
        const token = json.message?.content || "";
        if (token) {
          fullContent += token;
          onToken(token);
        }
      } catch (err) {
        // Only fails if the provider sent completely invalid JSON, not chunks
        console.warn("Ollama JSON parse error on complete line", err);
      }
    }
  }

  return fullContent;
}
