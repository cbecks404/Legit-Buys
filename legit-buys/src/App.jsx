import { useState } from "react";

const REVIEWS = [
  { id: 1, product: "Huel Black Edition", category: "drinks", rating: 5, review: "Didn't expect to love this but the chocolate flavour is actually decent. Keeps me full till lunch no problem.", submitter: "Marcus T.", where: "Amazon", price: "£40 / 17 meals", upvotes: 12, verified: true },
  { id: 2, product: "Pip & Nut Almond Butter Cups", category: "snacks", rating: 5, review: "These are elite. Every office snack drawer needs them. Three people bought their own box after trying mine.", submitter: "Priya K.", where: "Sainsbury's", price: "£2.50", upvotes: 19, verified: true },
  { id: 3, product: "Oatly Barista", category: "drinks", rating: 4, review: "The only oat milk that actually froths properly. If you're making coffee at home this is non-negotiable.", submitter: "Jamie L.", where: "Tesco", price: "£1.90", upvotes: 8, verified: true },
  { id: 4, product: "Leon Happy Lunch Box", category: "restaurants", rating: 4, review: "Actually filling unlike most healthy lunch spots. The falafel box specifically is worth it.", submitter: "Anita R.", where: "Leon – City branch", price: "~£9", upvotes: 6, verified: true },
];

const PENDING = [
  { id: 5, product: "Graze Protein Bites", category: "snacks", rating: 4, review: "Surprisingly not chalky. Dark chocolate ones are the move.", submitter: "Tom B.", where: "Graze.com", price: "£3.99", upvotes: 0, verified: false },
];

const CAT_META = {
  all:         { emoji: "◈", color: "#C8FF47" },
  snacks:      { emoji: "🍫", color: "#F4A942" },
  drinks:      { emoji: "☕", color: "#60C3F5" },
  restaurants: { emoji: "🍽", color: "#F07070" },
};

// ── Stars ──────────────────────────────────────────────
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

// ── Category pill ──────────────────────────────────────
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

// ── Review card ────────────────────────────────────────
function Card({ r, onUp }) {
  const [upped, setUpped] = useState(false);
  const accent = CAT_META[r.category]?.color ?? "#C8FF47";
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

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:2 }}>
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

// ── Bottom sheet modal ─────────────────────────────────
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

