const KEYWORDS = ["gsent", "sentient", "roma", "grid", "loyal"];

export default function Home() {
  return (
    <main style={main}>
      {/* Başlık */}
      <h1 style={h1}>Sentient Keyword Counter</h1>

      {/* Alt açıklama */}
      <p style={sub}>
        <b>Keywords (substring)</b> • <b>Counting:</b> Posts • Replies • Quotes • RTs
      </p>

      {/* Keyword chips */}
      <div style={chipsRow}>
        {KEYWORDS.map((k) => (
          <span key={k} style={chip}>{k}</span>
        ))}
      </div>

      {/* Sign in with X (UI-only) */}
      <div style={{ margin: "6px 0 24px" }}>
        <button onClick={() => {}} style={btn}>
          Sign in with X
        </button>
      </div>

      {/* Sonuçlar (placeholder) */}
      <section style={card}>
        <h2 style={{ marginTop: 0 }}>Sonuçlar @username</h2>
        <p style={{ margin: "4px 0", color: "#667085" }}>
          Taranan tweet: <b>234</b> &nbsp;/&nbsp; Mod: <b>substring</b>
        </p>
        <p style={{ margin: "4px 0 16px", fontSize: 18 }}>
          Senin toplamın: <b>175</b>
        </p>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>Keyword</th>
                <th style={th}>Total</th>
                <th style={th}>Examples</th>
              </tr>
            </thead>
            <tbody>
              {[
                { k: "gsent", t: 100, e: "…" },
                { k: "sentient", t: 50, e: "…" },
                { k: "roma", t: 25, e: "…" },
                { k: "grid", t: 0, e: "–" },
                { k: "loyal", t: 0, e: "–" }
              ].map((row) => (
                <tr key={row.k}>
                  <td style={td}>{row.k}</td>
                  <td style={td}>{row.t}</td>
                  <td style={td}>{row.e}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

/* ——— inline stiller ——— */
const main: React.CSSProperties = { maxWidth: 920, margin: "28px auto", padding: "0 16px", fontFamily: "Inter, system-ui, sans-serif" };
const h1: React.CSSProperties = { fontSize: 36, margin: 0 };
const sub: React.CSSProperties = { color: "#667085", marginTop: 8 };
const chipsRow: React.CSSProperties = { display: "flex", gap: 8, flexWrap: "wrap", margin: "12px 0 20px" };
const chip: React.CSSProperties = { padding: "6px 10px", border: "1px solid #E5E7EB", borderRadius: 999, background: "#F9FAFB" };
const btn: React.CSSProperties = { padding: "12px 18px", borderRadius: 10, border: "1px solid #2563eb", background: "#2563eb", color: "#fff", fontWeight: 600 };
const card: React.CSSProperties = { border: "1px solid #E5E7EB", borderRadius: 12, padding: 16, background: "#fff" };
const th: React.CSSProperties = { border: "1px solid #E5E7EB", padding: "10px 8px", textAlign: "left", background: "#F9FAFB" };
const td: React.CSSProperties = { border: "1px solid #E5E7EB", padding: "10px 8px", textAlign: "left" };
