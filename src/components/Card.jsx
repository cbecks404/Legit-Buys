import { useState } from "react";
import { CAT_META, DIET_TAGS, SCORE_COLORS, priceSymbol } from "../constants";
import RatingBand from "./Card/RatingBand";
import VerifiedBadge from "./VerifiedBadge";

const BookmarkIcon = ({ filled }) => (
  <svg width="13" height="15" viewBox="0 0 13 15" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
    <path d="M1 1h11v13l-5.5-3.5L1 14z" />
  </svg>
);

const ShareIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
  </svg>
);

const AVATAR_PALETTE = ["#C8FF47", "#60C3F5", "#F4A942", "#C084FC", "#FF6B6B", "#4ECDC4", "#FFB347"];
function getAvatarColor(name) {
  if (!name) return AVATAR_PALETTE[0];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (name.charCodeAt(i) + ((h << 5) - h)) | 0;
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
}
function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return parts.length === 1 ? parts[0][0].toUpperCase() : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Card({ r, onUp, saved, onSave, upped: initialUpped = false, onSubmitterClick, isActive = true, extraActions }) {
  const upped = initialUpped;
  const [copied, setCopied] = useState(false);
  const ratingColor = SCORE_COLORS[r.rating] ?? "#C8FF47";
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
  const avatarColor = getAvatarColor(r.submitter);

  const handleShare = async () => {
    const url = `${window.location.origin}${window.location.pathname}?r=${r.id}`;
    if (navigator.share) {
      try { await navigator.share({ title: r.product, text: r.review?.slice(0, 100), url }); } catch { /* user cancelled */ }
    } else {
      try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard blocked */ }
    }
  };

  return (
    <div
      id={`card-${r.id}`}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 14,
        overflow: "hidden",
        background: "var(--card-bg)",
        border: "1px solid var(--border)",
      }}
    >
      {/* 1. RatingBand — pinned at top edge */}
      <div style={{ flex: "0 0 auto" }}>
        <RatingBand score={r.rating} priceRange={priceRange} />
      </div>

      {/* 2. Scrollable content area */}
      <div style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto", padding: "12px 16px 14px", display: "flex", flexDirection: "column", gap: 10 }}>

        {/* 2a. Product name row */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            fontFamily: "'LBCardHeader', serif",
            fontSize: 17,
            fontWeight: 700,
            color: "var(--text)",
            lineHeight: 1.3,
            flex: 1,
          }}>
            {r.product}
          </span>
          <span style={{
            color: "var(--text-mid)",
            border: "1px solid var(--border2)",
            borderRadius: 99,
            padding: "4px 8px",
            display: "inline-flex",
            alignItems: "center",
            lineHeight: 1,
            flexShrink: 0,
          }}>
            <MapPinIcon />
          </span>
        </div>

        {/* 2b. Review quote — shown in full */}
        <p style={{
          margin: 0,
          fontFamily: "'LBReview', serif",
          fontStyle: "italic",
          fontSize: 16,
          lineHeight: 1.7,
          color: "var(--text-mid)",
        }}>
          {r.review}
        </p>

        {/* 2c. Metadata line */}
        {metaSegments.length > 0 && (
          <div style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--text-mid)",
            letterSpacing: ".04em",
          }}>
            {metaSegments.join(" · ")}
          </div>
        )}

        {/* 2d. Details — always visible */}
        {(dietTags.length > 0 || r.image_url || mapQuery || r.link) && (
          <div style={{
            borderTop: "1px solid var(--border)",
            paddingTop: 12,
            display: "flex",
            flexDirection: "column",
            gap: 12,
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
                {isActive ? (
                  <iframe
                    title="map"
                    width="100%"
                    height="160"
                    style={{ border: "none", borderRadius: 10 }}
                    loading="lazy"
                    allowFullScreen
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
                  />
                ) : (
                  <div style={{
                    height: 160,
                    borderRadius: 10,
                    border: "1px dashed var(--border2)",
                    background: "repeating-linear-gradient(45deg,var(--card-bg),var(--card-bg) 10px,var(--surface2) 10px,var(--surface2) 20px)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    color: "var(--text-dim)",
                  }}>
                    <span style={{ display: "inline-flex" }}><MapPinIcon /></span>
                    <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", letterSpacing: ".08em" }}>swipe to load map</span>
                  </div>
                )}
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

      </div>

      {/* 3. Footer — pinned at bottom */}
      <div style={{
        flex: "0 0 auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 8,
        padding: "10px 16px",
        borderTop: "1px solid var(--border)",
        background: "var(--card-bg)",
      }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
              background: `${avatarColor}20`, border: `1px solid ${avatarColor}40`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 9, fontFamily: "'DM Mono',monospace", fontWeight: 700, color: avatarColor,
            }}>
              {getInitials(r.submitter)}
            </div>
            <button
              type="button"
              onClick={onSubmitterClick ? () => onSubmitterClick(r.user_id ?? r.submitter) : undefined}
              style={{
                background: "none", border: "none", padding: 0,
                cursor: onSubmitterClick ? "pointer" : "default",
                fontSize: 13, color: "var(--text)", fontFamily: "'LBBody', sans-serif",
                fontWeight: 700, textAlign: "left", minWidth: 0,
              }}
            >
              {r.submitter}
            </button>
            {r.verified && <VerifiedBadge />}
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
            <button
              onClick={handleShare}
              onMouseDown={e => e.currentTarget.style.transform = "scale(0.88)"}
              onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
              style={{
                background: "transparent", border: `1px solid ${copied ? "#C8FF47" : "var(--border2)"}`,
                color: copied ? "#C8FF47" : "var(--text-mid)",
                borderRadius: 99, padding: "7px 11px", cursor: "pointer", transition: "all .15s",
                display: "flex", alignItems: "center", lineHeight: 1,
              }}
            >
              {copied ? <span style={{ fontSize: 11, fontWeight: 700 }}>✓</span> : <ShareIcon />}
            </button>
            {onSave && (
              <button
                onClick={() => onSave(r.id)}
                onMouseDown={e => e.currentTarget.style.transform = "scale(0.88)"}
                onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                style={{
                  background: saved ? `${ratingColor}22` : "transparent",
                  border: `1px solid ${saved ? ratingColor : "var(--border2)"}`,
                  color: saved ? ratingColor : "var(--text-mid)",
                  borderRadius: 99, padding: "7px 11px", cursor: "pointer", transition: "all .15s",
                  animation: saved ? "popIn .25s cubic-bezier(.16,1,.3,1)" : "none",
                  display: "flex", alignItems: "center", lineHeight: 1,
                }}
              >
                <BookmarkIcon filled={saved} />
              </button>
            )}
            {onUp && (
              <button
                onClick={() => { onUp(r.id); }}
                onMouseDown={e => { if (!upped) e.currentTarget.style.transform = "scale(0.88)"; }}
                onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                disabled={upped}
                style={{
                  background: upped ? "#C8FF4722" : "transparent",
                  border: `1px solid ${upped ? "#C8FF47" : "var(--border2)"}`,
                  color: upped ? "#C8FF47" : "var(--text-mid)",
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
            )}
            {extraActions}
          </div>
        </div>
    </div>
  );
}
