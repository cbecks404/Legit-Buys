import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

// Constants & utilities
import {
  CAT_META, DIET_TAGS, SCORE_META, SCORE_COLORS,
  RATE_LIMIT, canSubmit, recordSubmission,
} from "./constants";

// Components
import Card from "./components/Card";
import Sheet from "./components/Sheet";
import SubmitFlow from "./components/SubmitFlow";
import AdminQueue from "./components/AdminQueue";
import { Pill, DietPill } from "./components/Pills";
import { AppIntro, SubmitGuide } from "./components/Walkthroughs";

export default function App() {
  const [reviews, setReviews]           = useState([]);
  const [pending, setPending]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [cat, setCat]                   = useState("all");
  const [showSaved, setShowSaved]       = useState(false);
  const [activeDiet, setActiveDiet]     = useState([]);
  const [activeScore, setActiveScore]   = useState(null);
  const [rateLimited, setRateLimited]   = useState(!canSubmit());
  const [saved, setSaved]               = useState(() => {
    try { return JSON.parse(localStorage.getItem("lb_saved") || "[]"); }
    catch { return []; }
  });
  const [modal, setModal]               = useState(null);
  const [adminUser, setAdminUser]       = useState(null);
  const [adminEmail, setAdminEmail]     = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError]     = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [splash, setSplash]             = useState(true);
  const [showAppIntro, setShowAppIntro] = useState(() => {
    try { return localStorage.getItem("lb_intro_seen") !== "true"; }
    catch { return true; }
  });
  const [showSubmitGuide, setShowSubmitGuide] = useState(false);
  const [darkMode, setDarkMode]         = useState(() => {
    try { return localStorage.getItem("lb_theme") !== "light"; }
    catch { return true; }
  });

  // ── Theme ──────────────────────────────────────────
  const T = darkMode ? {
    bg: "#080808", surface: "#111", surface2: "#161616",
    border: "#1c1c1c", border2: "#2a2a2a",
    text: "#f0ede8", textMid: "#e0ddd8", textDim: "#555",
    pill: "#232323", cardBg: "#111",
    sheetBg: "#0d0d0d", sheetBorder: "#202020",
  } : {
    bg: "#f5f2ee", surface: "#ffffff", surface2: "#f0ede8",
    border: "#d0c8be", border2: "#b8b0a6",
    text: "#0f0d0b", textMid: "#2e2a26", textDim: "#6b6158",
    pill: "#e0d8d0", cardBg: "#ffffff",
    sheetBg: "#faf8f5", sheetBorder: "#d0c8be",
  };

  const toggleTheme = () => {
    setDarkMode(d => {
      const next = !d;
      localStorage.setItem("lb_theme", next ? "dark" : "light");
      return next;
    });
  };

  // ── Data loading ───────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setAdminUser(session.user);
    });
    async function loadData() {
      const { data: liveReviews }    = await supabase.from("reviews").select("*").order("upvotes", { ascending: false });
      const { data: pendingReviews } = await supabase.from("pending_reviews").select("*").order("date", { ascending: false });
      if (liveReviews)    setReviews(liveReviews);
      if (pendingReviews) setPending(pendingReviews);
      setLoading(false);
      setTimeout(() => setSplash(false), 600);
    }
    loadData();
  }, []);

  // ── Helpers ────────────────────────────────────────
  const toggleSave = (id) => {
    setSaved(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem("lb_saved", JSON.stringify(next));
      return next;
    });
  };

  const toggleDietFilter = (id) => setActiveDiet(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const filtered = [...reviews]
    .filter(r => !showSaved || saved.includes(r.id))
    .filter(r => cat === "all" || (r.categories ?? [r.category]).includes(cat))
    .filter(r => activeDiet.length === 0 || activeDiet.every(d => (r.diet_tags ?? []).includes(d)))
    .filter(r => activeScore === null || r.rating === activeScore)
    .sort((a, b) => b.upvotes - a.upvotes);

  // ── Walkthroughs ───────────────────────────────────
  const dismissIntro = (dontShow = false) => {
    if (dontShow) localStorage.setItem("lb_intro_seen", "true");
    setShowAppIntro(false);
  };

  const dismissSubmitGuide = (dontShow = false) => {
    if (dontShow) localStorage.setItem("lb_submit_guide_seen", "true");
    setShowSubmitGuide(false);
    setModal("submit");
  };

  // ── Supabase actions ───────────────────────────────
  const upvote = async (id) => {
    setReviews(rs => rs.map(r => r.id === id ? { ...r, upvotes: r.upvotes + 1 } : r));
    await supabase.rpc("increment_upvotes", { row_id: id });
  };

  const submit = async (f) => {
    const newReview = {
      product: f.product, category: f.category, categories: f.categories,
      rating: f.rating, review: f.review, submitter: f.submitter,
      where: f.where, price: f.price, price_range: f.priceRange,
      link: f.link, map_query: f.mapQuery, image_url: f.imageUrl,
      diet_tags: f.dietTags,
      verified: !!(await supabase.auth.getSession()).data.session,
      upvotes: 0, date: new Date().toISOString().slice(0, 10),
    };
    const { data, error } = await supabase.from("pending_reviews").insert([newReview]).select();
    if (error) { console.error("Submit error:", error); }
    else { setPending(p => [...p, data[0]]); recordSubmission(); setRateLimited(!canSubmit()); }
  };

  const approve = async (id) => {
    const r = pending.find(x => x.id === id);
    if (!r) return;
    const { id: _id, ...reviewData } = r;
    const { data, error } = await supabase.from("reviews").insert([{ ...reviewData, verified: true }]).select();
    if (error) { console.error("Approve error:", error); return; }
    await supabase.from("pending_reviews").delete().eq("id", id);
    setReviews(rs => [...rs, data[0]]);
    setPending(p => p.filter(x => x.id !== id));
  };

  const reject = async (id) => {
    const { error } = await supabase.from("pending_reviews").delete().eq("id", id);
    if (error) { console.error("Reject error:", error); return; }
    setPending(p => p.filter(x => x.id !== id));
  };

  const editApproved = async (id, fields) => {
    const update = { link: fields.link, map_query: fields.mapQuery };
    await supabase.from("reviews").update(update).eq("id", id);
    setReviews(rs => rs.map(r => r.id === id ? { ...r, ...update } : r));
  };

  const updatePending = (id, fields) => setPending(p => p.map(r => r.id === id ? { ...r, ...fields } : r));

  // ── Admin auth ─────────────────────────────────────
  const openAdmin = () => {
    if (adminUser) { setModal("admin"); return; }
    setModal("adminLogin");
  };

  const handleAdminLogin = async () => {
    setAdminLoading(true);
    setAdminError("");
    const { data, error } = await supabase.auth.signInWithPassword({ email: adminEmail, password: adminPassword });
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

  // ── Render ─────────────────────────────────────────
  return (
    <>
      {/* Splash screen */}
      {splash && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 999, background: T.bg,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          animation: loading ? "none" : "splashFadeOut .8s ease forwards",
          pointerEvents: loading ? "all" : "none",
        }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, animation: "splashFadeIn .6s cubic-bezier(.16,1,.3,1) forwards" }}>
            <div style={{ fontSize: 48, color: "#C8FF47", animation: "pulse 2s ease infinite" }}>✦</div>
            <h1 style={{ margin: "0 0 6px", fontFamily: "'LBTitle', sans-serif", fontSize: "clamp(48px, 11vw, 120px)", lineHeight: 1, color: T.text, fontWeight: 400, letterSpacing: ".04em", textTransform: "uppercase" }}>
              LEGIT BUYS
            </h1>
            <p style={{ margin: "0 0 24px", color: T.textMid, fontSize: 13.5, lineHeight: 1.6, fontFamily: "'LBBody', sans-serif", letterSpacing: ".18em", textTransform: "uppercase" }}>
              Real picks from real foodies
            </p>
          </div>
          {loading && (
            <div style={{ position: "absolute", bottom: 60, display: "flex", gap: 6 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#C8FF47", animation: `pulse 1.2s ease ${i * 0.2}s infinite` }} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Global styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,700;1,400&family=DM+Mono:wght@400;600;700&display=swap');
        *{box-sizing:border-box;} body{margin:0;background:${T.bg};transition:background .3s;}
        @keyframes sheetUp      {from{transform:translateY(60px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes holo         {0%{background-position:0% 50%;filter:hue-rotate(0deg)}50%{background-position:100% 50%;filter:hue-rotate(180deg)}100%{background-position:0% 50%;filter:hue-rotate(360deg)}}
        @keyframes shimmer      {0%{transform:translateX(-100%) rotate(45deg)}100%{transform:translateX(200%) rotate(45deg)}}
        @keyframes popIn        {0%{transform:scale(0.85);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
        @keyframes fadeSlideUp  {from{transform:translateY(8px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes splashFadeIn {from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes splashFadeOut{from{opacity:1}to{opacity:0;pointer-events:none}}
        @keyframes pulse        {0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes slideInRight {from{transform:translateX(60px);opacity:0}to{transform:translateX(0);opacity:1}}
        @keyframes slideInLeft  {from{transform:translateX(-60px);opacity:0}to{transform:translateX(0);opacity:1}}
        ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:#1e1e1e;border-radius:3px}
        input::placeholder,textarea::placeholder{color:#555}
        input:focus,textarea:focus,select:focus{border-color:#555!important;outline:none}
        a:hover{opacity:.75} select option{background:#161616}
      `}</style>

      {/* Main board */}
      <div style={{ maxWidth: 520, margin: "0 auto", minHeight: "100vh", paddingBottom: 120, overflowX: "hidden", background: T.bg, transition: "background .3s" }}>
        <div style={{ padding: "40px 18px 0", position: "relative", background: T.bg }}>

          {/* Top right controls */}
          <div style={{ position: "absolute", top: 38, right: 18, display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={toggleTheme} title="Toggle theme" style={{ background: "none", border: "none", fontSize: 16, cursor: "pointer", color: T.textDim, padding: 0 }}>
              {darkMode ? "☀️" : "🌙"}
            </button>
            <button onClick={openAdmin} title="Admin" style={{ background: "none", border: "none", color: T.textDim, fontSize: 19, cursor: "pointer", padding: 0 }}>⚙</button>
          </div>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ color: "#C8FF47", fontSize: 16 }}>✦</span>
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#CCC", letterSpacing: ".22em", textTransform: "uppercase" }}>Legit Buys</span>
          </div>
          <h1 style={{ margin: "0 0 6px", fontFamily: "'LBTitle', sans-serif", fontSize: "clamp(48px, 11vw, 120px)", lineHeight: 1, color: "#f0ede8", fontWeight: 400, letterSpacing: ".04em", textTransform: "uppercase" }}>
            LEGIT BUYS
          </h1>
          <p style={{ margin: "0 0 24px", color: "#e0ddd8", fontSize: 13.5, lineHeight: 1.6, fontFamily: "'LBBody', sans-serif", letterSpacing: ".18em", textTransform: "uppercase" }}>Real picks from real foodies</p>

          {/* Score filters */}
          <div style={{ padding: "14px 0", borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, marginBottom: 20 }}>
            <div style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: "#CCC", letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 10 }}>Filter by score</div>
            <div style={{ display: "flex", gap: 8 }}>
              {SCORE_META.map(m => {
                const color = SCORE_COLORS[m.value];
                const isActive = activeScore === m.value;
                return (
                  <button key={m.value} onClick={() => setActiveScore(isActive ? null : m.value)} style={{
                    flex: 1, padding: "10px 4px", borderRadius: 10, border: "none", lineHeight: 1.5,
                    outline: `1.5px solid ${isActive ? color : `${color}44`}`,
                    background: isActive ? `${color}18` : `${color}08`,
                    color: isActive ? color : `${color}99`,
                    fontFamily: "'DM Mono',monospace", fontSize: 10, cursor: "pointer",
                    transition: "all .15s", fontWeight: isActive ? 700 : 400,
                  }}>
                    {m.value}<br />{m.short}
                  </button>
                );
              })}
            </div>
            {activeScore !== null && (
              <button onClick={() => setActiveScore(null)} style={{ background: "none", border: "none", color: "#bbb", fontSize: 11, fontFamily: "'DM Mono',monospace", cursor: "pointer", padding: "8px 0 0", letterSpacing: ".06em" }}>
                ✕ clear
              </button>
            )}
          </div>

          {/* Category pills */}
          <div style={{ display: "flex", gap: 7, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 8 }}>
            {Object.keys(CAT_META).map(c => <Pill key={c} cat={c} active={cat === c} onClick={() => setCat(c)} />)}
          </div>

          {/* My saves */}
          <button onClick={() => setShowSaved(s => !s)} style={{
            marginTop: 2, marginBottom: 2,
            background: showSaved ? "#ffffff14" : "transparent",
            border: `1px solid ${showSaved ? "#f0ede8" : "#2e2e2e"}`,
            color: showSaved ? "#f0ede8" : "#BBB",
            borderRadius: 99, padding: "7px 16px", fontSize: 11,
            fontFamily: "'DM Mono',monospace", cursor: "pointer", transition: "all .2s",
          }}>
            {showSaved ? "★ My saves" : "☆ My saves"}
          </button>

          {/* Diet pills */}
          <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 4, paddingTop: 8 }}>
            {DIET_TAGS.map(tag => <DietPill key={tag.id} tag={tag} active={activeDiet.includes(tag.id)} onClick={() => toggleDietFilter(tag.id)} />)}
          </div>

          {/* Clear filters + scoring guide */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, minHeight: 24 }}>
            {activeDiet.length > 0 ? (
              <button onClick={() => setActiveDiet([])} style={{ background: "none", border: "none", color: "#ccc", fontSize: 11, fontFamily: "'LBBody',sans-serif", cursor: "pointer", padding: 0, letterSpacing: ".06em" }}>
                ✕ clear filters
              </button>
            ) : <span />}
            <a href="/scoring-guide.html" target="_blank" rel="noopener noreferrer" style={{
              fontSize: 11, fontFamily: "'LBBody', sans-serif", color: "#C8FF47",
              letterSpacing: ".08em", textDecoration: "none",
              background: "#C8FF4714", border: "1px solid #C8FF4733",
              padding: "6px 14px", borderRadius: 99,
            }}>
              ✦ Review &amp; scoring guide
            </a>
          </div>
        </div>

        {/* Card feed */}
        <div style={{ padding: "18px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
          {loading && <div style={{ textAlign: "center", padding: "60px 0", color: "#CCC", fontSize: 13, fontFamily: "'DM Mono',monospace", letterSpacing: ".1em" }}>loading buys...</div>}
          {!loading && filtered.length === 0 && <div style={{ textAlign: "center", padding: "60px 0", color: "#222", fontSize: 13, fontFamily: "'DM Mono',monospace" }}>No reviews match these filters.</div>}
          {filtered.map(r => <Card key={r.id} r={r} onUp={upvote} saved={saved.includes(r.id)} onSave={toggleSave} theme={T} />)}
        </div>
      </div>

      {/* Submit button */}
      <div style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", zIndex: 100 }}>
        <button
          onClick={() => {
            if (rateLimited) { setModal("rateLimited"); return; }
            const seen = localStorage.getItem("lb_submit_guide_seen") === "true";
            if (!seen) { setShowSubmitGuide(true); } else { setModal("submit"); }
          }}
          onMouseDown={e => e.currentTarget.style.transform = "scale(0.96)"}
          onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          style={{
            background: rateLimited ? "#111" : "#C8FF47",
            color: rateLimited ? "#444" : "#0a0a0a",
            border: rateLimited ? "1px solid #2a2a2a" : "none",
            borderRadius: 99, padding: "16px 36px",
            fontFamily: "'LBTitle', sans-serif",
            fontSize: "clamp(16px, 4vw, 22px)", letterSpacing: ".06em",
            cursor: "pointer", transition: "all .2s",
            boxShadow: rateLimited ? "none" : "0 4px 24px #C8FF4744",
          }}>
          {rateLimited ? "🔒 Submit" : "SUBMIT A LEGIT BUY"}
        </button>
      </div>

      {/* Walkthroughs */}
      {showAppIntro && !splash && <AppIntro onDismiss={dismissIntro} theme={T} />}
      {showSubmitGuide && <SubmitGuide onDismiss={dismissSubmitGuide} theme={T} />}

      {/* Modals */}
      {modal === "submit" && <SubmitFlow onSubmit={submit} onClose={() => setModal(null)} theme={T} />}

      {modal === "adminLogin" && (
        <Sheet title="Admin login" onClose={() => setModal(null)} theme={T}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: "#bbb", letterSpacing: ".14em", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 600 }}>Email</label>
              <input type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} placeholder="your@email.com"
                style={{ width: "100%", background: "#161616", border: "1px solid #666", borderRadius: 10, padding: "12px 14px", color: "#f0ede8", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "system-ui,sans-serif" }} />
            </div>
            <div>
              <label style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: "#bbb", letterSpacing: ".14em", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 600 }}>Password</label>
              <input type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} placeholder="••••••••"
                onKeyDown={e => e.key === "Enter" && handleAdminLogin()}
                style={{ width: "100%", background: "#161616", border: "1px solid #666", borderRadius: 10, padding: "12px 14px", color: "#f0ede8", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "system-ui,sans-serif" }} />
            </div>
            {adminError && <div style={{ fontSize: 12, color: "#E05A5A", fontFamily: "'DM Mono',monospace" }}>{adminError}</div>}
            <button onClick={handleAdminLogin} disabled={adminLoading}
              style={{ background: "#C8FF47", color: "#0a0a0a", border: "none", borderRadius: 99, padding: "13px 0", width: "100%", fontFamily: "'DM Mono',monospace", fontSize: 13, fontWeight: 700, cursor: adminLoading ? "not-allowed" : "pointer", opacity: adminLoading ? 0.5 : 1 }}>
              {adminLoading ? "Logging in…" : "Log in →"}
            </button>
          </div>
        </Sheet>
      )}

      {modal === "rateLimited" && (
        <Sheet title="Submission limit reached" onClose={() => setModal(null)} theme={T}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "#141414", border: "1px solid #1c1c1c", borderRadius: 10, padding: "14px 16px", fontSize: 13, color: "#ccc", fontFamily: "'DM Mono',monospace", lineHeight: 1.7 }}>
              You've submitted {RATE_LIMIT} reviews in the last 24 hours — that's the daily limit to keep things quality over quantity.
            </div>
            <div style={{ fontSize: 13, color: "#bbb", fontFamily: "'Libre Baskerville',Georgia,serif", lineHeight: 1.7 }}>
              Come back tomorrow to add more. In the meantime, upvote the reviews you agree with.
            </div>
            <button onClick={() => setModal(null)} style={{ background: "#C8FF47", color: "#0a0a0a", border: "none", borderRadius: 99, padding: "13px 0", width: "100%", fontFamily: "'DM Mono',monospace", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              Got it
            </button>
          </div>
        </Sheet>
      )}

      {modal === "admin" && (
        <Sheet title={`Admin${pending.length ? ` · ${pending.length} pending` : ""}`} onClose={() => setModal(null)} theme={T}>
          <AdminQueue pending={pending} onApprove={approve} onReject={reject} approved={reviews} onEditApproved={editApproved} onUpdatePending={updatePending} />
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #1a1a1a" }}>
            <div style={{ fontSize: 11, color: "#CCC", fontFamily: "'DM Mono',monospace", marginBottom: 10 }}>
              Logged in as {adminUser?.email}
            </div>
            <button onClick={handleAdminLogout} style={{ background: "transparent", color: "#E05A5A", border: "1px solid #E05A5A33", borderRadius: 99, padding: "9px 20px", fontFamily: "'DM Mono',monospace", fontSize: 12, cursor: "pointer" }}>
              Log out
            </button>
          </div>
        </Sheet>
      )}
    </>
  );
}
