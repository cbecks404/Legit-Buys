import { CAT_META, DIET_TAGS, SCORE_META, SCORE_COLORS } from "../constants";
import { Pill, DietPill } from "./Pills";

export default function FilterPanel({
  onClose,
  cat, setCat,
  activeScore, setActiveScore,
  activeDiet, toggleDietFilter,
  showSaved, setShowSaved,
  onClearAll,
}) {
  const hasFilters = cat !== "all" || activeScore !== null || activeDiet.length > 0 || showSaved;

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, background: "#000000cc", backdropFilter: "blur(10px)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 200 }}>
      <div style={{
        background: "var(--sheet-bg)",
        borderTop: "1px solid var(--sheet-border)",
        borderRadius: "18px 18px 0 0", width: "100%", maxWidth: 520,
        maxHeight: "85vh", overflowY: "auto",
        padding: "26px 22px 50px",
        animation: "sheetUp .25s cubic-bezier(.16,1,.3,1)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <span style={{ fontFamily: "'LBTitle',sans-serif", fontSize: 22, color: "var(--text)", letterSpacing: ".04em" }}>FILTERS</span>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {hasFilters && (
              <button onClick={onClearAll} style={{
                background: "none", border: "1px solid var(--border2)",
                borderRadius: 99, padding: "5px 12px",
                color: "var(--text-mid)", fontFamily: "'LBBody',sans-serif",
                fontSize: 11, cursor: "pointer",
              }}>Clear all</button>
            )}
            <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-dim)", fontSize: 22, cursor: "pointer" }}>✕</button>
          </div>
        </div>

        {/* Score */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: "#f0ede8", letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 12 }}>Score</div>
          <div style={{ display: "flex", gap: 8 }}>
            {SCORE_META.map(m => {
              const color = SCORE_COLORS[m.value];
              const isActive = activeScore === m.value;
              return (
                <button key={m.value} onClick={() => setActiveScore(isActive ? null : m.value)} style={{
                  flex: 1, padding: "10px 4px", borderRadius: 10, border: "none", lineHeight: 1.5,
                  outline: `1.5px solid ${isActive ? color : `${color}44`}`,
                  background: isActive ? `${color}18` : `${color}08`,
                  color: isActive ? color : `${color}99`,
                  fontFamily: "'DM Mono',monospace", fontSize: 10, cursor: "pointer",
                  transition: "all .15s", fontWeight: isActive ? 700 : 400,
                }}>
                  {m.value}<br />{m.short.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: "#f0ede8", letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 12 }}>Category</div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {Object.keys(CAT_META).map(c => <Pill key={c} cat={c} active={cat === c} onClick={() => setCat(c)} />)}
          </div>
        </div>

        {/* Dietary */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: "#f0ede8", letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 12 }}>Dietary</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {DIET_TAGS.map(tag => <DietPill key={tag.id} tag={tag} active={activeDiet.includes(tag.id)} onClick={() => toggleDietFilter(tag.id)} />)}
          </div>
        </div>

        {/* Saved */}
        <div>
          <div style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: "#f0ede8", letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 12 }}>Saved</div>
          <button onClick={() => setShowSaved(s => !s)} style={{
            background: showSaved ? "#ffffff14" : "transparent",
            border: `1px solid ${showSaved ? "#f0ede8" : "var(--border2)"}`,
            color: showSaved ? "#f0ede8" : "var(--text-mid)",
            borderRadius: 99, padding: "7px 16px", fontSize: 11,
            fontFamily: "'DM Mono',monospace", cursor: "pointer", transition: "all .2s",
          }}>
            {showSaved ? "★ My saves" : "☆ My saves"}
          </button>
        </div>

        {/* Apply button */}
        <button onClick={onClose} style={{
          marginTop: 32, background: "#C8FF47", color: "#0a0a0a",
          border: "none", borderRadius: 99, padding: "14px 0", width: "100%",
          fontFamily: "'LBTitle',sans-serif", fontSize: 16, letterSpacing: ".04em", cursor: "pointer",
        }}>
          SHOW RESULTS {hasFilters ? "✦" : ""}
        </button>
      </div>
    </div>
  );
}