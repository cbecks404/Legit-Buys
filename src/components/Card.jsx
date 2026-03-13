import { useState } from "react";
import { CAT_META, DIET_TAGS, priceSymbol } from "../constants";
import ScoreSelector from "./ScoreSelector";

function MapButton({ mapQuery }) {
  if (!mapQuery) return null;
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "5px 11px", borderRadius: 99, fontSize: 11,
      fontFamily: "'DM Mono',monospace", textDecoration: "none", fontWeight: 600,
      background: "#1a1f1a", border: "1px solid #2a3a2a", color: "#6fcf6f",
    }}>
      📍 {mapQuery}
    </a>
  );
}

function LinkButton({ link, where }) {
  if (!link) return null;
  let label = where || "Visit";
  try { label = new URL(link).hostname.replace("www.", ""); } catch {}
  return (
    <a href={link} target="_blank" rel="noopener noreferrer" style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "5px 11px", borderRadius: 99, fontSize: 11,
      fontFamily: "'DM Mono',monospace", textDecoration: "none", fontWeight: 600,
      background: "#1f1a14", border: "1px solid #3a2e1a", color: "#C8FF47",
    }}>
      ↗ {label}
    </a>
  );
}

export default function Card({ r, onUp, saved, onSave, theme: T = {} }) {
  const [upped, setUpped] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const accent = CAT_META[r.category]?.color ?? "#C8FF47";
  const rawDiet = r.diet_tags ?? r.dietTags ?? [];
  const dietTags = Array.isArray(rawDiet)
    ? rawDiet
    : typeof rawDiet === "string" && rawDiet.length > 2
      ? rawDiet.replace(/[{}]/g, "").split(",").map(s => s.trim())
      : [];
  const priceRange = r.price_range ?? r.priceRange ?? "";
  const mapQuery = r.map_query ?? r.mapQuery ?? "";
  const hasLinks = r.link || mapQuery;
  const sym = priceSymbol(priceRange);
  const isHolo = r.rating === 3 && priceRange === "pricey";

  return (
    <div
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
      style={{
        background: isHolo
          ? "linear-gradient(135deg,#1a1a2e 0%,#16213e 25%,#0f3460 50%,#1a1a2e 75%,#16213e 100%)"
          : (T.cardBg ?? "#111"),
        backgroundSize: isHolo ? "300% 300%" : "auto",
        animation: isHolo ? "holo 6s ease infinite" : "none",
        border: isHolo ? "1px solid transparent" : `1px solid ${accent}55`,
        borderRadius: 14, padding: "18px 18px 14px",
        display: "flex", flexDirection: "column", gap: 10,
        position: "relative", overflow: "hidden",
        boxShadow: isHolo ? "0 0 30px #C8FF4722, 0 0 60px #60C3F522" : "none",
        transition: "transform .15s",
      }}
    >
      {isHolo && (
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
          background: "linear-gradient(135deg,rgba(200,255,71,0.06),rgba(96,195,245,0.06),rgba(244,169,66,0.06),rgba(192,132,252,0.06))",
          animation: "shimmer 8s ease infinite",
        }} />
      )}
      {isHolo && (
        <div style={{
          position: "absolute", inset: 0, borderRadius: 14, pointerEvents: "none", zIndex: 0,
          border: "1px solid transparent",
          background: "linear-gradient(#111,#111) padding-box, linear-gradient(135deg,#C8FF47,#60C3F5,#F4A942,#C084FC) border-box",
        }} />
      )}

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 10 }}>

        {/* Title row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 4 }}>
              {(r.categories ?? [r.category]).map(c => (
                <span key={c} style={{
                  fontSize: 9, fontFamily: "'DM Mono',monospace",
                  color: CAT_META[c]?.color ?? accent,
                  letterSpacing: ".18em", textTransform: "uppercase", fontWeight: 600,
                }}>
                  {CAT_META[c]?.emoji} {c}
                </span>
              ))}
            </div>
            <div
              onClick={() => setExpanded(e => !e)}
              style={{ fontFamily: "'LBCardHeader', serif", fontSize: 18, color: T.text ?? "#f0ede8", lineHeight: 1.25, cursor: "pointer" }}>
              {r.product}
              <span style={{ fontSize: 9, color: "#ccc", fontFamily: "'LBBody',sans-serif", marginLeft: 8, letterSpacing: ".08em" }}>
                {expanded ? "▲ less" : "▼ more"}
              </span>
            </div>
          </div>
          <ScoreSelector value={r.rating} />
        </div>

        {/* Review text */}
        <p style={{ margin: 0, fontSize: 13.5, color: T.textMid ?? "#e0ddd8", lineHeight: 1.65, fontFamily: "'LBReview', serif" }}>{r.review}</p>

        {/* Diet tags */}
        {dietTags.length > 0 && (
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {dietTags.map(tag => {
              const meta = DIET_TAGS.find(d => d.id === tag);
              return meta ? (
                <span key={tag} style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: "#ccc", background: "#161616", border: "1px solid #666", padding: "2px 8px", borderRadius: 99 }}>
                  {meta.label}
                </span>
              ) : null;
            })}
          </div>
        )}

        {/* Links (collapsed) */}
        {hasLinks && !expanded && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", paddingTop: 2 }}>
            <LinkButton link={r.link} where={r.where} />
            <MapButton mapQuery={mapQuery} />
          </div>
        )}

        {/* Expanded detail */}
        {expanded && (
          <div style={{ animation: "fadeSlideUp .2s ease", borderTop: "1px solid #1e1e1e", paddingTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
            {r.image_url && (
              <div>
                <div style={{ fontSize: 9, fontFamily: "'LBBody',sans-serif", color: "#555", letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 8 }}>Photo</div>
                <img src={r.image_url} alt={r.product}
                  style={{ width: "100%", borderRadius: 10, objectFit: "cover", maxHeight: 220, display: "block" }}
                  onError={e => e.currentTarget.style.display = "none"} />
              </div>
            )}
            {r.map_query && (
              <div>
                <div style={{ fontSize: 9, fontFamily: "'LBBody',sans-serif", color: "#bbb", letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 8 }}>Location</div>
                <iframe title="map" width="100%" height="160"
                  style={{ border: "none", borderRadius: 10 }}
                  loading="lazy" allowFullScreen
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(r.map_query ?? r.where)}&output=embed`} />
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.map_query ?? r.where)}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 10, fontFamily: "'LBBody',sans-serif", color: "#bbb", textDecoration: "none", display: "block", marginTop: 4 }}>
                  Open in Google Maps &#8599;
                </a>
              </div>
            )}
            {r.link && (
              <div>
                <div style={{ fontSize: 9, fontFamily: "'LBBody',sans-serif", color: "#bbb", letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 8 }}>Link</div>
                <a href={r.link} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 10, background: "#161616", border: "1px solid #2a2a2a", borderRadius: 10, padding: "10px 14px", textDecoration: "none" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "#222", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🔗</div>
                  <div>
                    <div style={{ fontSize: 12, color: "#f0ede8", fontFamily: "'LBBody',sans-serif", marginBottom: 2 }}>
                      {(() => { try { return new URL(r.link).hostname.replace("www.", ""); } catch { return r.link; } })()}
                    </div>
                    <div style={{ fontSize: 10, color: "#bbb", fontFamily: "'LBBody',sans-serif" }}>{r.link.slice(0, 40)}{r.link.length > 40 ? "…" : ""}</div>
                  </div>
                </a>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2, paddingTop: hasLinks ? 8 : 0, borderTop: hasLinks ? "1px solid #181818" : "none" }}>
          <div>
            <div style={{ fontSize: 11, color: "#e0ddd8", fontFamily: "'LBBody', sans-serif" }}>
              {r.verified && <span style={{ color: "#C8FF47", marginRight: 5 }}>✓</span>}
              {r.submitter} · {r.where}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
              <span style={{ fontSize: 12, color: accent, fontFamily: "'DM Mono',monospace", fontWeight: 600 }}>£{r.price}</span>
              {sym && <span style={{ fontSize: 11, color: "#bbb", fontFamily: "'DM Mono',monospace", background: "#1a1a1a", border: "1px solid #666", padding: "1px 7px", borderRadius: 99 }}>{sym}</span>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={() => onSave(r.id)}
              onMouseDown={e => e.currentTarget.style.transform = "scale(0.88)"}
              onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
              style={{
                background: saved ? "#ffffff14" : "transparent",
                border: `1px solid ${saved ? "#f0ede8" : "#242424"}`,
                color: saved ? "#f0ede8" : "#444",
                borderRadius: 99, padding: "5px 11px", fontSize: 12,
                fontFamily: "'LBBody', sans-serif", cursor: "pointer", transition: "all .15s",
                animation: saved ? "popIn .25s cubic-bezier(.16,1,.3,1)" : "none",
              }}>
              {saved ? "★" : "☆"}
            </button>
            <button onClick={() => { if (!upped) { setUpped(true); onUp(r.id); } }}
              onMouseDown={e => { if (!upped) e.currentTarget.style.transform = "scale(0.88)"; }}
              onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
              style={{
                background: upped ? `${accent}18` : "transparent",
                border: `1px solid ${upped ? accent : "#242424"}`,
                color: upped ? accent : "#444",
                borderRadius: 99, padding: "5px 13px", fontSize: 12,
                fontFamily: "'LBBody', sans-serif", cursor: upped ? "default" : "pointer", transition: "all .15s",
                animation: upped ? "popIn .25s cubic-bezier(.16,1,.3,1)" : "none",
              }}>
              ↑ {r.upvotes + (upped ? 1 : 0)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
