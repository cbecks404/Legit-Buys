export default function MenuPanel({ onClose, onNavigate, adminUser, user, darkMode, toggleTheme }) {
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
        background: "var(--sheet-bg)",
        borderLeft: "1px solid var(--sheet-border)",
        zIndex: 401, display: "flex", flexDirection: "column",
        padding: "60px 28px 50px",
        animation: "slideInFromRight .25s cubic-bezier(.16,1,.3,1)",
      }}>
        {/* Close */}
        <button onClick={onClose} style={{
          position: "absolute", top: 20, right: 20,
          background: "none", border: "none", color: "var(--text-dim)",
          fontSize: 22, cursor: "pointer", padding: 4,
        }}>✕</button>

        {/* Logo */}
        <div style={{ marginBottom: 40 }}>
          <span style={{ color: "#C8FF47", fontSize: 24 }}>✦</span>
          <span style={{ fontFamily: "'LBTitle',sans-serif", fontSize: 30, color: "var(--text)", letterSpacing: ".04em", textTransform: "uppercase", marginLeft: 8 }}>LEGIT BUYS</span>
        </div>

        {/* Nav items */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          {[
            { label: "Home",         icon: "◈", action: "home"    },
            { label: "My Reviews",    icon: "✎", action: "profile" },
            { label: "Scoring Guide", icon: "★", action: "guide"   },
            ...(adminUser ? [{ label: "Admin", icon: "⚙", action: "admin" }] : []),
            ...(!user ? [{ label: "Log in", icon: "→", action: "login" }] : []),
          ].map(item => (
            <button key={item.action} onClick={() => { onNavigate(item.action); onClose(); }}
              style={{
                background: "none", border: "none", color: "var(--text)",
                fontFamily: "'LBBody',sans-serif", fontSize: 18, cursor: "pointer",
                textAlign: "left", padding: "12px 0",
                borderBottom: "1px solid var(--border)",
                display: "flex", alignItems: "center", gap: 14,
                transition: "color .15s",
              }}
              onMouseEnter={e => e.currentTarget.style.color = "#C8FF47"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--text)"}
            >
              <span style={{ fontSize: 14, color: "#C8FF47", width: 18, textAlign: "center" }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Bottom controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 24 }}>
          {user && (
            <div style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "'DM Mono',monospace", letterSpacing: ".06em" }}>
              ✦ {user.email}
            </div>
          )}
          
          {adminUser && (
            <button onClick={() => { onNavigate("logout"); onClose(); }} style={{
              background: "transparent", color: "#E05A5A",
              border: "1px solid #E05A5A33", borderRadius: 99,
              padding: "8px 16px", fontFamily: "'LBBody',sans-serif",
              fontSize: 12, cursor: "pointer", width: "fit-content",
            }}>
              Log out
            </button>
          )}
        </div>
      </div>
    </>
  );
}