export default function MenuPanel({ onClose, onNavigate, adminUser, darkMode, toggleTheme, theme: T }) {
  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "#000000aa",
        backdropFilter: "blur(6px)", zIndex: 400,
      }} />

      {/* Panel */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: "72vw", maxWidth: 300,
        background: T.sheetBg ?? "#0d0d0d",
        borderLeft: `1px solid ${T.sheetBorder ?? "#202020"}`,
        zIndex: 401, display: "flex", flexDirection: "column",
        padding: "60px 28px 50px",
        animation: "slideInFromRight .25s cubic-bezier(.16,1,.3,1)",
      }}>
        {/* Close */}
        <button onClick={onClose} style={{
          position: "absolute", top: 20, right: 20,
          background: "none", border: "none", color: T.textDim ?? "#555",
          fontSize: 22, cursor: "pointer", padding: 4,
        }}>✕</button>

        {/* Logo */}
        <div style={{ marginBottom: 40 }}>
          <span style={{ color: "#C8FF47", fontSize: 24 }}>✦</span>
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: T.textDim ?? "#555", letterSpacing: ".22em", textTransform: "uppercase", marginLeft: 8 }}>Legit Buys</span>
        </div>

        {/* Nav items */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          {[
            { label: "Home",         icon: "◈", action: "home"    },
            { label: "My Reviews",   icon: "✎", action: "profile" },
            { label: "Scoring Guide",icon: "★", action: "guide"   },
            ...(adminUser ? [{ label: "Admin", icon: "⚙", action: "admin" }] : []),
          ].map(item => (
            <button key={item.action} onClick={() => { onNavigate(item.action); onClose(); }}
              style={{
                background: "none", border: "none", color: T.text ?? "#f0ede8",
                fontFamily: "'LBBody',sans-serif", fontSize: 18, cursor: "pointer",
                textAlign: "left", padding: "12px 0",
                borderBottom: `1px solid ${T.border ?? "#1a1a1a"}`,
                display: "flex", alignItems: "center", gap: 14,
                transition: "color .15s",
              }}
              onMouseEnter={e => e.currentTarget.style.color = "#C8FF47"}
              onMouseLeave={e => e.currentTarget.style.color = T.text ?? "#f0ede8"}
            >
              <span style={{ fontSize: 14, color: "#C8FF47", width: 18, textAlign: "center" }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Bottom controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 24 }}>
          <button onClick={toggleTheme} style={{
            background: "none", border: `1px solid ${T.border ?? "#1a1a1a"}`,
            borderRadius: 99, padding: "8px 16px", color: T.textMid ?? "#aaa",
            fontFamily: "'LBBody',sans-serif", fontSize: 12, cursor: "pointer",
          }}>
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </div>
    </>
  );
}