import { useCallback } from "react";
import { useForge } from "../context/useForge.js";
import { chatCompletion } from "../services/providerRouter.js";
import { REVIEWER_SYSTEM_MESSAGE } from "../config/prompts.js";
import { getApiKey } from "../utils/apiKey.js";

/**
 * useReviewer encapsulates the logic for Stage 1: Static Relational Healer.
 * It analyzes a freshly generated file to ensure it doesn't import missing files.
 */
export function useReviewer() {
  const { state } = useForge();

  const runStaticReview = useCallback(async (path, content, existingPlan) => {
    // We only review logic and UI files where imports matter most
    if (!path.endsWith(".ts") && !path.endsWith(".tsx") && !path.endsWith(".js") && !path.endsWith(".jsx")) {
      return { isValid: true, missingFiles: [] };
    }

    // Build the list of currently known paths
    const currentPaths = existingPlan.map(f => f.path).join("\\n- ");

    const promptText = `هذا هو كود الملف: \`${path}\`
\`\`\`
${content}
\`\`\`

وهذه هي خطة الملفات المتوفرة في المشروع حالياً:
- ${currentPaths}

ابحث في الكود عن أي استدعاء (import) لملفات داخلية (Relative paths) غير متوفرة في الخطة.
إذا كان هناك ملفات ناقصة، اكتب الكود الخاص بها بالكامل وأرجعها في مصفوفة missingFiles بصيغة JSON.
إذا كان كل شيء سليم، أرجع {"isValid": true, "missingFiles": []}.
`;

    try {
      const apiKey = getApiKey(state);
      const responseText = await chatCompletion(
        state.provider,
        [REVIEWER_SYSTEM_MESSAGE, { role: "user", content: promptText }],
        state.model,
        { temperature: 0.1 },
        undefined, // signal
        apiKey
      );
      
      let reviewResult;
      try {
        reviewResult = JSON.parse(responseText);
      } catch {
        console.error("Failed to parse Reviewer JSON:", responseText);
        return { isValid: true, missingFiles: [] }; // Fallback to pass to avoid breaking loop
      }

      return {
        isValid: reviewResult.isValid ?? true,
        missingFiles: Array.isArray(reviewResult.missingFiles) ? reviewResult.missingFiles : []
      };

    } catch (error) {
      console.error("Reviewer agent error:", error);
      return { isValid: true, missingFiles: [] };
    }
  }, [state]);

  return { runStaticReview };
}
