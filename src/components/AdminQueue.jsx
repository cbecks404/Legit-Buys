import { useState } from "react";
import { DIET_TAGS, priceSymbol } from "../constants";
import ScoreSelector from "./ScoreSelector";

export default function AdminQueue({ pending, onApprove, onReject, approved, onEditApproved, onUpdatePending }) {
  const [editingId, setEditingId] = useState(null);
  const [editFields, setEditFields] = useState({ link: "", mapQuery: "" });

  const inp = { width: "100%", background: "#0f0f0f", border: "1px solid #2e2e2e", borderRadius: 8, padding: "10px 12px", color: "#f0ede8", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "system-ui,sans-serif" };
  const lbl = { fontSize: 9, fontFamily: "'DM Mono',monospace", color: "#bbb", letterSpacing: ".12em", textTransform: "uppercase", display: "block", marginBottom: 6, fontWeight: 600 };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>

      {/* Pending section */}
      <div style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: "#CCC", letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 8 }}>
        Pending approval {pending.length > 0 && `(${pending.length})`}
      </div>
      {pending.length === 0 && (
        <div style={{ fontSize: 13, color: "#BBB", fontFamily: "'DM Mono',monospace", marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid #141414" }}>
          All clear ✦
        </div>
      )}
      {pending.map(r => {
        const rawDiet = r.diet_tags ?? r.dietTags ?? [];
        const dietTags = Array.isArray(rawDiet)
          ? rawDiet
          : typeof rawDiet === "string" && rawDiet.length > 2
            ? rawDiet.replace(/[{}]/g, "").split(",").map(s => s.trim())
            : [];
        return (
          <div key={r.id} style={{ background: "#141414", border: "1px solid #2e2e2e", borderRadius: 12, padding: 16, marginBottom: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontFamily: "'Libre Baskerville',Georgia,serif", color: "#f0ede8", fontSize: 15, fontWeight: 700 }}>{r.product}</span>
              <ScoreSelector value={r.rating} />
            </div>
            <p style={{ margin: "0 0 6px", fontSize: 13, color: "#CCC", fontStyle: "italic", fontFamily: "'Libre Baskerville',Georgia,serif" }}>"{r.review}"</p>
            <div style={{ fontSize: 10, color: "#CCC", fontFamily: "'DM Mono',monospace", marginBottom: 6, letterSpacing: ".06em" }}>
              {r.submitter} · {r.category} · {r.where} · £{r.price} {priceSymbol(r.price_range ?? r.priceRange)}
            </div>
            {dietTags.length > 0 && (
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
                {dietTags.map(tag => {
                  const meta = DIET_TAGS.find(d => d.id === tag);
                  return meta ? <span key={tag} style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: "#ccc", background: "#161616", border: "1px solid #666", padding: "2px 7px", borderRadius: 99 }}>{meta.label}</span> : null;
                })}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12, padding: "10px 0", borderTop: "1px solid #1a1a1a" }}>
              <div style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: "#CCC", letterSpacing: ".12em", textTransform: "uppercase" }}>Add links before approving</div>
              <input style={inp} placeholder="Link (website / instagram)" value={r.link || ""} onChange={e => onUpdatePending(r.id, { link: e.target.value })} />
              <input style={inp} placeholder="Address or postcode for map" value={r.map_query ?? r.mapQuery ?? ""} onChange={e => onUpdatePending(r.id, { map_query: e.target.value })} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => onApprove(r.id)} style={{ flex: 1, background: "#C8FF47", color: "#0a0a0a", border: "none", borderRadius: 8, padding: "10px 0", fontFamily: "'DM Mono',monospace", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>✓ Approve</button>
              <button onClick={() => onReject(r.id)} style={{ flex: 1, background: "transparent", color: "#E05A5A", border: "1px solid #E05A5A33", borderRadius: 8, padding: "10px 0", fontFamily: "'DM Mono',monospace", fontSize: 12, cursor: "pointer" }}>✕ Reject</button>
            </div>
          </div>
        );
      })}

      {/* Live reviews */}
      <div style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: "#CCC", letterSpacing: ".14em", textTransform: "uppercase", margin: "16px 0 8px" }}>
        Edit live reviews
      </div>
      {approved.map(r => (
        <div key={r.id} style={{ background: "#141414", border: "1px solid #2e2e2e", borderRadius: 12, padding: 14, marginBottom: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "'Libre Baskerville',Georgia,serif", color: "#f0ede8", fontSize: 14, fontWeight: 700 }}>{r.product}</span>
            <button
              onClick={() => editingId === r.id ? setEditingId(null) : (setEditingId(r.id), setEditFields({ link: r.link || "", mapQuery: r.map_query ?? r.mapQuery ?? "" }))}
              style={{ background: "none", border: "1px solid #666", borderRadius: 6, color: "#bbb", fontSize: 11, fontFamily: "'DM Mono',monospace", padding: "4px 10px", cursor: "pointer" }}>
              {editingId === r.id ? "cancel" : "edit links"}
            </button>
          </div>
          <div style={{ fontSize: 10, color: "#CCC", fontFamily: "'DM Mono',monospace", marginTop: 4, letterSpacing: ".06em" }}>{r.submitter} · {r.where}</div>
          {editingId !== r.id && (
            <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
              {r.link ? <span style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: "#C8FF4788", background: "#C8FF4710", padding: "3px 8px", borderRadius: 99 }}>↗ {r.link.slice(0, 28)}{r.link.length > 28 ? "…" : ""}</span> : <span style={{ fontSize: 10, color: "#BBB", fontFamily: "'DM Mono',monospace" }}>no link</span>}
              {(r.map_query || r.mapQuery) ? <span style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: "#6fcf6f88", background: "#6fcf6f10", padding: "3px 8px", borderRadius: 99 }}>📍 {(r.map_query ?? r.mapQuery).slice(0, 25)}…</span> : <span style={{ fontSize: 10, color: "#BBB", fontFamily: "'DM Mono',monospace" }}>no map</span>}
            </div>
          )}
          {editingId === r.id && (
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
              <div><label style={lbl}>Website or Instagram link</label><input style={inp} placeholder="https://..." value={editFields.link} onChange={e => setEditFields(p => ({ ...p, link: e.target.value }))} /></div>
              <div><label style={lbl}>Address or postcode</label><input style={inp} placeholder="e.g. Leon London Bridge SE1" value={editFields.mapQuery} onChange={e => setEditFields(p => ({ ...p, mapQuery: e.target.value }))} /></div>
              <button onClick={() => { onEditApproved(r.id, editFields); setEditingId(null); }} style={{ background: "#C8FF47", color: "#0a0a0a", border: "none", borderRadius: 8, padding: "10px 0", fontFamily: "'LBBody', sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Save changes ✓</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
