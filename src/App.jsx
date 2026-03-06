import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

// ── Data ──────────────────────────────────────────────
const REVIEWS = [
  { id: 1, product: "Huel Black Edition", category: "drinks", rating: 5, review: "Didn't expect to love this but the chocolate flavour is actually decent. Keeps me full till lunch no problem.", submitter: "Marcus T.", where: "Amazon", price: "40", priceRange: "fair", upvotes: 12, verified: true, link: "https://huel.com/products/huel-black-edition", mapQuery: "", dietTags: ["vegan", "gluten-free"] },
  { id: 2, product: "Pip & Nut Almond Butter Cups", category: "snacks", rating: 5, review: "These are elite. Every office snack drawer needs them. Three people bought their own box after trying mine.", submitter: "Priya K.", where: "Sainsbury's", price: "2.50", priceRange: "cheap", upvotes: 19, verified: true, link: "https://www.sainsburys.co.uk", mapQuery: "Sainsbury's Bristol", dietTags: ["vegan", "gluten-free"] },
  { id: 3, product: "Oatly Barista", category: "drinks", rating: 4, review: "The only oat milk that actually froths properly. If you're making coffee at home this is non-negotiable.", submitter: "Jamie L.", where: "Tesco", price: "1.90", priceRange: "cheap", upvotes: 8, verified: true, link: "https://www.oatly.com", mapQuery: "", dietTags: ["vegan", "nut-free"] },
  { id: 4, product: "Leon Happy Lunch Box", category: "restaurants", rating: 4, review: "Actually filling unlike most healthy lunch spots. The falafel box specifically is worth it.", submitter: "Anita R.", where: "Leon – City branch", price: "9", priceRange: "fair", upvotes: 6, verified: true, link: "https://leon.co", mapQuery: "Leon Restaurant London Bridge", dietTags: ["vegetarian"] },
  { id: 5, product: "Gail's Sourdough", category: "cafes", rating: 5, review: "Best loaf you'll find on the high street. The seeded sourdough on Fridays is worth planning your week around.", submitter: "Sophie M.", where: "Gail's Bakery", price: "4.50", priceRange: "fair", upvotes: 11, verified: true, link: "https://gailsbread.co.uk", mapQuery: "Gail's Bakery Bristol", dietTags: ["vegetarian", "nut-free"] },
  { id: 6, product: "Belazu Roasted Pepper Pesto", category: "groceries", rating: 5, review: "Put it on everything. Pasta, toast, straight from the jar. Genuinely life-changing condiment.", submitter: "Marcus T.", where: "Waitrose", price: "3.80", priceRange: "fair", upvotes: 14, verified: true, link: "", mapQuery: "Waitrose Bristol", dietTags: ["vegetarian", "gluten-free"] },
];

const PENDING_INIT = [
  { id: 7, product: "Graze Protein Bites", category: "snacks", rating: 4, review: "Surprisingly not chalky. Dark chocolate ones are the move.", submitter: "Tom B.", where: "Graze.com", price: "3.99", priceRange: "cheap", upvotes: 0, verified: false, link: "", mapQuery: "", dietTags: ["gluten-free"] },
];

const CAT_META = {
  all:         { emoji: "◈", color: "#C8FF47" },
  snacks:      { emoji: "🍫", color: "#F4A942" },
  drinks:      { emoji: "☕", color: "#60C3F5" },
  restaurants: { emoji: "🍽", color: "#F07070" },
  cafes:       { emoji: "🥐", color: "#C084FC" },
  groceries:   { emoji: "🛒", color: "#34D399" },
};

const DIET_TAGS = [
  { id: "vegetarian",  label: "Vegetarian", emoji: "🥦" },
  { id: "vegan",       label: "Vegan",      emoji: "🌱" },
  { id: "gluten-free", label: "Gluten-free",emoji: "🌾" },
  { id: "non-alcoholic",label:"Non-alcoholic",emoji:"🚫🍺"},
  { id: "halal",       label: "Halal",      emoji: "☪️" },
  { id: "nut-free",    label: "Nut-free",   emoji: "🚫🥜" },
];

