/* ══════════════════════════════════════════════════════
   Project Store — Multi-Project Persistence Engine
   ══════════════════════════════════════════════════════ */

/**
 * Storage keys for the multi-project system.
 * - INDEX: Array of project metadata [{id, name, appType, date, fileCount, prompt}]
 * - Each project's full state is stored under its own key: `forge_project_<id>`
 */
const STORAGE_KEYS = {
  INDEX: "forge_projects_index",
  PREFIX: "forge_project_",
  ACTIVE: "forge_active_project_id",
  LEGACY: "forge_saved_project", // Old single-project key (for migration)
};

/**
 * Generates a short unique ID for project identification.
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/**
 * Gets the projects index (metadata list).
 * @returns {Array<{id, name, appType, date, fileCount, prompt}>}
 */
export function getProjectsIndex() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INDEX);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Saves the projects index to localStorage.
 */
function saveProjectsIndex(index) {
  localStorage.setItem(STORAGE_KEYS.INDEX, JSON.stringify(index));
}

/**
 * Loads a full project state by ID.
 * @param {string} projectId
 * @returns {Object|null} The full saved state or null
 */
export function loadProject(projectId) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PREFIX + projectId);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Saves the full project state under its own key.
 * Also updates the index with current metadata.
 * 
 * @param {string} projectId - Unique project ID
 * @param {Object} projectState - Full state to persist
 */
export function saveProject(projectId, projectState) {
  try {
    // Save full state
    localStorage.setItem(
      STORAGE_KEYS.PREFIX + projectId,
      JSON.stringify(projectState)
    );

    // Update index metadata
    const index = getProjectsIndex();
    const existingIdx = index.findIndex(p => p.id === projectId);

    const metadata = {
      id: projectId,
      name: projectState.projName || "مشروع بدون اسم",
      appType: projectState.appType || "nextjs",
      prompt: (projectState.prompt || "").substring(0, 120),
      date: new Date().toISOString(),
      fileCount: Object.keys(projectState.files || {}).length,
      phase: projectState.phase || "idle",
    };

    if (existingIdx >= 0) {
      index[existingIdx] = metadata;
    } else {
      index.unshift(metadata); // newest first
    }

    saveProjectsIndex(index);
    setActiveProjectId(projectId);
  } catch (e) {
    console.warn("Could not save project:", e);
  }
}

/**
 * Deletes a project by ID.
 * @param {string} projectId
 */
export function deleteProject(projectId) {
  localStorage.removeItem(STORAGE_KEYS.PREFIX + projectId);
  const index = getProjectsIndex().filter(p => p.id !== projectId);
  saveProjectsIndex(index);

  // If deleting the active project, clear the active ID
  if (getActiveProjectId() === projectId) {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE);
  }
}

/**
 * Gets the currently active project ID.
 */
export function getActiveProjectId() {
  return localStorage.getItem(STORAGE_KEYS.ACTIVE) || null;
}

/**
 * Sets the currently active project ID.
 */
export function setActiveProjectId(id) {
  localStorage.setItem(STORAGE_KEYS.ACTIVE, id);
}

/**
 * Creates a fresh project entry and returns its new ID.
 * @returns {string} New project ID
 */
export function createNewProject() {
  const id = generateId();
  setActiveProjectId(id);
  return id;
}

/**
 * Migrates the old single-project localStorage format to the new multi-project system.
 * Should only run once on first load.
 */
export function migrateLegacyProject() {
  try {
    const legacy = localStorage.getItem(STORAGE_KEYS.LEGACY);
    if (!legacy) return null;

    const legacyState = JSON.parse(legacy);
    
    // Check if we already have projects in the new system
    const existingIndex = getProjectsIndex();
    if (existingIndex.length > 0) {
      // Already migrated, just clean up
      localStorage.removeItem(STORAGE_KEYS.LEGACY);
      return null;
    }

    // Migrate to new format
    const newId = generateId();
    saveProject(newId, legacyState);

    // Clean up old key
    localStorage.removeItem(STORAGE_KEYS.LEGACY);

    return { id: newId, state: legacyState };
  } catch {
    return null;
  }
}

/**
 * Returns a human-readable time-ago string in Arabic.
 */
export function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "الآن";
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays < 7) return `منذ ${diffDays} يوم`;
  return date.toLocaleDateString("ar-EG", { month: "short", day: "numeric" });
}
