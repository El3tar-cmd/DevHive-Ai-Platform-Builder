/* ══════════════════════════════════════════════════════
   Gemini Service — Google Cloud API Provider
   ══════════════════════════════════════════════════════ */

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

/**
 * Known good Gemini models — used as fallback if the API call fails.
 * Keep updated quarterly. Removed non-existent "gemini-3.1-*" models.
 */
const GEMINI_FALLBACK_MODELS = [
  "gemini-2.5-pro",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
  "gemini-1.5-pro",
  "gemini-1.5-flash",
];

/**
 * Maps standard messages [{role: "system"|"user"|"assistant", content}] 
 * to Gemini's format {contents: [{role: "user"|"model", parts: [{text}]}], systemInstruction: ...}
 */
function buildGeminiRequest(messages, options = {}) {
  let systemInstruction = undefined;
  const contents = [];

  for (const msg of messages) {
    if (msg.role === "system") {
      systemInstruction = { parts: [{ text: msg.content }] };
      continue;
    }

    // Merge consecutive messages of the same role (Gemini requires alternating roles)
    const geminiRole = msg.role === "user" ? "user" : "model";
    const lastContent = contents[contents.length - 1];

    if (lastContent && lastContent.role === geminiRole) {
      lastContent.parts.push({ text: "\n" + msg.content });
    } else {
      contents.push({
        role: geminiRole,
        parts: [{ text: msg.content }],
      });
    }
  }

  return {
    contents,
    systemInstruction,
    generationConfig: {
      temperature: options.temperature ?? 0.3,
      topP: options.top_p ?? 0.9,
    }
  };
}

/**
 * Fetches available Gemini chat-compatible models from the REST API.
 * Falls back to a curated static list if the API call fails.
 *
 * @param {string} apiKey - Google AI API key
 * @returns {Promise<string[]>} List of model IDs
 */
export async function listModels(apiKey) {
  if (!apiKey) throw new Error("مفتاح API الخاص بـ Gemini مفقود.");

  try {
    const res = await fetch(
      `${GEMINI_BASE_URL}?key=${apiKey}&pageSize=50`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (!res.ok) {
      console.warn("Gemini listModels API returned non-OK, using fallback list.");
      return GEMINI_FALLBACK_MODELS;
    }

    const data = await res.json();

    // Filter to models that support generateContent (chat-capable)
    const chatModels = (data.models || [])
      .filter(m =>
        Array.isArray(m.supportedGenerationMethods) &&
        m.supportedGenerationMethods.includes("generateContent") &&
        m.name.includes("gemini")
      )
      .map(m => m.name.replace("models/", ""))
      .sort();

    return chatModels.length > 0 ? chatModels : GEMINI_FALLBACK_MODELS;
  } catch (err) {
    console.warn("Gemini listModels failed, using fallback:", err.message);
    return GEMINI_FALLBACK_MODELS;
  }
}

/**
 * Sends a non-streaming chat request to Gemini REST API.
 */
export async function chatCompletion(messages, model, options, signal, apiKey) {
  if (!apiKey) throw new Error("مفتاح API الخاص بـ Gemini مفقود.");

  const reqBody = buildGeminiRequest(messages, options);

  const res = await fetch(`${GEMINI_BASE_URL}/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal,
    body: JSON.stringify(reqBody),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(`Gemini Error: ${data.error?.message || res.statusText}`);
  }

  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

/**
 * Sends a streaming chat request to Gemini REST API via Server-Sent Events (SSE).
 */
export async function chatStream(messages, model, options, signal, onToken, apiKey) {
  if (!apiKey) throw new Error("مفتاح API الخاص بـ Gemini مفقود.");

  const reqBody = buildGeminiRequest(messages, options);

  const res = await fetch(`${GEMINI_BASE_URL}/${model}:streamGenerateContent?alt=sse&key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal,
    body: JSON.stringify(reqBody),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(`Gemini Error: ${errData.error?.message || res.statusText}`);
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
      if (!jsonStr) continue;

      try {
        const json = JSON.parse(jsonStr);
        const token = json.candidates?.[0]?.content?.parts?.[0]?.text;

        if (token) {
          fullContent += token;
          onToken(token);
        }
      } catch (err) {
        console.warn("Gemini JSON parse error on complete line", err, jsonStr);
      }
    }
  }

  return fullContent;
}
