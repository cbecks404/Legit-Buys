import { useState } from "react";
import { SCORE_META, SCORE_COLORS, SCORE_HINTS } from "../constants";

export default function ScoreSelector({ value = null, interactive = false, onChange }) {
  const [hov, setHov] = useState(null);
  const active = hov ?? value;

  if (!interactive) {
    if (value === null || value === undefined) return null;
    const meta = SCORE_META[value];
    if (!meta) return null;
    const color = SCORE_COLORS[value];
    return (
      <span style={{
        fontSize: 10, fontFamily: "'DM Mono',monospace", fontWeight: 700,
        color, background: `${color}18`, border: `1px solid ${color}44`,
        padding: "3px 9px", borderRadius: 99, whiteSpace: "nowrap", letterSpacing: ".06em",
      }}>
        {value === 3 ? "✦ " : ""}{meta.label}
      </span>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 8 }}>
        {SCORE_META.map(m => {
          const color = SCORE_COLORS[m.value];
          const isActive = active === m.value;
          return (
            <button key={m.value}
              onMouseEnter={() => setHov(m.value)}
              onMouseLeave={() => setHov(null)}
              onClick={() => onChange?.(m.value)}
              style={{
                flex: 1, padding: "10px 4px", borderRadius: 10, border: "none",
                background: isActive ? `${color}22` : "#161616",
                outline: `1.5px solid ${isActive ? color : "#1e1e1e"}`,
                color: isActive ? color : "#e0ddd8",
                fontFamily: "'DM Mono',monospace", fontSize: 10, cursor: "pointer",
                transition: "all .15s", lineHeight: 1.5, fontWeight: isActive ? 700 : 400,
              }}>
              {m.value}<br />{m.short}
            </button>
          );
        })}
      </div>
      {active !== null && (
        <div style={{ fontSize: 11, color: SCORE_COLORS[active], fontFamily: "'DM Mono',monospace", letterSpacing: ".06em" }}>
          {SCORE_HINTS[active]}
        </div>
      )}
    </div>
  );
}
