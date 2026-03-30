/* ══════════════════════════════════════════════════════
   TelemetryPanel — Stats, progress, timeline
   ══════════════════════════════════════════════════════ */

import { useForge } from "../../context/useForge.js";
import { PHASE_LABELS } from "../../config/constants.js";
import MetricsGrid from "./MetricsGrid.jsx";
import ProgressBar from "./ProgressBar.jsx";
import FileStatusGrid from "./FileStatusGrid.jsx";
import StepsTimeline from "./StepsTimeline.jsx";
import DownloadSection from "./DownloadSection.jsx";

export default function TelemetryPanel() {
  const { state } = useForge();
  const { phase, mobileTab } = state;

  return (
    <div
      className={`tab-content stats-panel ${mobileTab === "stats" ? "active" : ""}`}
      style={{ borderLeft: "1px solid var(--bd)", flexDirection: "column", overflow: "hidden" }}
    >
      <div className="ph">
        <span className="pt">المراقبة</span>
        <span className={`pbg ${phase === "done" ? "pbg-g" : phase === "generating" ? "pbg-c" : "pbg-a"}`}>
          {PHASE_LABELS[phase] || "—"}
        </span>
      </div>

      <MetricsGrid />
      <ProgressBar />
      <FileStatusGrid />
      <StepsTimeline />
      <DownloadSection />
    </div>
  );
}
