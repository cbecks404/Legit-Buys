import { CAT_META } from "../constants";

export function Pill({ cat, active, onClick }) {
  const m = CAT_META[cat];
  return (
    <button
      onClick={onClick}
      onMouseDown={e => e.currentTarget.style.transform = "scale(0.92)"}
      onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
      style={{
        background: active ? m.color : "transparent",
        color: active ? "#0a0a0a" : "#ccc",
        border: `1.5px solid ${active ? m.color : "#232323"}`,
        borderRadius: 99, padding: "5px 14px", fontSize: 12,
        fontFamily: "'LBBody', sans-serif", cursor: "pointer",
        fontWeight: active ? 700 : 400, whiteSpace: "nowrap", transition: "all .15s",
      }}>
      {m.emoji} {cat === "all" ? "All" : cat[0].toUpperCase() + cat.slice(1)}
    </button>
  );
}

export function DietPill({ tag, active, onClick }) {
  return (
    <button
      onClick={onClick}
      onMouseDown={e => e.currentTarget.style.transform = "scale(0.92)"}
      onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
      style={{
        background: active ? "#ffffff14" : "transparent",
        color: active ? "#f0ede8" : "#e0ddd8",
        border: `1.5px solid ${active ? "#BBB" : "#1e1e1e"}`,
        borderRadius: 99, padding: "4px 12px", fontSize: 11,
        fontFamily: "'DM Mono',monospace", cursor: "pointer",
        whiteSpace: "nowrap", transition: "all .15s", fontWeight: active ? 600 : 400,
      }}>
      {tag.label}
    </button>
  );
}