const PRICE_RANGE = [
  { id: "cheap",  label: "Cheap",  symbol: "£" },
  { id: "fair",   label: "Fair",   symbol: "££" },
  { id: "pricey", label: "Pricey", symbol: "£££" },
];

// ── Helpers ───────────────────────────────────────────
function priceSymbol(range) {
  return PRICE_RANGE.find(p => p.id === range)?.symbol ?? "";
}

// ── Stars ─────────────────────────────────────────────
function Stars({ value = 0, interactive = false, onChange }) {
  const [hov, setHov] = useState(0);
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {[1,2,3,4,5].map(n => (
        <span key={n}
          onMouseEnter={() => interactive && setHov(n)}
          onMouseLeave={() => interactive && setHov(0)}
          onClick={() => interactive && onChange?.(n)}
          style={{ fontSize: interactive ? 26 : 13, lineHeight: 1,
            cursor: interactive ? "pointer" : "default",
            color: n <= (hov || value) ? "#F4A942" : "#2c2c2c",
            transition: "color .1s" }}>★</span>
      ))}
    </span>
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
      fontFamily: "'DM Mono', monospace", cursor: "pointer",
      fontWeight: active ? 700 : 400, whiteSpace: "nowrap",
      transition: "all .15s",
    }}>
      {m.emoji} {cat === "all" ? "All" : cat[0].toUpperCase() + cat.slice(1)}
    </button>
  );
}

// ── Diet filter pill ──────────────────────────────────
function DietPill({ tag, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: active ? "#ffffff14" : "transparent",
      color: active ? "#f0ede8" : "#3a3a3a",
      border: `1.5px solid ${active ? "#555" : "#1e1e1e"}`,
      borderRadius: 99, padding: "4px 12px", fontSize: 11,
      fontFamily: "'DM Mono', monospace", cursor: "pointer",
      whiteSpace: "nowrap", transition: "all .15s",
      fontWeight: active ? 600 : 400,
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
      fontFamily: "'DM Mono', monospace", textDecoration: "none",
      fontWeight: 600, transition: "opacity .15s",
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
      fontFamily: "'DM Mono', monospace", textDecoration: "none",
      fontWeight: 600, transition: "opacity .15s",
      background: "#1f1a14", border: "1px solid #3a2e1a", color: "#C8FF47",
    }}>
      ↗ {label}
    </a>
  );
}

