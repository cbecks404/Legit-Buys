import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

const CAT_META = {
  all:         { emoji: "◈", color: "#C8FF47" },
  snacks:      { emoji: "🍫", color: "#F4A942" },
  drinks:      { emoji: "☕", color: "#60C3F5" },
  restaurants: { emoji: "🍽", color: "#F07070" },
  cafes:       { emoji: "🥐", color: "#C084FC" },
  groceries:   { emoji: "🛒", color: "#34D399" },
};

const DIET_TAGS = [
  { id: "vegetarian",   label: "Vegetarian"   },
  { id: "vegan",        label: "Vegan"         },
  { id: "gluten-free",  label: "Gluten-free"   },
  { id: "non-alcoholic",label: "Non-alcoholic" },
  { id: "halal",        label: "Halal"         },
  { id: "nut-free",     label: "Nut-free"      },
];

const PRICE_RANGE = [
  { id: "cheap",  label: "Cheap",  symbol: "£"   },
  { id: "fair",   label: "Fair",   symbol: "££"  },
  { id: "pricey", label: "Pricey", symbol: "£££" },
];

const SCORE_META = [
  { value: 0, label: "Pass",                short: "Pass"      },
  { value: 1, label: "Legit",               short: "Legit"     },
  { value: 2, label: "Big Legit",           short: "Big Legit" },
  { value: 3, label: "Certified Legit Buy", short: "Certified" },
];

const SCORE_COLORS = ["#808080", "#60C3F5", "#F4A942", "#C8FF47"];
const SCORE_HINTS  = [
  "No recommendation",
  "Worth picking up",
  "Genuinely great",
  "Stop what you're doing and buy this",
];

function priceSymbol(range) {
  return PRICE_RANGE.find(p => p.id === range)?.symbol ?? "";
}

// ── Score selector ────────────────────────────────────
function ScoreSelector({ value = null, interactive = false, onChange }) {
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
                color: isActive ? color : "#AAA",
                fontFamily: "'DM Mono',monospace", fontSize: 10, cursor: "pointer",
                transition: "all .15s", lineHeight: 1.5, fontWeight: isActive ? 700 : 400,
              }}>
              {m.value}<br/>{m.short}
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

// ── Category pill ─────────────────────────────────────
function Pill({ cat, active, onClick }) {
  const m = CAT_META[cat];
  return (
    <button
      onClick={onClick}
      onMouseDown={e => e.currentTarget.style.transform="scale(0.92)"}
      onMouseUp={e => e.currentTarget.style.transform="scale(1)"}
      onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}
      style={{
        background: active ? m.color : "transparent",
        color: active ? "#0a0a0a" : "#888",
        border: `1.5px solid ${active ? m.color : "#232323"}`,
        borderRadius: 99, padding: "5px 14px", fontSize: 12,
        fontFamily: "'LBBody', sans-serif", cursor: "pointer",
        fontWeight: active ? 700 : 400, whiteSpace: "nowrap", transition: "all .15s",
      }}>
      {m.emoji} {cat === "all" ? "All" : cat[0].toUpperCase() + cat.slice(1)}
    </button>
  );
}

// ── Diet pill ─────────────────────────────────────────
function DietPill({ tag, active, onClick }) {
  return (
    <button
      onClick={onClick}
      onMouseDown={e => e.currentTarget.style.transform="scale(0.92)"}
      onMouseUp={e => e.currentTarget.style.transform="scale(1)"}
      onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}
      style={{
      background: active ? "#ffffff14" : "transparent",
      color: active ? "#f0ede8" : "#AAA",
      border: `1.5px solid ${active ? "#BBB" : "#1e1e1e"}`,
      borderRadius: 99, padding: "4px 12px", fontSize: 11,
      fontFamily: "'DM Mono',monospace", cursor: "pointer",
      whiteSpace: "nowrap", transition: "all .15s", fontWeight: active ? 600 : 400,
    }}>
      {tag.label}
    </button>
  );
}

// ── Map button ────────────────────────────────────────
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

// ── Link button ───────────────────────────────────────
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

