/* ══════════════════════════════════════════════════════
   FilePanel — File tree + download section
   ══════════════════════════════════════════════════════ */

import { useState } from "react";
import { useForge } from "../../context/ForgeContext.jsx";
import { useToast } from "../../hooks/useToast.js";
import { generateShellScript, downloadBlob, generateZipBlob, downloadBlobDirect } from "../../utils/download.js";
import FileItem from "./FileItem.jsx";

export default function FilePanel() {
  const { state, dispatch, Actions, plan, doneCount } = useForge();
  const { files, fileStatuses, selectedFile, projName } = state;
  const currentPlan = state.dynamicPlan || plan;
  const { showToast } = useToast();
  const [zipping, setZipping] = useState(false);

  function handleSelectFile(path) {
    dispatch({ type: Actions.SELECT_FILE, payload: path });
    dispatch({ type: Actions.SET_MOBILE_TAB, payload: "code" });
  }

  function handleDownloadShell() {
    const sh = generateShellScript(projName, files);
    if (!sh) return;
    downloadBlob(`${projName}-setup.sh`, sh, "text/x-sh");
    showToast("⬇ setup.sh جاهز للتحميل!");
  }

  async function handleZipDownload() {
    setZipping(true);
    try {
      const blob = await generateZipBlob(projName, files);
      downloadBlobDirect(`${projName}.zip`, blob);
      showToast("📦 ZIP جاهز للتحميل!");
    } catch (err) {
      showToast("❌ فشل إنشاء ZIP");
      console.error(err);
    } finally {
      setZipping(false);
    }
  }

  return (
    <div className="file-panel">
      <div className="ph">
        <span className="pt">الملفات</span>
        <span className="pbg pbg-c" style={{ marginRight: "auto" }}>
          {doneCount}/{currentPlan.length}
        </span>
      </div>

      <div className="pc" style={{ gap: 2, padding: 6 }}>
        <div className="file-tree">
          {currentPlan.map(f => (
            <FileItem
              key={f.path}
              file={f}
              status={fileStatuses[f.path] || "pending"}
              isSelected={selectedFile === f.path}
              hasContent={!!files[f.path]}
              onSelect={handleSelectFile}
            />
          ))}
        </div>

        {/* Download buttons */}
        {doneCount > 0 && (
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
            <button className="dl-btn dl-zip" onClick={handleZipDownload} disabled={zipping}>
              {zipping ? "⏳ جاري الضغط..." : "📦 ZIP"}
            </button>
            <button className="dl-btn dl-sh" onClick={handleDownloadShell}>
              📜 setup.sh
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