// ── Review card ───────────────────────────────────────
function Card({ r, onUp }) {
  const [upped, setUpped] = useState(false);
  const accent = CAT_META[r.category]?.color ?? "#C8FF47";
  const hasLinks = r.link || r.mapQuery;
  const sym = priceSymbol(r.priceRange);

  return (
    <div style={{
      background: "#111", border: "1px solid #1c1c1c", borderRadius: 14,
      padding: "18px 18px 14px", display: "flex", flexDirection: "column", gap: 10,
      position: "relative", overflow: "hidden",
      transition: "border-color .2s, transform .15s",
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor="#2a2a2a"; e.currentTarget.style.transform="translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor="#1c1c1c"; e.currentTarget.style.transform="translateY(0)"; }}
    >
      <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:accent, borderRadius:"14px 14px 0 0" }} />

      {/* Title row */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
        <div>
          <div style={{ fontSize:9, fontFamily:"'DM Mono',monospace", color:accent, letterSpacing:".18em", textTransform:"uppercase", fontWeight:600, marginBottom:4 }}>
            {CAT_META[r.category]?.emoji} {r.category}
          </div>
          <div style={{ fontFamily:"'Libre Baskerville',Georgia,serif", fontSize:16, color:"#f0ede8", lineHeight:1.25, fontWeight:700 }}>{r.product}</div>
        </div>
        <Stars value={r.rating} />
      </div>

      {/* Review text */}
      <p style={{ margin:0, fontSize:13.5, color:"#777", lineHeight:1.65, fontStyle:"italic", fontFamily:"'Libre Baskerville',Georgia,serif" }}>"{r.review}"</p>

      {/* Diet tags */}
      {r.dietTags?.length > 0 && (
        <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
          {r.dietTags.map(tag => {
            const meta = DIET_TAGS.find(d => d.id === tag);
            return meta ? (
              <span key={tag} style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:"#555", background:"#161616", border:"1px solid #222", padding:"2px 8px", borderRadius:99 }}>
                {meta.emoji} {meta.label}
              </span>
            ) : null;
          })}
        </div>
      )}

      {/* Action links */}
      {hasLinks && (
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", paddingTop:2 }}>
          <LinkButton link={r.link} where={r.where} />
          <MapButton mapQuery={r.mapQuery} />
        </div>
      )}

      {/* Footer */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:2, paddingTop: hasLinks ? 8 : 0, borderTop: hasLinks ? "1px solid #181818" : "none" }}>
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
        <button onClick={() => { if (!upped) { setUpped(true); onUp(r.id); }}}
          style={{
            background: upped ? `${accent}18` : "transparent",
            border: `1px solid ${upped ? accent : "#242424"}`,
            color: upped ? accent : "#444",
            borderRadius:99, padding:"5px 13px", fontSize:12,
            fontFamily:"'DM Mono',monospace", cursor: upped?"default":"pointer",
            transition:"all .2s",
          }}>↑ {r.upvotes + (upped?1:0)}</button>
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
    product:"", category:"snacks", rating:0, review:"",
    submitter:"", where:"", price:"", priceRange:"fair",
    link:"", mapQuery:"", dietTags:[],
  });
  const set = (k,v) => setF(p => ({...p, [k]:v}));

  const toggleDiet = (id) => setF(p => ({
    ...p,
    dietTags: p.dietTags.includes(id) ? p.dietTags.filter(t=>t!==id) : [...p.dietTags, id]
  }));

  const inp = { width:"100%", background:"#161616", border:"1px solid #222", borderRadius:10, padding:"12px 14px", color:"#f0ede8", fontSize:14, outline:"none", boxSizing:"border-box", fontFamily:"system-ui,sans-serif" };
  const lbl = { fontSize:9, fontFamily:"'DM Mono',monospace", color:"#444", letterSpacing:".14em", textTransform:"uppercase", display:"block", marginBottom:7, fontWeight:600 };
  const hint = { fontSize:11, color:"#333", fontFamily:"'DM Mono',monospace", marginTop:5, lineHeight:1.5 };
  const nextBtn = (disabled) => ({ background:"#C8FF47", color:"#0a0a0a", border:"none", borderRadius:99, padding:"13px 0", width:"100%", fontFamily:"'DM Mono',monospace", fontSize:13, fontWeight:700, cursor:disabled?"not-allowed":"pointer", letterSpacing:".04em", marginTop:6, opacity:disabled?0.35:1 });
  const backBtn = { background:"transparent", color:"#3a3a3a", border:"1px solid #1e1e1e", borderRadius:99, padding:"11px 0", width:"100%", fontFamily:"'DM Mono',monospace", fontSize:12, cursor:"pointer", marginTop:8 };

  // ── Price input handler: strip non-numeric, keep decimals ──
  const handlePrice = (val) => {
    const cleaned = val.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
    set("price", cleaned);
  };

  const steps = [
    // Step 0 – What is it?
    <div key={0} style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ fontFamily:"'Libre Baskerville',Georgia,serif", color:"#555", fontSize:13, marginBottom:4 }}>Step 1 of 4 — The buy</div>
      <div>
        <label style={lbl}>Product or place *</label>
        <input style={inp} placeholder="e.g. Pip & Nut Almond Butter Cups" value={f.product} onChange={e=>set("product",e.target.value)} />
      </div>
      <div>
        <label style={lbl}>Category *</label>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
          {Object.entries(CAT_META).filter(([k])=>k!=="all").map(([c, m]) => (
            <button key={c} onClick={()=>set("category",c)} style={{
              padding:"10px 4px", borderRadius:10,
              border:`1.5px solid ${f.category===c ? m.color : "#1e1e1e"}`,
              background: f.category===c ? `${m.color}14` : "#161616",
              color: f.category===c ? m.color : "#444",
              fontFamily:"'DM Mono',monospace", fontSize:11, cursor:"pointer", transition:"all .15s",
              lineHeight:1.5,
            }}>
              {m.emoji}<br/>{c}
            </button>
          ))}
        </div>
      </div>
      <div><label style={lbl}>Where to get it</label><input style={inp} placeholder="Tesco, Amazon, local deli…" value={f.where} onChange={e=>set("where",e.target.value)} /></div>

      {/* Price + range */}
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

    // Step 1 – Diet tags
    <div key={1} style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ fontFamily:"'Libre Baskerville',Georgia,serif", color:"#555", fontSize:13, marginBottom:4 }}>Step 2 of 4 — Dietary info</div>
      <div style={{ background:"#141414", border:"1px solid #1c1c1c", borderRadius:10, padding:"12px 14px", fontSize:12, color:"#444", fontFamily:"'DM Mono',monospace", lineHeight:1.7 }}>
        Tag any diets this suits. Optional — but helps people filter for what works for them.
      </div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
        {DIET_TAGS.map(tag => (
          <button key={tag.id} onClick={()=>toggleDiet(tag.id)} style={{
            padding:"8px 14px", borderRadius:99, fontSize:12,
            border:`1.5px solid ${f.dietTags.includes(tag.id) ? "#555" : "#1e1e1e"}`,
            background: f.dietTags.includes(tag.id) ? "#ffffff14" : "#161616",
            color: f.dietTags.includes(tag.id) ? "#f0ede8" : "#3a3a3a",
            fontFamily:"'DM Mono',monospace", cursor:"pointer", transition:"all .15s",
          }}>
            {tag.emoji} {tag.label}
          </button>
        ))}
      </div>
      <button style={nextBtn(false)} onClick={()=>setStep(2)}>Next →</button>
      <button style={backBtn} onClick={()=>setStep(0)}>← Back</button>
    </div>,

    // Step 2 – Links
    <div key={2} style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ fontFamily:"'Libre Baskerville',Georgia,serif", color:"#555", fontSize:13, marginBottom:4 }}>Step 3 of 4 — Links (optional)</div>
      <div style={{ background:"#141414", border:"1px solid #1c1c1c", borderRadius:10, padding:"12px 14px", fontSize:12, color:"#444", fontFamily:"'DM Mono',monospace", lineHeight:1.7 }}>
        Help readers find it instantly. Both fields are optional — an admin can fill them in later.
      </div>
      <div>
        <label style={lbl}>Website or Instagram link</label>
        <input style={inp} placeholder="https://leon.co or https://instagram.com/..." value={f.link} onChange={e=>set("link",e.target.value)} />
      </div>
      <div>
        <label style={lbl}>Address or postcode for map</label>
        <input style={inp} placeholder="e.g. Leon, London Bridge, SE1 or SW1A 1AA" value={f.mapQuery} onChange={e=>set("mapQuery",e.target.value)} />
        <div style={hint}>Typed exactly into Google Maps when tapped.</div>
      </div>
      <button style={nextBtn(false)} onClick={()=>setStep(3)}>Next →</button>
      <button style={backBtn} onClick={()=>setStep(1)}>← Back</button>
    </div>,

    // Step 3 – Review & name
    <div key={3} style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ fontFamily:"'Libre Baskerville',Georgia,serif", color:"#555", fontSize:13, marginBottom:4 }}>Step 4 of 4 — Your verdict</div>
      <div>
        <label style={lbl}>Rating *</label>
        <Stars value={f.rating} interactive onChange={v=>set("rating",v)} />
        {f.rating > 0 && <div style={{ fontSize:11, color:"#444", fontFamily:"'DM Mono',monospace", marginTop:6 }}>{["","Nah","It's alright","Decent","Solid buy","Certified legit"][f.rating]}</div>}
      </div>
      <div><label style={lbl}>Your honest review *</label><textarea style={{ ...inp, minHeight:100, resize:"vertical" }} placeholder="What made it worth buying? Be specific." value={f.review} onChange={e=>set("review",e.target.value)} /></div>
      <div style={{ background:"#141414", border:"1px solid #1c1c1c", borderRadius:10, padding:"12px 14px", fontSize:12, color:"#555", fontFamily:"'DM Mono',monospace", lineHeight:1.6 }}>
        ✓ Your name shows on the review so people know it's real.
      </div>
      <div><label style={lbl}>Your name *</label><input style={inp} placeholder="First name + initial (e.g. Priya K.)" value={f.submitter} onChange={e=>set("submitter",e.target.value)} /></div>
      <button style={nextBtn(!(f.rating && f.review && f.submitter))} onClick={()=>{ if(f.rating && f.review && f.submitter){ onSubmit(f); setStep(4); } }}>Submit for approval →</button>
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
      <div style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:"#333", letterSpacing:".14em", textTransform:"uppercase", marginBottom:8 }}>
        Pending approval {pending.length > 0 && `(${pending.length})`}
      </div>
      {pending.length === 0 && <div style={{ fontSize:13, color:"#2a2a2a", fontFamily:"'DM Mono',monospace", marginBottom:20, paddingBottom:20, borderBottom:"1px solid #141414" }}>All clear ✦</div>}
      {pending.map(r => (
        <div key={r.id} style={{ background:"#141414", border:"1px solid #1e1e1e", borderRadius:12, padding:16, marginBottom:6 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
            <span style={{ fontFamily:"'Libre Baskerville',Georgia,serif", color:"#f0ede8", fontSize:15, fontWeight:700 }}>{r.product}</span>
            <Stars value={r.rating} />
          </div>
          <p style={{ margin:"0 0 6px", fontSize:13, color:"#666", fontStyle:"italic", fontFamily:"'Libre Baskerville',Georgia,serif" }}>"{r.review}"</p>
          <div style={{ fontSize:10, color:"#333", fontFamily:"'DM Mono',monospace", marginBottom:6, letterSpacing:".06em" }}>
            {r.submitter} · {r.category} · {r.where} · £{r.price} {priceSymbol(r.priceRange)}
          </div>
          {r.dietTags?.length > 0 && (
            <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:10 }}>
              {r.dietTags.map(tag => {
                const meta = DIET_TAGS.find(d=>d.id===tag);
                return meta ? <span key={tag} style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:"#555", background:"#161616", border:"1px solid #222", padding:"2px 7px", borderRadius:99 }}>{meta.emoji} {meta.label}</span> : null;
              })}
            </div>
          )}
          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:12, padding:"10px 0", borderTop:"1px solid #1a1a1a" }}>
            <div style={{ fontSize:9, fontFamily:"'DM Mono',monospace", color:"#2e2e2e", letterSpacing:".12em", textTransform:"uppercase" }}>Add links before approving</div>
            <input style={inp} placeholder="Link (website / instagram)" value={r.link || ""} onChange={e=>onUpdatePending(r.id,{link:e.target.value})} />
            <input style={inp} placeholder="Address or postcode for map" value={r.mapQuery || ""} onChange={e=>onUpdatePending(r.id,{mapQuery:e.target.value})} />
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={()=>onApprove(r.id)} style={{ flex:1, background:"#C8FF47", color:"#0a0a0a", border:"none", borderRadius:8, padding:"10px 0", fontFamily:"'DM Mono',monospace", fontSize:12, fontWeight:700, cursor:"pointer" }}>✓ Approve</button>
            <button onClick={()=>onReject(r.id)} style={{ flex:1, background:"transparent", color:"#E05A5A", border:"1px solid #E05A5A33", borderRadius:8, padding:"10px 0", fontFamily:"'DM Mono',monospace", fontSize:12, cursor:"pointer" }}>✕ Reject</button>
          </div>
        </div>
      ))}

      <div style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:"#333", letterSpacing:".14em", textTransform:"uppercase", margin:"16px 0 8px" }}>Edit live reviews</div>
      {approved.map(r => (
        <div key={r.id} style={{ background:"#141414", border:"1px solid #1e1e1e", borderRadius:12, padding:14, marginBottom:6 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontFamily:"'Libre Baskerville',Georgia,serif", color:"#f0ede8", fontSize:14, fontWeight:700 }}>{r.product}</span>
            <button onClick={()=>editingId===r.id ? setEditingId(null) : (setEditingId(r.id), setEditFields({ link:r.link||"", mapQuery:r.mapQuery||"" }))}
              style={{ background:"none", border:"1px solid #222", borderRadius:6, color:"#444", fontSize:11, fontFamily:"'DM Mono',monospace", padding:"4px 10px", cursor:"pointer" }}>
              {editingId===r.id?"cancel":"edit links"}
            </button>
          </div>
          <div style={{ fontSize:10, color:"#2e2e2e", fontFamily:"'DM Mono',monospace", marginTop:4, letterSpacing:".06em" }}>{r.submitter} · {r.where}</div>
          {editingId !== r.id && (
            <div style={{ marginTop:8, display:"flex", gap:6, flexWrap:"wrap" }}>
              {r.link ? <span style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:"#C8FF4788", background:"#C8FF4710", padding:"3px 8px", borderRadius:99 }}>↗ {r.link.slice(0,28)}{r.link.length>28?"…":""}</span> : <span style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:"#2a2a2a" }}>no link</span>}
              {r.mapQuery ? <span style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:"#6fcf6f88", background:"#6fcf6f10", padding:"3px 8px", borderRadius:99 }}>📍 {r.mapQuery.slice(0,25)}{r.mapQuery.length>25?"…":""}</span> : <span style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:"#2a2a2a" }}>no map</span>}
            </div>
          )}
          {editingId === r.id && (
            <div style={{ marginTop:12, display:"flex", flexDirection:"column", gap:10 }}>
              <div><label style={lbl}>Website or Instagram link</label><input style={inp} placeholder="https://..." value={editFields.link} onChange={e=>setEditFields(p=>({...p,link:e.target.value}))} /></div>
              <div><label style={lbl}>Address or postcode</label><input style={inp} placeholder="e.g. Leon London Bridge SE1" value={editFields.mapQuery} onChange={e=>setEditFields(p=>({...p,mapQuery:e.target.value}))} /></div>
              <button onClick={()=>{ onEditApproved(r.id,editFields); setEditingId(null); }} style={{ background:"#C8FF47", color:"#0a0a0a", border:"none", borderRadius:8, padding:"10px 0", fontFamily:"'DM Mono',monospace", fontSize:12, fontWeight:700, cursor:"pointer" }}>Save changes ✓</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main app ──────────────────────────────────────────
export default function App() {
 const [reviews, setReviews] = useState([]);
const [pending, setPending] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function loadData() {
    const { data: liveReviews } = await supabase
      .from('reviews')
      .select('*')
      .order('upvotes', { ascending: false });

    const { data: pendingReviews } = await supabase
      .from('pending_reviews')
      .select('*')
      .order('date', { ascending: false });

    if (liveReviews) setReviews(liveReviews);
    if (pendingReviews) setPending(pendingReviews);
    setLoading(false);
  }
  loadData();
}, []);
  const [cat, setCat] = useState("all");
  const [activeDiet, setActiveDiet] = useState([]);
  const [modal, setModal] = useState(null);
  const [adminOk, setAdminOk] = useState(false);

  const toggleDietFilter = (id) => setActiveDiet(p => p.includes(id) ? p.filter(x=>x!==id) : [...p, id]);

  const filtered = [...reviews]
    .filter(r => cat === "all" || r.category === cat)
    .filter(r => activeDiet.length === 0 || activeDiet.every(d => r.dietTags?.includes(d)))
    .sort((a,b) => b.upvotes - a.upvotes);

  const upvote = id => setReviews(rs => rs.map(r => r.id===id ? {...r, upvotes:r.upvotes+1} : r));
  const submit = f => setPending(p => [...p, { ...f, id:Date.now(), verified:false, upvotes:0, date:new Date().toISOString().slice(0,10) }]);
  const approve = id => { const r=pending.find(x=>x.id===id); if(r){ setReviews(rs=>[...rs,{...r,verified:true}]); setPending(p=>p.filter(x=>x.id!==id)); }};
  const reject = id => setPending(p=>p.filter(x=>x.id!==id));
  const editApproved = (id,fields) => setReviews(rs=>rs.map(r=>r.id===id?{...r,...fields}:r));
  const updatePending = (id,fields) => setPending(p=>p.map(r=>r.id===id?{...r,...fields}:r));

  const openAdmin = () => {
    if (adminOk) { setModal("admin"); return; }
    const pin = window.prompt("Admin PIN:");
    if (pin==="1234") { setAdminOk(true); setModal("admin"); }
    else if (pin!==null) window.alert("Wrong PIN.");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,700;1,400&family=DM+Mono:wght@400;600;700&display=swap');
        *{box-sizing:border-box;} body{margin:0;background:#080808;}
        @keyframes sheetUp{from{transform:translateY(60px);opacity:0}to{transform:translateY(0);opacity:1}}
        ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:#1e1e1e;border-radius:3px}
        input::placeholder,textarea::placeholder{color:#2a2a2a}
        input:focus,textarea:focus,select:focus{border-color:#2a2a2a!important;outline:none}
        a:hover{opacity:.75} select option{background:#161616}
      `}</style>

      <div style={{ maxWidth:520, margin:"0 auto", minHeight:"100vh", paddingBottom:120 }}>
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

          {/* Stats */}
          <div style={{ display:"flex", gap:28, padding:"16px 0", borderTop:"1px solid #141414", borderBottom:"1px solid #141414", marginBottom:20 }}>
            {[["Reviews",reviews.length],["Reviewers",new Set(reviews.map(r=>r.submitter)).size],["Pending",pending.length]].map(([l,v])=>(
              <div key={l}><div style={{ fontFamily:"'DM Mono',monospace", fontSize:24, color:"#C8FF47", fontWeight:600 }}>{v}</div><div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:"#2e2e2e", letterSpacing:".14em", textTransform:"uppercase", marginTop:3 }}>{l}</div></div>
            ))}
          </div>

          {/* Category filter */}
          <div style={{ display:"flex", gap:7, overflowX:"auto", scrollbarWidth:"none", paddingBottom:8 }}>
            {Object.keys(CAT_META).map(c=><Pill key={c} cat={c} active={cat===c} onClick={()=>setCat(c)} />)}
          </div>

          {/* Diet filter */}
          <div style={{ display:"flex", gap:6, overflowX:"auto", scrollbarWidth:"none", paddingBottom:4, paddingTop:8 }}>
            {DIET_TAGS.map(tag=><DietPill key={tag.id} tag={tag} active={activeDiet.includes(tag.id)} onClick={()=>toggleDietFilter(tag.id)} />)}
          </div>

          {activeDiet.length > 0 && (
            <div style={{ marginTop:8 }}>
              <button onClick={()=>setActiveDiet([])} style={{ background:"none", border:"none", color:"#444", fontSize:11, fontFamily:"'DM Mono',monospace", cursor:"pointer", padding:0, letterSpacing:".06em" }}>
                ✕ clear filters
              </button>
            </div>
          )}
        </div>

        {/* Cards */}
        <div style={{ padding:"18px 12px", display:"flex", flexDirection:"column", gap:10 }}>
          {loading && (
            <div style={{ textAlign:"center", padding:"60px 0", color:"#333", fontSize:13, fontFamily:"'DM Mono',monospace", letterSpacing:".1em" }}>
              loading buys...
            </div>
          )}
          {filtered.length===0 && (
            <div style={{ textAlign:"center", padding:"60px 0", color:"#222", fontSize:13, fontFamily:"'DM Mono',monospace" }}>
              No reviews match these filters.
            </div>
          )}
          {filtered.map(r=><Card key={r.id} r={r} onUp={upvote} />)}
        </div>
      </div>

      {/* FAB */}
      <div style={{ position:"fixed", bottom:28, left:"50%", transform:"translateX(-50%)", zIndex:100 }}>
        <button onClick={()=>setModal("submit")} style={{ background:"#C8FF47", color:"#0a0a0a", border:"none", borderRadius:99, padding:"14px 32px", fontFamily:"'DM Mono',monospace", fontSize:13, fontWeight:700, cursor:"pointer", letterSpacing:".05em", whiteSpace:"nowrap", boxShadow:"0 0 50px #C8FF4755" }}>
          + Submit a Legit Buy
        </button>
      </div>

      {modal==="submit" && <Sheet title="Submit a Legit Buy" onClose={()=>setModal(null)}><SubmitFlow onSubmit={submit} onClose={()=>setModal(null)} /></Sheet>}
      {modal==="admin" && (
        <Sheet title={`Admin${pending.length?` · ${pending.length} pending`:""}`} onClose={()=>setModal(null)}>
          <AdminQueue pending={pending} onApprove={approve} onReject={reject} approved={reviews} onEditApproved={editApproved} onUpdatePending={updatePending} />
        </Sheet>
      )}
    </>
  );
}