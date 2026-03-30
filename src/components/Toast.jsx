/* ── Toast — Notification toast ── */

import { useForge } from "../context/ForgeContext.jsx";

export default function Toast() {
  const { state } = useForge();
  const { toast } = state;

  return (
    <div className={`toast ${toast ? "show" : ""}`}>{toast}</div>
  );
}
