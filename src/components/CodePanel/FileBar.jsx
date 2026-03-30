/* ── FileBar — Currently viewed file info bar ── */

export default function FileBar({ path, desc, charCount }) {
  if (!path) return null;

  return (
    <div className="file-bar">
      <span className="file-bar-path" style={{ direction: "ltr" }}>{path}</span>
      {desc && <span className="file-bar-desc">{desc}</span>}
      {charCount != null && (
        <span className="file-bar-desc" style={{ marginRight: "auto" }}>
          {charCount.toLocaleString()} chars
        </span>
      )}
    </div>
  );
}