// ── Review card ───────────────────────────────────────
function Card({ r, onUp, saved, onSave, theme: T = {} }) {
  const [upped, setUpped] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const accent    = CAT_META[r.category]?.color ?? "#C8FF47";
  const rawDiet = r.diet_tags ?? r.dietTags ?? [];
  const dietTags = Array.isArray(rawDiet)
    ? rawDiet
    : typeof rawDiet === 'string' && rawDiet.length > 2
      ? rawDiet.replace(/[{}]/g, '').split(',').map(s => s.trim())
      : [];
  const priceRange = r.price_range ?? r.priceRange ?? "";
  const mapQuery  = r.map_query   ?? r.mapQuery   ?? "";
  const hasLinks  = r.link || mapQuery;
  const sym       = priceSymbol(priceRange);
  const isHolo    = r.rating === 3 && priceRange === "pricey";

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
      {/* Holographic shimmer overlay */}
      {/* Holographic glow — sits behind content via z-index */}
      {isHolo && (
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
          background: "linear-gradient(135deg,rgba(200,255,71,0.06),rgba(96,195,245,0.06),rgba(244,169,66,0.06),rgba(192,132,252,0.06))",
          animation: "shimmer 8s ease infinite",
        }} />
      )}

      {/* Rainbow border */}
      {isHolo && (
        <div style={{
          position: "absolute", inset: 0, borderRadius: 14, pointerEvents: "none", zIndex: 0,
          border: "1px solid transparent",
          background: "linear-gradient(#111,#111) padding-box, linear-gradient(135deg,#C8FF47,#60C3F5,#F4A942,#C084FC) border-box",
        }} />
      )}

      {/* All content wrapped to sit above holo overlays */}
      <div style={{ position:"relative", zIndex:1, display:"flex", flexDirection:"column", gap:10 }}>

        {/* Title row */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8, position:"relative", zIndex:1 }}>
          <div>
            <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:4 }}>
              {(r.categories ?? [r.category]).map(c => (
                <span key={c} style={{
                  fontSize:9, fontFamily:"'DM Mono',monospace",
                  color: CAT_META[c]?.color ?? accent,
                  letterSpacing:".18em", textTransform:"uppercase", fontWeight:600,
                }}>
                  {CAT_META[c]?.emoji} {c}
                </span>
              ))}
            </div>
            <div
              onClick={() => setExpanded(e => !e)}
              style={{ fontFamily:"'LBCardHeader', serif", fontSize:16, color: T.text ?? "#f0ede8", lineHeight:1.25 }}>
              {r.product}
              <span style={{ fontSize:9, color:"#444", fontFamily:"'LBBody',sans-serif", marginLeft:8, letterSpacing:".08em" }}>
                {expanded ? "▲ less" : "▼ more"}
              </span>
            </div>
          </div>
          <ScoreSelector value={r.rating} />
        </div>

        {/* Review text */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8, position:"relative", zIndex:1 }}></div>
        <p style={{ margin:0, fontSize:13.5, color: T.textMid ?? "#aaa", lineHeight:1.65, fontFamily:"'LBReview', serif" }}>{r.review}</p>

        {/* Diet tags */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8, position:"relative", zIndex:1 }}></div>
        {dietTags.length > 0 && (
          <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
            {dietTags.map(tag => {
              const meta = DIET_TAGS.find(d => d.id === tag);
              return meta ? (
                <span key={tag} style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:"#ccc", background:"#161616", border:"1px solid #666", padding:"2px 8px", borderRadius:99 }}>
                  {meta.label}
                </span>
              ) : null;
            })}
          </div>
        )}

        {/* Links */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8, position:"relative", zIndex:1 }}></div>
        {hasLinks && !expanded && (
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", paddingTop:2 }}>
            <LinkButton link={r.link} where={r.where} />
            <MapButton mapQuery={mapQuery} />
          </div>
        )}

        {/* Expanded detail */}
        {expanded && (
          <div style={{ animation:"fadeSlideUp .2s ease", borderTop:"1px solid #1e1e1e", paddingTop:12, display:"flex", flexDirection:"column", gap:12 }}>
            {r.map_query && (
              <div>
                <div style={{ fontSize:9, fontFamily:"'LBBody',sans-serif", color:"#555", letterSpacing:".14em", textTransform:"uppercase", marginBottom:8 }}>Location</div>
                <iframe
                  title="map"
                  width="100%"
                  height="160"
                  style={{ border:"none", borderRadius:10 }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(r.map_query ?? r.where)}&output=embed`}
                />
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.map_query ?? r.where)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize:10, fontFamily:"'LBBody',sans-serif", color:"#555", textDecoration:"none", display:"block", marginTop:4 }}>
                  Open in Google Maps &#8599;
                </a>
              </div>
            )}
            {r.link && (
              <div>
                <div style={{ fontSize:9, fontFamily:"'LBBody',sans-serif", color:"#555", letterSpacing:".14em", textTransform:"uppercase", marginBottom:8 }}>Link</div>
                <a
                  href={r.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display:"flex", alignItems:"center", gap:10,
                    background:"#161616", border:"1px solid #2a2a2a", borderRadius:10,
                    padding:"10px 14px", textDecoration:"none", transition:"all .15s",
                  }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:"#222", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>
                    🔗
                  </div>
                  <div>
                    <div style={{ fontSize:12, color:"#f0ede8", fontFamily:"'LBBody',sans-serif", marginBottom:2 }}>
                      {(() => { try { return new URL(r.link).hostname.replace("www.",""); } catch { return r.link; } })()}
                    </div>
                    <div style={{ fontSize:10, color:"#555", fontFamily:"'LBBody',sans-serif" }}>{r.link.slice(0,40)}{r.link.length>40?"…":""}</div>
                  </div>
                </a>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:2, paddingTop: hasLinks?8:0, borderTop: hasLinks?"1px solid #181818":"none", position:"relative", zIndex:1 }}>
          <div>
            <div style={{ fontSize:11, color:"#aaa", fontFamily:"'LBBody', sans-serif" }}>
              {r.verified && <span style={{ color:"#C8FF47", marginRight:5 }}>✓</span>}
              {r.submitter} · {r.where}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:3 }}>
              <span style={{ fontSize:12, color:accent, fontFamily:"'DM Mono',monospace", fontWeight:600 }}>£{r.price}</span>
              {sym && <span style={{ fontSize:11, color:"#bbb", fontFamily:"'DM Mono',monospace", background:"#1a1a1a", border:"1px solid #666", padding:"1px 7px", borderRadius:99 }}>{sym}</span>}
            </div>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <button
              onClick={() => onSave(r.id)}
              onMouseDown={e => e.currentTarget.style.transform="scale(0.88)"}
              onMouseUp={e => e.currentTarget.style.transform="scale(1)"}
              onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}
              style={{
                background: saved ? "#ffffff14" : "transparent",
                border: `1px solid ${saved ? "#f0ede8" : "#242424"}`,
                color: saved ? "#f0ede8" : "#444",
                borderRadius:99, padding:"5px 11px", fontSize:12,
                fontFamily:"'LBBody', sans-serif", cursor:"pointer", transition:"all .15s",
                animation: saved ? "popIn .25s cubic-bezier(.16,1,.3,1)" : "none",
              }}>
              {saved ? "★" : "☆"}
            </button>
            <button
              onClick={() => { if (!upped) { setUpped(true); onUp(r.id); }}}
              onMouseDown={e => { if(!upped) e.currentTarget.style.transform="scale(0.88)" }}
              onMouseUp={e => e.currentTarget.style.transform="scale(1)"}
              onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}
              style={{
                background: upped ? `${accent}18` : "transparent",
                border: `1px solid ${upped ? accent : "#242424"}`,
                color: upped ? accent : "#444",
                borderRadius:99, padding:"5px 13px", fontSize:12,
                fontFamily:"'LBBody', sans-serif", cursor: upped?"default":"pointer", transition:"all .15s",
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


// ── App intro walkthrough ─────────────────────────────
function AppIntro({ onDismiss, theme: T }) {
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
        { score: "0", label: "Pass", desc: "No recommendation", color: "#383838" },
        { score: "1", label: "Legit", desc: "Worth picking up", color: "#60C3F5" },
        { score: "2", label: "Big Legit", desc: "Genuinely great", color: "#F4A942" },
        { score: "3", label: "Certified Legit Buy", desc: "Stop what you're doing", color: "#C8FF47" },
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
    <div onClick={e => e.target===e.currentTarget && onDismiss(false)}
      style={{ position:"fixed", inset:0, background:"#000000cc", backdropFilter:"blur(10px)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:300 }}>
      <div style={{
        background: T.sheetBg ?? "#0d0d0d", borderTop:`1px solid ${T.sheetBorder ?? "#202020"}`,
        borderRadius:"18px 18px 0 0", width:"100%", maxWidth:520,
        padding:"26px 22px 50px", animation:"sheetUp .25s cubic-bezier(.16,1,.3,1)",
      }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
          <div style={{ display:"flex", gap:6 }}>
            {steps.map((_,i) => (
              <div key={i} style={{ width: i===step ? 20 : 6, height:6, borderRadius:99, background: i<step ? "#C8FF4788" : i===step ? "#C8FF47" : T.border ?? "#1e1e1e", transition:"all .3s" }} />
            ))}
          </div>
          <button onClick={()=>onDismiss(false)} style={{ background:"none", border:"none", color:T.textDim ?? "#555", fontSize:20, cursor:"pointer" }}>✕</button>
        </div>

        <div style={{ fontSize:40, marginBottom:16, color: s.emoji === "✦" ? "#C8FF47" : "inherit" }}>{s.emoji}</div>
        <div style={{ fontFamily:"'LBCardHeader', serif", fontSize:22, color:T.text ?? "#f0ede8", marginBottom:12, lineHeight:1.2 }}>{s.title}</div>
        <p style={{ margin:"0 0 20px", fontSize:14, color:T.textMid ?? "#aaa", fontFamily:"'LBBody', sans-serif", lineHeight:1.7 }}>{s.body}</p>

        {s.tip && (
          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
            {s.tip.map(t => (
              <div key={t.score} style={{ display:"flex", alignItems:"center", gap:12, background:T.surface2 ?? "#161616", border:`1px solid ${T.border ?? "#1e1e1e"}`, borderRadius:10, padding:"10px 14px" }}>
                <span style={{ fontSize:11, fontFamily:"'DM Mono',monospace", fontWeight:700, color:t.color, background:`${t.color}18`, border:`1px solid ${t.color}44`, padding:"3px 9px", borderRadius:99, whiteSpace:"nowrap" }}>{t.label}</span>
                <span style={{ fontSize:12, color:T.textMid ?? "#aaa", fontFamily:"'LBBody', sans-serif" }}>{t.desc}</span>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => isLast ? onDismiss(false) : setStep(s => s + 1)}
          style={{ background:"#C8FF47", color:"#0a0a0a", border:"none", borderRadius:99, padding:"13px 0", width:"100%", fontFamily:"'LBTitle', sans-serif", fontSize:16, letterSpacing:".04em", cursor:"pointer", marginBottom:10 }}>
          {isLast ? "LET'S GO →" : "NEXT →"}
        </button>
        {isLast && (
          <button onClick={()=>onDismiss(true)} style={{ background:"none", border:"none", color:T.textDim ?? "#555", fontSize:12, fontFamily:"'LBBody', sans-serif", cursor:"pointer", width:"100%", padding:"8px 0" }}>
            Don't show this again
          </button>
        )}
      </div>
    </div>
  );
}

// ── Submit guide walkthrough ──────────────────────────
function SubmitGuide({ onDismiss, theme: T }) {
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
    <div onClick={e => e.target===e.currentTarget && onDismiss(false)}
      style={{ position:"fixed", inset:0, background:"#000000cc", backdropFilter:"blur(10px)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:300 }}>
      <div style={{
        background: T.sheetBg ?? "#0d0d0d", borderTop:`1px solid ${T.sheetBorder ?? "#202020"}`,
        borderRadius:"18px 18px 0 0", width:"100%", maxWidth:520,
        padding:"26px 22px 50px", animation:"sheetUp .25s cubic-bezier(.16,1,.3,1)",
      }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
          <div style={{ display:"flex", gap:6 }}>
            {steps.map((_,i) => (
              <div key={i} style={{ width: i===step ? 20 : 6, height:6, borderRadius:99, background: i<step ? "#C8FF4788" : i===step ? "#C8FF47" : T.border ?? "#1e1e1e", transition:"all .3s" }} />
            ))}
          </div>
          <button onClick={()=>onDismiss(false)} style={{ background:"none", border:"none", color:T.textDim ?? "#555", fontSize:20, cursor:"pointer" }}>✕</button>
        </div>

        <div style={{ fontSize:40, marginBottom:16 }}>{s.emoji}</div>
        <div style={{ fontFamily:"'LBCardHeader', serif", fontSize:22, color:T.text ?? "#f0ede8", marginBottom:12, lineHeight:1.2 }}>{s.title}</div>
        <p style={{ margin:"0 0 16px", fontSize:14, color:T.textMid ?? "#aaa", fontFamily:"'LBBody', sans-serif", lineHeight:1.7 }}>{s.body}</p>

        {s.tip && (
          <div style={{ background:T.surface2 ?? "#161616", border:`1px solid ${T.border ?? "#1e1e1e"}`, borderRadius:10, padding:"12px 14px", marginBottom:20 }}>
            <p style={{ margin:0, fontSize:12, color:"#C8FF47", fontFamily:"'LBBody', sans-serif", lineHeight:1.6 }}>💡 {s.tip}</p>
            {s.link && (
              <a href="/scoring-guide.html" target="_blank" rel="noopener noreferrer"
                style={{ fontSize:11, color:"#C8FF47", fontFamily:"'LBBody', sans-serif", display:"block", marginTop:8, opacity:0.7 }}>
                View full scoring guide &#8599;
              </a>
            )}
          </div>
        )}

        <button
          onClick={() => isLast ? onDismiss(false) : setStep(s => s + 1)}
          style={{ background:"#C8FF47", color:"#0a0a0a", border:"none", borderRadius:99, padding:"13px 0", width:"100%", fontFamily:"'LBTitle', sans-serif", fontSize:16, letterSpacing:".04em", cursor:"pointer", marginBottom:10 }}>
          {isLast ? "START REVIEWING →" : "NEXT →"}
        </button>
        {isLast && (
          <button onClick={()=>onDismiss(true)} style={{ background:"none", border:"none", color:T.textDim ?? "#555", fontSize:12, fontFamily:"'LBBody', sans-serif", cursor:"pointer", width:"100%", padding:"8px 0" }}>
            Don't show this again
          </button>
        )}
      </div>
    </div>
  );
}

// ── Bottom sheet ──────────────────────────────────────
function Sheet({ title, onClose, children, theme: T = {} }) {
  return (
    <div onClick={e => e.target===e.currentTarget && onClose()}
      style={{ position:"fixed", inset:0, background:"#000000cc", backdropFilter:"blur(10px)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:200 }}>
      <div style={{
        background: T.sheetBg ?? "#0d0d0d", borderTop:`1px solid ${T.sheetBorder ?? "#202020"}`,
        borderRadius:"18px 18px 0 0", width:"100%", maxWidth:520,
        maxHeight:"92vh", overflowY:"auto", padding:"26px 22px 50px",
        animation:"sheetUp .25s cubic-bezier(.16,1,.3,1)",
      }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
          <span style={{ fontFamily:"'Libre Baskerville',Georgia,serif", fontSize:19, color:"#f0ede8", fontWeight:700 }}>{title}</span>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#AAA", fontSize:22, cursor:"pointer", lineHeight:1, padding:"2px 6px" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Submission flow ───────────────────────────────────
function SubmitFlow({ onSubmit, onClose }) {
  const [step, setStep] = useState(0);
  const [f, setF] = useState({
    product:"", category:"snacks", categories:["snacks"], rating:null, review:"",
    submitter:"", where:"", price:"", priceRange:"fair",
    link:"", mapQuery:"", dietTags:[],
  });
  const set = (k, v) => setF(p => ({...p, [k]:v}));
    const toggleCategory = (c) => setF(p => {
    const already = p.categories.includes(c);
    const next = already && p.categories.length === 1
      ? p.categories
      : already
        ? p.categories.filter(x => x !== c)
        : [...p.categories, c];
    return { ...p, categories: next, category: next[0] };
  });
  const toggleDiet = (id) => setF(p => ({
    ...p,
    dietTags: p.dietTags.includes(id) ? p.dietTags.filter(t=>t!==id) : [...p.dietTags, id],
  }));

  const inp = { width:"100%", background:"#161616", border:"1px solid #666", borderRadius:10, padding:"12px 14px", color:"#f0ede8", fontSize:14, outline:"none", boxSizing:"border-box", fontFamily:"system-ui,sans-serif" };
  const lbl = { fontSize:9, fontFamily:"'DM Mono',monospace", color:"#bbb", letterSpacing:".14em", textTransform:"uppercase", display:"block", marginBottom:7, fontWeight:600 };
  const hint = { fontSize:11, color:"#CCC", fontFamily:"'DM Mono',monospace", marginTop:5, lineHeight:1.5 };
  const nextBtn = (disabled) => ({ background:"#C8FF47", color:"#0a0a0a", border:"none", borderRadius:99, padding:"13px 0", width:"100%", fontFamily:"'DM Mono',monospace", fontSize:13, fontWeight:700, cursor:disabled?"not-allowed":"pointer", letterSpacing:".04em", marginTop:6, opacity:disabled?0.35:1 });
  const backBtn = { background:"transparent", color:"#aaa", border:"1px solid #2e2e2e", borderRadius:99, padding:"11px 0", width:"100%", fontFamily:"'DM Mono',monospace", fontSize:12, cursor:"pointer", marginTop:8 };
  const handlePrice = (val) => set("price", val.replace(/[^0-9.]/g,"").replace(/(\..*)\./g,"$1"));

  const steps = [
    // Step 0 – The buy
    <div key={0} style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ fontFamily:"'Libre Baskerville',Georgia,serif", color:"#ccc", fontSize:13, marginBottom:4 }}>Step 1 of 4 — The buy</div>
      <div>
        <label style={lbl}>Product or place *</label>
        <input style={inp} placeholder="e.g. Pip & Nut Almond Butter Cups" value={f.product} onChange={e=>set("product",e.target.value)} />
      </div>
      <div>
        <label style={lbl}>Category *</label>
        <div style={{ fontSize:11, color:"#666", fontFamily:"'LBBody',sans-serif", marginBottom:6 }}>
          Select all that apply
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
          {Object.entries(CAT_META).filter(([k])=>k!=="all").map(([c,m]) => {
            const isActive = f.categories.includes(c);
            return (
              <button key={c} onClick={()=>toggleCategory(c)} style={{
                padding:"10px 4px", borderRadius:10, border:"none", lineHeight:1.5,
                outline:`1.5px solid ${isActive ? m.color : "#1e1e1e"}`,
                background: isActive ? `${m.color}14` : "#161616",
                color: isActive ? m.color : "#444",
                fontFamily:"'DM Mono',monospace", fontSize:11, cursor:"pointer", transition:"all .15s",
                position:"relative",
              }}>
                {m.emoji}<br/>{c}
                {isActive && f.categories.length > 1 && (
                  <span style={{ position:"absolute", top:4, right:6, fontSize:8, color:m.color }}>✓</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div><label style={lbl}>Where to get it</label><input style={inp} placeholder="Tesco, Amazon, local deli…" value={f.where} onChange={e=>set("where",e.target.value)} /></div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <div>
          <label style={lbl}>Price</label>
          <div style={{ position:"relative" }}>
            <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"#f0ede8", fontFamily:"'DM Mono',monospace", fontSize:14, pointerEvents:"none" }}>£</span>
            <input style={{ ...inp, paddingLeft:26 }} placeholder="3.99" value={f.price} onChange={e=>handlePrice(e.target.value)} />
          </div>
        </div>
        <div>
          <label style={lbl}>Value</label>
          <select value={f.priceRange} onChange={e=>set("priceRange",e.target.value)} style={{ ...inp, cursor:"pointer", appearance:"none", backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23555'/%3E%3C/svg%3E")`, backgroundRepeat:"no-repeat", backgroundPosition:"calc(100% - 14px) center" }}>
            {PRICE_RANGE.map(p => <option key={p.id} value={p.id} style={{ background:"#161616" }}>{p.symbol} — {p.label}</option>)}
          </select>
        </div>
      </div>
      <button style={nextBtn(!f.product)} onClick={()=>f.product && setStep(1)}>Next →</button>
    </div>,

    // Step 1 – Score & name
    <div key={1} style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ fontFamily:"'Libre Baskerville',Georgia,serif", color:"#ccc", fontSize:13, marginBottom:4 }}>Step 2 of 4 — Your verdict</div>
      <div>
        <label style={lbl}>Score *</label>
        <ScoreSelector value={f.rating} interactive onChange={v=>set("rating",v)} />
      </div>
      <div>
        <label style={lbl}>Your honest review *</label>
        <textarea style={{ ...inp, minHeight:100, resize:"vertical" }} placeholder="What made it worth buying? Be specific." value={f.review} onChange={e=>set("review",e.target.value)} />
      </div>
      <div style={{ background:"#141414", border:"1px solid #1c1c1c", borderRadius:10, padding:"12px 14px", fontSize:12, color:"#ccc", fontFamily:"'DM Mono',monospace", lineHeight:1.6 }}>
        ✓ Your name shows on the review so people know it's real.
      </div>
      <div><label style={lbl}>Your name *</label><input style={inp} placeholder="First name + initial (e.g. Priya K.)" value={f.submitter} onChange={e=>set("submitter",e.target.value)} /></div>
      <button
        style={nextBtn(!(f.rating !== null && f.review && f.submitter))}
        onClick={()=>{ if(f.rating !== null && f.review && f.submitter){ setStep(2); } }}>
        Next →
      </button>
      <button style={backBtn} onClick={()=>setStep(0)}>← Back</button>
    </div>,

    // Step 2 – Dietary info
    <div key={2} style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ fontFamily:"'Libre Baskerville',Georgia,serif", color:"#ccc", fontSize:13, marginBottom:4 }}>Step 3 of 4 — Dietary info</div>
      <div style={{ background:"#141414", border:"1px solid #1c1c1c", borderRadius:10, padding:"12px 14px", fontSize:12, color:"#bbb", fontFamily:"'DM Mono',monospace", lineHeight:1.7 }}>
        Tag any diets this suits. Optional — helps people filter for what works for them.
      </div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
        {DIET_TAGS.map(tag => (
          <button key={tag.id} onClick={()=>toggleDiet(tag.id)} style={{
            padding:"8px 14px", borderRadius:99, fontSize:12, cursor:"pointer", transition:"all .15s",
            border:`1.5px solid ${f.dietTags.includes(tag.id) ? "#BBB" : "#1e1e1e"}`,
            background: f.dietTags.includes(tag.id) ? "#ffffff14" : "#161616",
            color: f.dietTags.includes(tag.id) ? "#f0ede8" : "#AAA",
            fontFamily:"'DM Mono',monospace",
          }}>
            {tag.label}
          </button>
        ))}
      </div>
      <button style={nextBtn(false)} onClick={()=>setStep(3)}>Next →</button>
      <button style={backBtn} onClick={()=>setStep(1)}>← Back</button>
    </div>,

    // Step 3 – Links
    <div key={3} style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ fontFamily:"'Libre Baskerville',Georgia,serif", color:"#ccc", fontSize:13, marginBottom:4 }}>Step 4 of 4 — Links (optional)</div>
      <div style={{ background:"#141414", border:"1px solid #1c1c1c", borderRadius:10, padding:"12px 14px", fontSize:12, color:"#bbb", fontFamily:"'DM Mono',monospace", lineHeight:1.7 }}>
        Help readers find it instantly. Both fields are optional — an admin can fill them in later.
      </div>
      <div>
        <label style={lbl}>Website or Instagram link</label>
        <input style={inp} placeholder="https://leon.co or https://instagram.com/..." value={f.link} onChange={e=>set("link",e.target.value)} />
      </div>
      <div>
        <label style={lbl}>Address or postcode for map</label>
        <input style={inp} placeholder="e.g. Leon, London Bridge SE1 or SW1A 1AA" value={f.mapQuery} onChange={e=>set("mapQuery",e.target.value)} />
        <div style={hint}>Typed exactly into Google Maps when tapped.</div>
      </div>
      <button style={nextBtn(false)} onClick={()=>{ onSubmit(f); setStep(4); }}>Submit for approval →</button>
      <button style={backBtn} onClick={()=>setStep(2)}>← Back</button>
    </div>,

    // Done
    <div key={4} style={{ textAlign:"center", padding:"30px 0 10px" }}>
      <div style={{ fontSize:48, marginBottom:16 }}>✦</div>
      <div style={{ fontFamily:"'Libre Baskerville',Georgia,serif", fontSize:22, color:"#f0ede8", marginBottom:8 }}>Nice one.</div>
      <div style={{ fontSize:13, color:"#ccc", lineHeight:1.7, marginBottom:28 }}>Your review is in the queue.<br/>It'll go live once approved.</div>
      <button onClick={onClose} style={{ background:"#C8FF47", color:"#0a0a0a", border:"none", borderRadius:99, padding:"13px 32px", fontFamily:"'DM Mono',monospace", fontSize:13, fontWeight:700, cursor:"pointer" }}>Back to board</button>
    </div>,
  ];

  const dots = step < 4 ? (
    <div style={{ display:"flex", gap:6, justifyContent:"center", marginBottom:22 }}>
      {[0,1,2,3].map(i => <div key={i} style={{ width:i===step?20:6, height:6, borderRadius:99, background:i<step?"#C8FF4788":i===step?"#C8FF47":"#1e1e1e", transition:"all .3s" }} />)}
    </div>
  ) : null;

  return <>{dots}{steps[step]}</>;
}

