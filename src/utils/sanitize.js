/* ══════════════════════════════════════════════════════
   Sanitize — Input validation helpers
   ══════════════════════════════════════════════════════ */

/**
 * Sanitizes a project name: removes whitespace, restricts to safe characters.
 *
 * @param {string} raw - Raw user input
 * @returns {string} Sanitized project name
 */
export function sanitizeProjectName(raw) {
  return raw
    .replace(/\s+/g, "-")            // spaces → hyphens
    .replace(/[^a-zA-Z0-9_.-]/g, "") // remove unsafe chars
    .substring(0, 64);               // max length
}
