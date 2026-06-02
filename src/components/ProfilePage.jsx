import { useState, useEffect, useCallback, useRef, useLayoutEffect } from "react";
import { supabase } from "../supabaseClient";
import VerifiedBadge from "./VerifiedBadge";
import Card from "./Card";
import Carousel from "./Carousel";

export default function ProfilePage({ user, targetUserId, onClose, onLogout, onFollowChange, onChangePassword }) {
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
  const [tab, setTab]                   = useState("reviews"); // "reviews" | "saved"
  const [savedReviews, setSavedReviews] = useState(null); // null = not loaded yet
  const [savedLoading, setSavedLoading] = useState(false);

  // Own-profile-only state
  const [editingId, setEditingId]       = useState(null);
  const [editFields, setEditFields]     = useState({ review: "", price: "" });
  const [displayName, setDisplayName]   = useState("");
  const [savingName, setSavingName]     = useState(false);
  const [editingName, setEditingName]   = useState(false);

  // Carousel sizing: the hero scrolls away, the header + sticky tab bar stay
  // pinned, and the carousel fills the rest of the scroll body.
  const bodyRef = useRef(null);
  const tabBarRef = useRef(null);
  const [carouselH, setCarouselH] = useState(null);
  useLayoutEffect(() => {
    const measure = () => {
      if (!bodyRef.current) return;
      const bodyH = bodyRef.current.clientHeight;
      const tabsH = tabBarRef.current?.offsetHeight ?? 0;
      setCarouselH(Math.max(320, bodyH - tabsH));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (bodyRef.current) ro.observe(bodyRef.current);
    window.addEventListener("resize", measure);
    return () => { ro.disconnect(); window.removeEventListener("resize", measure); };
  }, [loading, tab, isOwnProfile, reviews.length]);

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
  const centerFill = {
    height: "100%", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", textAlign: "center",
    color: "var(--text-dim)", fontSize: 13, fontFamily: "'LBBody',sans-serif", lineHeight: 1.7,
    padding: "0 18px",
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

  const loadSaved = useCallback(async () => {
    if (!isOwnProfile) return;
    setSavedLoading(true);
    const { data } = await supabase
      .from("saved_reviews")
      .select("review_id, created_at, reviews(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setSavedReviews((data ?? []).map(row => row.reviews).filter(Boolean));
    setSavedLoading(false);
  }, [isOwnProfile, user.id]);

  useEffect(() => {
    if (tab === "saved" && savedReviews === null) loadSaved();
  }, [tab, savedReviews, loadSaved]);

  const unsave = async (reviewId) => {
    setSavedReviews(prev => prev?.filter(r => r.id !== reviewId) ?? []);
    await supabase.from("saved_reviews").delete()
      .eq("user_id", user.id).eq("review_id", reviewId);
  };

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

  const profileActionBtn = {
    background: "none", border: "1px solid var(--border2)", borderRadius: 99,
    padding: "7px 14px", color: "var(--text-mid)", fontFamily: "'LBBody',sans-serif",
    fontSize: 12, cursor: "pointer",
  };

  // Renders one review inside a Carousel slot: inline edit form when this
  // review is being edited, otherwise the shared full-size Card.
  const renderItem = (r, isActive, { canEdit = false, onUnsave } = {}) => {
    if (editingId === r.id && canEdit) {
      return (
        <div style={{ width: "100%", height: "100%", overflowY: "auto", background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 14, padding: "16px 16px 18px" }}>
          <div style={{ fontFamily: "'LBCardHeader',serif", fontSize: 16, color: "var(--text)", marginBottom: 12 }}>{r.product}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
        </div>
      );
    }
    return (
      <Card
        r={r}
        isActive={isActive}
        extraActions={
          <>
            {canEdit && (
              <button onClick={() => startEdit(r)} style={profileActionBtn}>Edit</button>
            )}
            {onUnsave && (
              <button onClick={onUnsave} style={profileActionBtn}>Unsave</button>
            )}
          </>
        }
      />
    );
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "var(--bg)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header — pinned */}
      <div style={{ flex: "0 0 auto", zIndex: 10, background: "var(--bg)", padding: "env(safe-area-inset-top) 18px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 0 16px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontFamily: "'LBTitle',sans-serif", fontSize: 22, color: "var(--text)", letterSpacing: ".04em" }}>
            {isOwnProfile ? "MY REVIEWS" : (profile?.display_name?.toUpperCase() ?? "PROFILE")}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-dim)", fontSize: 22, cursor: "pointer" }}>✕</button>
        </div>
      </div>

      <div ref={bodyRef} style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-dim)", fontSize: 13, fontFamily: "'DM Mono',monospace" }}>Loading…</div>
        ) : (
          <>
            {/* Profile hero — scrolls away */}
            <div style={{ maxWidth: 520, width: "100%", margin: "0 auto", padding: "24px 18px 0" }}>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 16px", marginBottom: 18 }}>
              <div style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: "var(--text-dim)", letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 12 }}>
                {isOwnProfile ? "Your profile" : "Profile"}
              </div>

              {isOwnProfile ? (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ fontSize: 12, color: "var(--text-dim)", fontFamily: "'LBBody',sans-serif" }}>{user.email}</div>
                    {onChangePassword && (
                      <button onClick={onChangePassword} style={{ background: "none", border: "1px solid var(--border2)", borderRadius: 99, padding: "4px 12px", color: "var(--text-dim)", fontFamily: "'LBBody',sans-serif", fontSize: 11, cursor: "pointer" }}>
                        Change password
                      </button>
                    )}
                  </div>

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
            </div>{/* end hero wrapper */}

            {/* Sticky bar — tabs (own) or reviews count (other), stays pinned */}
            <div ref={tabBarRef} style={{ position: "sticky", top: 0, zIndex: 5, background: "var(--bg)" }}>
              <div style={{ maxWidth: 520, width: "100%", margin: "0 auto", padding: "0 18px" }}>
                {isOwnProfile ? (
                  <div style={{ display: "flex", gap: 8, borderBottom: "1px solid var(--border)" }}>
                    {[
                      { key: "reviews", label: `Reviews (${reviews.length})` },
                      { key: "saved", label: `Saved${savedReviews ? ` (${savedReviews.length})` : ""}` },
                    ].map(t => (
                      <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          padding: "10px 14px",
                          fontFamily: "'DM Mono',monospace", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase",
                          color: tab === t.key ? "var(--text)" : "var(--text-dim)",
                          borderBottom: tab === t.key ? "2px solid #C8FF47" : "2px solid transparent",
                          marginBottom: -1,
                        }}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: "var(--text-dim)", letterSpacing: ".18em", textTransform: "uppercase", padding: "4px 0 12px" }}>
                    Reviews ({reviews.length})
                  </div>
                )}
              </div>
            </div>

            {/* Carousel area — fills the rest of the scroll body */}
            <div style={{ maxWidth: 520, width: "100%", margin: "0 auto", height: carouselH ?? "60vh" }}>
              {(!isOwnProfile || tab === "reviews") && (
                reviews.length === 0 ? (
                  <div style={centerFill}>
                    {isOwnProfile ? <>No reviews yet.<br />Submit your first Legit Buy!</> : "No reviews yet."}
                  </div>
                ) : (
                  <Carousel items={reviews} getKey={r => r.id} height="100%">
                    {(r, isActive) => renderItem(r, isActive, { canEdit: isOwnProfile })}
                  </Carousel>
                )
              )}
              {isOwnProfile && tab === "saved" && (
                savedLoading && savedReviews === null ? (
                  <div style={centerFill}>Loading…</div>
                ) : (savedReviews?.length ?? 0) === 0 ? (
                  <div style={centerFill}>
                    Nothing saved yet.<br />Tap the bookmark on a review to save it here.
                  </div>
                ) : (
                  <Carousel items={savedReviews} getKey={r => r.id} height="100%">
                    {(r, isActive) => renderItem(r, isActive, { onUnsave: () => unsave(r.id) })}
                  </Carousel>
                )
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
