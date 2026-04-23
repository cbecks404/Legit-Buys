import { SCORE_META } from "../../constants";

/**
 * RatingBand — full-width band that sits at the top of a Card.
 *
 * Props:
 *   score:      integer 0–3
 *   priceRange: "cheap" | "fair" | "pricey" | ""
 *
 * Score 0 renders an outlined-only band; scores 1 & 2 are flat fills;
 * score 3 + pricey gets the animated holo treatment (keyframes `holo`
 * and `shimmer` are defined globally in App.jsx).
 */
export default function RatingBand({ score, priceRange }) {
  const meta = SCORE_META.find(s => s.value === score);
  if (!meta) return null;

  const isHolo = score === 3 && priceRange === "pricey";
  const isOutlined = score === 0;

  // Base band styles — shared across variants.
  const height = 48;
  const padding = "0 18px";
  const borderRadius = 12;

  // Colour logic per variant.
  let background = "transparent";
  let borderStyle = "1px solid transparent";
  let labelColor = "#0a0a0a";

  if (isHolo) {
    background = "linear-gradient(135deg,#1a1a2e 0%,#16213e 25%,#0f3460 50%,#1a1a2e 75%,#16213e 100%)";
    labelColor = "#C8FF47";
  } else if (isOutlined) {
    background = "transparent";
    borderStyle = "1px solid var(--score-0)";
    labelColor = "var(--score-0)";
  } else if (score === 1) {
    background = "var(--score-1)";
  } else if (score === 2) {
    background = "var(--score-2)";
  } else if (score === 3) {
    background = "var(--score-3)";
  }

  // Stars: first `score` filled (★), remaining outlined (☆). Score 0 → all outlined.
  const dots = [0, 1, 2].map(i => (
    <span
      key={i}
      aria-hidden="true"
      style={{ color: labelColor, fontSize: 14, lineHeight: 1 }}
    >
      {i < score ? "★" : "☆"}
    </span>
  ));

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height,
        borderRadius,
        overflow: "hidden",
        background,
        backgroundSize: isHolo ? "300% 300%" : "auto",
        animation: isHolo ? "holo 6s ease infinite" : "none",
        border: borderStyle,
      }}
    >
      {/* Holo shimmer overlay */}
      {isHolo && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
            background:
              "linear-gradient(135deg,rgba(200,255,71,0.06),rgba(96,195,245,0.06),rgba(244,169,66,0.06),rgba(192,132,252,0.06))",
            animation: "shimmer 8s ease infinite",
          }}
        />
      )}

      {/* Holo gradient border */}
      {isHolo && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            borderRadius,
            pointerEvents: "none",
            zIndex: 0,
            border: "1px solid transparent",
            background:
              "linear-gradient(#111,#111) padding-box, linear-gradient(135deg,#C8FF47,#60C3F5,#F4A942,#C084FC) border-box",
          }}
        />
      )}

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          padding,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <span
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: ".18em",
            textTransform: "uppercase",
            color: labelColor,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {meta.short}
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          {dots}
        </span>
      </div>
    </div>
  );
}
