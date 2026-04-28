import { CAT_META, SCORE_COLORS, SCORE_META, priceSymbol } from "../constants";

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
  return parts.length === 1
    ? parts[0][0].toUpperCase()
    : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function PublicProfile({ displayName, userId, allReviews, onClose }) {
  const reviews = allReviews
    .filter(r => (userId && r.user_id === userId) || (!userId && r.submitter === displayName))
    .sort((a, b) => b.upvotes - a.upvotes);

  const avatarColor = getAvatarColor(displayName);
  const totalUpvotes = reviews.reduce((sum, r) => sum + (r.upvotes || 0), 0);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 250, background: "#080808", display: "flex", flexDirection: "column", overflowY: "auto" }}>

      {/* Header */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "#080808", padding: "env(safe-area-inset-top) 18px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 0 16px", borderBottom: "1px solid #1a1a1a" }}>
          <div style={{ fontFamily: "'LBTitle',sans-serif", fontSize: 22, color: "#f0ede8", letterSpacing: ".04em" }}>PROFILE</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#555", fontSize: 22, cursor: "pointer", lineHeight: 1 }}>✕</button>
        </div>
      </div>

      <div style={{ flex: 1, padding: "28px 18px 60px", maxWidth: 520, width: "100%", margin: "0 auto" }}>

        {/* Profile hero */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 28 }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%", flexShrink: 0,
            background: `${avatarColor}20`, border: `2px solid ${avatarColor}60`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontFamily: "'DM Mono',monospace", fontWeight: 700,
            color: avatarColor,
          }}>
            {getInitials(displayName)}
          </div>
          <div>
            <div style={{ fontFamily: "'LBCardHeader',serif", fontSize: 22, fontWeight: 700, color: "#f0ede8", marginBottom: 4 }}>{displayName}</div>
            <div style={{ display: "flex", gap: 16 }}>
              <span style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#888" }}>
                <span style={{ color: "#C8FF47", fontWeight: 700 }}>{reviews.length}</span> review{reviews.length !== 1 ? "s" : ""}
              </span>
              <span style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#888" }}>
                <span style={{ color: "#C8FF47", fontWeight: 700 }}>{totalUpvotes}</span> upvote{totalUpvotes !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Reviews */}
        {reviews.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#555", fontSize: 13, fontFamily: "'LBBody',sans-serif" }}>
            No reviews yet.
          </div>
        ) : (
          reviews.map(r => {
            const accent = CAT_META[r.category]?.color ?? "#C8FF47";
            const meta = SCORE_META[r.rating];
            const color = SCORE_COLORS[r.rating];
            const sym = priceSymbol(r.price_range ?? "");
            return (
              <div key={r.id} style={{ background: "#111", border: `1px solid ${accent}44`, borderRadius: 14, padding: "16px 16px 14px", marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: accent, letterSpacing: ".18em", textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>
                      {CAT_META[r.category]?.emoji} {r.category}
                    </div>
                    <div style={{ fontFamily: "'LBCardHeader',serif", fontSize: 16, color: "#f0ede8" }}>{r.product}</div>
                  </div>
                  <span style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", fontWeight: 700, color, background: `${color}18`, border: `1px solid ${color}44`, padding: "3px 9px", borderRadius: 99, whiteSpace: "nowrap", flexShrink: 0 }}>
                    {r.rating === 3 ? "✦ " : ""}{meta?.label}
                  </span>
                </div>
                <p style={{ margin: "0 0 10px", fontSize: 13, color: "#e0ddd8", fontFamily: "'LBReview',serif", lineHeight: 1.6 }}>{r.review}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {r.where && <span style={{ fontSize: 10, color: "#666", fontFamily: "'DM Mono',monospace" }}>{r.where}</span>}
                  {r.price && <span style={{ fontSize: 11, color: accent, fontFamily: "'DM Mono',monospace", fontWeight: 600 }}>£{r.price}</span>}
                  {sym && <span style={{ fontSize: 10, color: "#555", fontFamily: "'DM Mono',monospace", background: "#161616", border: "1px solid #1c1c1c", padding: "1px 7px", borderRadius: 99 }}>{sym}</span>}
                  <span style={{ fontSize: 10, color: "#555", fontFamily: "'DM Mono',monospace", marginLeft: "auto" }}>↑ {r.upvotes ?? 0}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
