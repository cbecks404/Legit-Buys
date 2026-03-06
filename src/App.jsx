import { useState } from "react";

const REVIEWS = [
  { id: 1, product: "Huel Black Edition", category: "drinks", rating: 5, review: "Didn't expect to love this but the chocolate flavour is actually decent. Keeps me full till lunch no problem.", submitter: "Marcus T.", where: "Amazon", price: "£40 / 17 meals", upvotes: 12, verified: true, link: "https://huel.com/products/huel-black-edition", mapQuery: "" },
  { id: 2, product: "Pip & Nut Almond Butter Cups", category: "snacks", rating: 5, review: "These are elite. Every office snack drawer needs them. Three people bought their own box after trying mine.", submitter: "Priya K.", where: "Sainsbury's", price: "£2.50", upvotes: 19, verified: true, link: "https://www.sainsburys.co.uk", mapQuery: "Sainsbury's London" },
  { id: 3, product: "Oatly Barista", category: "drinks", rating: 4, review: "The only oat milk that actually froths properly. If you're making coffee at home this is non-negotiable.", submitter: "Jamie L.", where: "Tesco", price: "£1.90", upvotes: 8, verified: true, link: "https://www.oatly.com", mapQuery: "" },
  { id: 4, product: "Leon Happy Lunch Box", category: "restaurants", rating: 4, review: "Actually filling unlike most healthy lunch spots. The falafel box specifically is worth it.", submitter: "Anita R.", where: "Leon – City branch", price: "~£9", upvotes: 6, verified: true, link: "https://leon.co", mapQuery: "Leon Restaurant London Bridge" },
];

const PENDING_INIT = [
  { id: 5, product: "Graze Protein Bites", category: "snacks", rating: 4, review: "Surprisingly not chalky. Dark chocolate ones are the move.", submitter: "Tom B.", where: "Graze.com", price: "£3.99", upvotes: 0, verified: false, link: "", mapQuery: "" },
];

const CAT_META = {
  all:         { emoji: "◈", color: "#C8FF47" },
  snacks:      { emoji: "🍫", color: "#F4A942" },
  drinks:      { emoji: "☕", color: "#60C3F5" },
  restaurants: { emoji: "🍽", color: "#F07070" },
};

function Stars({ value = 0, interactive = false, onChange }) {
  const [hov, setHov] = useState(0);
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {[1,2,3,4,5].map(n => (
        <span key={n}
          onMouseEnter={() => interactive && setHov(n)}
          onMouseLeave={() => interactive && setHov(0)}
          onClick={() => interactive && onChange?.(n)}
          style={{ fontSize: interactive ? 26 : 13, lineHeight: 1, cursor: interactive ? "pointer" : "default",
            color: n <= (hov || value) ? "#F4A942" : "#2c2c2c", transition: "color .1s" }}>★</span>
      ))}
    </span>
  );
}

function Pill({ cat, active, onClick }) {
  const m = CAT_META[cat];
  return (
    <button onClick={onClick} style={{
      background: active ? m.color : "transparent",
      color: active ? "#0a0a0a" : "#4a4a4a",
      border: `1.5px solid ${active ? m.color : "#232323"}`,
      borderRadius: 99, padding: "5px 15px", fontSize: 12,
      fontFamily: "'DM Mono', monospace", cursor: "pointer",
      fontWeight: active ? 700 : 400, whiteSpace: "nowrap",
      transition: "all .15s",
    }}>
      {m.emoji} {cat === "all" ? "All" : cat[0].toUpperCase() + cat.slice(1)}
    </button>
  );
}

function MapButtons({ mapQuery }) {
  if (!mapQuery) return null;
  const encoded = encodeURIComponent(mapQuery);
  const googleUrl = `https://www.google.com/maps/search/?api=1&query=${encoded}`;
  const appleUrl = `https://maps.apple.com/?q=${encoded}`;
  const btnBase = {
    display: "inline-flex", alignItems: "center", gap: 5,
    padding: "5px 11px", borderRadius: 99, fontSize: 11,
    fontFamily: "'DM Mono', monospace", cursor: "pointer",
    textDecoration: "none", fontWeight: 600, transition: "all .15s",
  };
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      <a href={googleUrl} target="_blank" rel="noopener noreferrer"
        style={{ ...btnBase, background: "#1a1f1a", border: "1px solid #2a3a2a", color: "#6fcf6f" }}>
        <span>📍</span> Google Maps
      </a>
      <a href={appleUrl} target="_blank" rel="noopener noreferrer"
        style={{ ...btnBase, background: "#1a1a22", border: "1px solid #2a2a3a", color: "#7eb6f0" }}>
        <span>🗺</span> Apple Maps
      </a>
    </div>
  );
}

