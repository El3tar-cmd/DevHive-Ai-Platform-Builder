/* ── Toast — Notification toast ── */

import { useForge } from "../context/useForge.js";

export default function Toast() {
  const { state } = useForge();
  const { toast } = state;

  return (
    <div className={`toast ${toast ? "show" : ""}`}>{toast}</div>
  );
}
