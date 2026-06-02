import Card from "./Card";
import Carousel from "./Carousel";

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
          <Carousel items={reviews} getKey={r => r.id} bottomInset={32}>
            {(r, isActive) => <Card r={r} isActive={isActive} />}
          </Carousel>
        )}
      </div>
    </div>
  );
}
