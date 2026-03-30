/* ══════════════════════════════════════════════════════
   OpenRouter Service — OpenAI Compatible API
   ══════════════════════════════════════════════════════ */

import FREE_MODELS from "../../free_models.json";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

/**
 * Returns the current page origin for use in HTTP-Referer.
 * Avoids hardcoding localhost which breaks in production deployments.
 */
const getReferer = () =>
  typeof window !== "undefined" ? window.location.origin : "http://localhost:5173";

/**
 * Common headers required by OpenRouter for attribution and ranking.
 * @param {string} apiKey
 */
function buildHeaders(apiKey) {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`,
    "HTTP-Referer": getReferer(),
    "X-Title": "DevHive AI Platform",
  };
}

/**
 * Returns the list of free models from free_models.json.
 * Validates a non-empty API key before returning.
 *
 * @param {string} apiKey
 * @returns {Promise<string[]>}
 */
export async function listModels(apiKey) {
  if (!apiKey) throw new Error("مفتاح API الخاص بـ OpenRouter مفقود.");
  // Return the curated free-models list from the JSON file
  return Array.isArray(FREE_MODELS) ? FREE_MODELS : [];
}

/**
 * Sends a non-streaming chat request.
 */
export async function chatCompletion(messages, model, options, signal, apiKey) {
  if (!apiKey) throw new Error("مفتاح API الخاص بـ OpenRouter مفقود.");

  const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: buildHeaders(apiKey),
    signal,
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature ?? 0.3,
      top_p: options.top_p ?? 0.9,
      stream: false,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error("OpenRouter Full Error:", data);
    const providerDetails = data.error?.metadata?.raw ?? JSON.stringify(data.error?.metadata ?? "");
    throw new Error(`OpenRouter Error: ${data.error?.message || res.statusText} | التفاصيل: ${providerDetails}`);
  }

  return data.choices?.[0]?.message?.content || "";
}

/**
 * Sends a streaming chat request (SSE).
 */
export async function chatStream(messages, model, options, signal, onToken, apiKey) {
  if (!apiKey) throw new Error("مفتاح API الخاص بـ OpenRouter مفقود.");

  const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: buildHeaders(apiKey),
    signal,
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature ?? 0.3,
      top_p: options.top_p ?? 0.9,
      stream: true,
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    console.error("OpenRouter Stream Full Error:", errData);
    const providerDetails = errData.error?.metadata?.raw ?? JSON.stringify(errData.error?.metadata ?? "");
    throw new Error(`OpenRouter Error: ${errData.error?.message || res.statusText} | التفاصيل: ${providerDetails}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let fullContent = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.trim().startsWith("data: ")) continue;

      const jsonStr = line.replace(/^data:\s*/, "").trim();
      if (!jsonStr || jsonStr === "[DONE]") continue;

      try {
        const json = JSON.parse(jsonStr);
        const token = json.choices?.[0]?.delta?.content;

        if (token) {
          fullContent += token;
          onToken(token);
        }
      } catch (err) {
        console.warn("OpenRouter JSON parse error on complete line", err, jsonStr);
      }
    }
  }

  return fullContent;
}
