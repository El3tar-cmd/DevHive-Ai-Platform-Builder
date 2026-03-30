/* ══════════════════════════════════════════════════════
   codeAnalyzer — Static Code Quality Inspector
   Fast regex-based checks (no AST), runs in-browser.
   ══════════════════════════════════════════════════════ */

/**
 * Runs a battery of static quality checks on generated file content.
 * Returns an array of review items, each with a status of "pass", "warn", or "fail".
 *
 * @param {string} content - Raw file content
 * @param {string} path    - File path (used to infer type)
 * @returns {Array<{msg: string, status: "pass"|"warn"|"fail", detail: string}>}
 */
export function analyzeCodeQuality(content, path) {
  const issues = [];

  if (!content) {
    issues.push({ msg: "Empty File", status: "fail", detail: "File has no content" });
    return issues;
  }

  const isTS        = path.endsWith(".ts") || path.endsWith(".tsx");
  const isComponent = path.endsWith(".tsx") || path.endsWith(".jsx");
  const isConfig    = path.endsWith(".json");

  // ── JSON Files ──────────────────────────────────────
  if (isConfig) {
    try {
      JSON.parse(content);
      issues.push({ msg: "JSON Structure", status: "pass", detail: "Valid syntax" });
    } catch {
      issues.push({ msg: "JSON Structure", status: "fail", detail: "Invalid JSON format" });
    }
    return issues;
  }

  // ── 1. Production Readiness (no TODOs / placeholders) ──
  const hasPlaceholders = /TODO|FIXME|\.\.\.|your_.*_here|placeholder/i.test(content);
  issues.push({
    msg: "Production Readiness",
    status: hasPlaceholders ? "warn" : "pass",
    detail: hasPlaceholders ? "Found inline TODOs or placeholders" : "Clean code",
  });

  // ── 2. Strict Typing (TypeScript only) ──────────────
  if (isTS) {
    const hasAny = /\bany\b/.test(content);
    issues.push({
      msg: "Strict Typing",
      status: hasAny ? "warn" : "pass",
      detail: hasAny ? "Found usage of 'any' type" : "Strictly typed",
    });
  }

  // ── 3. Module Export (components must export) ───────
  if (isComponent) {
    const hasExport = /export\s+default|export\s+const|export\s+function/.test(content);
    issues.push({
      msg: "Module Export",
      status: hasExport ? "pass" : "fail",
      detail: hasExport ? "Exports correctly" : "Missing export statement",
    });
  }

  // ── 4. Import Coverage ───────────────────────────────
  const hasImports = /import\s+.*from\s+/.test(content) || /require\(/.test(content);
  issues.push({
    msg: "Dependencies",
    status: hasImports || !isTS ? "pass" : "warn",
    detail: hasImports ? "Valid module imports" : "No imports found (might be isolated)",
  });

  // ── 5. Debug Leftovers (console.log in production files) ──
  const hasDebugLogs = /console\.log\(/.test(content);
  issues.push({
    msg: "Debug Cleanliness",
    status: hasDebugLogs ? "warn" : "pass",
    detail: hasDebugLogs ? "Found console.log() — remove before production" : "No debug logs",
  });

  return issues;
}
