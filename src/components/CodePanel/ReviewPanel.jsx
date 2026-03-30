/* ── ReviewPanel — Shows automated code review results ── */

import { useForge } from "../../context/useForge.js";

export default function ReviewPanel({ path }) {
  const { state } = useForge();
  const review = state.fileReviews[path];

  if (!review) {
    return (
      <div className="empty">
        <div className="empty-icon">🛡️</div>
        <div className="empty-t">لا يوجد فحص متاح</div>
        <div className="empty-d">قم بتوليد الكود أولاً ليتم فحصه تلقائياً</div>
      </div>
    );
  }

  const fails = review.filter(r => r.status === "fail").length;
  const warns = review.filter(r => r.status === "warn").length;
  const passes = review.filter(r => r.status === "pass").length;

  return (
    <div className="review-area" style={{ padding: 20 }}>
      {/* Overview Head */}
      <div style={{
        display: "flex", gap: 12, padding: 16, background: "var(--s1)",
        borderRadius: 8, border: "1px solid var(--bd)", marginBottom: 20
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: "var(--mu)", marginBottom: 4 }}>نتيجة الفحص</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 24, fontWeight: 800, color: fails ? "var(--r)" : warns ? "var(--a)" : "var(--g)" }}>
              {fails ? "فشل" : warns ? "ملاحظات" : "ممتاز"}
            </span>
            <span style={{ color: "var(--mu)", fontSize: 12 }}>({review.length} مقاييس)</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end", justifyContent: "center", fontSize: 12 }}>
          {fails > 0 && <span style={{ color: "var(--r)" }}>{fails} ✕ أخطاء حرجة</span>}
          {warns > 0 && <span style={{ color: "var(--a)" }}>{warns} ⚠️ تحذير</span>}
          {passes > 0 && <span style={{ color: "var(--g)" }}>{passes} ✓ مجتاز</span>}
        </div>
      </div>

      {/* Review Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {review.map((item, i) => {
          const color = item.status === "fail" ? "var(--r)" : item.status === "warn" ? "var(--a)" : "var(--g)";
          const icon = item.status === "fail" ? "✕" : item.status === "warn" ? "⚠️" : "✓";

          return (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 12, padding: 12,
              background: "var(--s1)", borderRadius: 6, borderLeft: `3px solid ${color}`
            }}>
              <div style={{ color, fontSize: 14, fontWeight: 800, width: 20, textAlign: "center" }}>{icon}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--tx)", marginBottom: 2 }}>{item.msg}</div>
                <div style={{ fontSize: 11, color: "var(--mu)" }}>{item.detail}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
