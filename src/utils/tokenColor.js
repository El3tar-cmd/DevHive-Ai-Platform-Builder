/* ══════════════════════════════════════════════════════
   Token Colorizer — Returns CSS class for syntax tokens
   ══════════════════════════════════════════════════════ */

/**
 * Maps a token string to a CSS class for syntax highlighting.
 *
 * @param {string} tok - Raw token text
 * @returns {string} CSS class name
 */
export function tokenColor(tok) {
  if (tok.match(/^<\/?[a-zA-Z]/))                                                    return "tk-html";
  if (tok.match(/^(const|let|var|function|return|if|else|for|while|class|import|export|interface|type|async|await|=>)/)) return "tk-kw";
  if (tok.match(/^['"`]/))                                                            return "tk-str";
  if (tok.match(/^\d/))                                                               return "tk-num";
  if (tok.startsWith("//") || tok.startsWith("/*"))                                   return "tk-cm";
  if (tok.match(/^[A-Z]/))                                                            return "tk-ts";
  return "tk-plain";
}
