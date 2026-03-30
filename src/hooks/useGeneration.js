/* ══════════════════════════════════════════════════════
   useGeneration — File generation orchestrator
   ══════════════════════════════════════════════════════ */

import { useCallback, useRef, useEffect } from "react";
import { useForge } from "../context/ForgeContext.jsx";
import { OLLAMA_BASE_URL } from "../config/constants.js";
import { buildFilePrompt, SYSTEM_MESSAGE } from "../config/prompts.js";
import { usePlanner } from "./usePlanner.js";
import { useReviewer } from "./useReviewer.js";
import { useHealer } from "./useHealer.js";
import { chatStream } from "../services/providerRouter.js";
import { analyzeCodeQuality } from "../utils/codeAnalyzer.js";
import { getApiKey } from "../utils/apiKey.js";

/**
 * Orchestrates multi-file generation with streaming.
 * Loops through FILE_PLANS, generating each file sequentially.
 */
export function useGeneration() {
  const {
    state, dispatch, Actions,
    selectedAppType, doneCount,
    addStep, abortRef, timerRef, startRef, tokRef,
  } = useForge();

  const { runPlanner } = usePlanner();
  const { runStaticReview } = useReviewer();
  const { runHealingLoop } = useHealer();

  /**
   * Mutable ref that always holds the latest generated files.
   * Avoids stale-closure issues when the healing loop reads files 
   * after a long generation loop has mutated state many times.
   */
  const filesRef = useRef({});
  useEffect(() => {
    filesRef.current = state.files;
  }, [state.files]);

  /**
   * Streams a single file from the Ollama API.
   */
  const generateFile = useCallback(async (fileInfo, signal) => {
    const fp = buildFilePrompt(
      fileInfo,
      selectedAppType?.label || state.appType,
      state.prompt,
      state.features,
      state.projName
    );

    const onToken = (tok) => {
      tokRef.current++;
      dispatch({
        type: Actions.APPEND_TOKEN,
        payload: { id: tokRef.current, text: tok, totalTokens: tokRef.current },
      });
    };

    const apiKey = getApiKey(state);
    const content = await chatStream(
      state.provider,
      [SYSTEM_MESSAGE, { role: "user", content: fp }],
      state.model,
      { temperature: 0.3, top_p: 0.9 },
      signal,
      onToken,
      apiKey
    );

    return content;
  }, [
    state.provider, state.geminiApiKey, state.openRouterApiKey, state.appType, state.prompt, 
    state.features, state.projName, state.model, selectedAppType, 
    dispatch, Actions, tokRef
  ]);

  /**
   * Main generation loop — generates all files dynamically.
   */
  const generate = useCallback(async () => {
    if (!state.prompt.trim() || !state.model || !state.connected || state.loading) return;

    // 1. Planning Phase (AI determines files)
    const dynamicPlan = await runPlanner();
    
    // If planning failed or aborted, stop early
    if (!dynamicPlan || !Array.isArray(dynamicPlan)) return;

    // 2. Generation Phase
    dispatch({ type: Actions.START_GENERATION, payload: dynamicPlan });
    tokRef.current = 0;
    startRef.current = Date.now();

    // Metrics timer
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      const tps = elapsed > 0 ? +(tokRef.current / elapsed).toFixed(1) : 0;
      dispatch({ type: Actions.UPDATE_METRICS, payload: { elapsed, tps } });
    }, 300);

    abortRef.current = new AbortController();
    const { signal } = abortRef.current;

    addStep("info", `تأكيد هندسة ${selectedAppType?.label}`, `${dynamicPlan.length} ملفات · ${state.projName}`);

    let fileIdx = 0;
    for (const fileInfo of dynamicPlan) {
      if (signal.aborted) break;

      dispatch({ type: Actions.FILE_GENERATING, payload: fileInfo });

      const prog = Math.round((fileIdx / dynamicPlan.length) * 90);
      dispatch({ type: Actions.SET_PROGRESS, payload: prog });

      addStep("build", `يبني ${fileInfo.path}`, fileInfo.desc);

      try {
        const content = await generateFile(fileInfo, signal);
        dispatch({ type: Actions.FILE_DONE, payload: { path: fileInfo.path, content } });
        
        // --- Run Code Review Analysis ---
        const review = analyzeCodeQuality(content, fileInfo.path);
        dispatch({ type: Actions.SET_FILE_REVIEW, payload: { path: fileInfo.path, review } });
        
        
        const issuesCount = review.filter(r => r.status === "fail" || r.status === "warn").length;
        if (issuesCount > 0) {
          addStep("warn", `مراجع: ${issuesCount} ملاحظات`, fileInfo.path);
        } else {
          addStep("done", `✓ ${fileInfo.path}`, `تم تدقيق الأكواد`);
        }

        // --- Phase 10 Stage 1: Static Relational Healing ---
        addStep("info", `المدقق الذكي`, `يبحث عن تبعيات ${fileInfo.path} المفقودة`);
        const { missingFiles } = await runStaticReview(fileInfo.path, content, dynamicPlan);
        
        if (missingFiles && missingFiles.length > 0) {
          for (const mFile of missingFiles) {
            if (!state.files[mFile.path] && mFile.code) {
              dispatch({ type: Actions.FILE_DONE, payload: { path: mFile.path, content: mFile.code } });
              addStep("build", `✨ إصلاح ذاتي`, `تم توليد ملف ناقص: ${mFile.path}`);
              // Append to dynamic plan so the UI reflects it
              dynamicPlan.push(mFile);
            }
          }
        }
        
      } catch (err) {
        if (err.name === "AbortError") break;
        dispatch({ type: Actions.FILE_ERROR, payload: fileInfo.path });
        addStep("error", `فشل ${fileInfo.path}`, err.message);
      }

      fileIdx++;
    }

    clearInterval(timerRef.current);

    if (!signal.aborted) {
      // --- Phase 10 Stage 2: Compile-Time Healer ---
      addStep("info", "🔍 فحص متقدم", "بدء الفحص التجميعي للمشروع بالكامل...");

      /** 
       * In-Browser Static Compile Check 
       * Scans all generated files for broken cross-file imports.
       */
      const compileCheck = async (files) => {
        const errors = [];
        const allPaths = Object.keys(files);

        for (const [filePath, content] of Object.entries(files)) {
          if (!content) continue;
          // Extract all relative imports: import X from '@/...' or './...'
          const importRegex = /(?:import|from)\s+['"](@\/[^'"]+|\.\/[^'"]+|\.\.\/[^'"]+)['"]/g;
          let m;
          while ((m = importRegex.exec(content)) !== null) {
            let importedPath = m[1];
            
            // Normalize @/ alias to src/
            if (importedPath.startsWith("@/")) {
              importedPath = "src/" + importedPath.slice(2);
            }

            // Check if imported path exists (with common extensions)
            const extensions = ["", ".ts", ".tsx", ".js", ".jsx", "/index.ts", "/index.tsx", "/index.js"];
            const found = extensions.some(ext => allPaths.includes(importedPath + ext));

            if (!found) {
              errors.push(`${filePath}: Cannot find module '${m[1]}'`);
            }
          }
        }

        if (errors.length > 0) {
          return { success: false, errorLog: `Build Error: ${errors.length} broken import(s) found:\n${errors.join("\n")}` };
        }
        return { success: true, errorLog: "" };
      };

      // Use filesRef.current to get the LATEST files (not a stale closure snapshot)
      // Then also merge any newly added files from the dynamic plan
      const latestFiles = { ...filesRef.current };
      for (const f of dynamicPlan) {
        if (filesRef.current[f.path]) latestFiles[f.path] = filesRef.current[f.path];
      }

      await runHealingLoop(latestFiles, compileCheck);
    }
  }, [
    state.prompt, state.model, state.connected, state.loading, state.projName,
    dispatch, Actions, selectedAppType, addStep, doneCount,
    generateFile, abortRef, timerRef, startRef, tokRef, runPlanner, runStaticReview, runHealingLoop
  ]);

  /**
   * Stops the current generation.
   */
  const stop = useCallback(() => {
    abortRef.current?.abort();
    clearInterval(timerRef.current);
    dispatch({ type: Actions.STOP });
  }, [dispatch, Actions, abortRef, timerRef]);

  /**
   * Retries only the failed/errored files from the current plan.
   * Does NOT re-run the planner — uses the existing dynamicPlan.
   */
  const retryFailed = useCallback(async () => {
    const plan = state.dynamicPlan;
    if (!plan || !Array.isArray(plan) || !state.model || !state.connected) return;

    // Collect files that have 'err' or 'pending' status
    const failedFiles = plan.filter(f => {
      const status = state.fileStatuses[f.path];
      return status === "err" || status === "pending";
    });

    if (failedFiles.length === 0) return;

    // Switch to generating phase but keep existing files intact
    dispatch({ type: Actions.SET_PROGRESS, payload: Math.round((1 - failedFiles.length / plan.length) * 90) });
    dispatch({ type: Actions.ADD_STEP, payload: { type: "info", title: `\u267B\uFE0F إعادة توليد`, detail: `${failedFiles.length} ملف فاشل`, ts: "0.00" } });

    // Mark as loading
    abortRef.current = new AbortController();
    const { signal } = abortRef.current;
    startRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      const tps = elapsed > 0 ? +(tokRef.current / elapsed).toFixed(1) : 0;
      dispatch({ type: Actions.UPDATE_METRICS, payload: { elapsed, tps } });
    }, 300);

    // Generate each failed file with retry per file (max 2 attempts)
    let recovered = 0;
    for (const fileInfo of failedFiles) {
      if (signal.aborted) break;

      dispatch({ type: Actions.FILE_GENERATING, payload: fileInfo });
      addStep("build", `\u267B\uFE0F يعيد ${fileInfo.path}`, fileInfo.desc);

      let success = false;
      for (let attempt = 1; attempt <= 2 && !success; attempt++) {
        try {
          const content = await generateFile(fileInfo, signal);
          dispatch({ type: Actions.FILE_DONE, payload: { path: fileInfo.path, content } });

          const review = analyzeCodeQuality(content, fileInfo.path);
          dispatch({ type: Actions.SET_FILE_REVIEW, payload: { path: fileInfo.path, review } });
          addStep("done", `\u2713 ${fileInfo.path}`, `تم الاسترداد (محاولة ${attempt})`);
          success = true;
          recovered++;
        } catch (err) {
          if (err.name === "AbortError") break;
          if (attempt === 2) {
            dispatch({ type: Actions.FILE_ERROR, payload: fileInfo.path });
            addStep("error", `\u274C فشل نهائي ${fileInfo.path}`, err.message);
          } else {
            addStep("warn", `محاولة ثانية...`, fileInfo.path);
            await new Promise(r => setTimeout(r, 1000)); // Wait 1s before retry
          }
        }
      }

      const prog = Math.round(((plan.length - failedFiles.length + recovered) / plan.length) * 90);
      dispatch({ type: Actions.SET_PROGRESS, payload: prog });
    }

    clearInterval(timerRef.current);

    if (!signal.aborted) {
      const remainingErrors = Object.values(state.fileStatuses).filter(s => s === "err").length;
      if (remainingErrors === 0 || recovered === failedFiles.length) {
        dispatch({ type: Actions.GENERATION_DONE });
        addStep("done", "\u2705 تم استرداد جميع الملفات!", `${recovered} ملف تم إصلاحه`);
      } else {
        dispatch({ type: Actions.STOP });
        addStep("warn", `\u26A0\uFE0F تم استرداد ${recovered}/${failedFiles.length}`, "بعض الملفات لا تزال فاشلة");
      }
    }
  }, [
    state.dynamicPlan, state.model, state.connected, state.fileStatuses,
    dispatch, Actions, addStep, generateFile, abortRef, timerRef, startRef, tokRef
  ]);

  return { generate, stop, retryFailed };
}