// ── Submission form (3-step) ───────────────────────────
function SubmitFlow({ onSubmit, onClose }) {
  const [step, setStep] = useState(0);
  const [f, setF] = useState({ product:"", category:"snacks", rating:0, review:"", submitter:"", where:"", price:"" });
  const set = (k,v) => setF(p => ({...p, [k]:v}));

  const inp = { width:"100%", background:"#161616", border:"1px solid #222", borderRadius:10, padding:"12px 14px", color:"#f0ede8", fontSize:14, outline:"none", boxSizing:"border-box", fontFamily:"system-ui,sans-serif", transition:"border-color .15s" };
  const lbl = { fontSize:9, fontFamily:"'DM Mono',monospace", color:"#444", letterSpacing:".14em", textTransform:"uppercase", display:"block", marginBottom:7, fontWeight:600 };
  const next = { background:"#C8FF47", color:"#0a0a0a", border:"none", borderRadius:99, padding:"13px 0", width:"100%", fontFamily:"'DM Mono',monospace", fontSize:13, fontWeight:700, cursor:"pointer", letterSpacing:".04em", marginTop:6 };
  const back = { background:"transparent", color:"#3a3a3a", border:"1px solid #1e1e1e", borderRadius:99, padding:"11px 0", width:"100%", fontFamily:"'DM Mono',monospace", fontSize:12, cursor:"pointer", marginTop:8 };

  const steps = [
    // Step 0 – What is it?
    <div key={0} style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ fontFamily:"'Libre Baskerville',Georgia,serif", color:"#555", fontSize:13, marginBottom:4 }}>Step 1 of 3 — The buy</div>
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
      <button style={{ ...next, opacity: f.product ? 1 : .35, cursor: f.product ? "pointer":"not-allowed" }} onClick={()=>f.product && setStep(1)}>Next →</button>
    </div>,

    // Step 1 – The review
    <div key={1} style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ fontFamily:"'Libre Baskerville',Georgia,serif", color:"#555", fontSize:13, marginBottom:4 }}>Step 2 of 3 — Your verdict</div>
      <div>
        <label style={lbl}>Rating *</label>
        <Stars value={f.rating} interactive onChange={v=>set("rating",v)} />
        {f.rating > 0 && <div style={{ fontSize:11, color:"#444", fontFamily:"'DM Mono',monospace", marginTop:6 }}>{["","Nah","It's alright","Decent","Solid buy","Certified legit"][f.rating]}</div>}
      </div>
      <div><label style={lbl}>Your honest review *</label><textarea style={{ ...inp, minHeight:100, resize:"vertical" }} placeholder="What made it worth buying? Be specific." value={f.review} onChange={e=>set("review",e.target.value)} /></div>
      <button style={{ ...next, opacity: (f.rating && f.review) ? 1:.35, cursor:(f.rating && f.review)?"pointer":"not-allowed" }} onClick={()=>(f.rating && f.review) && setStep(2)}>Next →</button>
      <button style={back} onClick={()=>setStep(0)}>← Back</button>
    </div>,

    // Step 2 – Who are you?
    <div key={2} style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ fontFamily:"'Libre Baskerville',Georgia,serif", color:"#555", fontSize:13, marginBottom:4 }}>Step 3 of 3 — Verify yourself</div>
      <div style={{ background:"#141414", border:"1px solid #1c1c1c", borderRadius:10, padding:"12px 14px", fontSize:12, color:"#555", fontFamily:"'DM Mono',monospace", lineHeight:1.6 }}>
        ✓ Your name shows on the review so people know it's real. No anonymous submissions.
      </div>
      <div><label style={lbl}>Your name *</label><input style={inp} placeholder="First name + initial (e.g. Priya K.)" value={f.submitter} onChange={e=>set("submitter",e.target.value)} /></div>
      <button style={{ ...next, opacity: f.submitter ? 1:.35, cursor:f.submitter?"pointer":"not-allowed" }} onClick={()=>{ if(f.submitter){onSubmit(f);setStep(3);} }}>Submit for approval →</button>
      <button style={back} onClick={()=>setStep(1)}>← Back</button>
    </div>,

    // Done
    <div key={3} style={{ textAlign:"center", padding:"30px 0 10px" }}>
      <div style={{ fontSize:48, marginBottom:16 }}>✦</div>
      <div style={{ fontFamily:"'Libre Baskerville',Georgia,serif", fontSize:22, color:"#f0ede8", marginBottom:8 }}>Nice one.</div>
      <div style={{ fontSize:13, color:"#555", lineHeight:1.7, fontFamily:"system-ui,sans-serif", marginBottom:28 }}>
        Your review is in the queue.<br/>It'll go live once approved.
      </div>
      <button onClick={onClose} style={{ ...next, width:"auto", padding:"13px 32px" }}>Back to board</button>
    </div>,
  ];

  // Progress dots
  const dots = step < 3 ? (
    <div style={{ display:"flex", gap:6, justifyContent:"center", marginBottom:22 }}>
      {[0,1,2].map(i => <div key={i} style={{ width: i===step?20:6, height:6, borderRadius:99, background: i===step?"#C8FF47":"#1e1e1e", transition:"all .3s" }} />)}
    </div>
  ) : null;

  return <>{dots}{steps[step]}</>;
}

