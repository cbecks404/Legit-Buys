import { useState, useRef } from "react";
import { CAT_META, DIET_TAGS, PRICE_RANGE } from "../constants";
import ScoreSelector from "./ScoreSelector";

export default function SubmitFlow({ onSubmit, onClose, theme: T = {} }) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [f, setF] = useState({
    product: "", category: "snacks", categories: ["snacks"], rating: 0, review: "",
    submitter: "", where: "", price: "", priceRange: "fair",
    link: "", mapQuery: "", dietTags: [], imageUrl: "",
  });

  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  const toggleDiet = (id) => setF(p => ({
    ...p,
    dietTags: p.dietTags.includes(id) ? p.dietTags.filter(t => t !== id) : [...p.dietTags, id],
  }));

  const toggleCategory = (c) => setF(p => {
    const already = p.categories.includes(c);
    const next = already && p.categories.length === 1
      ? p.categories
      : already
        ? p.categories.filter(x => x !== c)
        : [...p.categories, c];
    return { ...p, categories: next, category: next[0] };
  });

  const goNext = (n) => { setDir(1); setStep(n); };
  const goBack = (n) => { setDir(-1); setStep(n); };

  const touchStart = useRef(null);
  const handleTouchStart = (e) => { touchStart.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStart.current === null) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) < 50) return;
    if (diff > 0 && step < 3) goNext(step + 1);
    if (diff < 0 && step > 0) goBack(step - 1);
    touchStart.current = null;
  };

  const inp = { width: "100%", background: T.surface2 ?? "#161616", border: `1px solid ${T.border2 ?? "#aaa"}`, borderRadius: 10, padding: "12px 14px", color: T.text ?? "#f0ede8", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "system-ui,sans-serif" };
  const lbl = { fontSize: 12, fontFamily: "'LBBody',sans-serif", color: "#f0ede8", letterSpacing: ".14em", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 600 };
  const hint = { fontSize: 11, color: T.textDim ?? "#555", fontFamily: "'LBBody',sans-serif", marginTop: 5, lineHeight: 1.5 };
  const handlePrice = (val) => set("price", val.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1"));

  const TOTAL_STEPS = 4;
  const progress = (step / TOTAL_STEPS) * 100;

  const anim = (d) => `${d > 0 ? "slideInRight" : "slideInLeft"} .25s cubic-bezier(.16,1,.3,1)`;

  const steps = [
    // Step 0 – The buy
    <div key={0} style={{ display: "flex", flexDirection: "column", gap: 16, animation: anim(dir) }}>
      <div style={{ fontFamily: "'LBTitle', sans-serif", color: T.text ?? "#f0ede8", fontSize: "clamp(32px, 8vw, 52px)", letterSpacing: ".04em", lineHeight: 1, marginBottom: 16, textTransform: "uppercase" }}>THE BUY</div>
      <div>
        <label style={lbl}>Product or place *</label>
        <input style={inp} placeholder="e.g. Pip & Nut Almond Butter Cups" value={f.product} onChange={e => set("product", e.target.value)} />
      </div>
      <div>
        <label style={lbl}>Category *</label>
        <div style={{ fontSize: 11, color: T.textDim ?? "#e0ddd8", fontFamily: "'LBBody',sans-serif", marginBottom: 6 }}>Select all that apply</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {Object.entries(CAT_META).filter(([k]) => k !== "all").map(([c, m]) => {
            const isActive = f.categories.includes(c);
            return (
              <button key={c} onClick={() => toggleCategory(c)} style={{
                padding: "10px 4px", borderRadius: 10, border: "none", lineHeight: 1.5,
                outline: `1.5px solid ${isActive ? m.color : T.border ?? "#1e1e1e"}`,
                background: isActive ? `${m.color}14` : T.surface2 ?? "#161616",
                color: isActive ? m.color : T.textDim ?? "#444",
                fontFamily: "'DM Mono',monospace", fontSize: 11, cursor: "pointer", transition: "all .15s", position: "relative",
              }}>
                {m.emoji}<br />{c}
                {isActive && f.categories.length > 1 && (
                  <span style={{ position: "absolute", top: 4, right: 6, fontSize: 8, color: m.color }}>✓</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div><label style={lbl}>Where to get it</label><input style={inp} placeholder="Tesco, Amazon, local deli…" value={f.where} onChange={e => set("where", e.target.value)} /></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={lbl}>Price</label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: T.text ?? "#f0ede8", fontFamily: "'DM Mono',monospace", fontSize: 14, pointerEvents: "none" }}>£</span>
            <input style={{ ...inp, paddingLeft: 26 }} placeholder="3.99" value={f.price} onChange={e => handlePrice(e.target.value)} />
          </div>
        </div>
        <div>
          <label style={lbl}>Value</label>
          <select value={f.priceRange} onChange={e => set("priceRange", e.target.value)} style={{ ...inp, cursor: "pointer", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23555'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "calc(100% - 14px) center" }}>
            {PRICE_RANGE.map(p => <option key={p.id} value={p.id} style={{ background: T.surface2 ?? "#161616" }}>{p.symbol} — {p.label}</option>)}
          </select>
        </div>
      </div>
      <button style={{ background: "#C8FF47", color: "#0a0a0a", border: "none", borderRadius: 99, padding: "13px 0", width: "100%", fontFamily: "'LBTitle',sans-serif", fontSize: 16, letterSpacing: ".04em", cursor: f.product ? "pointer" : "not-allowed", opacity: f.product ? 1 : 0.35, marginTop: 6 }}
        onClick={() => f.product && goNext(1)}>NEXT →</button>
    </div>,

    // Step 1 – Score & name
    <div key={1} style={{ display: "flex", flexDirection: "column", gap: 16, animation: anim(dir) }}>
      <div style={{ fontFamily: "'LBTitle', sans-serif", color: T.text ?? "#f0ede8", fontSize: "clamp(32px, 8vw, 52px)", letterSpacing: ".04em", lineHeight: 1, marginBottom: 16, textTransform: "uppercase" }}>YOUR VERDICT</div>
      <div>
        <label style={lbl}>Score *</label>
        <ScoreSelector value={f.rating} interactive onChange={v => set("rating", v)} />
      </div>
      <div>
        <label style={lbl}>Your honest review *</label>
        <textarea style={{ ...inp, minHeight: 100, resize: "vertical" }} placeholder="What made it worth buying? Be specific." value={f.review} onChange={e => set("review", e.target.value)} />
      </div>
      <div style={{ background: T.surface2 ?? "#141414", border: `1px solid ${T.border ?? "#1c1c1c"}`, borderRadius: 10, padding: "12px 14px", fontSize: 12, color: T.textMid ?? "#ddd", fontFamily: "'LBBody',monospace", lineHeight: 1.6 }}>
        ✓ Your name shows on the review so people know it's real.
      </div>
      <div><label style={lbl}>Your name *</label><input style={inp} placeholder="First name + initial (e.g. Priya K.)" value={f.submitter} onChange={e => set("submitter", e.target.value)} /></div>
      <button style={{ background: "#C8FF47", color: "#0a0a0a", border: "none", borderRadius: 99, padding: "13px 0", width: "100%", fontFamily: "'LBTitle',sans-serif", fontSize: 16, letterSpacing: ".04em", cursor: (f.rating !== null && f.review && f.submitter) ? "pointer" : "not-allowed", opacity: (f.rating !== null && f.review && f.submitter) ? 1 : 0.35, marginTop: 6 }}
        onClick={() => { if (f.rating !== null && f.review && f.submitter) goNext(2); }}>NEXT →</button>
      <button style={{ background: "transparent", color: T.textMid ?? "#ccc", border: `1px solid ${T.border2 ?? "#2e2e2e"}`, borderRadius: 99, padding: "11px 0", width: "100%", fontFamily: "'LBBody',sans-serif", fontSize: 12, cursor: "pointer", marginTop: 4 }} onClick={() => goBack(0)}>← Back</button>
    </div>,

    // Step 2 – Dietary info
    <div key={2} style={{ display: "flex", flexDirection: "column", gap: 16, animation: anim(dir) }}>
      <div style={{ fontFamily: "'LBTitle', sans-serif", color: T.text ?? "#f0ede8", fontSize: "clamp(32px, 8vw, 52px)", letterSpacing: ".04em", lineHeight: 1, marginBottom: 16, textTransform: "uppercase" }}>DIETARY INFO</div>
      <div style={{ background: T.surface2 ?? "#141414", border: `1px solid ${T.border ?? "#1c1c1c"}`, borderRadius: 10, padding: "12px 14px", fontSize: 12, color: T.textMid ?? "#ccc", fontFamily: "'LBBody',sans-serif", lineHeight: 1.7 }}>
        Tag any diets this suits. Optional — helps people filter for what works for them.
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {DIET_TAGS.map(tag => (
          <button key={tag.id} onClick={() => toggleDiet(tag.id)} style={{
            padding: "8px 14px", borderRadius: 99, fontSize: 12, cursor: "pointer", transition: "all .15s",
            border: `1.5px solid ${f.dietTags.includes(tag.id) ? "#555" : T.border ?? "#1e1e1e"}`,
            background: f.dietTags.includes(tag.id) ? "#ffffff14" : T.surface2 ?? "#161616",
            color: f.dietTags.includes(tag.id) ? T.text ?? "#f0ede8" : T.textDim ?? "#bbb",
            fontFamily: "'LBBody',sans-serif",
          }}>{tag.label}</button>
        ))}
      </div>
      <button style={{ background: "#C8FF47", color: "#0a0a0a", border: "none", borderRadius: 99, padding: "13px 0", width: "100%", fontFamily: "'LBTitle',sans-serif", fontSize: 16, letterSpacing: ".04em", cursor: "pointer", marginTop: 6 }} onClick={() => goNext(3)}>NEXT →</button>
      <button style={{ background: "transparent", color: T.textMid ?? "#ccc", border: `1px solid ${T.border2 ?? "#2e2e2e"}`, borderRadius: 99, padding: "11px 0", width: "100%", fontFamily: "'LBBody',sans-serif", fontSize: 12, cursor: "pointer", marginTop: 4 }} onClick={() => goBack(1)}>← Back</button>
    </div>,

    // Step 3 – Links
    <div key={3} style={{ display: "flex", flexDirection: "column", gap: 16, animation: anim(dir) }}>
      <div style={{ fontFamily: "'LBTitle', sans-serif", color: T.text ?? "#f0ede8", fontSize: "clamp(32px, 8vw, 52px)", letterSpacing: ".04em", lineHeight: 1, marginBottom: 16, textTransform: "uppercase" }}>LINKS</div>
      <div style={{ background: T.surface2 ?? "#141414", border: `1px solid ${T.border ?? "#1c1c1c"}`, borderRadius: 10, padding: "12px 14px", fontSize: 12, color: T.textMid ?? "#ccc", fontFamily: "'LBBody',sans-serif", lineHeight: 1.7 }}>
        Help readers find it instantly. Both fields are optional — an admin can fill them in later.
      </div>
      <div>
        <label style={lbl}>Website or Instagram link</label>
        <input style={inp} placeholder="https://leon.co or https://instagram.com/..." value={f.link} onChange={e => set("link", e.target.value)} />
      </div>
      <div>
        <label style={lbl}>Photo link (optional)</label>
        <input style={inp} placeholder="Paste a direct image URL ending in .jpg or .png" value={f.imageUrl} onChange={e => set("imageUrl", e.target.value)} />
        <div style={hint}>Must be a direct image link — right click any image online and copy image address.</div>
      </div>
      <div>
        <label style={lbl}>Address or postcode for map</label>
        <input style={inp} placeholder="e.g. Leon, London Bridge SE1 or SW1A 1AA" value={f.mapQuery} onChange={e => set("mapQuery", e.target.value)} />
        <div style={hint}>Typed exactly into Google Maps when tapped.</div>
      </div>
      <button style={{ background: "#C8FF47", color: "#0a0a0a", border: "none", borderRadius: 99, padding: "13px 0", width: "100%", fontFamily: "'LBTitle',sans-serif", fontSize: 16, letterSpacing: ".04em", cursor: "pointer", marginTop: 6 }}
        onClick={() => { onSubmit(f); goNext(4); }}>SUBMIT FOR APPROVAL →</button>
      <button style={{ background: "transparent", color: T.textMid ?? "#ccc", border: `1px solid ${T.border2 ?? "#2e2e2e"}`, borderRadius: 99, padding: "11px 0", width: "100%", fontFamily: "'LBBody',sans-serif", fontSize: 12, cursor: "pointer", marginTop: 4 }} onClick={() => goBack(2)}>← Back</button>
    </div>,

    // Done
    <div key={4} style={{ textAlign: "center", padding: "30px 0 10px", animation: "slideInRight .25s cubic-bezier(.16,1,.3,1)" }}>
      <div style={{ fontSize: 48, marginBottom: 16, color: "#C8FF47" }}>✦</div>
      <div style={{ fontFamily: "'LBTitle',sans-serif", fontSize: 28, color: T.text ?? "#f0ede8", marginBottom: 8, letterSpacing: ".04em" }}>NICE ONE.</div>
      <div style={{ fontSize: 13, color: T.textMid ?? "#ddd", lineHeight: 1.7, marginBottom: 28, fontFamily: "'LBBody',sans-serif" }}>Your review is in the queue.<br />It'll go live once approved.</div>
      <button onClick={onClose} style={{ background: "#C8FF47", color: "#0a0a0a", border: "none", borderRadius: 99, padding: "13px 32px", fontFamily: "'LBTitle',sans-serif", fontSize: 16, letterSpacing: ".04em", cursor: "pointer" }}>BACK TO BOARD</button>
    </div>,
  ];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: T.bg ?? "#080808", display: "flex", flexDirection: "column", overflowY: "auto" }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}>
      {/* Progress bar */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: T.bg ?? "#080808", paddingTop: "env(safe-area-inset-top)" }}>
        <div style={{ height: 3, background: T.border ?? "#1a1a1a" }}>
          <div style={{ height: "100%", background: "#C8FF47", width: `${progress}%`, transition: "width .3s cubic-bezier(.16,1,.3,1)" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 18px 8px" }}>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.textDim ?? "#555", fontSize: 13, fontFamily: "'LBBody',sans-serif", cursor: "pointer", padding: 0 }}>✕ Cancel</button>
          <span style={{ fontSize: 11, color: T.textDim ?? "#555", fontFamily: "'LBBody',sans-serif", letterSpacing: ".1em" }}>
            {step < 4 ? `${step + 1} of 4` : ""}
          </span>
        </div>
      </div>
      {/* Step content */}
      <div style={{ flex: 1, padding: "40px 18px 60px", maxWidth: 520, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {steps[step]}
      </div>
    </div>
  );
}