function LinkButton({ link, where }) {
  if (!link) return null;
  let label = where || "Visit";
  try { label = new URL(link).hostname.replace("www.", ""); } catch {}
  return (
    <a href={link} target="_blank" rel="noopener noreferrer" style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "5px 11px", borderRadius: 99, fontSize: 11,
      fontFamily: "'DM Mono', monospace", cursor: "pointer",
      textDecoration: "none", fontWeight: 600,
      background: "#1f1a14", border: "1px solid #3a2e1a", color: "#C8FF47",
      transition: "all .15s",
    }}>
      ↗ {label}
    </a>
  );
}

function Card({ r, onUp }) {
  const [upped, setUpped] = useState(false);
  const accent = CAT_META[r.category]?.color ?? "#C8FF47";
  const hasLinks = r.link || r.mapQuery;
  return (
    <div style={{
      background: "#111", border: "1px solid #1c1c1c", borderRadius: 14,
      padding: "18px 18px 14px", display: "flex", flexDirection: "column", gap: 10,
      position: "relative", overflow: "hidden", transition: "border-color .2s, transform .15s",
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor="#2a2a2a"; e.currentTarget.style.transform="translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor="#1c1c1c"; e.currentTarget.style.transform="translateY(0)"; }}
    >
      <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background: accent, borderRadius:"14px 14px 0 0" }} />

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
        <div>
          <div style={{ fontSize:9, fontFamily:"'DM Mono',monospace", color: accent, letterSpacing:".18em", textTransform:"uppercase", fontWeight:600, marginBottom:4 }}>
            {CAT_META[r.category]?.emoji} {r.category}
          </div>
          <div style={{ fontFamily:"'Libre Baskerville',Georgia,serif", fontSize:16, color:"#f0ede8", lineHeight:1.25, fontWeight:700 }}>{r.product}</div>
        </div>
        <Stars value={r.rating} />
      </div>

      <p style={{ margin:0, fontSize:13.5, color:"#777", lineHeight:1.65, fontStyle:"italic", fontFamily:"'Libre Baskerville',Georgia,serif" }}>"{r.review}"</p>

      {/* Action links row */}
      {hasLinks && (
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", paddingTop:2 }}>
          <LinkButton link={r.link} where={r.where} />
          <MapButtons mapQuery={r.mapQuery} />
        </div>
      )}

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:2, paddingTop: hasLinks ? 6 : 0, borderTop: hasLinks ? "1px solid #181818" : "none" }}>
        <div>
          <div style={{ fontSize:11, color:"#3a3a3a", fontFamily:"'DM Mono',monospace" }}>
            {r.verified && <span style={{ color:"#C8FF47", marginRight:5 }}>✓</span>}
            {r.submitter} · {r.where}
          </div>
          <div style={{ fontSize:12, color: accent, fontFamily:"'DM Mono',monospace", marginTop:3, fontWeight:600 }}>{r.price}</div>
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