// ── Admin queue ────────────────────────────────────────
function AdminQueue({ pending, onApprove, onReject }) {
  if (!pending.length) return <div style={{ textAlign:"center", padding:"40px 0", color:"#333", fontSize:13, fontFamily:"'DM Mono',monospace" }}>All clear ✦ No pending reviews.</div>;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      {pending.map(r => (
        <div key={r.id} style={{ background:"#141414", border:"1px solid #1e1e1e", borderRadius:12, padding:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
            <span style={{ fontFamily:"'Libre Baskerville',Georgia,serif", color:"#f0ede8", fontSize:15, fontWeight:700 }}>{r.product}</span>
            <Stars value={r.rating} />
          </div>
          <p style={{ margin:"0 0 8px", fontSize:13, color:"#666", fontStyle:"italic", fontFamily:"'Libre Baskerville',Georgia,serif" }}>"{r.review}"</p>
          <div style={{ fontSize:10, color:"#333", fontFamily:"'DM Mono',monospace", marginBottom:14, letterSpacing:".06em" }}>
            {r.submitter} · {r.category} · {r.where} · {r.price}
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={()=>onApprove(r.id)} style={{ flex:1, background:"#C8FF47", color:"#0a0a0a", border:"none", borderRadius:8, padding:"10px 0", fontFamily:"'DM Mono',monospace", fontSize:12, fontWeight:700, cursor:"pointer" }}>✓ Approve</button>
            <button onClick={()=>onReject(r.id)} style={{ flex:1, background:"transparent", color:"#E05A5A", border:"1px solid #E05A5A33", borderRadius:8, padding:"10px 0", fontFamily:"'DM Mono',monospace", fontSize:12, cursor:"pointer" }}>✕ Reject</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main app ───────────────────────────────────────────
export default function App() {
  const [reviews, setReviews] = useState(REVIEWS);
  const [pending, setPending] = useState(PENDING);
  const [cat, setCat] = useState("all");
  const [modal, setModal] = useState(null);
  const [adminOk, setAdminOk] = useState(false);

  const filtered = [...reviews].filter(r => cat==="all" || r.category===cat).sort((a,b)=>b.upvotes-a.upvotes);

  const upvote = id => setReviews(rs => rs.map(r => r.id===id ? {...r, upvotes:r.upvotes+1} : r));
  const submit = f => setPending(p => [...p, { ...f, id:Date.now(), verified:false, upvotes:0, date:new Date().toISOString().slice(0,10) }]);
  const approve = id => { const r=pending.find(x=>x.id===id); if(r){ setReviews(rs=>[...rs,{...r,verified:true}]); setPending(p=>p.filter(x=>x.id!==id)); }};
  const reject = id => setPending(p=>p.filter(x=>x.id!==id));

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
        input::placeholder,textarea::placeholder{color:#2e2e2e}
        input:focus,textarea:focus{border-color:#2a2a2a!important;outline:none}
      `}</style>

      <div style={{ maxWidth:520, margin:"0 auto", minHeight:"100vh", paddingBottom:120 }}>

        {/* ── Header ── */}
        <div style={{ padding:"40px 18px 0", position:"relative" }}>
          <button onClick={openAdmin} title="Admin" style={{ position:"absolute", top:38, right:18, background:"none", border:"none", color:"#1e1e1e", fontSize:19, cursor:"pointer" }}>⚙</button>

          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
            <span style={{ color:"#C8FF47", fontSize:16, letterSpacing:1 }}>✦</span>
            <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:"#333", letterSpacing:".22em", textTransform:"uppercase" }}>Legit Buys</span>
          </div>

          <h1 style={{ margin:"0 0 8px", fontFamily:"'Libre Baskerville',Georgia,serif", fontSize:36, lineHeight:1.08, color:"#f0ede8", fontWeight:700 }}>
            Stuff worth<br/>actually buying.
          </h1>
          <p style={{ margin:"0 0 28px", color:"#383838", fontSize:13.5, lineHeight:1.6, fontFamily:"system-ui,sans-serif" }}>
            Real picks from real colleagues. No ads, no fluff.
          </p>

          {/* Stats */}
          <div style={{ display:"flex", gap:28, padding:"16px 0", borderTop:"1px solid #141414", borderBottom:"1px solid #141414", marginBottom:22 }}>
            {[["Reviews", reviews.length],["Reviewers", new Set(reviews.map(r=>r.submitter)).size],["Pending", pending.length]].map(([l,v])=>(
              <div key={l}><div style={{ fontFamily:"'DM Mono',monospace", fontSize:24, color:"#C8FF47", fontWeight:600, letterSpacing:"-.02em" }}>{v}</div><div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:"#2e2e2e", letterSpacing:".14em", textTransform:"uppercase", marginTop:3 }}>{l}</div></div>
            ))}
          </div>

          {/* Category filter */}
          <div style={{ display:"flex", gap:7, overflowX:"auto", scrollbarWidth:"none", paddingBottom:2 }}>
            {Object.keys(CAT_META).map(c=><Pill key={c} cat={c} active={cat===c} onClick={()=>setCat(c)} />)}
          </div>
        </div>

        {/* ── Cards ── */}
        <div style={{ padding:"18px 12px", display:"flex", flexDirection:"column", gap:10 }}>
          {filtered.length===0 && <div style={{ textAlign:"center", padding:"60px 0", color:"#222", fontSize:13 }}>No reviews yet in this category.</div>}
          {filtered.map(r=><Card key={r.id} r={r} onUp={upvote} />)}
        </div>
      </div>

      {/* ── FAB ── */}
      <div style={{ position:"fixed", bottom:28, left:"50%", transform:"translateX(-50%)", zIndex:100 }}>
        <button onClick={()=>setModal("submit")} style={{
          background:"#C8FF47", color:"#0a0a0a", border:"none", borderRadius:99,
          padding:"14px 32px", fontFamily:"'DM Mono',monospace", fontSize:13,
          fontWeight:700, cursor:"pointer", letterSpacing:".05em", whiteSpace:"nowrap",
          boxShadow:"0 0 50px #C8FF4755",
        }}>+ Submit a Legit Buy</button>
      </div>

      {/* ── Modals ── */}
      {modal==="submit" && <Sheet title="Submit a Legit Buy" onClose={()=>setModal(null)}><SubmitFlow onSubmit={submit} onClose={()=>setModal(null)} /></Sheet>}
      {modal==="admin" && <Sheet title={`Approval Queue${pending.length ? ` (${pending.length})` : ""}`} onClose={()=>setModal(null)}><AdminQueue pending={pending} onApprove={approve} onReject={reject} /></Sheet>}
    </>
  );
}