/* ══════════════════════════════════════════════════════
   CodePanel — Code/stream/review viewer container
   ══════════════════════════════════════════════════════ */

import { useForge } from "../../context/ForgeContext.jsx";
import { useToast } from "../../hooks/useToast.js";
import { downloadBlob, copyToClipboard } from "../../utils/download.js";
import StreamView from "./StreamView.jsx";
import CodeView from "./CodeView.jsx";
import ReviewPanel from "./ReviewPanel.jsx";
import FileBar from "./FileBar.jsx";

export default function CodePanel() {
  const { state, dispatch, Actions } = useForge();
  const { files, selectedFile, currentFile, currentStream, codeView, loading } = state;
  const { showToast } = useToast();

  const viewedContent = selectedFile ? files[selectedFile] : currentStream;
  const viewedPath = selectedFile || currentFile?.path;

  function handleCopy() {
    if (!viewedContent) return;
    copyToClipboard(viewedContent);
    showToast("📋 تم النسخ!");
  }

  function handleDownload() {
    if (!selectedFile || !viewedContent) return;
    downloadBlob(selectedFile.split("/").pop(), viewedContent);
    showToast("⬇ تم التحميل");
  }

  return (
    <div className="code-panel">
      {/* Header */}
      <div className="ph">
        <span className="pt">{codeView === "review" ? "فحص الجودة" : selectedFile ? "محتوى الملف" : "Stream مباشر"}</span>
        {viewedPath && (
          <span
            className="pbg pbg-c"
            style={{ fontFamily: "var(--fm)", fontSize: 9, direction: "ltr", textAlign: "left", marginRight: 4 }}
          >
            {viewedPath?.split("/").pop()}
          </span>
        )}
        <div className="ph-right">
          <button
            className={`tbtn ${codeView === "stream" ? "on" : ""}`}
            onClick={() => dispatch({ type: Actions.SET_CODE_VIEW, payload: "stream" })}
          >
            Live
          </button>
          <button
            className={`tbtn ${codeView === "code" ? "on" : ""}`}
            onClick={() => dispatch({ type: Actions.SET_CODE_VIEW, payload: "code" })}
          >
            Code
          </button>
          <button
            className={`tbtn ${codeView === "review" ? "on" : ""}`}
            onClick={() => dispatch({ type: Actions.SET_CODE_VIEW, payload: "review" })}
            title="فحص جودة الكود"
          >
            🛡️ Review
          </button>

          {viewedContent && codeView !== "review" && (
            <>
              <button className="tbtn" onClick={handleCopy}>📋</button>
              {selectedFile && <button className="tbtn" onClick={handleDownload}>⬇</button>}
            </>
          )}
        </div>
      </div>

      {/* File info bar */}
      <FileBar
        path={viewedPath}
        desc={currentFile && !selectedFile ? currentFile.desc : null}
        charCount={viewedContent ? viewedContent.length : null}
      />

      {/* Empty state */}
      {!viewedContent && !loading && (
        <div className="empty">
          <div className="empty-icon">📂</div>
          <div className="empty-t">لا يوجد محتوى بعد</div>
          <div className="empty-d">ابدأ التوليد أو اختر ملفاً من الشجرة</div>
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", position: "relative" }}>
        {codeView === "stream" && <StreamView />}
        {codeView === "code" && viewedContent && <CodeView content={viewedContent} />}
        {codeView === "review" && viewedPath && <ReviewPanel path={viewedPath} />}
      </div>
    </div>
  );
}
