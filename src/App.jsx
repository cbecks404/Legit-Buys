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

const SCORE_COLORS = ["#555", "#60C3F5", "#F4A942", "#C8FF47"];
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
                color: isActive ? color : "#444",
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
    <button onClick={onClick} style={{
      background: active ? m.color : "transparent",
      color: active ? "#0a0a0a" : "#4a4a4a",
      border: `1.5px solid ${active ? m.color : "#232323"}`,
      borderRadius: 99, padding: "5px 14px", fontSize: 12,
      fontFamily: "'DM Mono',monospace", cursor: "pointer",
      fontWeight: active ? 700 : 400, whiteSpace: "nowrap", transition: "all .15s",
    }}>
      {m.emoji} {cat === "all" ? "All" : cat[0].toUpperCase() + cat.slice(1)}
    </button>
  );
}

// ── Diet pill ─────────────────────────────────────────
function DietPill({ tag, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: active ? "#ffffff14" : "transparent",
      color: active ? "#f0ede8" : "#3a3a3a",
      border: `1.5px solid ${active ? "#555" : "#1e1e1e"}`,
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
function Card({ r, onUp }) {
  console.log('Card rendering:', r);
  const [upped, setUpped] = useState(false);
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
          : "#111",
        backgroundSize: isHolo ? "300% 300%" : "auto",
        animation: isHolo ? "holo 6s ease infinite" : "none",
        border: "1px solid #1c1c1c",
        borderRadius: 14, padding: "18px 18px 14px",
        display: "flex", flexDirection: "column", gap: 10,
        position: "relative", overflow: "hidden",
        boxShadow: isHolo ? "0 0 30px #C8FF4722, 0 0 60px #60C3F522" : "none",
        transition: "transform .15s",
      }}
    >
      {/* Top accent / rainbow bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: isHolo
          ? "linear-gradient(90deg,#C8FF47,#60C3F5,#F4A942,#F07070,#C084FC,#C8FF47)"
          : accent,
        backgroundSize: "200%",
        animation: isHolo ? "shimmer-bar 3s linear infinite" : "none",
        borderRadius: "14px 14px 0 0",
      }} />

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
            <div style={{ fontSize:9, fontFamily:"'DM Mono',monospace", color:accent, letterSpacing:".18em", textTransform:"uppercase", fontWeight:600, marginBottom:4 }}>
              {CAT_META[r.category]?.emoji} {r.category}
            </div>
            <div style={{ fontFamily:"'Libre Baskerville',Georgia,serif", fontSize:16, color:"#f0ede8", lineHeight:1.25, fontWeight:700 }}>{r.product}</div>
          </div>
          <ScoreSelector value={r.rating} />
        </div>

        {/* Review text */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8, position:"relative", zIndex:1 }}></div>
        <p style={{ margin:0, fontSize:13.5, color:"#777", lineHeight:1.65, fontStyle:"italic", fontFamily:"'Libre Baskerville',Georgia,serif" }}>"{r.review}"</p>

        {/* Diet tags */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8, position:"relative", zIndex:1 }}></div>
        {dietTags.length > 0 && (
          <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
            {dietTags.map(tag => {
              const meta = DIET_TAGS.find(d => d.id === tag);
              return meta ? (
                <span key={tag} style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:"#555", background:"#161616", border:"1px solid #222", padding:"2px 8px", borderRadius:99 }}>
                  {meta.label}
                </span>
              ) : null;
            })}
          </div>
        )}

        {/* Links */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8, position:"relative", zIndex:1 }}></div>
        {hasLinks && (
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", paddingTop:2 }}>
            <LinkButton link={r.link} where={r.where} />
            <MapButton mapQuery={mapQuery} />
          </div>
        )}

        {/* Footer */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8, position:"relative", zIndex:1 }}></div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:2, paddingTop: hasLinks?8:0, borderTop: hasLinks?"1px solid #181818":"none" }}>
          <div>
            <div style={{ fontSize:11, color:"#3a3a3a", fontFamily:"'DM Mono',monospace" }}>
              {r.verified && <span style={{ color:"#C8FF47", marginRight:5 }}>✓</span>}
              {r.submitter} · {r.where}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:3 }}>
              <span style={{ fontSize:12, color:accent, fontFamily:"'DM Mono',monospace", fontWeight:600 }}>£{r.price}</span>
              {sym && <span style={{ fontSize:11, color:"#444", fontFamily:"'DM Mono',monospace", background:"#1a1a1a", border:"1px solid #222", padding:"1px 7px", borderRadius:99 }}>{sym}</span>}
            </div>
          </div>
          <button
            onClick={() => { if (!upped) { setUpped(true); onUp(r.id); }}}
            style={{
              background: upped ? `${accent}18` : "transparent",
              border: `1px solid ${upped ? accent : "#242424"}`,
              color: upped ? accent : "#444",
              borderRadius:99, padding:"5px 13px", fontSize:12,
              fontFamily:"'DM Mono',monospace", cursor: upped?"default":"pointer", transition:"all .2s",
            }}>
            ↑ {r.upvotes + (upped ? 1 : 0)}
          </button>
        </div>
      </div>
    </div>  
  );
}

