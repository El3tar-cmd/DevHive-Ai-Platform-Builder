/* ══════════════════════════════════════════════════════
   Forge Context — Centralized state with useReducer
   ══════════════════════════════════════════════════════ */

import { createContext, useContext, useReducer, useRef, useCallback, useEffect, useMemo } from "react";
import { FILE_PLANS, APP_TYPES } from "../config/constants.js";
import { 
  getActiveProjectId, loadProject, saveProject, 
  createNewProject, migrateLegacyProject 
} from "../utils/projectStore.js";

/* ── Multi-Project Aware State Loader ── */
const loadInitialState = () => {
  // Try to migrate legacy single-project format first
  const migrated = migrateLegacyProject();
  if (migrated) return { id: migrated.id, state: migrated.state };

  // Load the active project
  const activeId = getActiveProjectId();
  if (activeId) {
    const saved = loadProject(activeId);
    if (saved) return { id: activeId, state: saved };
  }

  // No project found, start fresh
  const newId = createNewProject();
  return { id: newId, state: null };
};

const { id: initialProjectId, state: savedState } = loadInitialState();

/* ── Initial State ── */
const initialState = {
  // Project Identity
  projectId: initialProjectId,
  showProjectsDrawer: false,

  // Connection
  models: [],
  model: savedState?.model || "",
  connected: false,

  // Config
  provider: "ollama", // "ollama" | "gemini" | "openrouter"
  geminiApiKey: "",
  openRouterApiKey: "",
  appType: savedState?.appType || "nextjs",
  projName: savedState?.projName || "my-app",
  prompt: savedState?.prompt || "",
  features: savedState?.features || ["Authentication", "RTL Arabic"],

  // Generation
  loading: false,
  dynamicPlan: savedState?.dynamicPlan || null,
  files: savedState?.files || {},
  fileStatuses: savedState?.fileStatuses || {},
  fileReviews: savedState?.fileReviews || {},
  selectedFile: savedState?.selectedFile || null,
  currentFile: savedState?.currentFile || null,
  streamTokens: [],
  currentStream: "",
  progress: savedState?.progress || 0,
  phase: savedState?.phase === "generating" || savedState?.phase === "planning" ? "stopped" : (savedState?.phase || "idle"),

  // Telemetry
  steps: savedState?.steps || [],
  metrics: savedState?.metrics || { tokens: 0, tps: 0, elapsed: 0, chars: 0, files: 0 },

  // UI
  mobileTab: savedState?.mobileTab || "config",
  codeView: savedState?.codeView || "code",
  toast: "",
};

/* ── Action Types ── */
const Actions = {
  SET_MODELS:       "SET_MODELS",
  SET_MODEL:        "SET_MODEL",
  SET_CONNECTED:    "SET_CONNECTED",
  SET_APP_TYPE:     "SET_APP_TYPE",
  SET_PROJ_NAME:    "SET_PROJ_NAME",
  SET_PROMPT:       "SET_PROMPT",
  TOGGLE_FEATURE:   "TOGGLE_FEATURE",
  START_PLANNING:   "START_PLANNING",
  PLANNING_DONE:    "PLANNING_DONE",
  PLANNING_ERROR:   "PLANNING_ERROR",
  START_GENERATION: "START_GENERATION",
  FILE_GENERATING:  "FILE_GENERATING",
  FILE_DONE:        "FILE_DONE",
  FILE_ERROR:       "FILE_ERROR",
  SET_FILE_REVIEW:  "SET_FILE_REVIEW",
  APPEND_TOKEN:     "APPEND_TOKEN",
  UPDATE_STREAM:    "UPDATE_STREAM",
  UPDATE_METRICS:   "UPDATE_METRICS",
  ADD_STEP:         "ADD_STEP",
  GENERATION_DONE:  "GENERATION_DONE",
  STOP:             "STOP",
  SELECT_FILE:      "SELECT_FILE",
  SET_CODE_VIEW:    "SET_CODE_VIEW",
  SET_MOBILE_TAB:   "SET_MOBILE_TAB",
  SET_TOAST:        "SET_TOAST",
  RESET_STREAM:     "RESET_STREAM",
  SET_PROGRESS:     "SET_PROGRESS",

  // Verification & Healing
  START_VERIFICATION: "START_VERIFICATION",
  COMPILATION_ERROR:  "COMPILATION_ERROR",
  HEALING_STARTED:    "HEALING_STARTED",
  HEALING_DONE:       "HEALING_DONE",

  // Multi-Project
  LOAD_PROJECT:           "LOAD_PROJECT",
  NEW_PROJECT:            "NEW_PROJECT",
  SET_PROJECTS_LIST:      "SET_PROJECTS_LIST",
  TOGGLE_PROJECTS_DRAWER: "TOGGLE_PROJECTS_DRAWER",
  SET_PROVIDER:           "SET_PROVIDER",
  SET_GEMINI_KEY:         "SET_GEMINI_KEY",
  SET_OPENROUTER_KEY:     "SET_OPENROUTER_KEY"
};

