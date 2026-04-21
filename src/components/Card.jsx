import { useState } from "react";
import { CAT_META, DIET_TAGS, priceSymbol } from "../constants";
import RatingBand from "./Card/RatingBand";

export default function Card({ r, onUp, saved, onSave, upped: initialUpped = false, onSubmitterClick }) {
  const upped = initialUpped;
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
  const sym = priceSymbol(priceRange);

  // Metadata line segments
  const priceText = r.price != null && r.price !== ""
    ? `£${r.price}${sym ? ` (${sym})` : ""}`
    : sym;
  const catMeta = CAT_META[r.category];
  const categorySegment = catMeta ? `${catMeta.emoji} ${r.category}` : "";
  const metaSegments = [priceText, categorySegment, r.where].filter(Boolean);

  return (
    <div
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
      style={{
        borderRadius: 14,
        overflow: "hidden",
        background: "var(--card-bg)",
        border: "1px solid var(--border)",
        transition: "transform .15s",
      }}
    >
      {/* 1. RatingBand — flush at top edge */}
      <RatingBand score={r.rating} priceRange={priceRange} />

      {/* 2. Content area */}
      <div style={{ padding: "12px 16px 14px", display: "flex", flexDirection: "column", gap: 10 }}>

        {/* 2a. Product name row — clicking toggles expanded */}
        <div
          onClick={() => setExpanded(e => !e)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            cursor: "pointer",
          }}
        >
          <span style={{
            fontFamily: "'LBCardHeader', serif",
            fontSize: 15,
            fontWeight: 700,
            color: "var(--text)",
            lineHeight: 1.3,
            flex: 1,
          }}>
            {r.product}
          </span>
          <span style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            color: "var(--text-dim)",
            background: "var(--surface2)",
            border: "1px solid var(--border2)",
            borderRadius: 99,
            padding: "2px 7px",
            flexShrink: 0,
          }}>
            {expanded ? "▲" : "▼"}
          </span>
        </div>

        {/* 2b. Review quote */}
        <p style={{
          margin: 0,
          fontFamily: "'LBReview', serif",
          fontStyle: "italic",
          fontSize: 16,
          lineHeight: 1.7,
          color: "var(--text-mid)",
          ...(expanded ? {} : {
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }),
        }}>
          {r.review}
        </p>

        {/* 2c. Metadata line */}
        {metaSegments.length > 0 && (
          <div style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            color: "var(--text-dim)",
            letterSpacing: ".04em",
          }}>
            {metaSegments.join(" · ")}
          </div>
        )}

        {/* 2e. Expand block */}
        {expanded && (
          <div style={{
            borderTop: "1px solid var(--border)",
            paddingTop: 12,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            animation: "fadeSlideUp .2s ease",
          }}>
            {/* Diet tags */}
            {dietTags.length > 0 && (
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {dietTags.map(tag => {
                  const meta = DIET_TAGS.find(d => d.id === tag);
                  return meta ? (
                    <span key={tag} style={{
                      fontSize: 10,
                      fontFamily: "'DM Mono', monospace",
                      color: "var(--text-mid)",
                      background: "var(--surface2)",
                      border: "1px solid var(--border2)",
                      padding: "2px 8px",
                      borderRadius: 99,
                    }}>
                      {meta.label}
                    </span>
                  ) : null;
                })}
              </div>
            )}

            {/* Image */}
            {r.image_url && (
              <div>
                <div style={{
                  fontSize: 9,
                  fontFamily: "'LBBody', sans-serif",
                  color: "var(--text-dim)",
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}>Photo</div>
                <img
                  src={r.image_url}
                  alt={r.product}
                  style={{ width: "100%", borderRadius: 10, objectFit: "cover", maxHeight: 220, display: "block" }}
                  onError={e => e.currentTarget.style.display = "none"}
                />
              </div>
            )}

            {/* Map iframe */}
            {mapQuery && (
              <div>
                <div style={{
                  fontSize: 9,
                  fontFamily: "'LBBody', sans-serif",
                  color: "var(--text-dim)",
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}>Location</div>
                <iframe
                  title="map"
                  width="100%"
                  height="160"
                  style={{ border: "none", borderRadius: 10 }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
                />
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 10,
                    fontFamily: "'LBBody', sans-serif",
                    color: "var(--text-mid)",
                    textDecoration: "none",
                    display: "block",
                    marginTop: 4,
                  }}
                >
                  Open in Google Maps &#8599;
                </a>
              </div>
            )}

            {/* Link preview */}
            {r.link && (
              <div>
                <div style={{
                  fontSize: 9,
                  fontFamily: "'LBBody', sans-serif",
                  color: "var(--text-dim)",
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}>Link</div>
                <a
                  href={r.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "var(--surface2)",
                    border: "1px solid var(--border2)",
                    borderRadius: 10,
                    padding: "10px 14px",
                    textDecoration: "none",
                  }}
                >
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "var(--bg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    flexShrink: 0,
                  }}>🔗</div>
                  <div>
                    <div style={{
                      fontSize: 12,
                      color: "var(--text)",
                      fontFamily: "'LBBody', sans-serif",
                      marginBottom: 2,
                    }}>
                      {(() => { try { return new URL(r.link).hostname.replace("www.", ""); } catch { return r.link; } })()}
                    </div>
                    <div style={{
                      fontSize: 10,
                      color: "var(--text-dim)",
                      fontFamily: "'LBBody', sans-serif",
                    }}>
                      {r.link.slice(0, 40)}{r.link.length > 40 ? "…" : ""}
                    </div>
                  </div>
                </a>
              </div>
            )}
          </div>
        )}

        {/* 2d. Footer */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 8,
          borderTop: "1px solid var(--border)",
        }}>
          <button
            type="button"
            onClick={undefined}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "default",
              fontSize: 11,
              color: "var(--text-mid)",
              fontFamily: "'LBBody', sans-serif",
              fontWeight: 500,
              textAlign: "left",
            }}
          >
            {r.verified && <span style={{ color: "#2D6A4F", marginRight: 4 }}>✓</span>}
            {r.submitter}
          </button>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={() => onSave(r.id)}
              onMouseDown={e => e.currentTarget.style.transform = "scale(0.88)"}
              onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
              style={{
                background: saved ? "#ffffff14" : "transparent",
                border: `1px solid ${saved ? "var(--text)" : "var(--border2)"}`,
                color: saved ? "var(--text)" : "var(--text-mid)",
                borderRadius: 99,
                padding: "7px 14px",
                fontSize: 14,
                fontFamily: "'LBBody', sans-serif",
                cursor: "pointer",
                transition: "all .15s",
                animation: saved ? "popIn .25s cubic-bezier(.16,1,.3,1)" : "none",
              }}
            >
              {saved ? "★" : "☆"}
            </button>
            <button
              onClick={() => { onUp(r.id); }}
              onMouseDown={e => { if (!upped) e.currentTarget.style.transform = "scale(0.88)"; }}
              onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
              disabled={upped}
              style={{
                background: upped ? `${accent}22` : "transparent",
                border: `1px solid ${upped ? accent : "var(--border2)"}`,
                color: upped ? accent : "var(--text-mid)",
                borderRadius: 99,
                padding: "7px 14px",
                fontSize: 14,
                fontFamily: "'LBBody', sans-serif",
                cursor: upped ? "default" : "pointer",
                transition: "all .15s",
                animation: upped ? "popIn .25s cubic-bezier(.16,1,.3,1)" : "none",
              }}
            >
              ↑ {r.upvotes + (upped ? 1 : 0)}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
