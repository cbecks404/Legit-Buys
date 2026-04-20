import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { CAT_META, SCORE_COLORS, SCORE_META, priceSymbol } from "../constants";

export default function ProfilePage({ user, onClose, onLogout }) {
  const [profile, setProfile]       = useState(null);
  const [myReviews, setMyReviews]   = useState([]);
  const [myPending, setMyPending]   = useState([]);
  const [editingId, setEditingId]   = useState(null);
  const [editFields, setEditFields] = useState({ review: "", price: "" });
  const [editTarget, setEditTarget] = useState(null); // "live" | "pending"
  const [loading, setLoading]       = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [editingName, setEditingName] = useState(false);

  const inp = {
    width: "100%", background: "var(--surface2)",
    border: "1px solid var(--border2)", borderRadius: 10,
    padding: "12px 14px", color: "var(--text)", fontSize: 14,
    outline: "none", boxSizing: "border-box", fontFamily: "system-ui,sans-serif",
  };
  const lbl = {
    fontSize: 9, fontFamily: "'DM Mono',monospace", color: "var(--text-dim)",
    letterSpacing: ".14em", textTransform: "uppercase",
    display: "block", marginBottom: 7, fontWeight: 600,
  };

  useEffect(() => {
    async function load() {
      const [{ data: prof }, { data: live }, { data: pend }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("reviews").select("*").eq("user_id", user.id).order("date", { ascending: false }),
        supabase.from("pending_reviews").select("*").eq("user_id", user.id).order("date", { ascending: false }),
      ]);
      if (prof) { setProfile(prof); setDisplayName(prof.display_name ?? ""); }
      if (live) setMyReviews(live);
      if (pend) setMyPending(pend);
      setLoading(false);
    }
    load();
  }, [user.id]);

  const saveDisplayName = async () => {
    setSavingName(true);
    const { error } = await supabase.from("profiles").upsert({ id: user.id, display_name: displayName });
    if (!error) {
      setProfile(p => ({ ...p, display_name: displayName }));
    }
    setSavingName(false);
  };

  const startEdit = (r, target) => {
    setEditingId(r.id);
    setEditTarget(target);
    setEditFields({ review: r.review, price: r.price ?? "" });
  };

  const saveEdit = async () => {
    const table = editTarget === "live" ? "reviews" : "pending_reviews";
    await supabase.from(table).update({ review: editFields.review, price: editFields.price }).eq("id", editingId);
    if (editTarget === "live") {
      setMyReviews(rs => rs.map(r => r.id === editingId ? { ...r, ...editFields } : r));
    } else {
      setMyPending(rs => rs.map(r => r.id === editingId ? { ...r, ...editFields } : r));
    }
    setEditingId(null);
  };

  const ReviewCard = ({ r, target }) => {
    const accent = CAT_META[r.category]?.color ?? "#C8FF47";
    const meta = SCORE_META[r.rating];
    const color = SCORE_COLORS[r.rating];
    const isEditing = editingId === r.id;

    return (
      <div style={{ background: "var(--surface)", border: `1px solid ${accent}44`, borderRadius: 14, padding: "16px 16px 14px", marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: accent, letterSpacing: ".18em", textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>
              {CAT_META[r.category]?.emoji} {r.category}
            </div>
            <div style={{ fontFamily: "'LBCardHeader',serif", fontSize: 16, color: "var(--text)" }}>{r.product}</div>
          </div>
          <span style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", fontWeight: 700, color, background: `${color}18`, border: `1px solid ${color}44`, padding: "3px 9px", borderRadius: 99, whiteSpace: "nowrap" }}>
            {r.rating === 3 ? "✦ " : ""}{meta?.label}
          </span>
        </div>

        {isEditing ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
            <div>
              <label style={lbl}>Review</label>
              <textarea style={{ ...inp, minHeight: 80, resize: "vertical" }} value={editFields.review} onChange={e => setEditFields(p => ({ ...p, review: e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>Price (£)</label>
              <input style={inp} type="text" value={editFields.price} onChange={e => setEditFields(p => ({ ...p, price: e.target.value.replace(/[^0-9.]/g, "") }))} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={saveEdit} style={{ flex: 1, background: "#C8FF47", color: "#0a0a0a", border: "none", borderRadius: 99, padding: "11px 0", fontFamily: "'LBBody',sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Save ✓</button>
              <button onClick={() => setEditingId(null)} style={{ flex: 1, background: "transparent", color: "var(--text-mid)", border: "1px solid var(--border2)", borderRadius: 99, padding: "11px 0", fontFamily: "'LBBody',sans-serif", fontSize: 13, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <p style={{ margin: "0 0 10px", fontSize: 13, color: "var(--text-mid)", fontFamily: "'LBReview',serif", lineHeight: 1.6 }}>{r.review}</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {r.price && <span style={{ fontSize: 12, color: accent, fontFamily: "'DM Mono',monospace", fontWeight: 600 }}>£{r.price}</span>}
                {r.price_range && <span style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "'DM Mono',monospace", background: "var(--surface2)", border: "1px solid var(--border)", padding: "1px 7px", borderRadius: 99 }}>{priceSymbol(r.price_range)}</span>}
                {target === "pending" && <span style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: "#F4A942", background: "#F4A94218", border: "1px solid #F4A94244", padding: "2px 8px", borderRadius: 99 }}>Pending</span>}
              </div>
              <button onClick={() => startEdit(r, target)} style={{ background: "none", border: "1px solid var(--border2)", borderRadius: 99, padding: "5px 14px", color: "var(--text-mid)", fontFamily: "'LBBody',sans-serif", fontSize: 11, cursor: "pointer" }}>
                Edit
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "var(--bg)", display: "flex", flexDirection: "column", overflowY: "auto" }}>
      {/* Header */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "var(--bg)", padding: "env(safe-area-inset-top) 18px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 0 16px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontFamily: "'LBTitle',sans-serif", fontSize: 22, color: "var(--text)", letterSpacing: ".04em" }}>MY REVIEWS</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-dim)", fontSize: 22, cursor: "pointer" }}>✕</button>
        </div>
      </div>

      <div style={{ flex: 1, padding: "24px 18px 60px", maxWidth: 520, width: "100%", margin: "0 auto" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-dim)", fontSize: 13, fontFamily: "'DM Mono',monospace" }}>Loading…</div>
        ) : (
          <>
            {/* Profile section */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 16px", marginBottom: 28 }}>
              <div style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: "var(--text-dim)", letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 12 }}>Your profile</div>
              <div style={{ fontSize: 12, color: "var(--text-dim)", fontFamily: "'LBBody',sans-serif", marginBottom: 12 }}>{user.email}</div>

              {profile?.display_name && !editingName ? (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: "var(--text-dim)", letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 4 }}>Display name</div>
                    <div style={{ fontSize: 15, color: "var(--text)", fontFamily: "'LBCardHeader',serif" }}>{profile.display_name}</div>
                  </div>
                  <button onClick={() => setEditingName(true)} style={{ background: "none", border: "1px solid var(--border2)", borderRadius: 99, padding: "5px 14px", color: "var(--text-mid)", fontFamily: "'LBBody',sans-serif", fontSize: 11, cursor: "pointer" }}>
                    Edit
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 12, color: "#F4A942", fontFamily: "'LBBody',sans-serif", marginBottom: 10 }}>
                    ⚠ Set your display name so it appears on your reviews
                  </div>
                  <input style={{ width: "100%", background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: 10, padding: "12px 14px", color: "var(--text)", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "system-ui,sans-serif", marginBottom: 10 }}
                    type="text" placeholder="First name + initial e.g. Priya K."
                    value={displayName} onChange={e => setDisplayName(e.target.value)} />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={async () => { await saveDisplayName(); setEditingName(false); }} disabled={savingName}
                      style={{ background: "#C8FF47", color: "#0a0a0a", border: "none", borderRadius: 99, padding: "10px 20px", fontFamily: "'LBBody',sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                      {savingName ? "Saving…" : "Save name"}
                    </button>
                    {editingName && (
                      <button onClick={() => setEditingName(false)} style={{ background: "transparent", color: "var(--text-mid)", border: "1px solid var(--border2)", borderRadius: 99, padding: "9px 16px", fontFamily: "'LBBody',sans-serif", fontSize: 12, cursor: "pointer" }}>
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Pending reviews */}
            {myPending.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: "var(--text-dim)", letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 14 }}>
                  Awaiting approval ({myPending.length})
                </div>
                {myPending.map(r => <ReviewCard key={r.id} r={r} target="pending" />)}
              </div>
            )}

            {/* Live reviews */}
            <div>
              <div style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: "var(--text-dim)", letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 14 }}>
                Live reviews ({myReviews.length})
              </div>
              {myReviews.length === 0 && myPending.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-dim)", fontSize: 13, fontFamily: "'LBBody',sans-serif", lineHeight: 1.7 }}>
                  No reviews yet.<br />Submit your first Legit Buy!
                </div>
              )}
              {myReviews.map(r => <ReviewCard key={r.id} r={r} target="live" />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}