function SubmitFlow({ onSubmit, onClose }) {
  const [step, setStep] = useState(0);
  const [f, setF] = useState({ product:"", category:"snacks", rating:0, review:"", submitter:"", where:"", price:"", link:"", mapQuery:"" });
  const set = (k,v) => setF(p => ({...p, [k]:v}));

  const inp = { width:"100%", background:"#161616", border:"1px solid #222", borderRadius:10, padding:"12px 14px", color:"#f0ede8", fontSize:14, outline:"none", boxSizing:"border-box", fontFamily:"system-ui,sans-serif", transition:"border-color .15s" };
  const lbl = { fontSize:9, fontFamily:"'DM Mono',monospace", color:"#444", letterSpacing:".14em", textTransform:"uppercase", display:"block", marginBottom:7, fontWeight:600 };
  const hint = { fontSize:11, color:"#333", fontFamily:"'DM Mono',monospace", marginTop:5, lineHeight:1.5 };
  const nextBtn = (disabled) => ({ background:"#C8FF47", color:"#0a0a0a", border:"none", borderRadius:99, padding:"13px 0", width:"100%", fontFamily:"'DM Mono',monospace", fontSize:13, fontWeight:700, cursor: disabled?"not-allowed":"pointer", letterSpacing:".04em", marginTop:6, opacity: disabled?0.35:1 });
  const backBtn = { background:"transparent", color:"#3a3a3a", border:"1px solid #1e1e1e", borderRadius:99, padding:"11px 0", width:"100%", fontFamily:"'DM Mono',monospace", fontSize:12, cursor:"pointer", marginTop:8 };

  const steps = [
    // Step 0 – What is it?
    <div key={0} style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ fontFamily:"'Libre Baskerville',Georgia,serif", color:"#555", fontSize:13, marginBottom:4 }}>Step 1 of 4 — The buy</div>
      <div><label style={lbl}>Product or place *</label><input style={inp} placeholder="e.g. Pip & Nut Almond Butter Cups" value={f.product} onChange={e=>set("product",e.target.value)} /></div>
      <div>
        <label style={lbl}>Category *</label>
        <div style={{ display:"flex", gap:8 }}>
          {["snacks","drinks","restaurants"].map(c => (
            <button key={c} onClick={()=>set("category",c)} style={{ flex:1, padding:"12px 4px", borderRadius:10, border:`1.5px solid ${f.category===c ? CAT_META[c].color : "#1e1e1e"}`, background: f.category===c ? `${CAT_META[c].color}14` : "#161616", color: f.category===c ? CAT_META[c].color : "#444", fontFamily:"'DM Mono',monospace", fontSize:11, cursor:"pointer", transition:"all .15s" }}>
              {CAT_META[c].emoji}<br/>{c}
            </button>
          ))}
        </div>
      </div>
      <div><label style={lbl}>Where to get it</label><input style={inp} placeholder="Tesco, Amazon, local deli…" value={f.where} onChange={e=>set("where",e.target.value)} /></div>
      <div><label style={lbl}>Approx price</label><input style={inp} placeholder="£3.99" value={f.price} onChange={e=>set("price",e.target.value)} /></div>
      <button style={nextBtn(!f.product)} onClick={()=>f.product && setStep(1)}>Next →</button>
    </div>,

    // Step 1 – Links & location
    <div key={1} style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ fontFamily:"'Libre Baskerville',Georgia,serif", color:"#555", fontSize:13, marginBottom:4 }}>Step 2 of 4 — Links (optional)</div>
      <div style={{ background:"#141414", border:"1px solid #1c1c1c", borderRadius:10, padding:"12px 14px", fontSize:12, color:"#444", fontFamily:"'DM Mono',monospace", lineHeight:1.7 }}>
        Help readers find it instantly. Both fields are optional — an admin can add them later if you're not sure.
      </div>
      <div>
        <label style={lbl}>Website or Instagram link</label>
        <input style={inp} placeholder="https://leon.co or https://instagram.com/..." value={f.link} onChange={e=>set("link",e.target.value)} />
        <div style={hint}>Direct link to buy online, or the restaurant/brand's page.</div>
      </div>
      <div>
        <label style={lbl}>Map search term</label>
        <input style={inp} placeholder="e.g. Leon Restaurant London Bridge" value={f.mapQuery} onChange={e=>set("mapQuery",e.target.value)} />
        <div style={hint}>What someone would type into Google Maps to find it. Skip if it's online-only.</div>
      </div>
      <button style={nextBtn(false)} onClick={()=>setStep(2)}>Next →</button>
      <button style={backBtn} onClick={()=>setStep(0)}>← Back</button>
    </div>,

    // Step 2 – Review
    <div key={2} style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ fontFamily:"'Libre Baskerville',Georgia,serif", color:"#555", fontSize:13, marginBottom:4 }}>Step 3 of 4 — Your verdict</div>
      <div>
        <label style={lbl}>Rating *</label>
        <Stars value={f.rating} interactive onChange={v=>set("rating",v)} />
        {f.rating > 0 && <div style={{ fontSize:11, color:"#444", fontFamily:"'DM Mono',monospace", marginTop:6 }}>{["","Nah","It's alright","Decent","Solid buy","Certified legit"][f.rating]}</div>}
      </div>
      <div><label style={lbl}>Your honest review *</label><textarea style={{ ...inp, minHeight:100, resize:"vertical" }} placeholder="What made it worth buying? Be specific." value={f.review} onChange={e=>set("review",e.target.value)} /></div>
      <button style={nextBtn(!(f.rating && f.review))} onClick={()=>(f.rating && f.review) && setStep(3)}>Next →</button>
      <button style={backBtn} onClick={()=>setStep(1)}>← Back</button>
    </div>,

    // Step 3 – Who are you?
    <div key={3} style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ fontFamily:"'Libre Baskerville',Georgia,serif", color:"#555", fontSize:13, marginBottom:4 }}>Step 4 of 4 — Verify yourself</div>
      <div style={{ background:"#141414", border:"1px solid #1c1c1c", borderRadius:10, padding:"12px 14px", fontSize:12, color:"#555", fontFamily:"'DM Mono',monospace", lineHeight:1.6 }}>
        ✓ Your name shows on the review so people know it's real. No anonymous submissions.
      </div>
      <div><label style={lbl}>Your name *</label><input style={inp} placeholder="First name + initial (e.g. Priya K.)" value={f.submitter} onChange={e=>set("submitter",e.target.value)} /></div>
      <button style={nextBtn(!f.submitter)} onClick={()=>{ if(f.submitter){ onSubmit(f); setStep(4); } }}>Submit for approval →</button>
      <button style={backBtn} onClick={()=>setStep(2)}>← Back</button>
    </div>,

    // Done
    <div key={4} style={{ textAlign:"center", padding:"30px 0 10px" }}>
      <div style={{ fontSize:48, marginBottom:16 }}>✦</div>
      <div style={{ fontFamily:"'Libre Baskerville',Georgia,serif", fontSize:22, color:"#f0ede8", marginBottom:8 }}>Nice one.</div>
      <div style={{ fontSize:13, color:"#555", lineHeight:1.7, fontFamily:"system-ui,sans-serif", marginBottom:28 }}>
        Your review is in the queue.<br/>It'll go live once approved.
      </div>
      <button onClick={onClose} style={{ background:"#C8FF47", color:"#0a0a0a", border:"none", borderRadius:99, padding:"13px 32px", fontFamily:"'DM Mono',monospace", fontSize:13, fontWeight:700, cursor:"pointer" }}>Back to board</button>
    </div>,
  ];

  const dots = step < 4 ? (
    <div style={{ display:"flex", gap:6, justifyContent:"center", marginBottom:22 }}>
      {[0,1,2,3].map(i => <div key={i} style={{ width: i===step?20:6, height:6, borderRadius:99, background: i<step ? "#C8FF4788" : i===step?"#C8FF47":"#1e1e1e", transition:"all .3s" }} />)}
    </div>
  ) : null;

  return <>{dots}{steps[step]}</>;
}

