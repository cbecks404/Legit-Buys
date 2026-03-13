export default function Sheet({ title, onClose, children, theme: T = {} }) {
  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed", inset: 0, background: "#000000cc",
        backdropFilter: "blur(10px)", display: "flex",
        alignItems: "flex-end", justifyContent: "center", zIndex: 200,
      }}>
      <div style={{
        background: T.sheetBg ?? "#0d0d0d",
        borderTop: `1px solid ${T.sheetBorder ?? "#202020"}`,
        borderRadius: "18px 18px 0 0", width: "100%", maxWidth: 520,
        maxHeight: "92vh", overflowY: "auto", padding: "26px 22px 50px",
        animation: "sheetUp .25s cubic-bezier(.16,1,.3,1)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <span style={{ fontFamily: "'Libre Baskerville',Georgia,serif", fontSize: 19, color: "#f0ede8", fontWeight: 700 }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#e0ddd8", fontSize: 22, cursor: "pointer", lineHeight: 1, padding: "2px 6px" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
