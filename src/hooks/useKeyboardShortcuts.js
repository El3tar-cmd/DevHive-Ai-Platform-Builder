/* ── useKeyboardShortcuts — Global keyboard handler ── */

import { useEffect, useCallback } from "react";

/**
 * Registers global keyboard shortcuts for the Forge app.
 *
 * @param {{ generate, stop, download, newProject, togglePalette, connected, loading, hasFiles }} handlers
 */
export function useKeyboardShortcuts({ generate, stop, download, newProject, togglePalette, connected, loading, hasFiles }) {

  const handler = useCallback((e) => {
    const ctrl = e.ctrlKey || e.metaKey;

    // Ctrl+K → Command Palette
    if (ctrl && e.key === "k") {
      e.preventDefault();
      togglePalette?.();
      return;
    }

    // Escape → close palette (handled by palette itself, but safety fallback)
    if (e.key === "Escape") return;

    // Ignore if typing in an input / textarea
    const tag = document.activeElement?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

    // Ctrl+Enter → Generate
    if (ctrl && e.key === "Enter") {
      e.preventDefault();
      if (!loading && connected) generate?.();
      return;
    }

    // Ctrl+. → Stop
    if (ctrl && e.key === ".") {
      e.preventDefault();
      if (loading) stop?.();
      return;
    }

    // Ctrl+D → Download ZIP
    if (ctrl && e.key === "d") {
      e.preventDefault();
      if (hasFiles) download?.();
      return;
    }

    // Ctrl+N → New Project
    if (ctrl && e.key === "n") {
      e.preventDefault();
      newProject?.();
      return;
    }
  }, [generate, stop, download, newProject, togglePalette, connected, loading, hasFiles]);

  useEffect(() => {
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handler]);
}
