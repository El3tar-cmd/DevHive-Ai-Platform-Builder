/* ══════════════════════════════════════════════════════
   Entry Point — Ollama FullStack Forge
   ══════════════════════════════════════════════════════ */

import React from "react";
import ReactDOM from "react-dom/client";

// Styles (order matters: tokens → reset → layout → components)
import "./styles/variables.css";
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/components.css";

import { ForgeProvider } from "./context/ForgeContext.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import AppShell from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ForgeProvider>
        <AppShell />
      </ForgeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
