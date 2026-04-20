import { useState } from "react";
import { supabase } from "../supabaseClient";

const baseInp = {
  width: "100%", borderRadius: 10, padding: "12px 14px",
  fontSize: 14, outline: "none", boxSizing: "border-box",
  fontFamily: "system-ui,sans-serif",
};
export default function UserAuth({ onClose, onLogin }) {
  const [mode, setMode] = useState("choose"); // choose | login | signup | magic
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const inp = { ...baseInp, background: "var(--surface2)", border: "1px solid var(--border2)", color: "var(--text)" };
  const lbl = {
    fontSize: 9, fontFamily: "'DM Mono',monospace", color: "var(--text-dim)",
    letterSpacing: ".14em", textTransform: "uppercase",
    display: "block", marginBottom: 7, fontWeight: 600,
  };

  const handleSignUp = async () => {
    if (!email || !password || !displayName) { setError("All fields are required."); return; }
    // Enforce "First name + surname initial" format e.g. "Priya K."
    const nameRegex = /^[A-Za-z]+\s[A-Za-z]\.?$/;
    if (!nameRegex.test(displayName.trim())) {
      setError("Display name must be in the format: First name + surname initial (e.g. Priya K.)");
      return;
    }
    setLoading(true); setError("");
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) { setError(signUpError.message); setLoading(false); return; }
    // Save display name to profiles table
    if (data.user) {
      await supabase.from("profiles").upsert({ id: data.user.id, display_name: displayName });
      // Link any existing reviews by email
      await supabase.from("reviews").update({ user_id: data.user.id, submitter_email: email })
        .eq("submitter_email", email);
      await supabase.from("pending_reviews").update({ user_id: data.user.id, submitter_email: email })
        .eq("submitter_email", email);
    }
    setLoading(false);
    setSuccess("Account created! Check your email to confirm, then log in.");
  };

  const handleLogin = async () => {
    if (!email || !password) { setError("Email and password required."); return; }
    setLoading(true); setError("");
    const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) { setError("Incorrect email or password."); setLoading(false); return; }
    // Link reviews by email on login
    await supabase.from("reviews").update({ user_id: data.user.id })
      .eq("submitter_email", email).is("user_id", null);
    await supabase.from("pending_reviews").update({ user_id: data.user.id })
      .eq("submitter_email", email).is("user_id", null);
    setLoading(false);
    onLogin(data.user);
    onClose();
  };

  const handleMagicLink = async () => {
    if (!email) { setError("Enter your email address."); return; }
    setLoading(true); setError("");
    const { error: magicError } = await supabase.auth.signInWithOtp({ email });
    if (magicError) { setError(magicError.message); setLoading(false); return; }
    setLoading(false);
    setSuccess("Magic link sent! Check your email and tap the link to log in.");
  };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, background: "#000000cc", backdropFilter: "blur(10px)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 300 }}>
      <div style={{
        background: "var(--sheet-bg)", borderTop: "1px solid var(--sheet-border)",
        borderRadius: "18px 18px 0 0", width: "100%", maxWidth: 520,
        padding: "26px 22px 50px", animation: "sheetUp .25s cubic-bezier(.16,1,.3,1)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            {mode !== "choose" && (
              <button onClick={() => { setMode("choose"); setError(""); setSuccess(""); }}
                style={{ background: "none", border: "none", color: "var(--text-dim)", fontSize: 12, fontFamily: "'LBBody',sans-serif", cursor: "pointer", padding: 0, marginBottom: 4, display: "block" }}>
                ← Back
              </button>
            )}
            <span style={{ fontFamily: "'LBTitle',sans-serif", fontSize: 22, color: "var(--text)", letterSpacing: ".04em" }}>
              {mode === "choose" ? "MY ACCOUNT" : mode === "login" ? "LOG IN" : mode === "signup" ? "SIGN UP" : "MAGIC LINK"}
            </span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-dim)", fontSize: 22, cursor: "pointer" }}>✕</button>
        </div>

        {/* Success message */}
        {success && (
          <div style={{ background: "#C8FF4714", border: "1px solid #C8FF4733", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#C8FF47", fontFamily: "'LBBody',sans-serif", lineHeight: 1.6, marginBottom: 20 }}>
            {success}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div style={{ background: "#E05A5A14", border: "1px solid #E05A5A33", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#E05A5A", fontFamily: "'LBBody',sans-serif", lineHeight: 1.6, marginBottom: 20 }}>
            {error}
          </div>
        )}

        {/* Choose mode */}
        {mode === "choose" && !success && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ margin: "0 0 8px", fontSize: 14, color: "var(--text-mid)", fontFamily: "'LBBody',sans-serif", lineHeight: 1.7 }}>
              Log in to see your reviews, edit them, and get a verified badge on your submissions. Join a growing community of food lovers sharing their best finds.
            </p>
            <button onClick={() => { setMode("login"); setError(""); }}
              style={{ background: "#C8FF47", color: "#0a0a0a", border: "none", borderRadius: 99, padding: "13px 0", width: "100%", fontFamily: "'LBTitle',sans-serif", fontSize: 16, letterSpacing: ".04em", cursor: "pointer" }}>
              LOG IN →
            </button>
            <button onClick={() => { setMode("signup"); setError(""); }}
              style={{ background: "transparent", color: "var(--text)", border: "1px solid var(--border2)", borderRadius: 99, padding: "13px 0", width: "100%", fontFamily: "'LBTitle',sans-serif", fontSize: 16, letterSpacing: ".04em", cursor: "pointer" }}>
              CREATE ACCOUNT →
            </button>
            <button onClick={() => { setMode("magic"); setError(""); }}
              style={{ background: "transparent", color: "var(--text-mid)", border: "none", borderRadius: 99, padding: "10px 0", width: "100%", fontFamily: "'LBBody',sans-serif", fontSize: 13, cursor: "pointer" }}>
              ✉ Send me a magic link instead
            </button>
          </div>
        )}

        {/* Log in */}
        {mode === "login" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div><label style={lbl}>Email</label><input style={inp} type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
            <div><label style={lbl}>Password</label><input style={inp} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} /></div>
            <button onClick={handleLogin} disabled={loading}
              style={{ background: "#C8FF47", color: "#0a0a0a", border: "none", borderRadius: 99, padding: "13px 0", width: "100%", fontFamily: "'LBTitle',sans-serif", fontSize: 16, letterSpacing: ".04em", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.5 : 1 }}>
              {loading ? "Logging in…" : "LOG IN →"}
            </button>
            <button onClick={() => { setMode("magic"); setError(""); }}
              style={{ background: "transparent", color: "var(--text-mid)", border: "none", padding: "8px 0", width: "100%", fontFamily: "'LBBody',sans-serif", fontSize: 12, cursor: "pointer" }}>
              Forgot password? Send a magic link
            </button>
          </div>
        )}

        {/* Sign up */}
        {mode === "signup" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={lbl}>Display name</label>
              <input
                style={inp}
                type="text"
                placeholder="First name + initial e.g. Priya K."
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                autoComplete="off"
                autoFocus
              />
            </div>
            <div><label style={lbl}>Email</label><input style={inp} type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
            <div><label style={lbl}>Password</label><input style={inp} type="password" placeholder="At least 6 characters" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSignUp()} /></div>
            <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", fontSize: 12, color: "var(--text-mid)", fontFamily: "'LBBody',sans-serif", lineHeight: 1.6 }}>
              Your display name will appear on your reviews. Use your real name so colleagues know it's you.
            </div>
            <button onClick={handleSignUp} disabled={loading}
              style={{ background: "#C8FF47", color: "#0a0a0a", border: "none", borderRadius: 99, padding: "13px 0", width: "100%", fontFamily: "'LBTitle',sans-serif", fontSize: 16, letterSpacing: ".04em", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.5 : 1 }}>
              {loading ? "Creating account…" : "CREATE ACCOUNT →"}
            </button>
          </div>
        )}

        {/* Magic link */}
        {mode === "magic" && !success && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={{ margin: "0 0 4px", fontSize: 14, color: "var(--text-mid)", fontFamily: "'LBBody',sans-serif", lineHeight: 1.7 }}>
              Enter your email and we'll send you a link to log in instantly — no password needed.
            </p>
            <div><label style={lbl}>Email</label><input style={inp} type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleMagicLink()} /></div>
            <button onClick={handleMagicLink} disabled={loading}
              style={{ background: "#C8FF47", color: "#0a0a0a", border: "none", borderRadius: 99, padding: "13px 0", width: "100%", fontFamily: "'LBTitle',sans-serif", fontSize: 16, letterSpacing: ".04em", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.5 : 1 }}>
              {loading ? "Sending…" : "SEND MAGIC LINK →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}