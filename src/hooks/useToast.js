/* ══════════════════════════════════════════════════════
   useToast — Toast notification helper
   ══════════════════════════════════════════════════════ */

import { useCallback, useRef } from "react";
import { useForge } from "../context/ForgeContext.jsx";

/**
 * Provides a `showToast(msg)` function that auto-clears after 2.2s.
 */
export function useToast() {
  const { dispatch, Actions } = useForge();
  const timeoutRef = useRef(null);

  const showToast = useCallback((message) => {
    // Clear any pending timeout
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    dispatch({ type: Actions.SET_TOAST, payload: message });

    timeoutRef.current = setTimeout(() => {
      dispatch({ type: Actions.SET_TOAST, payload: "" });
      timeoutRef.current = null;
    }, 2200);
  }, [dispatch, Actions]);

  return { showToast };
}
