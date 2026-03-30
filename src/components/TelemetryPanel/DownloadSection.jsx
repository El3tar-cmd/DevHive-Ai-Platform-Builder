/* ── DownloadSection — Download buttons for generated project ── */

import { useState } from "react";
import { useForge } from "../../context/ForgeContext.jsx";
import { useToast } from "../../hooks/useToast.js";
import { generateShellScript, downloadBlob, generateZipBlob, downloadBlobDirect } from "../../utils/download.js";

export default function DownloadSection() {
  const { state, doneCount } = useForge();
  const { files, projName } = state;
  const { showToast } = useToast();
  const [zipping, setZipping] = useState(false);

  if (doneCount === 0) return null;

  function handleShellDownload() {
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
    <div className="dl-section">
      <div style={{
        fontSize: 9, fontFamily: "var(--fm)", color: "var(--mu)",
        letterSpacing: "1px", textTransform: "uppercase", marginBottom: 2,
      }}>
        تحميل المشروع
      </div>

      <button className="dl-btn dl-zip" onClick={handleZipDownload} disabled={zipping}>
        {zipping ? "⏳ جاري الضغط..." : "📦 تحميل ZIP"}
      </button>

      <button className="dl-btn dl-sh" onClick={handleShellDownload}>
        📜 تحميل setup.sh
      </button>

      <div style={{ fontSize: 9, color: "var(--mu)", textAlign: "center", fontFamily: "var(--fm)" }}>
        ZIP لكل الأنظمة · Shell Script لـ Linux/Mac
      </div>
    </div>
  );
}
