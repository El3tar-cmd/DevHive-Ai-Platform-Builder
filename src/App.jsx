/* ══════════════════════════════════════════════════════
   App v2 — Root application with Command Palette + Shortcuts
   ══════════════════════════════════════════════════════ */

import { useState, lazy, Suspense, useCallback } from "react";
import { useOllama } from "./hooks/useOllama.js";
import { useGeneration } from "./hooks/useGeneration.js";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts.js";
import { useForge } from "./context/useForge.js";
import { createNewProject } from "./utils/projectStore.js";
import { generateZipBlob, downloadBlobDirect } from "./utils/download.js";

import Header       from "./components/Header.jsx";
import ConfigPanel  from "./components/ConfigPanel/ConfigPanel.jsx";
import FilePanel    from "./components/FilePanel/FilePanel.jsx";
import CodePanel    from "./components/CodePanel/CodePanel.jsx";
import TelemetryPanel from "./components/TelemetryPanel/TelemetryPanel.jsx";
import MobileNav    from "./components/MobileNav.jsx";
import Toast        from "./components/Toast.jsx";
import CommandPalette from "./components/CommandPalette.jsx";

// Lazy-load heavy panels that aren't visible on every session
const ProjectsDrawer = lazy(() => import("./components/ProjectsDrawer.jsx"));

/**
 * Inner app component — must be rendered inside <ForgeProvider>.
 */
function AppShell() {
  const { state, dispatch, Actions } = useForge();
  const { loading, connected, mobileTab, progress, files } = state;
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Initialize connection & auto-retry
  useOllama();

  // Generation controls
  const { generate, stop, retryFailed } = useGeneration();

  // Download all files as ZIP
  const handleDownload = useCallback(async () => {
    const entries = Object.entries(files);
    if (!entries.length) return;
    try {
      const blob = await generateZipBlob(state.projName || "project", files);
      downloadBlobDirect(`${state.projName || "project"}.zip`, blob);
    } catch (err) {
      console.error("ZIP download failed:", err);
    }
  }, [files, state.projName]);

  // New project handler
  const handleNewProject = useCallback(() => {
    const newId = createNewProject();
    dispatch({ type: Actions.NEW_PROJECT, payload: newId });
  }, [dispatch, Actions]);

  // Open projects drawer
  const handleOpenProjects = useCallback(() => {
    dispatch({ type: Actions.TOGGLE_PROJECTS_DRAWER });
  }, [dispatch, Actions]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    generate,
    stop,
    download:     handleDownload,
    newProject:   handleNewProject,
    togglePalette: () => setPaletteOpen(v => !v),
    connected,
    loading,
    hasFiles: Object.keys(files).length > 0,
  });

  return (
    <div className="shell">
      {/* ═══ HEADER ═══ */}
      <Header onOpenPalette={() => setPaletteOpen(true)} />

      {/* ═══ MAIN ═══ */}
      <div className="main">
        {/* ── Config Panel ── */}
        <ConfigPanel onGenerate={generate} onStop={stop} onRetry={retryFailed} />

        {/* ── Center: Files + Code ── */}
        <div className={`center-panel ${mobileTab === "files" || mobileTab === "code" ? "active" : ""}`}>
          <div className="prog-wrap">
            <div className={`prog-bar ${loading ? "pulsing" : ""}`} style={{ width: `${progress}%` }} />
          </div>
          <div className="split">
            <FilePanel />
            <CodePanel />
          </div>
        </div>

        {/* ── Telemetry / Stats Panel ── */}
        <TelemetryPanel />
      </div>

      {/* ═══ MOBILE NAV ═══ */}
      <MobileNav />

      {/* ═══ GLOBAL OVERLAYS ═══ */}
      <Toast />

      {/* Command Palette */}
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        handlers={{
          generate,
          stop,
          download:     handleDownload,
          newProject:   handleNewProject,
          openProjects: handleOpenProjects,
        }}
      />

      {/* Projects Drawer — lazy loaded */}
      <Suspense fallback={null}>
        <ProjectsDrawer />
      </Suspense>
    </div>
  );
}

export default AppShell;
