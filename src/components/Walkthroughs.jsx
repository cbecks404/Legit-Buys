import { useState } from "react";

export function AppIntro({ onDismiss, theme: T }) {
  const [step, setStep] = useState(0);
  const steps = [
    {
      emoji: "✦",
      title: "Welcome to Legit Buys",
      body: "Real food picks from real colleagues. No ads, no algorithms — just honest recommendations from people you actually know.",
      tip: null,
    },
    {
      emoji: "🏆",
      title: "The scoring scale",
      body: "Every review gets a score from 0 to 3. Here's what they mean:",
      tip: [
        { score: "0", label: "Pass",                desc: "No recommendation",          color: "#383838" },
        { score: "1", label: "Legit",               desc: "Worth picking up",            color: "#60C3F5" },
        { score: "2", label: "Big Legit",           desc: "Genuinely great",             color: "#F4A942" },
        { score: "3", label: "Certified Legit Buy", desc: "Stop what you're doing",      color: "#C8FF47" },
      ],
    },
    {
      emoji: "📝",
      title: "How to submit",
      body: "Tap 'Submit a Legit Buy' to add your pick. Your review goes to admin for approval before going live — keeping things quality over quantity.",
      tip: null,
    },
  ];
  const s = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div onClick={e => e.target === e.currentTarget && onDismiss(false)}
      style={{ position: "fixed", inset: 0, background: "#000000cc", backdropFilter: "blur(10px)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 300 }}>
      <div style={{
        background: T.sheetBg ?? "#0d0d0d", borderTop: `1px solid ${T.sheetBorder ?? "#202020"}`,
        borderRadius: "18px 18px 0 0", width: "100%", maxWidth: 520,
        padding: "26px 22px 50px", animation: "sheetUp .25s cubic-bezier(.16,1,.3,1)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 6 }}>
            {steps.map((_, i) => (
              <div key={i} style={{ width: i === step ? 20 : 6, height: 6, borderRadius: 99, background: i < step ? "#C8FF4788" : i === step ? "#C8FF47" : T.border ?? "#1e1e1e", transition: "all .3s" }} />
            ))}
          </div>
          <button onClick={() => onDismiss(false)} style={{ background: "none", border: "none", color: T.textDim ?? "#555", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ fontSize: 40, marginBottom: 16, color: s.emoji === "✦" ? "#C8FF47" : "inherit" }}>{s.emoji}</div>
        <div style={{ fontFamily: "'LBCardHeader', serif", fontSize: 22, color: T.text ?? "#f0ede8", marginBottom: 12, lineHeight: 1.2 }}>{s.title}</div>
        <p style={{ margin: "0 0 20px", fontSize: 14, color: T.textMid ?? "#e0ddd8", fontFamily: "'LBBody', sans-serif", lineHeight: 1.7 }}>{s.body}</p>

        {s.tip && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {s.tip.map(t => (
              <div key={t.score} style={{ display: "flex", alignItems: "center", gap: 12, background: T.surface2 ?? "#161616", border: `1px solid ${T.border ?? "#1e1e1e"}`, borderRadius: 10, padding: "10px 14px" }}>
                <span style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", fontWeight: 700, color: t.color, background: `${t.color}18`, border: `1px solid ${t.color}44`, padding: "3px 9px", borderRadius: 99, whiteSpace: "nowrap" }}>{t.label}</span>
                <span style={{ fontSize: 12, color: T.textMid ?? "#e0ddd8", fontFamily: "'LBBody', sans-serif" }}>{t.desc}</span>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => isLast ? onDismiss(false) : setStep(s => s + 1)}
          style={{ background: "#C8FF47", color: "#0a0a0a", border: "none", borderRadius: 99, padding: "13px 0", width: "100%", fontFamily: "'LBTitle', sans-serif", fontSize: 16, letterSpacing: ".04em", cursor: "pointer", marginBottom: 10 }}>
          {isLast ? "LET'S GO →" : "NEXT →"}
        </button>
        {isLast && (
          <button onClick={() => onDismiss(true)} style={{ background: "none", border: "none", color: T.textDim ?? "#555", fontSize: 12, fontFamily: "'LBBody', sans-serif", cursor: "pointer", width: "100%", padding: "8px 0" }}>
            Don't show this again
          </button>
        )}
      </div>
    </div>
  );
}

export function SubmitGuide({ onDismiss, theme: T }) {
  const [step, setStep] = useState(0);
  const steps = [
    {
      emoji: "✍️",
      title: "Writing a good review",
      body: "Be specific — what made it worth buying? Mention the taste, value, where to get it. Reviews like 'it was nice' don't help anyone.",
      tip: "Think: would a colleague trust this recommendation?",
    },
    {
      emoji: "🏆",
      title: "Scoring honestly",
      body: "Only give a Certified Legit Buy (3) if you'd genuinely stop what you're doing to recommend it. Save the top score for the best.",
      tip: "When in doubt, check the full scoring guide below.",
      link: true,
    },
  ];
  const s = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div onClick={e => e.target === e.currentTarget && onDismiss(false)}
      style={{ position: "fixed", inset: 0, background: "#000000cc", backdropFilter: "blur(10px)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 300 }}>
      <div style={{
        background: T.sheetBg ?? "#0d0d0d", borderTop: `1px solid ${T.sheetBorder ?? "#202020"}`,
        borderRadius: "18px 18px 0 0", width: "100%", maxWidth: 520,
        padding: "26px 22px 50px", animation: "sheetUp .25s cubic-bezier(.16,1,.3,1)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 6 }}>
            {steps.map((_, i) => (
              <div key={i} style={{ width: i === step ? 20 : 6, height: 6, borderRadius: 99, background: i < step ? "#C8FF4788" : i === step ? "#C8FF47" : T.border ?? "#1e1e1e", transition: "all .3s" }} />
            ))}
          </div>
          <button onClick={() => onDismiss(false)} style={{ background: "none", border: "none", color: T.textDim ?? "#555", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ fontSize: 40, marginBottom: 16 }}>{s.emoji}</div>
        <div style={{ fontFamily: "'LBCardHeader', serif", fontSize: 22, color: T.text ?? "#f0ede8", marginBottom: 12, lineHeight: 1.2 }}>{s.title}</div>
        <p style={{ margin: "0 0 16px", fontSize: 14, color: T.textMid ?? "#e0ddd8", fontFamily: "'LBBody', sans-serif", lineHeight: 1.7 }}>{s.body}</p>

        {s.tip && (
          <div style={{ background: T.surface2 ?? "#161616", border: `1px solid ${T.border ?? "#1e1e1e"}`, borderRadius: 10, padding: "12px 14px", marginBottom: 20 }}>
            <p style={{ margin: 0, fontSize: 12, color: "#C8FF47", fontFamily: "'LBBody', sans-serif", lineHeight: 1.6 }}>💡 {s.tip}</p>
            {s.link && (
              <a href="/scoring-guide.html" target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 11, color: "#C8FF47", fontFamily: "'LBBody', sans-serif", display: "block", marginTop: 8, opacity: 0.7 }}>
                View full scoring guide &#8599;
              </a>
            )}
          </div>
        )}

        <button
          onClick={() => isLast ? onDismiss(false) : setStep(s => s + 1)}
          style={{ background: "#C8FF47", color: "#0a0a0a", border: "none", borderRadius: 99, padding: "13px 0", width: "100%", fontFamily: "'LBTitle', sans-serif", fontSize: 16, letterSpacing: ".04em", cursor: "pointer", marginBottom: 10 }}>
          {isLast ? "START REVIEWING →" : "NEXT →"}
        </button>
        {isLast && (
          <button onClick={() => onDismiss(true)} style={{ background: "none", border: "none", color: T.textDim ?? "#555", fontSize: 12, fontFamily: "'LBBody', sans-serif", cursor: "pointer", width: "100%", padding: "8px 0" }}>
            Don't show this again
          </button>
        )}
      </div>
    </div>
  );
}
