/* ══════════════════════════════════════════════════════
   useHealer — Compile-Time Self-Healing Engine
   ══════════════════════════════════════════════════════ */

import { useCallback } from "react";
import { useForge } from "../context/ForgeContext.jsx";
import { chatCompletion } from "../services/providerRouter.js";
import { HEALER_SYSTEM_MESSAGE } from "../config/prompts.js";
import { getApiKey } from "../utils/apiKey.js";

/**
 * Maximum number of heal attempts before giving up.
 * Prevents infinite loops if the LLM can't fix the issue.
 */
const MAX_HEAL_RETRIES = 3;

/**
 * useHealer — Stage 2: Compile-Time Healer
 * 
 * After all files are generated, this hook:
 * 1. Writes all generated files to disk (via Vite dev server proxy or local API).
 * 2. Attempts to compile the project.
 * 3. If compilation fails, sends the error + file code to the AI Healer.
 * 4. The AI returns an XML <patch> with targeted edits.
 * 5. Applies the patch and retries compilation.
 */
export function useHealer() {
  const { state, dispatch, Actions, addStep } = useForge();

  /**
   * Parses XML patch response from the Healer LLM.
   * Supports multiple <patch> blocks in a single response.
   * 
   * @param {string} xmlText - Raw XML response from the LLM
   * @returns {Array<{action: string, file: string, search: string, replace: string, fullCode: string}>}
   */
  const parsePatches = useCallback((xmlText) => {
    const patches = [];
    // Match all <patch>...</patch> blocks (supports multiple patches)
    const patchRegex = /<patch>([\s\S]*?)<\/patch>/gi;
    let match;

    while ((match = patchRegex.exec(xmlText)) !== null) {
      const block = match[1];

      const getTag = (tag) => {
        const tagRegex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "i");
        const m = block.match(tagRegex);
        return m ? m[1].trim() : "";
      };

      // Strip XML comments from content
      const stripComments = (text) => text.replace(/<!--[\s\S]*?-->/g, "").trim();

      const action   = stripComments(getTag("action"));
      const file     = stripComments(getTag("file"));
      const search   = stripComments(getTag("search"));
      const replace  = stripComments(getTag("replace"));
      const fullCode = stripComments(getTag("fullCode"));

      if (file && action) {
        patches.push({ action, file, search, replace, fullCode });
      }
    }

    return patches;
  }, []);

  /**
   * Applies a single patch to the project's in-memory file store.
   * 
   * @param {Object} patch - Parsed patch object
   * @param {Object} files - Current files map {path: content}
   * @returns {Object} Updated files map
   */
  const applyPatch = useCallback((patch, files) => {
    const updatedFiles = { ...files };

    switch (patch.action) {
      case "edit": {
        const currentContent = updatedFiles[patch.file];
        if (!currentContent) {
          console.warn(`Healer: File not found for edit: ${patch.file}`);
          return updatedFiles;
        }

        if (patch.search && currentContent.includes(patch.search)) {
          updatedFiles[patch.file] = currentContent.replace(patch.search, patch.replace);
        } else if (patch.search) {
          // Fuzzy match: try trimmed version
          const trimmedSearch = patch.search.split("\n").map(l => l.trim()).join("\n");
          const trimmedContent = currentContent.split("\n").map(l => l.trim()).join("\n");
          
          if (trimmedContent.includes(trimmedSearch)) {
            // Find the original lines and replace
            const searchLines = patch.search.split("\n").map(l => l.trim());
            const contentLines = currentContent.split("\n");
            let startIdx = -1;

            for (let i = 0; i <= contentLines.length - searchLines.length; i++) {
              let match = true;
              for (let j = 0; j < searchLines.length; j++) {
                if (contentLines[i + j].trim() !== searchLines[j]) {
                  match = false;
                  break;
                }
              }
              if (match) {
                startIdx = i;
                break;
              }
            }

            if (startIdx !== -1) {
              const before = contentLines.slice(0, startIdx);
              const after = contentLines.slice(startIdx + searchLines.length);
              updatedFiles[patch.file] = [...before, patch.replace, ...after].join("\n");
            }
          } else {
            console.warn(`Healer: Search text not found in ${patch.file}, falling back to replace_all`);
            if (patch.fullCode) {
              updatedFiles[patch.file] = patch.fullCode;
            }
          }
        }
        break;
      }

      case "create": {
        updatedFiles[patch.file] = patch.fullCode || "";
        break;
      }

      case "replace_all": {
        if (patch.fullCode) {
          updatedFiles[patch.file] = patch.fullCode;
        }
        break;
      }

      default:
        console.warn(`Healer: Unknown action: ${patch.action}`);
    }

    return updatedFiles;
  }, []);

  /**
   * Sends a compile error to the AI Healer and receives XML patches.
   * 
   * @param {string} errorLog - The raw compile error log from the build tool
   * @param {Object} files - Current files map
   * @returns {Array} Parsed patches
   */
  const requestHeal = useCallback(async (errorLog, files) => {
    // Extract the file path from the error message
    const filePathMatch = errorLog.match(/(?:src\/[^\s:]+\.[jt]sx?)/);
    const errorFilePath = filePathMatch ? filePathMatch[0] : null;
    
    // Build context: include the erroring file's code if found
    let fileContext = "";
    if (errorFilePath && files[errorFilePath]) {
      fileContext = `\nكود الملف المسبب للخطأ (\`${errorFilePath}\`):\n\`\`\`\n${files[errorFilePath]}\n\`\`\`\n`;
    }

    // Include a list of all available file paths for context
    const allPaths = Object.keys(files).map(p => `- ${p}`).join("\n");

    const promptText = `رسالة الخطأ من أداة البناء (Build Error):
\`\`\`
${errorLog}
\`\`\`
${fileContext}
قائمة جميع ملفات المشروع المتوفرة:
${allPaths}

قم بتحليل الخطأ وأرجع لي تعديل (Patch) بصيغة XML لإصلاحه.
يمكنك إرجاع أكثر من <patch> إذا لزم الأمر لإصلاح عدة ملفات.`;

    try {
      const apiKey = getApiKey(state);
      const responseText = await chatCompletion(
        state.provider,
        [HEALER_SYSTEM_MESSAGE, { role: "user", content: promptText }],
        state.model,
        { temperature: 0.1 },
        undefined, // signal
        apiKey
      );

      return parsePatches(responseText);
    } catch (error) {
      console.error("Healer request failed:", error);
      return [];
    }
  }, [state.provider, state.model, state.geminiApiKey, state.openRouterApiKey, parsePatches]);

  /**
   * Main healing loop.
   * Attempts to compile, and if it fails, asks the AI to fix and retries.
   *
   * @param {Object} files - Current files map from state
   * @param {Function} compileFunc - Function that attempts compilation, returns {success, errorLog}
   * @returns {Object} Updated files map after healing
   */
  const runHealingLoop = useCallback(async (files, compileFunc) => {
    let currentFiles = { ...files };
    let attempt = 0;

    dispatch({ type: Actions.START_VERIFICATION });
    addStep("info", "🔍 فحص المشروع", "يتم التحقق من سلامة البناء...");

    while (attempt < MAX_HEAL_RETRIES) {
      const result = await compileFunc(currentFiles);

      if (result.success) {
        addStep("done", "✅ بنية سليمة!", `تم التحقق بنجاح ${attempt > 0 ? `بعد ${attempt} إصلاح` : "من أول محاولة"}`);
        dispatch({ type: Actions.GENERATION_DONE });
        return currentFiles;
      }

      attempt++;
      addStep("error", `⚠️ خطأ بناء #${attempt}`, result.errorLog?.substring(0, 100) || "خطأ غير معروف");

      dispatch({ type: Actions.COMPILATION_ERROR, payload: result.errorLog });
      dispatch({ type: Actions.HEALING_STARTED, payload: { path: "Auto-Healer", desc: `محاولة إصلاح #${attempt}` } });

      addStep("build", `🛠️ الإصلاح الذاتي #${attempt}`, "يتم تحليل الخطأ وإرسال التعديلات...");

      const patches = await requestHeal(result.errorLog, currentFiles);

      if (patches.length === 0) {
        addStep("error", "❌ فشل الإصلاح", "لم يتمكن المراجع من توليد تعديلات");
        break;
      }

      for (const patch of patches) {
        currentFiles = applyPatch(patch, currentFiles);
        
        // Update the file in context
        dispatch({ type: Actions.HEALING_DONE, payload: { path: patch.file, content: currentFiles[patch.file] } });
        addStep("done", `✓ تم تعديل ${patch.file}`, `${patch.action === "create" ? "ملف جديد" : "تعديل موجه"}`);
      }
    }

    if (attempt >= MAX_HEAL_RETRIES) {
      addStep("error", "⚠️ الحد الأقصى", `تم استنزاف ${MAX_HEAL_RETRIES} محاولات إصلاح`);
    }

    return currentFiles;
  }, [dispatch, Actions, addStep, requestHeal, applyPatch]);

  return { runHealingLoop, parsePatches, applyPatch, requestHeal };
}
