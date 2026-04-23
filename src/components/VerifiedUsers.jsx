import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function VerifiedUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      const { data } = await supabase
        .from("profiles")
        .select("id, display_name, verified")
        .order("display_name", { ascending: true });
      if (data) setUsers(data);
      setLoading(false);
    }
    fetchUsers();
  }, []);

  const toggleVerified = async (userId, current) => {
    // Optimistic update
    setUsers(prev =>
      prev.map(u => u.id === userId ? { ...u, verified: !current } : u)
    );
    const { error } = await supabase
      .from("profiles")
      .update({ verified: !current })
      .eq("id", userId);
    if (error) {
      // Revert on error
      setUsers(prev =>
        prev.map(u => u.id === userId ? { ...u, verified: current } : u)
      );
    }
  };

  if (loading) {
    return (
      <div style={{ fontFamily: "'DM Mono', monospace", color: "var(--text-dim)", fontSize: 13, padding: "16px 0" }}>
        Loading users…
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "var(--text-dim)", letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 8 }}>
        Verified users ({users.length})
      </div>
      {users.length === 0 && (
        <div style={{ fontSize: 13, color: "var(--text-dim)", fontFamily: "'DM Mono', monospace" }}>
          No profiles found.
        </div>
      )}
      {users.map(u => (
        <div
          key={u.id}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 10, padding: "10px 14px",
          }}
        >
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "var(--text)" }}>
            {u.display_name
              ? u.display_name
              : <em style={{ color: "var(--text-dim)" }}>no name</em>}
          </span>
          <button
            onClick={() => toggleVerified(u.id, u.verified)}
            style={{
              background: "transparent",
              border: `1px solid ${u.verified ? "#C8FF47" : "var(--border2)"}`,
              borderRadius: 99,
              padding: "5px 12px",
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              color: u.verified ? "#C8FF47" : "var(--text-dim)",
              cursor: "pointer",
              transition: "all .15s",
              whiteSpace: "nowrap",
            }}
          >
            {u.verified ? "✦ Verified" : "◇ Not verified"}
          </button>
        </div>
      ))}
    </div>
  );
}