/* ── Reducer ── */
function forgeReducer(state, action) {
  switch (action.type) {
    case Actions.SET_MODELS:
      return { ...state, models: action.payload };

    case Actions.SET_MODEL:
      return { ...state, model: action.payload };

    case Actions.SET_CONNECTED:
      return { ...state, connected: action.payload };

    case Actions.SET_APP_TYPE:
      return { ...state, appType: action.payload };

    case Actions.SET_PROJ_NAME:
      return { ...state, projName: action.payload };

    case Actions.SET_PROMPT:
      return { ...state, prompt: action.payload };

    case Actions.TOGGLE_FEATURE: {
      const feat = action.payload;
      const has = state.features.includes(feat);
      return {
        ...state,
        features: has
          ? state.features.filter(f => f !== feat)
          : [...state.features, feat],
      };
    }

    case Actions.START_PLANNING:
      return {
        ...state,
        loading: true,
        dynamicPlan: null,
        files: {},
        fileStatuses: {},
        fileReviews: {},
        selectedFile: null,
        currentFile: null,
        streamTokens: [],
        currentStream: "",
        steps: [],
        progress: 0,
        phase: "planning",
        metrics: { tokens: 0, tps: 0, elapsed: 0, chars: 0, files: 0 },
        mobileTab: "files",
        codeView: "stream",
      };

    case Actions.PLANNING_DONE:
      return {
        ...state,
        dynamicPlan: action.payload,
      };

    case Actions.PLANNING_ERROR:
      return {
        ...state,
        loading: false,
        phase: "error",
      };

    case Actions.START_GENERATION: {
      const plan = action.payload || FILE_PLANS[state.appType] || [];
      const initStatuses = {};
      plan.forEach(f => { initStatuses[f.path] = "pending"; });
      return {
        ...state,
        loading: true,
        fileStatuses: initStatuses,
        phase: "generating",
      };
    }

    case Actions.FILE_GENERATING:
      return {
        ...state,
        currentFile: action.payload,
        fileStatuses: { ...state.fileStatuses, [action.payload.path]: "gen" },
        currentStream: "",
        streamTokens: [],
        codeView: "stream",
      };

    case Actions.FILE_DONE:
      return {
        ...state,
        files: { ...state.files, [action.payload.path]: action.payload.content },
        fileStatuses: { ...state.fileStatuses, [action.payload.path]: "done" },
        metrics: { ...state.metrics, files: state.metrics.files + 1 },
      };

    case Actions.FILE_ERROR:
      return {
        ...state,
        fileStatuses: { ...state.fileStatuses, [action.payload]: "err" },
      };

    case Actions.SET_FILE_REVIEW:
      return {
        ...state,
        fileReviews: { ...state.fileReviews, [action.payload.path]: action.payload.review },
      };

    case Actions.APPEND_TOKEN: {
      const tok = action.payload;
      return {
        ...state,
        currentStream: state.currentStream + tok.text,
        streamTokens: [...state.streamTokens.slice(-600), tok],
        metrics: {
          ...state.metrics,
          tokens: tok.totalTokens,
          chars: state.metrics.chars + tok.text.length,
        },
      };
    }

    case Actions.SET_PROVIDER:
      return { ...state, provider: action.payload };

    case Actions.SET_GEMINI_KEY:
      return { ...state, geminiApiKey: action.payload };

    case Actions.SET_OPENROUTER_KEY:
      return { ...state, openRouterApiKey: action.payload };

    case Actions.UPDATE_STREAM:
      return { ...state, currentStream: action.payload };

    case Actions.UPDATE_METRICS:
      return { ...state, metrics: { ...state.metrics, ...action.payload } };

    case Actions.ADD_STEP:
      return { ...state, steps: [...state.steps, action.payload] };

    case Actions.GENERATION_DONE:
      return {
        ...state,
        progress: 100,
        phase: "done",
        currentFile: null,
        loading: false,
        mobileTab: "files",
      };

    case Actions.STOP:
      return { ...state, loading: false, phase: "stopped" };

    case Actions.SELECT_FILE:
      return {
        ...state,
        selectedFile: action.payload,
        codeView: action.payload ? "code" : state.codeView,
      };

    case Actions.SET_CODE_VIEW:
      return {
        ...state,
        codeView: action.payload,
        selectedFile: action.payload === "stream" ? null : state.selectedFile,
      };

    case Actions.SET_MOBILE_TAB:
      return { ...state, mobileTab: action.payload };

    case Actions.SET_TOAST:
      return { ...state, toast: action.payload };

    case Actions.SET_PROGRESS:
      return { ...state, progress: action.payload };

    case Actions.RESET_STREAM:
      return { ...state, currentStream: "", streamTokens: [] };

    case Actions.START_VERIFICATION:
      return { ...state, phase: "verifying", loading: true, progress: 95 };

    case Actions.COMPILATION_ERROR:
      return { 
        ...state, 
        phase: "compile_error", 
        loading: false, 
        currentStream: action.payload // Show error text in stream view
      };

    case Actions.HEALING_STARTED:
      return { 
        ...state, 
        phase: "healing", 
        loading: true, 
        currentFile: action.payload,
        currentStream: "",
        streamTokens: [],
        codeView: "stream"
      };

    case Actions.HEALING_DONE:
      return {
        ...state,
        phase: "verifying",
        files: { ...state.files, [action.payload.path]: action.payload.content },
        loading: true, // stays true — healing loop will call GENERATION_DONE when finished
      };

    case Actions.LOAD_PROJECT: {
      const p = action.payload; // { id, savedState }
      return {
        ...initialState,
        projectId: p.id,
        provider: p.savedState?.provider || state.provider,
        geminiApiKey: p.savedState?.geminiApiKey || state.geminiApiKey,
        openRouterApiKey: p.savedState?.openRouterApiKey || state.openRouterApiKey,
        models: state.models,
        model: p.savedState?.model || state.model,
        connected: state.connected,
        appType: p.savedState?.appType || "nextjs",
        projName: p.savedState?.projName || "my-app",
        prompt: p.savedState?.prompt || "",
        features: p.savedState?.features || ["Authentication", "RTL Arabic"],
        dynamicPlan: p.savedState?.dynamicPlan || null,
        files: p.savedState?.files || {},
        fileStatuses: p.savedState?.fileStatuses || {},
        fileReviews: p.savedState?.fileReviews || {},
        selectedFile: p.savedState?.selectedFile || null,
        progress: p.savedState?.progress || 0,
        phase: p.savedState?.phase === "generating" || p.savedState?.phase === "planning" ? "stopped" : (p.savedState?.phase || "idle"),
        steps: p.savedState?.steps || [],
        metrics: p.savedState?.metrics || { tokens: 0, tps: 0, elapsed: 0, chars: 0, files: 0 },
        showProjectsDrawer: false,
      };
    }

    case Actions.NEW_PROJECT: {
      return {
        // Project identity
        projectId: action.payload,
        showProjectsDrawer: false,

        // Preserve connection & provider state
        provider: state.provider,
        geminiApiKey: state.geminiApiKey,
        openRouterApiKey: state.openRouterApiKey,
        models: state.models,
        model: state.model,
        connected: state.connected,

        // Reset config to defaults
        appType: "nextjs",
        projName: "my-app",
        prompt: "",
        features: ["Authentication", "RTL Arabic"],

        // Reset generation
        loading: false,
        dynamicPlan: null,
        files: {},
        fileStatuses: {},
        fileReviews: {},
        selectedFile: null,
        currentFile: null,
        streamTokens: [],
        currentStream: "",
        progress: 0,
        phase: "idle",

        // Reset telemetry
        steps: [],
        metrics: { tokens: 0, tps: 0, elapsed: 0, chars: 0, files: 0 },

        // Reset UI
        mobileTab: "config",
        codeView: "code",
        toast: "",
      };
    }

    case Actions.TOGGLE_PROJECTS_DRAWER:
      return { ...state, showProjectsDrawer: !state.showProjectsDrawer };

    default:
      return state;
  }
}

