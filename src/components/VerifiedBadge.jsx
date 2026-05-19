export default function VerifiedBadge() {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: "#C8FF4718", border: "1px solid #C8FF4744",
      borderRadius: 99, padding: "3px 10px", fontSize: 10,
      fontFamily: "'DM Mono', monospace", color: "#C8FF47", letterSpacing: ".12em",
    }}>
      ✦ VERIFIED
    </span>
  );
}
