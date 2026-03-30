/* ══════════════════════════════════════════════════════
   ErrorBoundary — Catches React rendering errors
   ══════════════════════════════════════════════════════ */

import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", height: "100vh",
          background: "#070b12", color: "#dce9f8", fontFamily: "'Outfit', sans-serif",
          gap: 16, padding: 32, textAlign: "center",
        }}>
          <div style={{ fontSize: 48 }}>⚠️</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#ef4444" }}>حدث خطأ غير متوقع</h2>
          <p style={{ fontSize: 13, color: "#3d5878", maxWidth: 400 }}>
            {this.state.error?.message || "Unknown error"}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 24px", background: "linear-gradient(135deg, #00d4ff, #8b5cf6)",
              border: "none", borderRadius: 8, color: "#000",
              fontWeight: 700, cursor: "pointer", fontSize: 14,
            }}
          >
            🔄 إعادة تحميل
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