/* ── Context ── */
const ForgeContext = createContext(null);

/* ── Provider ── */
export function ForgeProvider({ children }) {
  const [state, dispatch] = useReducer(forgeReducer, initialState);

  // Multi-project persistence
  useEffect(() => {
    if (!state.projectId) return;
    try {
      const stateToSave = {
        model: state.model,
        projName: state.projName,
        appType: state.appType,
        features: state.features,
        prompt: state.prompt,
        dynamicPlan: state.dynamicPlan,
        files: state.files,
        fileStatuses: state.fileStatuses,
        fileReviews: state.fileReviews,
        selectedFile: state.selectedFile,
        progress: state.progress,
        phase: state.phase,
        steps: state.steps,
        metrics: state.metrics,
        mobileTab: state.mobileTab,
        codeView: state.codeView
      };
      saveProject(state.projectId, stateToSave);
    } catch (e) {
      console.warn("Could not save project state", e);
    }
  }, [
    state.projectId, state.model, state.projName, state.appType, state.features,
    state.prompt, state.dynamicPlan, state.files, state.fileStatuses,
    state.fileReviews, state.selectedFile, state.progress, state.phase,
    state.steps, state.metrics, state.mobileTab, state.codeView
  ]);

  // Mutable refs for generation loop (not triggering re-renders)
  const abortRef = useRef(null);
  const timerRef = useRef(null);
  const startRef = useRef(0);
  const tokRef = useRef(0);

  // Helper: add a step to the timeline
  const addStep = useCallback((type, title, detail = "") => {
    const ts = startRef.current
      ? ((Date.now() - startRef.current) / 1000).toFixed(2)
      : "0.00";
    dispatch({ type: Actions.ADD_STEP, payload: { type, title, detail, ts } });
  }, []);

  // Computed values — memoized to avoid recalculation on unrelated state changes
  const plan = useMemo(() => FILE_PLANS[state.appType] || [], [state.appType]);
  const selectedAppType = useMemo(() => APP_TYPES.find(t => t.id === state.appType), [state.appType]);
  const doneCount = useMemo(
    () => Object.values(state.fileStatuses).filter(s => s === "done").length,
    [state.fileStatuses]
  );

  const value = {
    state,
    dispatch,
    Actions,
    plan,
    selectedAppType,
    doneCount,
    addStep,
    abortRef,
    timerRef,
    startRef,
    tokRef,
  };

  return (
    <ForgeContext.Provider value={value}>
      {children}
    </ForgeContext.Provider>
  );
}

/* ── Hook ── */
export function useForge() {
  const ctx = useContext(ForgeContext);
  if (!ctx) throw new Error("useForge must be used within <ForgeProvider>");
  return ctx;
}

export { Actions };