// ── Admin queue with link editing ─────────────────────
function AdminQueue({ pending, onApprove, onReject, approved, onEditApproved, onUpdatePending }) {
  const [editingId, setEditingId] = useState(null);
  const [editFields, setEditFields] = useState({ link:"", mapQuery:"" });

  const inp = { width:"100%", background:"#0f0f0f", border:"1px solid #1e1e1e", borderRadius:8, padding:"10px 12px", color:"#f0ede8", fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"system-ui,sans-serif" };
  const lbl = { fontSize:9, fontFamily:"'DM Mono',monospace", color:"#444", letterSpacing:".12em", textTransform:"uppercase", display:"block", marginBottom:6, fontWeight:600 };

  const startEdit = (r) => {
    setEditingId(r.id);
    setEditFields({ link: r.link || "", mapQuery: r.mapQuery || "" });
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>

      {/* ── Pending section ── */}
      <div style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:"#333", letterSpacing:".14em", textTransform:"uppercase", marginBottom:8 }}>
        Pending approval {pending.length > 0 && `(${pending.length})`}
      </div>

      {pending.length === 0 && (
        <div style={{ fontSize:13, color:"#2a2a2a", fontFamily:"'DM Mono',monospace", marginBottom:20, paddingBottom:20, borderBottom:"1px solid #141414" }}>
          All clear ✦
        </div>
      )}

      {pending.map(r => (
        <div key={r.id} style={{ background:"#141414", border:"1px solid #1e1e1e", borderRadius:12, padding:16, marginBottom:6 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
            <span style={{ fontFamily:"'Libre Baskerville',Georgia,serif", color:"#f0ede8", fontSize:15, fontWeight:700 }}>{r.product}</span>
            <Stars value={r.rating} />
          </div>
          <p style={{ margin:"0 0 8px", fontSize:13, color:"#666", fontStyle:"italic", fontFamily:"'Libre Baskerville',Georgia,serif" }}>"{r.review}"</p>
          <div style={{ fontSize:10, color:"#333", fontFamily:"'DM Mono',monospace", marginBottom:10, letterSpacing:".06em" }}>
            {r.submitter} · {r.category} · {r.where} · {r.price}
          </div>

          {/* ── Editable link fields on pending — now wired up ── */}
          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:12, padding:"10px 0", borderTop:"1px solid #1a1a1a" }}>
            <div style={{ fontSize:9, fontFamily:"'DM Mono',monospace", color:"#2e2e2e", letterSpacing:".12em", textTransform:"uppercase" }}>
              Add links before approving
            </div>
            <input
              style={inp}
              placeholder="Link (website / instagram)"
              value={r.link || ""}
              onChange={e => onUpdatePending(r.id, { link: e.target.value })}
            />
            <input
              style={inp}
              placeholder="Map search (e.g. Leon London Bridge)"
              value={r.mapQuery || ""}
              onChange={e => onUpdatePending(r.id, { mapQuery: e.target.value })}
            />
          </div>

          <div style={{ display:"flex", gap:8 }}>
            <button onClick={()=>onApprove(r.id)} style={{ flex:1, background:"#C8FF47", color:"#0a0a0a", border:"none", borderRadius:8, padding:"10px 0", fontFamily:"'DM Mono',monospace", fontSize:12, fontWeight:700, cursor:"pointer" }}>✓ Approve</button>
            <button onClick={()=>onReject(r.id)} style={{ flex:1, background:"transparent", color:"#E05A5A", border:"1px solid #E05A5A33", borderRadius:8, padding:"10px 0", fontFamily:"'DM Mono',monospace", fontSize:12, cursor:"pointer" }}>✕ Reject</button>
          </div>
        </div>
      ))}

      {/* ── Live reviews — edit links ── */}
      <div style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:"#333", letterSpacing:".14em", textTransform:"uppercase", margin:"16px 0 8px" }}>
        Edit live reviews
      </div>

      {approved.map(r => (
        <div key={r.id} style={{ background:"#141414", border:"1px solid #1e1e1e", borderRadius:12, padding:14, marginBottom:6 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontFamily:"'Libre Baskerville',Georgia,serif", color:"#f0ede8", fontSize:14, fontWeight:700 }}>{r.product}</span>
            <button
              onClick={() => editingId === r.id ? setEditingId(null) : startEdit(r)}
              style={{ background:"none", border:"1px solid #222", borderRadius:6, color:"#444", fontSize:11, fontFamily:"'DM Mono',monospace", padding:"4px 10px", cursor:"pointer" }}>
              {editingId === r.id ? "cancel" : "edit links"}
            </button>
          </div>
          <div style={{ fontSize:10, color:"#2e2e2e", fontFamily:"'DM Mono',monospace", marginTop:4, letterSpacing:".06em" }}>
            {r.submitter} · {r.where}
          </div>

          {editingId !== r.id && (
            <div style={{ marginTop:8, display:"flex", gap:6, flexWrap:"wrap" }}>
              {r.link
                ? <span style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:"#C8FF4788", background:"#C8FF4710", padding:"3px 8px", borderRadius:99 }}>↗ {r.link.slice(0,30)}{r.link.length>30?"…":""}</span>
                : <span style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:"#2a2a2a" }}>no link</span>}
              {r.mapQuery
                ? <span style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:"#6fcf6f88", background:"#6fcf6f10", padding:"3px 8px", borderRadius:99 }}>📍 {r.mapQuery.slice(0,25)}{r.mapQuery.length>25?"…":""}</span>
                : <span style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:"#2a2a2a" }}>no map pin</span>}
            </div>
          )}

          {editingId === r.id && (
            <div style={{ marginTop:12, display:"flex", flexDirection:"column", gap:10 }}>
              <div><label style={lbl}>Website or Instagram link</label><input style={inp} placeholder="https://..." value={editFields.link} onChange={e=>setEditFields(p=>({...p,link:e.target.value}))} /></div>
              <div><label style={lbl}>Map search term</label><input style={inp} placeholder="e.g. Leon London Bridge" value={editFields.mapQuery} onChange={e=>setEditFields(p=>({...p,mapQuery:e.target.value}))} /></div>
              <button
                onClick={() => { onEditApproved(r.id, editFields); setEditingId(null); }}
                style={{ background:"#C8FF47", color:"#0a0a0a", border:"none", borderRadius:8, padding:"10px 0", fontFamily:"'DM Mono',monospace", fontSize:12, fontWeight:700, cursor:"pointer" }}>
                Save changes ✓
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [reviews, setReviews] = useState(REVIEWS);
  const [pending, setPending] = useState(PENDING_INIT);
  const [cat, setCat] = useState("all");
  const [modal, setModal] = useState(null);
  const [adminOk, setAdminOk] = useState(false);

  const filtered = [...reviews].filter(r => cat==="all" || r.category===cat).sort((a,b)=>b.upvotes-a.upvotes);
  const upvote = id => setReviews(rs => rs.map(r => r.id===id ? {...r, upvotes:r.upvotes+1} : r));
  const submit = f => setPending(p => [...p, { ...f, id:Date.now(), verified:false, upvotes:0, date:new Date().toISOString().slice(0,10) }]);
  const approve = id => { const r=pending.find(x=>x.id===id); if(r){ setReviews(rs=>[...rs,{...r,verified:true}]); setPending(p=>p.filter(x=>x.id!==id)); }};
  const reject = id => setPending(p=>p.filter(x=>x.id!==id));
  const editApproved = (id, fields) => setReviews(rs => rs.map(r => r.id===id ? {...r, ...fields} : r));
  const updatePending = (id, fields) => setPending(p => p.map(r => r.id === id ? {...r, ...fields} : r));

  const openAdmin = () => {
    if (adminOk) { setModal("admin"); return; }
    const pin = window.prompt("Admin PIN:");
    if (pin==="1234") { setAdminOk(true); setModal("admin"); }
    else if (pin!==null) window.alert("Wrong PIN.");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,700;1,400&family=DM+Mono:wght@400;600&display=swap');
        *{box-sizing:border-box;} body{margin:0;background:#080808;}
        @keyframes sheetUp{from{transform:translateY(60px);opacity:0}to{transform:translateY(0);opacity:1}}
        ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:#1e1e1e;border-radius:3px}
        input::placeholder,textarea::placeholder{color:#2a2a2a}
        input:focus,textarea:focus{border-color:#2a2a2a!important}
        a:hover{opacity:.8}
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
          <p style={{ margin:"0 0 28px", color:"#383838", fontSize:13.5, lineHeight:1.6 }}>Real picks from real colleagues. No ads, no fluff.</p>

          <div style={{ display:"flex", gap:28, padding:"16px 0", borderTop:"1px solid #141414", borderBottom:"1px solid #141414", marginBottom:22 }}>
            {[["Reviews", reviews.length],["Reviewers", new Set(reviews.map(r=>r.submitter)).size],["Pending", pending.length]].map(([l,v])=>(
              <div key={l}><div style={{ fontFamily:"'DM Mono',monospace", fontSize:24, color:"#C8FF47", fontWeight:600 }}>{v}</div><div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:"#2e2e2e", letterSpacing:".14em", textTransform:"uppercase", marginTop:3 }}>{l}</div></div>
            ))}
          </div>

          <div style={{ display:"flex", gap:7, overflowX:"auto", scrollbarWidth:"none", paddingBottom:2 }}>
            {Object.keys(CAT_META).map(c=><Pill key={c} cat={c} active={cat===c} onClick={()=>setCat(c)} />)}
          </div>
        </div>

        <div style={{ padding:"18px 12px", display:"flex", flexDirection:"column", gap:10 }}>
          {filtered.length===0 && <div style={{ textAlign:"center", padding:"60px 0", color:"#222", fontSize:13 }}>No reviews yet in this category.</div>}
          {filtered.map(r=><Card key={r.id} r={r} onUp={upvote} />)}
        </div>
      </div>

      <div style={{ position:"fixed", bottom:28, left:"50%", transform:"translateX(-50%)", zIndex:100 }}>
        <button onClick={()=>setModal("submit")} style={{ background:"#C8FF47", color:"#0a0a0a", border:"none", borderRadius:99, padding:"14px 32px", fontFamily:"'DM Mono',monospace", fontSize:13, fontWeight:700, cursor:"pointer", letterSpacing:".05em", whiteSpace:"nowrap", boxShadow:"0 0 50px #C8FF4755" }}>
          + Submit a Legit Buy
        </button>
      </div>

      {modal==="submit" && <Sheet title="Submit a Legit Buy" onClose={()=>setModal(null)}><SubmitFlow onSubmit={submit} onClose={()=>setModal(null)} /></Sheet>}
      {modal==="admin" && (
        <Sheet title={`Admin${pending.length ? ` · ${pending.length} pending` : ""}`} onClose={()=>setModal(null)}>
          <AdminQueue pending={pending} onApprove={approve} onReject={reject} approved={reviews} onEditApproved={editApproved} onUpdatePending={updatePending} />
        </Sheet>
      )}
    </>
  );
}