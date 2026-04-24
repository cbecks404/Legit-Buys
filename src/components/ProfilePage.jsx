import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { CAT_META, SCORE_COLORS, SCORE_META, priceSymbol } from "../constants";

export default function ProfilePage({ user, targetUserId, onClose, onLogout, onFollowChange }) {
  // Determine mode: own profile if targetUserId is absent or equals logged-in user
  const isOwnProfile = !targetUserId || targetUserId === user.id;
  const profileUserId = isOwnProfile ? user.id : targetUserId;

  const [profile, setProfile]           = useState(null);
  const [reviews, setReviews]           = useState([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing]   = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [loading, setLoading]           = useState(true);

  // Own-profile-only state
  const [editingId, setEditingId]       = useState(null);
  const [editFields, setEditFields]     = useState({ review: "", price: "" });
  const [displayName, setDisplayName]   = useState("");
  const [savingName, setSavingName]     = useState(false);
  const [editingName, setEditingName]   = useState(false);

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

  const load = useCallback(async () => {
    setLoading(true);
    const queries = [
      supabase.from("profiles").select("*").eq("id", profileUserId).single(),
      supabase.from("reviews").select("*").eq("user_id", profileUserId).order("date", { ascending: false }),
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("followee_id", profileUserId),
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", profileUserId),
    ];
    if (!isOwnProfile) {
      queries.push(
        supabase.from("follows").select("followee_id").eq("follower_id", user.id).eq("followee_id", profileUserId).maybeSingle()
      );
    }
    const results = await Promise.all(queries);
    const [profRes, reviewsRes, followerRes, followingRes] = results;
    if (profRes.data) {
      setProfile(profRes.data);
      if (isOwnProfile) setDisplayName(profRes.data.display_name ?? "");
    }
    if (reviewsRes.data) setReviews(reviewsRes.data);
    setFollowerCount(followerRes.count ?? 0);
    setFollowingCount(followingRes.count ?? 0);
    if (!isOwnProfile && results[4]) {
      setIsFollowing(!!results[4].data);
    }
    setLoading(false);
  }, [profileUserId, isOwnProfile, user.id]);

  useEffect(() => { load(); }, [load]);

  const saveDisplayName = async () => {
    setSavingName(true);
    const { error } = await supabase.from("profiles").upsert({ id: user.id, display_name: displayName });
    if (!error) {
      setProfile(p => ({ ...p, display_name: displayName }));
    }
    setSavingName(false);
  };

  const startEdit = (r) => {
    setEditingId(r.id);
    setEditFields({ review: r.review, price: r.price ?? "" });
  };

  const saveEdit = async () => {
    await supabase.from("reviews").update({ review: editFields.review, price: editFields.price }).eq("id", editingId);
    setReviews(rs => rs.map(r => r.id === editingId ? { ...r, ...editFields } : r));
    setEditingId(null);
  };

  const handleFollow = async () => {
    if (followLoading) return;
    // Optimistic update
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);
    setFollowerCount(c => wasFollowing ? c - 1 : c + 1);
    setFollowLoading(true);
    try {
      if (wasFollowing) {
        const { error } = await supabase.from("follows").delete()
          .eq("follower_id", user.id)
          .eq("followee_id", profileUserId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("follows").insert({
          follower_id: user.id,
          followee_id: profileUserId,
        });
        if (error) throw error;
      }
      onFollowChange?.();
    } catch {
      // Revert on error
      setIsFollowing(wasFollowing);
      setFollowerCount(c => wasFollowing ? c + 1 : c - 1);
    } finally {
      setFollowLoading(false);
    }
  };

  const VerifiedBadge = () => (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: "#C8FF4718", border: "1px solid #C8FF4744",
      borderRadius: 99, padding: "3px 10px", fontSize: 10,
      fontFamily: "'DM Mono', monospace", color: "#C8FF47", letterSpacing: ".12em",
    }}>
      ✦ VERIFIED
    </span>
  );

  const ReviewCard = ({ r, canEdit = true }) => {
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

        {isEditing && canEdit ? (
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
              </div>
              {canEdit && (
                <button onClick={() => startEdit(r)} style={{ background: "none", border: "1px solid var(--border2)", borderRadius: 99, padding: "5px 14px", color: "var(--text-mid)", fontFamily: "'LBBody',sans-serif", fontSize: 11, cursor: "pointer" }}>
                  Edit
                </button>
              )}
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
          <div style={{ fontFamily: "'LBTitle',sans-serif", fontSize: 22, color: "var(--text)", letterSpacing: ".04em" }}>
            {isOwnProfile ? "MY REVIEWS" : (profile?.display_name?.toUpperCase() ?? "PROFILE")}
          </div>
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
              <div style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: "var(--text-dim)", letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 12 }}>
                {isOwnProfile ? "Your profile" : "Profile"}
              </div>

              {isOwnProfile ? (
                <>
                  <div style={{ fontSize: 12, color: "var(--text-dim)", fontFamily: "'LBBody',sans-serif", marginBottom: 12 }}>{user.email}</div>

                  {profile?.display_name && !editingName ? (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: "var(--text-dim)", letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 4 }}>Display name</div>
                        <div style={{ fontSize: 15, color: "var(--text)", fontFamily: "'LBCardHeader',serif", marginBottom: 6 }}>{profile.display_name}</div>
                        {profile.verified && <VerifiedBadge />}
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
                      <input
                        style={{ width: "100%", background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: 10, padding: "12px 14px", color: "var(--text)", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "system-ui,sans-serif", marginBottom: 10 }}
                        type="text" placeholder="First name + initial e.g. Priya K."
                        value={displayName} onChange={e => setDisplayName(e.target.value)}
                      />
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

                  {/* Follower / following counts */}
                  <div style={{ marginTop: 14, fontSize: 11, fontFamily: "'DM Mono',monospace", color: "var(--text-dim)" }}>
                    {followerCount} followers · {followingCount} following
                  </div>

                  {/* Logout */}
                  {onLogout && (
                    <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
                      <button onClick={onLogout} style={{ background: "transparent", color: "var(--text-dim)", border: "1px solid var(--border2)", borderRadius: 99, padding: "8px 18px", fontFamily: "'LBBody',sans-serif", fontSize: 12, cursor: "pointer" }}>
                        Log out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                /* Other-user profile */
                <>
                  <div style={{ fontSize: 18, color: "var(--text)", fontFamily: "'LBCardHeader',serif", marginBottom: 6 }}>
                    {profile?.display_name ?? "Anonymous"}
                  </div>
                  {profile?.verified && (
                    <div style={{ marginBottom: 10 }}>
                      <VerifiedBadge />
                    </div>
                  )}

                  {/* Follower/following + follow button */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                    <div style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "var(--text-dim)" }}>
                      {followerCount} followers · {followingCount} following
                    </div>
                    <button
                      onClick={handleFollow}
                      disabled={followLoading}
                      style={{
                        background: isFollowing ? "#C8FF4718" : "transparent",
                        border: isFollowing ? "1px solid #C8FF47" : "1px solid var(--border2)",
                        color: isFollowing ? "#C8FF47" : "var(--text-mid)",
                        borderRadius: 99, padding: "6px 16px",
                        fontFamily: "'LBBody',sans-serif", fontSize: 12,
                        cursor: followLoading ? "default" : "pointer",
                        opacity: followLoading ? 0.6 : 1,
                        transition: "all .15s",
                      }}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Reviews section */}
            <div>
              <div style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: "var(--text-dim)", letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 14 }}>
                {isOwnProfile ? `Live reviews (${reviews.length})` : `Reviews (${reviews.length})`}
              </div>

              {reviews.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-dim)", fontSize: 13, fontFamily: "'LBBody',sans-serif", lineHeight: 1.7 }}>
                  {isOwnProfile ? <>No reviews yet.<br />Submit your first Legit Buy!</> : "No reviews yet."}
                </div>
              )}

              {reviews.map(r => (
                <ReviewCard key={r.id} r={r} canEdit={isOwnProfile} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
