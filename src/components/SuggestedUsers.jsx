import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function SuggestedUsers({ user, onFollowDone }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [followed, setFollowed]       = useState({});

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase.rpc("get_suggested_users", { p_user_id: user.id, p_limit: 8 });
        setSuggestions(data ?? []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user.id]);

  if (loading || suggestions.length === 0) return null;

  const handleFollow = async (suggestion) => {
    // Optimistic update
    setFollowed(prev => ({ ...prev, [suggestion.user_id]: true }));

    const { error } = await supabase
      .from("follows")
      .insert({ follower_id: user.id, followee_id: suggestion.user_id });

    if (error) {
      // Revert on error
      setFollowed(prev => ({ ...prev, [suggestion.user_id]: false }));
    } else {
      onFollowDone();
    }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        fontSize: 9,
        fontFamily: "'DM Mono', monospace",
        color: "var(--text-dim)",
        letterSpacing: ".18em",
        textTransform: "uppercase",
        marginBottom: 14,
      }}>
        People to follow
      </div>

      {suggestions.map(s => (
        <div key={s.user_id} style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: "14px 16px",
          marginBottom: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          {/* Left side */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                fontSize: 14,
                color: "var(--text)",
                fontFamily: "'LBCardHeader', serif",
              }}>
                {s.display_name || "Anonymous"}
              </span>
              {s.verified && (
                <span style={{
                  color: "#C8FF47",
                  background: "#C8FF4718",
                  border: "1px solid #C8FF4744",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 10,
                  padding: "3px 10px",
                  borderRadius: 99,
                }}>
                  ✦ VERIFIED
                </span>
              )}
            </div>
            <div style={{
              color: "var(--text-dim)",
              fontSize: 11,
              fontFamily: "'DM Mono', monospace",
              marginTop: 3,
            }}>
              {s.review_count} reviews
            </div>
          </div>

          {/* Follow button */}
          <button
            type="button"
            onClick={() => handleFollow(s)}
            disabled={followed[s.user_id]}
            style={followed[s.user_id] ? {
              background: "#C8FF4718",
              border: "1px solid #C8FF47",
              color: "#C8FF47",
              borderRadius: 99,
              padding: "7px 16px",
              fontSize: 11,
              fontFamily: "'DM Mono', monospace",
              cursor: "default",
            } : {
              background: "transparent",
              border: "1px solid var(--border2)",
              color: "var(--text-mid)",
              borderRadius: 99,
              padding: "7px 16px",
              fontSize: 11,
              fontFamily: "'DM Mono', monospace",
              cursor: "pointer",
            }}
          >
            {followed[s.user_id] ? "Following" : "Follow"}
          </button>
        </div>
      ))}
    </div>
  );
}
