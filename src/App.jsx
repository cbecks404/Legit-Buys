import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import "./theme.css";

// Constants & utilities
import {
  CAT_META, DIET_TAGS, SCORE_META, SCORE_COLORS,
  RATE_LIMIT, canSubmit, recordSubmission,
} from "./constants";

// Components
import Card from "./components/Card";
import Sheet from "./components/Sheet";
import SubmitFlow from "./components/SubmitFlow";
import VerifiedUsers from "./components/VerifiedUsers";
import { Pill, DietPill } from "./components/Pills";
import { AppIntro, SubmitGuide } from "./components/Walkthroughs";
import MenuPanel from "./components/MenuPanel";
import FilterPanel from "./components/FilterPanel";
import UserAuth from "./components/UserAuth";
import ProfilePage from "./components/ProfilePage";

export default function App() {
  const [reviews, setReviews]           = useState([]);
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
  const [showMenu, setShowMenu]       = useState(false);
  const [showFilter, setShowFilter]   = useState(false);
  const [screen, setScreen]           = useState("home");
  const [activeCity, setActiveCity]   = useState(null);
  const [userUpvotes, setUserUpvotes] = useState([]);
  const [user, setUser]                 = useState(null);
  const [userProfile, setUserProfile]   = useState(null);
  const [showUserAuth, setShowUserAuth] = useState(false);
  const [feedTab, setFeedTab]           = useState("all"); // "all" | "following"
  const [followingReviews, setFollowingReviews] = useState([]);
  const [viewingUserId, setViewingUserId] = useState(null);
  const [darkMode]                       = useState(() => {
    try { return localStorage.getItem("lb_theme") !== "light"; }
    catch { return true; }
  });

  // ── Sync data-theme attribute with darkMode (CSS variable theming) ──
  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
  }, [darkMode]);

  // ── Following feed ─────────────────────────────────
  useEffect(() => {
    if (feedTab !== "following" || !user) return;
    supabase.rpc("get_following_reviews", { p_user_id: user.id })
      .then(({ data }) => { if (data) setFollowingReviews(data); });
  }, [feedTab, user]);

  // ── Helpers ────────────────────────────────────────
  const loadUserProfile = async (u) => {
    if (!u) { setUserProfile(null); setUserUpvotes([]); return; }
    const [{ data: prof }, { data: upvoteData }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", u.id).single(),
      supabase.from("upvotes").select("review_id").eq("user_id", u.id),
    ]);
    if (prof) setUserProfile(prof);
    if (upvoteData) setUserUpvotes(upvoteData.map(u => u.review_id));
  };

  const toggleSave = (id) => {
    setSaved(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem("lb_saved", JSON.stringify(next));
      return next;
    });
  };

  const toggleDietFilter = (id) => setActiveDiet(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const activeReviews = feedTab === "following" ? followingReviews : reviews;

  const filtered = [...activeReviews]
    .filter(r => !showSaved || saved.includes(r.id))
    .filter(r => cat === "all" || (r.categories ?? [r.category]).includes(cat))
    .filter(r => activeDiet.length === 0 || activeDiet.every(d => (r.diet_tags ?? []).includes(d)))
    .filter(r => activeScore === null || r.rating === activeScore)
    .filter(r => !activeCity || r.city === activeCity)
    .sort((a, b) => {
      const aHolo = a.rating === 3 && (a.price_range === "pricey") ? 1 : 0;
      const bHolo = b.rating === 3 && (b.price_range === "pricey") ? 1 : 0;
      if (bHolo !== aHolo) return bHolo - aHolo;
      return b.upvotes - a.upvotes;
    });

  // ── Data loading ───────────────────────────────────
  useEffect(() => {
    const isAdmin = (u) => u?.app_metadata?.role === "admin";

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        if (isAdmin(session.user)) setAdminUser(session.user);
        loadUserProfile(session.user);
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        if (isAdmin(session.user)) setAdminUser(session.user);
        else setAdminUser(null);
        loadUserProfile(session.user);
      } else {
        setAdminUser(null);
        setUserProfile(null);
      }
    });

    async function loadData() {
      const { data: liveReviews } = await supabase.from("reviews").select("*").order("upvotes", { ascending: false });
      if (liveReviews) setReviews(liveReviews);
      setLoading(false);
      setTimeout(() => setSplash(false), 600);
    }

    loadData();
  }, []);
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
    if (!user) { setShowUserAuth(true); return; }
    if (userUpvotes.includes(id)) return;
    
    setUserUpvotes(prev => [...prev, id]);
    await supabase.from("upvotes").insert({ user_id: user.id, review_id: id });
    await supabase.rpc("increment_upvotes", { row_id: id });
    
    const { data } = await supabase.from("reviews").select("*").eq("id", id).single();
    if (data) setReviews(rs => rs.map(r => r.id === id ? data : r));
  };

  const submit = async (f) => {
    const newReview = {
      product: f.product, category: f.category, categories: f.categories,
      rating: f.rating, review: f.review, submitter: f.submitter,
      where: f.where, price: f.price, price_range: f.priceRange,
      link: f.link, map_query: f.mapQuery, image_url: f.imageUrl, city: f.city,
      diet_tags: f.dietTags,
      user_id: user?.id ?? null,
      submitter_email: user?.email ?? null,
      verified: !!user,
      upvotes: 0, date: new Date().toISOString().slice(0, 10),
    };
    const { data, error } = await supabase.from("reviews").insert([newReview]).select();
    if (error) { console.error("Submit error:", error); }
    else { setReviews(rs => [...rs, data[0]]); recordSubmission(); setRateLimited(!canSubmit()); }
  };

  // ── Admin auth ─────────────────────────────────────
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
            position: "fixed", inset: 0, zIndex: 999, background: "var(--bg)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            animation: loading ? "none" : "splashFadeOut .8s ease forwards",
            pointerEvents: loading ? "all" : "none",
          }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, animation: "splashFadeIn .6s cubic-bezier(.16,1,.3,1) forwards" }}>
              <div style={{ fontSize: 48, color: "#C8FF47", animation: "pulse 2s ease infinite" }}>✦</div>
              <h1 style={{ margin: "0 0 6px", fontFamily: "'LBTitle', sans-serif", fontSize: "clamp(48px, 11vw, 120px)", lineHeight: 1, color: "var(--text)", fontWeight: 400, letterSpacing: ".04em", textTransform: "uppercase" }}>
                LEGIT BUYS
              </h1>
              <p style={{ margin: "0 0 24px", color: "var(--text-mid)", fontSize: 13.5, lineHeight: 1.6, fontFamily: "'LBBody', sans-serif", letterSpacing: ".18em", textTransform: "uppercase" }}>
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
          *{box-sizing:border-box;} body{margin:0;background:var(--bg);transition:background .3s;}
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
          @keyframes slideInFromRight {from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
          ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:#1e1e1e;border-radius:3px}
          input::placeholder,textarea::placeholder{color:#555}
          input:focus,textarea:focus,select:focus{border-color:#555!important;outline:none}
          a:hover{opacity:.75} select option{background:#161616}
        `}</style>

        {/* Main board */}
        <div style={{ maxWidth: 520, margin: "0 auto", minHeight: "100vh", paddingBottom: 120, overflowX: "hidden", background: "var(--bg)", transition: "background .3s" }}>
          <div style={{ padding: "20px 18px 0", position: "relative", background: "var(--bg)" }}>

            {/* Top bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ color: "#C8FF47", fontSize: 28, lineHeight: 1 }}>✦</span>
              <button onClick={() => setShowMenu(true)} style={{
                background: "none", border: "none", cursor: "pointer",
                color: "var(--text-mid)", fontSize: 22, padding: 4, lineHeight: 1,
              }}>☰</button>
            </div>

            {/* City pills */}
            {(() => {
              const cities = [...new Set(reviews.filter(r => r.city).map(r => r.city))].sort();
              if (cities.length === 0) return null;
              return (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontFamily: "'LBBody',sans-serif", color: "#f0ede8", marginBottom: 10, textTransform: "uppercase", letterSpacing: ".1em" }}>City</div>
                  <div style={{ display: "flex", gap: 7, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 4 }}>
                    <button
                      onClick={() => setActiveCity(null)}
                      style={{
                        background: !activeCity ? "#C8FF47" : "transparent",
                        color: !activeCity ? "#0a0a0a" : "var(--text-mid)",
                        border: `1.5px solid ${!activeCity ? "#C8FF47" : "var(--border2)"}`,
                        borderRadius: 99, padding: "5px 14px", fontSize: 12,
                        fontFamily: "'LBBody',sans-serif", cursor: "pointer",
                        whiteSpace: "nowrap", transition: "all .15s",
                      }}>
                      All
                    </button>
                    {cities.map(city => (
                      <button key={city}
                        onClick={() => setActiveCity(activeCity === city ? null : city)}
                        style={{
                          background: activeCity === city ? "#C8FF47" : "transparent",
                          color: activeCity === city ? "#0a0a0a" : "var(--text-mid)",
                          border: `1.5px solid ${activeCity === city ? "#C8FF47" : "var(--border2)"}`,
                          borderRadius: 99, padding: "5px 14px", fontSize: 12,
                          fontFamily: "'LBBody',sans-serif", cursor: "pointer",
                          whiteSpace: "nowrap", transition: "all .15s",
                        }}>
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Feed tab toggle */}
            <div style={{ display: "flex", marginBottom: 12 }}>
              <button
                onClick={() => {
                  const next = feedTab === "all" ? "following" : "all";
                  if (next === "following" && !user) { setShowUserAuth(true); return; }
                  setFeedTab(next);
                }}
                style={{
                  background: feedTab === "following" ? "#C8FF47" : "transparent",
                  color: feedTab === "following" ? "#0a0a0a" : "var(--text-mid)",
                  border: `1.5px solid ${feedTab === "following" ? "#C8FF47" : "var(--border2)"}`,
                  borderRadius: 99,
                  padding: "6px 18px",
                  fontSize: 11,
                  fontFamily: "'DM Mono', monospace",
                  letterSpacing: ".1em",
                  cursor: "pointer",
                  transition: "all .15s",
                }}
              >
                {feedTab === "following" ? "FOLLOWING" : "ALL"}
              </button>
            </div>
          </div>

          {/* Card feed */}
          <div style={{ padding: "8px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
            {loading && <div style={{ textAlign: "center", padding: "60px 0", color: "#CCC", fontSize: 13, fontFamily: "'DM Mono',monospace", letterSpacing: ".1em" }}>loading buys...</div>}
            {!loading && filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-dim)", fontSize: 13, fontFamily: "'DM Mono',monospace" }}>
                {feedTab === "following"
                  ? "None of your follows have reviewed this yet."
                  : "No reviews match these filters."}
              </div>
            )}
            {filtered.map(r => <Card key={r.id} r={r} onUp={upvote} saved={saved.includes(r.id)} onSave={toggleSave} upped={userUpvotes.includes(r.id)} onSubmitterClick={(userId) => {
              if (!userId || userId === user?.id) return;
              setViewingUserId(userId);
            }} />)}
          </div>
        </div>

        {/* Bottom action bar */}
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
          display: "flex", justifyContent: "center", gap: 10,
          padding: "16px 18px 36px",
          background: "linear-gradient(to top, rgba(8,8,8,0.92) 20%, rgba(8,8,8,0.6) 50%, rgba(8,8,8,0.1) 80%, transparent 100%)",
        }}>
          <button onClick={() => setShowFilter(true)} style={{
            background: "#080808",
            color: "#C8FF47",
            border: "1.5px solid #C8FF47",
            borderRadius: 99, padding: "16px 22px",
            fontFamily: "'LBTitle',sans-serif",
            fontSize: "clamp(13px, 3vw, 16px)", letterSpacing: ".06em",
            cursor: "pointer", transition: "all .2s",
          }}>
            FILTER {(activeScore !== null || activeDiet.length > 0 || cat !== "all" || showSaved) ? "✦" : ""}
          </button>
          <button
            onClick={() => {
              if (!user) { setShowUserAuth(true); return; }
              if (rateLimited && !adminUser) { setModal("rateLimited"); return; }
              const seen = localStorage.getItem("lb_submit_guide_seen") === "true";
              if (!seen) { setShowSubmitGuide(true); } else { setModal("submit"); }
            }}
            onMouseDown={e => e.currentTarget.style.transform = "scale(0.96)"}
            onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            style={{
              background: (rateLimited && !adminUser) ? "#111" : "#C8FF47",
              color: (rateLimited && !adminUser) ? "#444" : "#0a0a0a",
              border: (rateLimited && !adminUser) ? "1px solid #2a2a2a" : "none",
              borderRadius: 99, padding: "16px 28px",
              fontFamily: "'LBTitle', sans-serif",
              fontSize: "clamp(13px, 3vw, 16px)", letterSpacing: ".06em",
              cursor: "pointer", transition: "all .2s",
              boxShadow: (rateLimited && !adminUser) ? "none" : "0 4px 24px #C8FF4744",
            }}>
            {rateLimited && !adminUser ? "🔒 SUBMIT" : "WHATS THE LEGIT BUY"}
          </button>
        </div>

        {/* Menu panel */}
        {showMenu && (
          <MenuPanel
            onClose={() => setShowMenu(false)}
            onNavigate={async (action) => {
              if (action === "home")    setScreen("home");
              if (action === "profile") {
                if (user) { setScreen("profile"); }
                else { setShowUserAuth(true); }
              }
              if (action === "admin")   setModal("admin");
              if (action === "guide")   window.open("/scoring-guide.html", "_blank");
              if (action === "login") setShowUserAuth(true);
              if (action === "logout") {
                await supabase.auth.signOut();
                setUser(null);
                setAdminUser(null);
                setScreen("home");
              }
            }}
            adminUser={adminUser}
            user={user}
          />
        )}

        {/* Filter panel */}
        {showFilter && (
          <FilterPanel
            onClose={() => setShowFilter(false)}
            cat={cat} setCat={setCat}
            activeScore={activeScore} setActiveScore={setActiveScore}
            activeDiet={activeDiet} toggleDietFilter={toggleDietFilter}
            showSaved={showSaved} setShowSaved={setShowSaved}
            onClearAll={() => { setCat("all"); setActiveScore(null); setActiveDiet([]); setShowSaved(false); setActiveCity(null); }}
          />
        )}

        {/* Profile screen */}
        {screen === "profile" && user && (
          <ProfilePage
            user={user}
            onClose={() => setScreen("home")}
            onLogout={async () => {
              await supabase.auth.signOut();
              setUser(null);
              setAdminUser(null);
              setScreen("home");
            }}
          />
        )}

        {/* Other-user profile */}
        {viewingUserId && (
          <ProfilePage
            user={user}
            targetUserId={viewingUserId}
            onClose={() => setViewingUserId(null)}
            onFollowChange={() => {
              if (feedTab === "following") {
                supabase.rpc("get_following_reviews", { p_user_id: user.id })
                  .then(({ data }) => { if (data) setFollowingReviews(data); });
              }
            }}
          />
        )}

        {/* User auth */}
        {showUserAuth && (
          <UserAuth
            onClose={() => setShowUserAuth(false)}
            onLogin={(u) => { setUser(u); setScreen("profile"); }}
          />
        )}

        {/* Walkthroughs */}
        {showAppIntro && !splash && <AppIntro onDismiss={dismissIntro} />}
        {showSubmitGuide && <SubmitGuide onDismiss={dismissSubmitGuide} />}

        {/* Modals */}
        {modal === "submit" && <SubmitFlow onSubmit={submit} onClose={() => setModal(null)} prefillName={userProfile?.display_name ?? ""} />}

        {modal === "adminLogin" && (
          <Sheet title="Admin login" onClose={() => setModal(null)}>
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
          <Sheet title="Submission limit reached" onClose={() => setModal(null)}>
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
          <Sheet title="Admin" onClose={() => setModal(null)}>
            <VerifiedUsers />
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
