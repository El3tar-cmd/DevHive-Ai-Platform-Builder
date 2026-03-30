/* ══════════════════════════════════════════════════════
   ProjectsDrawer — Slide-out panel with project history
   ══════════════════════════════════════════════════════ */

import { useForge } from "../context/ForgeContext.jsx";
import { getProjectsIndex, loadProject, deleteProject, createNewProject, timeAgo } from "../utils/projectStore.js";

const APP_TYPE_ICONS = {
  nextjs: "▲",
  "react-node": "⚛",
  "rest-api": "🔌",
  "saas-starter": "🚀",
  website: "🌐",
  pwa: "📱",
};

const PHASE_BADGES = {
  done: { label: "مكتمل", color: "#10b981" },
  generating: { label: "قيد التوليد", color: "#3b82f6" },
  stopped: { label: "متوقف", color: "#f59e0b" },
  error: { label: "خطأ", color: "#ef4444" },
  idle: { label: "جديد", color: "#6b7280" },
};

export default function ProjectsDrawer() {
  const { state, dispatch, Actions } = useForge();
  const projects = getProjectsIndex();

  if (!state.showProjectsDrawer) return null;

  const handleLoadProject = (id) => {
    const savedState = loadProject(id);
    dispatch({ type: Actions.LOAD_PROJECT, payload: { id, savedState } });
  };

  const handleNewProject = () => {
    const newId = createNewProject();
    dispatch({ type: Actions.NEW_PROJECT, payload: newId });
  };

  const handleDeleteProject = (e, id) => {
    e.stopPropagation();
    if (confirm("هل أنت متأكد من حذف هذا المشروع؟")) {
      deleteProject(id);
      if (id === state.projectId) {
        handleNewProject();
      } else {
        // Force re-render by toggling drawer
        dispatch({ type: Actions.TOGGLE_PROJECTS_DRAWER });
        dispatch({ type: Actions.TOGGLE_PROJECTS_DRAWER });
      }
    }
  };

  const handleClose = () => {
    dispatch({ type: Actions.TOGGLE_PROJECTS_DRAWER });
  };

  return (
    <>
      {/* Backdrop */}
      <div onClick={handleClose} style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)", zIndex: 999,
        animation: "fadein .2s ease",
      }} />

      {/* Drawer */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: "min(380px, 90vw)",
        background: "var(--s)", borderLeft: "1px solid var(--bd)",
        zIndex: 1000, display: "flex", flexDirection: "column",
        animation: "slideIn .25s ease",
        boxShadow: "-8px 0 30px rgba(0,0,0,0.3)",
      }}>
        {/* Header */}
        <div style={{
          padding: "16px 20px", borderBottom: "1px solid var(--bd)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, color: "var(--tx)", fontFamily: "var(--fm)" }}>
              🗂️ مشاريعي
            </h3>
            <small style={{ color: "var(--mu)", fontSize: 11 }}>
              {projects.length} مشروع محفوظ
            </small>
          </div>
          <button onClick={handleClose} style={{
            background: "none", border: "none", color: "var(--mu)",
            fontSize: 20, cursor: "pointer", padding: 4,
          }}>✕</button>
        </div>

        {/* New Project Button */}
        <div style={{ padding: "12px 20px" }}>
          <button onClick={handleNewProject} style={{
            width: "100%", padding: "10px 16px",
            background: "linear-gradient(135deg, var(--c), var(--p))",
            border: "none", borderRadius: 8, cursor: "pointer",
            color: "#fff", fontSize: 13, fontWeight: 600,
            fontFamily: "var(--fm)", display: "flex", alignItems: "center",
            justifyContent: "center", gap: 8,
            transition: "transform .15s, box-shadow .15s",
          }}
          onMouseEnter={e => { e.target.style.transform = "translateY(-1px)"; e.target.style.boxShadow = "0 4px 15px rgba(0,212,255,0.3)"; }}
          onMouseLeave={e => { e.target.style.transform = "none"; e.target.style.boxShadow = "none"; }}
          >
            ➕ مشروع جديد
          </button>
        </div>

        {/* Projects List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 12px 12px" }}>
          {projects.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "40px 20px",
              color: "var(--mu)", fontSize: 13,
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📁</div>
              لا توجد مشاريع محفوظة بعد.
              <br />ابدأ مشروعاً جديداً لتراه هنا!
            </div>
          ) : (
            projects.map((project) => {
              const isActive = project.id === state.projectId;
              const badge = PHASE_BADGES[project.phase] || PHASE_BADGES.idle;
              const icon = APP_TYPE_ICONS[project.appType] || "📦";

              return (
                <div
                  key={project.id}
                  onClick={() => !isActive && handleLoadProject(project.id)}
                  style={{
                    padding: "14px 16px", marginBottom: 8,
                    background: isActive ? "rgba(0,212,255,0.08)" : "var(--bg)",
                    border: `1px solid ${isActive ? "var(--c)" : "var(--bd)"}`,
                    borderRadius: 10, cursor: isActive ? "default" : "pointer",
                    transition: "all .2s",
                    position: "relative",
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = "var(--bd2)"; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = "var(--bd)"; }}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div style={{
                      position: "absolute", top: 10, left: 10,
                      width: 6, height: 6, borderRadius: "50%",
                      background: "var(--c)",
                      boxShadow: "0 0 8px var(--c)",
                    }} />
                  )}

                  {/* Project info */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 14, fontWeight: 600, color: "var(--tx)",
                        fontFamily: "var(--fm)", marginBottom: 4,
                        display: "flex", alignItems: "center", gap: 6,
                      }}>
                        <span>{icon}</span>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {project.name}
                        </span>
                      </div>

                      {/* Prompt preview */}
                      {project.prompt && (
                        <div style={{
                          fontSize: 11, color: "var(--mu)", lineHeight: 1.4,
                          overflow: "hidden", textOverflow: "ellipsis",
                          whiteSpace: "nowrap", marginBottom: 8,
                        }}>
                          {project.prompt}
                        </div>
                      )}

                      {/* Metadata row */}
                      <div style={{
                        display: "flex", gap: 10, fontSize: 10,
                        color: "var(--mu)", alignItems: "center",
                      }}>
                        <span>📁 {project.fileCount} ملف</span>
                        <span>⏱ {timeAgo(project.date)}</span>
                        <span style={{
                          padding: "1px 6px", borderRadius: 4,
                          background: badge.color + "22", color: badge.color,
                          fontSize: 9, fontWeight: 600,
                        }}>
                          {badge.label}
                        </span>
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={(e) => handleDeleteProject(e, project.id)}
                      title="حذف المشروع"
                      style={{
                        background: "none", border: "none",
                        color: "var(--mu)", cursor: "pointer",
                        fontSize: 14, padding: "4px 6px",
                        opacity: 0.5, transition: "opacity .2s",
                        flexShrink: 0,
                      }}
                      onMouseEnter={e => e.target.style.opacity = 1}
                      onMouseLeave={e => e.target.style.opacity = 0.5}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