// ── Admin queue ───────────────────────────────────────
function AdminQueue({ pending, onApprove, onReject, approved, onEditApproved, onUpdatePending }) {
  const [editingId, setEditingId] = useState(null);
  const [editFields, setEditFields] = useState({ link:"", mapQuery:"" });

  const inp = { width:"100%", background:"#0f0f0f", border:"1px solid #2e2e2e", borderRadius:8, padding:"10px 12px", color:"#f0ede8", fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"system-ui,sans-serif" };
  const lbl = { fontSize:9, fontFamily:"'DM Mono',monospace", color:"#bbb", letterSpacing:".12em", textTransform:"uppercase", display:"block", marginBottom:6, fontWeight:600 };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>

      {/* Pending section */}
      <div style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:"#CCC", letterSpacing:".14em", textTransform:"uppercase", marginBottom:8 }}>
        Pending approval {pending.length > 0 && `(${pending.length})`}
      </div>
      {pending.length === 0 && (
        <div style={{ fontSize:13, color:"#BBB", fontFamily:"'DM Mono',monospace", marginBottom:20, paddingBottom:20, borderBottom:"1px solid #141414" }}>
          All clear ✦
        </div>
      )}
      {pending.map(r => {
        const rawDiet = r.diet_tags ?? r.dietTags ?? [];
        const dietTags = Array.isArray(rawDiet)
          ? rawDiet
          : typeof rawDiet === 'string' && rawDiet.length > 2
            ? rawDiet.replace(/[{}]/g, '').split(',').map(s => s.trim())
            : [];
        return (
          <div key={r.id} style={{ background:"#141414", border:"1px solid #2e2e2e", borderRadius:12, padding:16, marginBottom:6 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <span style={{ fontFamily:"'Libre Baskerville',Georgia,serif", color:"#f0ede8", fontSize:15, fontWeight:700 }}>{r.product}</span>
              <ScoreSelector value={r.rating} />
            </div>
            <p style={{ margin:"0 0 6px", fontSize:13, color:"#CCC", fontStyle:"italic", fontFamily:"'Libre Baskerville',Georgia,serif" }}>"{r.review}"</p>
            <div style={{ fontSize:10, color:"#CCC", fontFamily:"'DM Mono',monospace", marginBottom:6, letterSpacing:".06em" }}>
              {r.submitter} · {r.category} · {r.where} · £{r.price} {priceSymbol(r.price_range ?? r.priceRange)}
            </div>
            {dietTags.length > 0 && (
              <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:10 }}>
                {dietTags.map(tag => {
                  const meta = DIET_TAGS.find(d=>d.id===tag);
                  return meta ? <span key={tag} style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:"#ccc", background:"#161616", border:"1px solid #666", padding:"2px 7px", borderRadius:99 }}>{meta.label}</span> : null;
                })}
              </div>
            )}
            <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:12, padding:"10px 0", borderTop:"1px solid #1a1a1a" }}>
              <div style={{ fontSize:9, fontFamily:"'DM Mono',monospace", color:"#CCC", letterSpacing:".12em", textTransform:"uppercase" }}>Add links before approving</div>
              <input style={inp} placeholder="Link (website / instagram)" value={r.link || ""} onChange={e=>onUpdatePending(r.id,{link:e.target.value})} />
              <input style={inp} placeholder="Address or postcode for map" value={r.map_query ?? r.mapQuery ?? ""} onChange={e=>onUpdatePending(r.id,{map_query:e.target.value})} />
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={()=>onApprove(r.id)} style={{ flex:1, background:"#C8FF47", color:"#0a0a0a", border:"none", borderRadius:8, padding:"10px 0", fontFamily:"'DM Mono',monospace", fontSize:12, fontWeight:700, cursor:"pointer" }}>✓ Approve</button>
              <button onClick={()=>onReject(r.id)} style={{ flex:1, background:"transparent", color:"#E05A5A", border:"1px solid #E05A5A33", borderRadius:8, padding:"10px 0", fontFamily:"'DM Mono',monospace", fontSize:12, cursor:"pointer" }}>✕ Reject</button>
            </div>
          </div>
        );
      })}

      {/* Live reviews */}
      <div style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:"#CCC", letterSpacing:".14em", textTransform:"uppercase", margin:"16px 0 8px" }}>
        Edit live reviews
      </div>
      {approved.map(r => (
        <div key={r.id} style={{ background:"#141414", border:"1px solid #2e2e2e", borderRadius:12, padding:14, marginBottom:6 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontFamily:"'Libre Baskerville',Georgia,serif", color:"#f0ede8", fontSize:14, fontWeight:700 }}>{r.product}</span>
            <button
              onClick={()=> editingId===r.id ? setEditingId(null) : (setEditingId(r.id), setEditFields({ link:r.link||"", mapQuery:r.map_query??r.mapQuery??""}))}
              style={{ background:"none", border:"1px solid #666", borderRadius:6, color:"#bbb", fontSize:11, fontFamily:"'DM Mono',monospace", padding:"4px 10px", cursor:"pointer" }}>
              {editingId===r.id ? "cancel" : "edit links"}
            </button>
          </div>
          <div style={{ fontSize:10, color:"#CCC", fontFamily:"'DM Mono',monospace", marginTop:4, letterSpacing:".06em" }}>{r.submitter} · {r.where}</div>
          {editingId !== r.id && (
            <div style={{ marginTop:8, display:"flex", gap:6, flexWrap:"wrap" }}>
              {r.link ? <span style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:"#C8FF4788", background:"#C8FF4710", padding:"3px 8px", borderRadius:99 }}>↗ {r.link.slice(0,28)}{r.link.length>28?"…":""}</span> : <span style={{ fontSize:10, color:"#BBB", fontFamily:"'DM Mono',monospace" }}>no link</span>}
              {(r.map_query||r.mapQuery) ? <span style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:"#6fcf6f88", background:"#6fcf6f10", padding:"3px 8px", borderRadius:99 }}>📍 {(r.map_query??r.mapQuery).slice(0,25)}…</span> : <span style={{ fontSize:10, color:"#BBB", fontFamily:"'DM Mono',monospace" }}>no map</span>}
            </div>
          )}
          {editingId === r.id && (
            <div style={{ marginTop:12, display:"flex", flexDirection:"column", gap:10 }}>
              <div><label style={lbl}>Website or Instagram link</label><input style={inp} placeholder="https://..." value={editFields.link} onChange={e=>setEditFields(p=>({...p,link:e.target.value}))} /></div>
              <div><label style={lbl}>Address or postcode</label><input style={inp} placeholder="e.g. Leon London Bridge SE1" value={editFields.mapQuery} onChange={e=>setEditFields(p=>({...p,mapQuery:e.target.value}))} /></div>
              <button onClick={()=>{ onEditApproved(r.id, editFields); setEditingId(null); }} style={{ background:"#C8FF47", color:"#0a0a0a", border:"none", borderRadius:8, padding:"10px 0", fontFamily:"'LBBody', sans-serif", fontSize:12, fontWeight:700, cursor:"pointer", transition:"all .2s", }}>Save changes ✓</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Rate Limiter 
const SUBMISSION_KEY = "lb_submissions";
const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

function getRecentSubmissions() {
  try {
    const raw = localStorage.getItem(SUBMISSION_KEY);
    const timestamps = raw ? JSON.parse(raw) : [];
    const cutoff = Date.now() - RATE_WINDOW_MS;
    return timestamps.filter(t => t > cutoff);
  } catch { return []; }
}

function recordSubmission() {
  try {
    const recent = getRecentSubmissions();
    localStorage.setItem(SUBMISSION_KEY, JSON.stringify([...recent, Date.now()]));
  } catch {}
}

function canSubmit() {
  return getRecentSubmissions().length < RATE_LIMIT;
}

// ── Main app ──────────────────────────────────────────
export default function App() {
  const [reviews, setReviews] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("all");
  const [showSaved, setShowSaved] = useState(false);
  const [activeDiet, setActiveDiet] = useState([]);
  const [activeScore, setActiveScore] = useState(null);
  const [rateLimited, setRateLimited] = useState(!canSubmit());
  const [saved, setSaved] = useState(() => {
    try { return JSON.parse(localStorage.getItem("lb_saved") || "[]"); }
    catch { return []; }
  });

  const toggleSave = (id) => {
    setSaved(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem("lb_saved", JSON.stringify(next));
      return next;
    });
  };
  const [modal, setModal] = useState(null);
  const [adminOk, setAdminOk] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [splash, setSplash] = useState(true);
  const [showAppIntro, setShowAppIntro] = useState(() => {
    try { return localStorage.getItem("lb_intro_seen") !== "true"; }
    catch { return true; }
  });
  const [showSubmitGuide, setShowSubmitGuide] = useState(false);
  const [introStep, setIntroStep] = useState(0);
  const [submitGuideStep, setSubmitGuideStep] = useState(0);

  const dismissIntro = (dontShow = false) => {
    if (dontShow) localStorage.setItem("lb_intro_seen", "true");
    setShowAppIntro(false);
  };

  const dismissSubmitGuide = (dontShow = false) => {
    if (dontShow) localStorage.setItem("lb_submit_guide_seen", "true");
    setShowSubmitGuide(false);
    setModal("submit");
  };
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem("lb_theme") !== "light"; }
    catch { return true; }
  });

  const toggleTheme = () => {
    setDarkMode(d => {
      const next = !d;
      localStorage.setItem("lb_theme", next ? "dark" : "light");
      return next;
    });
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setAdminUser(session.user);
      });
    async function loadData() {
      const { data: liveReviews } = await supabase
        .from('reviews').select('*').order('upvotes', { ascending: false });
      const { data: pendingReviews } = await supabase
        .from('pending_reviews').select('*').order('date', { ascending: false });
      if (liveReviews) setReviews(liveReviews);
      if (pendingReviews) setPending(pendingReviews);
      setLoading(false);
      setTimeout(() => setSplash(false), 600);
    }
    loadData();
  }, []);

  const toggleDietFilter = (id) => setActiveDiet(p => p.includes(id) ? p.filter(x=>x!==id) : [...p, id]);

  const filtered = [...reviews]
    .filter(r => !showSaved || saved.includes(r.id))
    .filter(r => cat === "all" || (r.categories ?? [r.category]).includes(cat))
    .filter(r => activeDiet.length === 0 || activeDiet.every(d => (r.diet_tags ?? []).includes(d)))
    .filter(r => activeScore === null || r.rating === activeScore)
    .sort((a,b) => b.upvotes - a.upvotes);

  const upvote = async (id) => {
    setReviews(rs => rs.map(r => r.id===id ? {...r, upvotes:r.upvotes+1} : r));
    await supabase.rpc('increment_upvotes', { row_id: id });
  };

  const submit = async (f) => {
    const newReview = {
      product:     f.product,
      category:    f.category,
      categories:  f.categories,
      rating:      f.rating,
      review:      f.review,
      submitter:   f.submitter,
      where:       f.where,
      price:       f.price,
      price_range: f.priceRange,
      link:        f.link,
      map_query:   f.mapQuery,
      diet_tags:   f.dietTags,
      verified: !!(await supabase.auth.getSession()).data.session,
      upvotes:     0,
      date:        new Date().toISOString().slice(0, 10),
    };
    const { data, error } = await supabase.from('pending_reviews').insert([newReview]).select();
    if (error) { console.error('Submit error:', error); }
    else { setPending(p => [...p, data[0]]); recordSubmission(); setRateLimited(!canSubmit()); } 
  };

  const approve = async (id) => {
    const r = pending.find(x => x.id === id);
    if (!r) return;
    const { id: _id, ...reviewData } = r;
    const { data, error } = await supabase.from('reviews').insert([{ ...reviewData, verified: true }]).select();
    if (error) { console.error('Approve error:', error); return; }
    await supabase.from('pending_reviews').delete().eq('id', id);
    setReviews(rs => [...rs, data[0]]);
    setPending(p => p.filter(x => x.id !== id));
  };

  const reject = async (id) => {
    const { error } = await supabase.from('pending_reviews').delete().eq('id', id);
    if (error) { console.error('Reject error:', error); return; }
    setPending(p => p.filter(x => x.id !== id));
  };

  const editApproved = async (id, fields) => {
    const update = { link: fields.link, map_query: fields.mapQuery };
    await supabase.from('reviews').update(update).eq('id', id);
    setReviews(rs => rs.map(r => r.id===id ? {...r, ...update} : r));
  };

  const updatePending = (id, fields) => setPending(p => p.map(r => r.id===id ? {...r,...fields} : r));

  const openAdmin = () => {
  if (adminUser) { setModal("admin"); return; }
  setModal("adminLogin");
  };

  const handleAdminLogin = async () => {
    setAdminLoading(true);
    setAdminError("");
    const { data, error } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });
    setAdminLoading(false);
    if (error) { setAdminError("Incorrect email or password."); return; }
    setAdminUser(data.user);
    setModal("admin");
  };

  const handleAdminLogout = async () => {
    await supabase.auth.signOut();
    setAdminUser(null);
    setModal(null);
  };

  const T = darkMode ? {
    bg:        "#080808",
    surface:   "#111",
    surface2:  "#161616",
    border:    "#1c1c1c",
    border2:   "#2a2a2a",
    text:      "#f0ede8",
    textMid:   "#aaa",
    textDim:   "#555",
    pill:      "#232323",
    cardBg:    "#111",
    sheetBg:   "#0d0d0d",
    sheetBorder:"#202020",
  } : {
    bg:        "#f5f2ee",
    surface:   "#ffffff",
    surface2:  "#f0ede8",
    border:    "#d0c8be",
    border2:   "#b8b0a6",
    text:      "#0f0d0b",
    textMid:   "#2e2a26",
    textDim:   "#6b6158",
    pill:      "#e0d8d0",
    cardBg:    "#ffffff",
    sheetBg:   "#faf8f5",
    sheetBorder:"#d0c8be",
  };

  return (
    <>
    {splash && (
      <div style={{
        position:"fixed", inset:0, zIndex:999,
        background: T.bg,
        display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        animation: loading ? "none" : "splashFadeOut .8s ease forwards",
        pointerEvents: loading ? "all" : "none",
      }}>
        <div style={{
          display:"flex", flexDirection:"column", alignItems:"center", gap:16,
          animation:"splashFadeIn .6s cubic-bezier(.16,1,.3,1) forwards",
        }}>
          <div style={{
            fontSize:48, color:"#C8FF47",
            animation:"pulse 2s ease infinite",
          }}>✦</div>
          <h1 style={{ 
            margin:"0 0 6px", 
            fontFamily:"'LBTitle', sans-serif", 
            fontSize:"clamp(48px, 11vw, 120px)", 
            lineHeight:1, color:T.text, 
            fontWeight:400, 
            letterSpacing:".04em", 
            textTransform:"uppercase" 
            }}>
            LEGIT BUYS
          </h1>
          <p style={{ 
            margin:"0 0 24px", 
            color:T.textMid, 
            fontSize:13.5, 
            lineHeight:1.6, 
            fontFamily:"'LBBody', sans-serif", 
            letterSpacing:".18em", 
            textTransform:"uppercase" 
            }}>
            Real picks from real foodies
          </p>
        </div>
        {loading && (
          <div style={{
            position:"absolute", bottom:60,
            display:"flex", gap:6,
          }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width:5, height:5, borderRadius:"50%",
                background:"#C8FF47",
                animation:`pulse 1.2s ease ${i * 0.2}s infinite`,
              }} />
            ))}
          </div>
        )}
      </div>
    )}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,700;1,400&family=DM+Mono:wght@400;600;700&display=swap');
        *{box-sizing:border-box;} body{margin:0;background:${T.bg};transition:background .3s;}
        @keyframes sheetUp  {from{transform:translateY(60px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes holo     {0%{background-position:0% 50%;filter:hue-rotate(0deg)}50%{background-position:100% 50%;filter:hue-rotate(180deg)}100%{background-position:0% 50%;filter:hue-rotate(360deg)}}
        @keyframes shimmer  {0%{transform:translateX(-100%) rotate(45deg)}100%{transform:translateX(200%) rotate(45deg)}}
        @keyframes shimmer-bar{0%{background-position:0% 50%}100%{background-position:200% 50%}}
        @keyframes popIn {0%{transform:scale(0.85);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
        @keyframes fadeSlideUp {from{transform:translateY(8px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes splashFadeIn {from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes splashFadeOut {from{opacity:1}to{opacity:0;pointer-events:none}}
        @keyframes pulse {0%,100%{opacity:1}50%{opacity:0.4}}
        ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:#1e1e1e;border-radius:3px}
        input::placeholder,textarea::placeholder{color:#555}
        input:focus,textarea:focus,select:focus{border-color:#555!important;outline:none}
        a:hover{opacity:.75} select option{background:#161616}
      `}</style>

      <div style={{ maxWidth:520, margin:"0 auto", minHeight:"100vh", paddingBottom:120, overflowX:"hidden", background:T.bg, transition:"background .3s" }}>
        <div style={{ padding:"40px 18px 0", position:"relative", background:T.bg }}>
          <div style={{ position:"absolute", top:38, right:18, display:"flex", alignItems:"center", gap:10 }}>
            <button
              onClick={toggleTheme}
              title="Toggle theme"
              style={{ background:"none", border:"none", fontSize:16, cursor:"pointer", color:T.textDim, transition:"color .2s", padding:0 }}>
              {darkMode ? "☀️" : "🌙"}
            </button>
            <button onClick={openAdmin} title="Admin" style={{ background:"none", border:"none", color:T.textDim, fontSize:19, cursor:"pointer", padding:0 }}>⚙</button>
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
            <span style={{ color:"#C8FF47", fontSize:16 }}>✦</span>
            <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:"#CCC", letterSpacing:".22em", textTransform:"uppercase" }}>Legit Buys</span>
          </div>
          <h1 style={{ margin:"0 0 6px", fontFamily:"'LBTitle', sans-serif", fontSize:"clamp(48px, 11vw, 120px)", lineHeight:1, color:"#f0ede8", fontWeight:400, letterSpacing:".04em", textTransform:"uppercase" }}>
            LEGIT BUYS
          </h1>
          <p style={{ margin:"0 0 24px", color:"#aaa", fontSize:13.5, lineHeight:1.6, fontFamily:"'LBBody', sans-serif", letterSpacing:".18em", textTransform:"uppercase" }}>Real picks from real foodies</p>

          <div style={{ padding:"14px 0", borderTop:`1px solid ${T.border}`, borderBottom:`1px solid ${T.border}`, marginBottom:20 }}>
            <div style={{ fontSize:9, fontFamily:"'DM Mono',monospace", color:"#CCC", letterSpacing:".14em", textTransform:"uppercase", marginBottom:10 }}>Filter by score</div>
            <div style={{ display:"flex", gap:8 }}>
              {SCORE_META.map(m => {
                const color = SCORE_COLORS[m.value];
                const isActive = activeScore === m.value;
                return (
                  <button key={m.value} onClick={()=>setActiveScore(isActive ? null : m.value)} style={{
                    flex:1, padding:"10px 4px", borderRadius:10, border:"none", lineHeight:1.5,
                    outline:`1.5px solid ${isActive ? color : `${color}44`}`,
                    background: isActive ? `${color}18` : `${color}08`,
                    color: isActive ? color : `${color}99`,
                    fontFamily:"'DM Mono',monospace", fontSize:10, cursor:"pointer",
                    transition:"all .15s", fontWeight: isActive ? 700 : 400,
                  }}>
                    {m.value}<br/>{m.short}
                  </button>
                );
              })}
            </div>
            {activeScore !== null && (
              <button onClick={()=>setActiveScore(null)} style={{ background:"none", border:"none", color:"#bbb", fontSize:11, fontFamily:"'DM Mono',monospace", cursor:"pointer", padding:"8px 0 0", letterSpacing:".06em" }}>
                ✕ clear
              </button>
            )}
          </div>

          <div style={{ display:"flex", gap:7, overflowX:"auto", scrollbarWidth:"none", paddingBottom:8 }}>
            {Object.keys(CAT_META).map(c=><Pill key={c} cat={c} active={cat===c} onClick={()=>setCat(c)} />)}
          </div>

          <button
            onClick={() => setShowSaved(s => !s)}
            style={{
              marginTop:2, marginBottom:2,
              background: showSaved ? "#ffffff14" : "transparent",
              border: `1px solid ${showSaved ? "#f0ede8" : "#2e2e2e"}`,
              color: showSaved ? "#f0ede8" : "#BBB",
              borderRadius:99, padding:"7px 16px", fontSize:11,
              fontFamily:"'DM Mono',monospace", cursor:"pointer", transition:"all .2s",
            }}>
            {showSaved ? "★ My saves" : "☆ My saves"}
          </button>

          <div style={{ display:"flex", gap:6, overflowX:"auto", scrollbarWidth:"none", paddingBottom:4, paddingTop:8 }}>
            {DIET_TAGS.map(tag=><DietPill key={tag.id} tag={tag} active={activeDiet.includes(tag.id)} onClick={()=>toggleDietFilter(tag.id)} />)}
          </div>

          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:10, minHeight:24 }}>
            {activeDiet.length > 0 ? (
              <button onClick={()=>setActiveDiet([])} style={{ background:"none", border:"none", color:"#888", fontSize:11, fontFamily:"'LBBody',sans-serif", cursor:"pointer", padding:0, letterSpacing:".06em" }}>
                ✕ clear filters
              </button>
            ) : <span />}
            <a
              href="/scoring-guide.html"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize:11, fontFamily:"'LBBody', sans-serif", color:"#C8FF47",
                letterSpacing:".08em", textDecoration:"none", transition:"all .15s",
                background:"#C8FF4714", border:"1px solid #C8FF4733",
                padding:"6px 14px", borderRadius:99,
              }}
              onMouseEnter={e=>e.currentTarget.style.background="#C8FF4728"}
              onMouseLeave={e=>e.currentTarget.style.background="#C8FF4714"}
            >
              ✦ Review &amp; scoring guide
            </a>
          </div>
        </div>

        <div style={{ padding:"18px 12px", display:"flex", flexDirection:"column", gap:10 }}>
          {loading && <div style={{ textAlign:"center", padding:"60px 0", color:"#CCC", fontSize:13, fontFamily:"'DM Mono',monospace", letterSpacing:".1em" }}>loading buys...</div>}
          {!loading && filtered.length===0 && <div style={{ textAlign:"center", padding:"60px 0", color:"#222", fontSize:13, fontFamily:"'DM Mono',monospace" }}>No reviews match these filters.</div>}
          {filtered.map(r => <Card key={r.id} r={r} onUp={upvote} saved={saved.includes(r.id)} onSave={toggleSave} theme={T} />)}
        </div>
      </div>

      <div style={{ position:"fixed", bottom:28, left:"50%", transform:"translateX(-50%)", zIndex:100 }}>
        <button
          onClick={() => {
            if (rateLimited) {
              setModal("rateLimited");
            } else {
              const seen = localStorage.getItem("lb_submit_guide_seen") === "true";
              if (!seen) {
                setSubmitGuideStep(0);
                setShowSubmitGuide(true);
              } else {
                setModal("submit");
              }
            }
          }}
          onMouseDown={e => e.currentTarget.style.transform="scale(0.96)"}
          onMouseUp={e => e.currentTarget.style.transform="scale(1)"}
          onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}
          style={{
            background: rateLimited ? "#111" : "#C8FF47",
            color: rateLimited ? "#444" : "#0a0a0a",
            border: rateLimited ? "1px solid #2a2a2a" : "none",
            borderRadius:99, padding:"16px 36px",
            fontFamily:"'LBTitle', sans-serif",
            fontSize:"clamp(16px, 4vw, 22px)",
            letterSpacing:".06em",
            cursor:"pointer", transition:"all .2s",
            boxShadow: rateLimited ? "none" : "0 4px 24px #C8FF4744",
          }}>
          {rateLimited ? "🔒 Submit" : "SUBMIT A LEGIT BUY"}
        </button>
      </div>
      
      {showAppIntro && !splash && <AppIntro onDismiss={dismissIntro} theme={T} />}
      {showSubmitGuide && <SubmitGuide onDismiss={dismissSubmitGuide} theme={T} />}

      {modal==="submit" && <Sheet title="Submit a Legit Buy" onClose={()=>setModal(null)}><SubmitFlow onSubmit={submit} onClose={()=>setModal(null)} /></Sheet>}

      {modal==="adminLogin" && (
        <Sheet title="Admin login" onClose={()=>setModal(null)}>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div>
              <label style={{ fontSize:9, fontFamily:"'DM Mono',monospace", color:"#bbb", letterSpacing:".14em", textTransform:"uppercase", display:"block", marginBottom:7, fontWeight:600 }}>Email</label>
              <input
                type="email"
                value={adminEmail}
                onChange={e=>setAdminEmail(e.target.value)}
                placeholder="your@email.com"
                style={{ width:"100%", background:"#161616", border:"1px solid #666", borderRadius:10, padding:"12px 14px", color:"#f0ede8", fontSize:14, outline:"none", boxSizing:"border-box", fontFamily:"system-ui,sans-serif" }}
              />
            </div>
            <div>
              <label style={{ fontSize:9, fontFamily:"'DM Mono',monospace", color:"#bbb", letterSpacing:".14em", textTransform:"uppercase", display:"block", marginBottom:7, fontWeight:600 }}>Password</label>
              <input
                type="password"
                value={adminPassword}
                onChange={e=>setAdminPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={e=>e.key==="Enter" && handleAdminLogin()}
                style={{ width:"100%", background:"#161616", border:"1px solid #666", borderRadius:10, padding:"12px 14px", color:"#f0ede8", fontSize:14, outline:"none", boxSizing:"border-box", fontFamily:"system-ui,sans-serif" }}
              />
            </div>
            {adminError && <div style={{ fontSize:12, color:"#E05A5A", fontFamily:"'DM Mono',monospace" }}>{adminError}</div>}
            <button
              onClick={handleAdminLogin}
              disabled={adminLoading}
              style={{ background:"#C8FF47", color:"#0a0a0a", border:"none", borderRadius:99, padding:"13px 0", width:"100%", fontFamily:"'DM Mono',monospace", fontSize:13, fontWeight:700, cursor:adminLoading?"not-allowed":"pointer", opacity:adminLoading?0.5:1, marginTop:4 }}>
              {adminLoading ? "Logging in…" : "Log in →"}
            </button>
          </div>
        </Sheet>
      )}

      {modal==="rateLimited" && (
        <Sheet title="Submission limit reached" onClose={()=>setModal(null)}>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ background:"#141414", border:"1px solid #1c1c1c", borderRadius:10, padding:"14px 16px", fontSize:13, color:"#ccc", fontFamily:"'DM Mono',monospace", lineHeight:1.7 }}>
              You've submitted {RATE_LIMIT} reviews in the last 24 hours — that's the daily limit to keep things quality over quantity.
            </div>
            <div style={{ fontSize:13, color:"#bbb", fontFamily:"'Libre Baskerville',Georgia,serif", lineHeight:1.7 }}>
              Come back tomorrow to add more. In the meantime, upvote the reviews you agree with.
            </div>
            <button onClick={()=>setModal(null)} style={{ background:"#C8FF47", color:"#0a0a0a", border:"none", borderRadius:99, padding:"13px 0", width:"100%", fontFamily:"'DM Mono',monospace", fontSize:13, fontWeight:700, cursor:"pointer" }}>
              Got it
            </button>
          </div>
        </Sheet>
      )}

      {modal==="admin" && (
        <Sheet title={`Admin${pending.length?` · ${pending.length} pending`:""}`} onClose={()=>setModal(null)}>
          <AdminQueue pending={pending} onApprove={approve} onReject={reject} approved={reviews} onEditApproved={editApproved} onUpdatePending={updatePending} />
          <div style={{ marginTop:24, paddingTop:16, borderTop:"1px solid #1a1a1a" }}>
            <div style={{ fontSize:11, color:"#CCC", fontFamily:"'DM Mono',monospace", marginBottom:10 }}>
              Logged in as {adminUser?.email}
            </div>
            <button onClick={handleAdminLogout} style={{ background:"transparent", color:"#E05A5A", border:"1px solid #E05A5A33", borderRadius:99, padding:"9px 20px", fontFamily:"'DM Mono',monospace", fontSize:12, cursor:"pointer" }}>
              Log out
            </button>
          </div>
        </Sheet>
      )}
    </>
  );
}