// ── Bottom sheet ──────────────────────────────────────
function Sheet({ title, onClose, children }) {
  return (
    <div onClick={e => e.target===e.currentTarget && onClose()}
      style={{ position:"fixed", inset:0, background:"#000000cc", backdropFilter:"blur(10px)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:200 }}>
      <div style={{
        background:"#0d0d0d", borderTop:"1px solid #202020",
        borderRadius:"18px 18px 0 0", width:"100%", maxWidth:520,
        maxHeight:"92vh", overflowY:"auto", padding:"26px 22px 50px",
        animation:"sheetUp .25s cubic-bezier(.16,1,.3,1)",
      }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
          <span style={{ fontFamily:"'Libre Baskerville',Georgia,serif", fontSize:19, color:"#f0ede8", fontWeight:700 }}>{title}</span>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#383838", fontSize:22, cursor:"pointer", lineHeight:1, padding:"2px 6px" }}>✕</button>
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
    product:"", category:"snacks", rating:null, review:"",
    submitter:"", where:"", price:"", priceRange:"fair",
    link:"", mapQuery:"", dietTags:[],
  });
  const set = (k, v) => setF(p => ({...p, [k]:v}));
  const toggleDiet = (id) => setF(p => ({
    ...p,
    dietTags: p.dietTags.includes(id) ? p.dietTags.filter(t=>t!==id) : [...p.dietTags, id],
  }));

  const inp = { width:"100%", background:"#161616", border:"1px solid #222", borderRadius:10, padding:"12px 14px", color:"#f0ede8", fontSize:14, outline:"none", boxSizing:"border-box", fontFamily:"system-ui,sans-serif" };
  const lbl = { fontSize:9, fontFamily:"'DM Mono',monospace", color:"#444", letterSpacing:".14em", textTransform:"uppercase", display:"block", marginBottom:7, fontWeight:600 };
  const hint = { fontSize:11, color:"#333", fontFamily:"'DM Mono',monospace", marginTop:5, lineHeight:1.5 };
  const nextBtn = (disabled) => ({ background:"#C8FF47", color:"#0a0a0a", border:"none", borderRadius:99, padding:"13px 0", width:"100%", fontFamily:"'DM Mono',monospace", fontSize:13, fontWeight:700, cursor:disabled?"not-allowed":"pointer", letterSpacing:".04em", marginTop:6, opacity:disabled?0.35:1 });
  const backBtn = { background:"transparent", color:"#3a3a3a", border:"1px solid #1e1e1e", borderRadius:99, padding:"11px 0", width:"100%", fontFamily:"'DM Mono',monospace", fontSize:12, cursor:"pointer", marginTop:8 };
  const handlePrice = (val) => set("price", val.replace(/[^0-9.]/g,"").replace(/(\..*)\./g,"$1"));

  const steps = [
    // Step 0 – The buy
    <div key={0} style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ fontFamily:"'Libre Baskerville',Georgia,serif", color:"#555", fontSize:13, marginBottom:4 }}>Step 1 of 4 — The buy</div>
      <div>
        <label style={lbl}>Product or place *</label>
        <input style={inp} placeholder="e.g. Pip & Nut Almond Butter Cups" value={f.product} onChange={e=>set("product",e.target.value)} />
      </div>
      <div>
        <label style={lbl}>Category *</label>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
          {Object.entries(CAT_META).filter(([k])=>k!=="all").map(([c,m]) => (
            <button key={c} onClick={()=>set("category",c)} style={{
              padding:"10px 4px", borderRadius:10, border:"none", lineHeight:1.5,
              outline:`1.5px solid ${f.category===c ? m.color : "#1e1e1e"}`,
              background: f.category===c ? `${m.color}14` : "#161616",
              color: f.category===c ? m.color : "#444",
              fontFamily:"'DM Mono',monospace", fontSize:11, cursor:"pointer", transition:"all .15s",
            }}>
              {m.emoji}<br/>{c}
            </button>
          ))}
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
      <div style={{ fontFamily:"'Libre Baskerville',Georgia,serif", color:"#555", fontSize:13, marginBottom:4 }}>Step 2 of 4 — Your verdict</div>
      <div>
        <label style={lbl}>Score *</label>
        <ScoreSelector value={f.rating} interactive onChange={v=>set("rating",v)} />
      </div>
      <div>
        <label style={lbl}>Your honest review *</label>
        <textarea style={{ ...inp, minHeight:100, resize:"vertical" }} placeholder="What made it worth buying? Be specific." value={f.review} onChange={e=>set("review",e.target.value)} />
      </div>
      <div style={{ background:"#141414", border:"1px solid #1c1c1c", borderRadius:10, padding:"12px 14px", fontSize:12, color:"#555", fontFamily:"'DM Mono',monospace", lineHeight:1.6 }}>
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
      <div style={{ fontFamily:"'Libre Baskerville',Georgia,serif", color:"#555", fontSize:13, marginBottom:4 }}>Step 3 of 4 — Dietary info</div>
      <div style={{ background:"#141414", border:"1px solid #1c1c1c", borderRadius:10, padding:"12px 14px", fontSize:12, color:"#444", fontFamily:"'DM Mono',monospace", lineHeight:1.7 }}>
        Tag any diets this suits. Optional — helps people filter for what works for them.
      </div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
        {DIET_TAGS.map(tag => (
          <button key={tag.id} onClick={()=>toggleDiet(tag.id)} style={{
            padding:"8px 14px", borderRadius:99, fontSize:12, cursor:"pointer", transition:"all .15s",
            border:`1.5px solid ${f.dietTags.includes(tag.id) ? "#555" : "#1e1e1e"}`,
            background: f.dietTags.includes(tag.id) ? "#ffffff14" : "#161616",
            color: f.dietTags.includes(tag.id) ? "#f0ede8" : "#3a3a3a",
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
      <div style={{ fontFamily:"'Libre Baskerville',Georgia,serif", color:"#555", fontSize:13, marginBottom:4 }}>Step 4 of 4 — Links (optional)</div>
      <div style={{ background:"#141414", border:"1px solid #1c1c1c", borderRadius:10, padding:"12px 14px", fontSize:12, color:"#444", fontFamily:"'DM Mono',monospace", lineHeight:1.7 }}>
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
      <div style={{ fontSize:13, color:"#555", lineHeight:1.7, marginBottom:28 }}>Your review is in the queue.<br/>It'll go live once approved.</div>
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

  const inp = { width:"100%", background:"#0f0f0f", border:"1px solid #1e1e1e", borderRadius:8, padding:"10px 12px", color:"#f0ede8", fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"system-ui,sans-serif" };
  const lbl = { fontSize:9, fontFamily:"'DM Mono',monospace", color:"#444", letterSpacing:".12em", textTransform:"uppercase", display:"block", marginBottom:6, fontWeight:600 };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>

      {/* Pending section */}
      <div style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:"#333", letterSpacing:".14em", textTransform:"uppercase", marginBottom:8 }}>
        Pending approval {pending.length > 0 && `(${pending.length})`}
      </div>
      {pending.length === 0 && (
        <div style={{ fontSize:13, color:"#2a2a2a", fontFamily:"'DM Mono',monospace", marginBottom:20, paddingBottom:20, borderBottom:"1px solid #141414" }}>
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
          <div key={r.id} style={{ background:"#141414", border:"1px solid #1e1e1e", borderRadius:12, padding:16, marginBottom:6 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <span style={{ fontFamily:"'Libre Baskerville',Georgia,serif", color:"#f0ede8", fontSize:15, fontWeight:700 }}>{r.product}</span>
              <ScoreSelector value={r.rating} />
            </div>
            <p style={{ margin:"0 0 6px", fontSize:13, color:"#666", fontStyle:"italic", fontFamily:"'Libre Baskerville',Georgia,serif" }}>"{r.review}"</p>
            <div style={{ fontSize:10, color:"#333", fontFamily:"'DM Mono',monospace", marginBottom:6, letterSpacing:".06em" }}>
              {r.submitter} · {r.category} · {r.where} · £{r.price} {priceSymbol(r.price_range ?? r.priceRange)}
            </div>
            {dietTags.length > 0 && (
              <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:10 }}>
                {dietTags.map(tag => {
                  const meta = DIET_TAGS.find(d=>d.id===tag);
                  return meta ? <span key={tag} style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:"#555", background:"#161616", border:"1px solid #222", padding:"2px 7px", borderRadius:99 }}>{meta.label}</span> : null;
                })}
              </div>
            )}
            <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:12, padding:"10px 0", borderTop:"1px solid #1a1a1a" }}>
              <div style={{ fontSize:9, fontFamily:"'DM Mono',monospace", color:"#2e2e2e", letterSpacing:".12em", textTransform:"uppercase" }}>Add links before approving</div>
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
      <div style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:"#333", letterSpacing:".14em", textTransform:"uppercase", margin:"16px 0 8px" }}>
        Edit live reviews
      </div>
      {approved.map(r => (
        <div key={r.id} style={{ background:"#141414", border:"1px solid #1e1e1e", borderRadius:12, padding:14, marginBottom:6 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontFamily:"'Libre Baskerville',Georgia,serif", color:"#f0ede8", fontSize:14, fontWeight:700 }}>{r.product}</span>
            <button
              onClick={()=> editingId===r.id ? setEditingId(null) : (setEditingId(r.id), setEditFields({ link:r.link||"", mapQuery:r.map_query??r.mapQuery??""}))}
              style={{ background:"none", border:"1px solid #222", borderRadius:6, color:"#444", fontSize:11, fontFamily:"'DM Mono',monospace", padding:"4px 10px", cursor:"pointer" }}>
              {editingId===r.id ? "cancel" : "edit links"}
            </button>
          </div>
          <div style={{ fontSize:10, color:"#2e2e2e", fontFamily:"'DM Mono',monospace", marginTop:4, letterSpacing:".06em" }}>{r.submitter} · {r.where}</div>
          {editingId !== r.id && (
            <div style={{ marginTop:8, display:"flex", gap:6, flexWrap:"wrap" }}>
              {r.link ? <span style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:"#C8FF4788", background:"#C8FF4710", padding:"3px 8px", borderRadius:99 }}>↗ {r.link.slice(0,28)}{r.link.length>28?"…":""}</span> : <span style={{ fontSize:10, color:"#2a2a2a", fontFamily:"'DM Mono',monospace" }}>no link</span>}
              {(r.map_query||r.mapQuery) ? <span style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:"#6fcf6f88", background:"#6fcf6f10", padding:"3px 8px", borderRadius:99 }}>📍 {(r.map_query??r.mapQuery).slice(0,25)}…</span> : <span style={{ fontSize:10, color:"#2a2a2a", fontFamily:"'DM Mono',monospace" }}>no map</span>}
            </div>
          )}
          {editingId === r.id && (
            <div style={{ marginTop:12, display:"flex", flexDirection:"column", gap:10 }}>
              <div><label style={lbl}>Website or Instagram link</label><input style={inp} placeholder="https://..." value={editFields.link} onChange={e=>setEditFields(p=>({...p,link:e.target.value}))} /></div>
              <div><label style={lbl}>Address or postcode</label><input style={inp} placeholder="e.g. Leon London Bridge SE1" value={editFields.mapQuery} onChange={e=>setEditFields(p=>({...p,mapQuery:e.target.value}))} /></div>
              <button onClick={()=>{ onEditApproved(r.id, editFields); setEditingId(null); }} style={{ background:"#C8FF47", color:"#0a0a0a", border:"none", borderRadius:8, padding:"10px 0", fontFamily:"'DM Mono',monospace", fontSize:12, fontWeight:700, cursor:"pointer" }}>Save changes ✓</button>
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
  const [activeDiet, setActiveDiet] = useState([]);
  const [activeScore, setActiveScore] = useState(null);
  const [rateLimited, setRateLimited] = useState(!canSubmit());
  const [modal, setModal] = useState(null);
  const [adminOk, setAdminOk] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);

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
    }
    loadData();
  }, []);

  const toggleDietFilter = (id) => setActiveDiet(p => p.includes(id) ? p.filter(x=>x!==id) : [...p, id]);

  const filtered = [...reviews]
    .filter(r => cat === "all" || r.category === cat)
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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,700;1,400&family=DM+Mono:wght@400;600;700&display=swap');
        *{box-sizing:border-box;} body{margin:0;background:#080808;}
        @keyframes sheetUp  {from{transform:translateY(60px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes holo     {0%{background-position:0% 50%;filter:hue-rotate(0deg)}50%{background-position:100% 50%;filter:hue-rotate(180deg)}100%{background-position:0% 50%;filter:hue-rotate(360deg)}}
        @keyframes shimmer  {0%{transform:translateX(-100%) rotate(45deg)}100%{transform:translateX(200%) rotate(45deg)}}
        @keyframes shimmer-bar{0%{background-position:0% 50%}100%{background-position:200% 50%}}
        ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:#1e1e1e;border-radius:3px}
        input::placeholder,textarea::placeholder{color:#2a2a2a}
        input:focus,textarea:focus,select:focus{border-color:#2a2a2a!important;outline:none}
        a:hover{opacity:.75} select option{background:#161616}
      `}</style>

      <div style={{ maxWidth:520, margin:"0 auto", minHeight:"100vh", paddingBottom:120, overflowX:"hidden" }}>
        <div style={{ padding:"40px 18px 0", position:"relative" }}>
          <button onClick={openAdmin} title="Admin" style={{ position:"absolute", top:38, right:18, background:"none", border:"none", color:"#1e1e1e", fontSize:19, cursor:"pointer" }}>⚙</button>

          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
            <span style={{ color:"#C8FF47", fontSize:16 }}>✦</span>
            <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:"#333", letterSpacing:".22em", textTransform:"uppercase" }}>Legit Buys</span>
          </div>
          <h1 style={{ margin:"0 0 8px", fontFamily:"'Libre Baskerville',Georgia,serif", fontSize:36, lineHeight:1.08, color:"#f0ede8", fontWeight:700 }}>
            Stuff worth<br/>actually buying.
          </h1>
          <p style={{ margin:"0 0 24px", color:"#383838", fontSize:13.5, lineHeight:1.6 }}>Real picks from real colleagues. No ads, no fluff.</p>

          <div style={{ padding:"14px 0", borderTop:"1px solid #141414", borderBottom:"1px solid #141414", marginBottom:20 }}>
            <div style={{ fontSize:9, fontFamily:"'DM Mono',monospace", color:"#333", letterSpacing:".14em", textTransform:"uppercase", marginBottom:10 }}>Filter by score</div>
            <div style={{ display:"flex", gap:8 }}>
              {SCORE_META.map(m => {
                const color = SCORE_COLORS[m.value];
                const isActive = activeScore === m.value;
                return (
                  <button key={m.value} onClick={()=>setActiveScore(isActive ? null : m.value)} style={{
                    flex:1, padding:"10px 4px", borderRadius:10, border:"none", lineHeight:1.5,
                    outline:`1.5px solid ${isActive ? color : "#1e1e1e"}`,
                    background: isActive ? `${color}18` : "#111",
                    color: isActive ? color : "#333",
                    fontFamily:"'DM Mono',monospace", fontSize:10, cursor:"pointer",
                    transition:"all .15s", fontWeight: isActive ? 700 : 400,
                  }}>
                    {m.value}<br/>{m.short}
                  </button>
                );
              })}
            </div>
            {activeScore !== null && (
              <button onClick={()=>setActiveScore(null)} style={{ background:"none", border:"none", color:"#444", fontSize:11, fontFamily:"'DM Mono',monospace", cursor:"pointer", padding:"8px 0 0", letterSpacing:".06em" }}>
                ✕ clear
              </button>
            )}
          </div>

          <div style={{ display:"flex", gap:7, overflowX:"auto", scrollbarWidth:"none", paddingBottom:8 }}>
            {Object.keys(CAT_META).map(c=><Pill key={c} cat={c} active={cat===c} onClick={()=>setCat(c)} />)}
          </div>

          <div style={{ display:"flex", gap:6, overflowX:"auto", scrollbarWidth:"none", paddingBottom:4, paddingTop:8 }}>
            {DIET_TAGS.map(tag=><DietPill key={tag.id} tag={tag} active={activeDiet.includes(tag.id)} onClick={()=>toggleDietFilter(tag.id)} />)}
          </div>

          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:8, minHeight:24 }}>
            {activeDiet.length > 0 ? (
              <button onClick={()=>setActiveDiet([])} style={{ background:"none", border:"none", color:"#444", fontSize:11, fontFamily:"'DM Mono',monospace", cursor:"pointer", padding:0, letterSpacing:".06em" }}>
                ✕ clear filters
              </button>
            ) : <span />}
            <a
              href="/scoring-guide.html"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:"#333", letterSpacing:".08em", textDecoration:"none", borderBottom:"1px solid #2a2a2a", paddingBottom:1, transition:"color .15s" }}
              onMouseEnter={e=>e.target.style.color="#C8FF47"}
              onMouseLeave={e=>e.target.style.color="#333"}
            >
              Review &amp; scoring guide &#8599;
            </a>
          </div>
        </div>

        <div style={{ padding:"18px 12px", display:"flex", flexDirection:"column", gap:10 }}>
          {loading && <div style={{ textAlign:"center", padding:"60px 0", color:"#333", fontSize:13, fontFamily:"'DM Mono',monospace", letterSpacing:".1em" }}>loading buys...</div>}
          {!loading && filtered.length===0 && <div style={{ textAlign:"center", padding:"60px 0", color:"#222", fontSize:13, fontFamily:"'DM Mono',monospace" }}>No reviews match these filters.</div>}
          {filtered.map(r=><Card key={r.id} r={r} onUp={upvote} />)}
        </div>
      </div>

      <div style={{ position:"fixed", bottom:28, left:"50%", transform:"translateX(-50%)", zIndex:100 }}>
        <button
          onClick={() => {
            if (rateLimited) {
              setModal("rateLimited");
            } else {
              setModal("submit");
            }
          }}
          style={{
            background: rateLimited ? "transparent" : "#C8FF47",
            color: rateLimited ? "#333" : "#0a0a0a",
            border: rateLimited ? "1px solid #222" : "none",
            borderRadius:99, padding:"10px 20px",
            fontFamily:"'DM Mono',monospace", fontSize:12, fontWeight:700,
            cursor:"pointer", transition:"all .2s",
          }}>
          {rateLimited ? "🔒 Submit" : "+ Submit a Legit Buy"}
        </button>
      </div>

      {modal==="submit" && <Sheet title="Submit a Legit Buy" onClose={()=>setModal(null)}><SubmitFlow onSubmit={submit} onClose={()=>setModal(null)} /></Sheet>}

      {modal==="adminLogin" && (
        <Sheet title="Admin login" onClose={()=>setModal(null)}>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div>
              <label style={{ fontSize:9, fontFamily:"'DM Mono',monospace", color:"#444", letterSpacing:".14em", textTransform:"uppercase", display:"block", marginBottom:7, fontWeight:600 }}>Email</label>
              <input
                type="email"
                value={adminEmail}
                onChange={e=>setAdminEmail(e.target.value)}
                placeholder="your@email.com"
                style={{ width:"100%", background:"#161616", border:"1px solid #222", borderRadius:10, padding:"12px 14px", color:"#f0ede8", fontSize:14, outline:"none", boxSizing:"border-box", fontFamily:"system-ui,sans-serif" }}
              />
            </div>
            <div>
              <label style={{ fontSize:9, fontFamily:"'DM Mono',monospace", color:"#444", letterSpacing:".14em", textTransform:"uppercase", display:"block", marginBottom:7, fontWeight:600 }}>Password</label>
              <input
                type="password"
                value={adminPassword}
                onChange={e=>setAdminPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={e=>e.key==="Enter" && handleAdminLogin()}
                style={{ width:"100%", background:"#161616", border:"1px solid #222", borderRadius:10, padding:"12px 14px", color:"#f0ede8", fontSize:14, outline:"none", boxSizing:"border-box", fontFamily:"system-ui,sans-serif" }}
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
            <div style={{ background:"#141414", border:"1px solid #1c1c1c", borderRadius:10, padding:"14px 16px", fontSize:13, color:"#555", fontFamily:"'DM Mono',monospace", lineHeight:1.7 }}>
              You've submitted {RATE_LIMIT} reviews in the last 24 hours — that's the daily limit to keep things quality over quantity.
            </div>
            <div style={{ fontSize:13, color:"#444", fontFamily:"'Libre Baskerville',Georgia,serif", lineHeight:1.7 }}>
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
            <div style={{ fontSize:11, color:"#333", fontFamily:"'DM Mono',monospace", marginBottom:10 }}>
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