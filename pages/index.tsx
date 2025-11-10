const KEYWORDS = ["gsent", "sentient", "roma", "grid", "loyal"];

export default function Home() {
  return (
    <main style={{ maxWidth: 920, margin: "28px auto", padding: "0 16px", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Başlık */}
      <h1 style={{ fontSize: 36, margin: 0 }}>Sentient Keyword Counter</h1>

      {/* Alt açıklama */}
      <p style={{ color: "#667085", marginTop: 8 }}>
        <b>Keywords (substring)</b> • <b>Counting:</b> Posts • Replies • Quotes • RTs
      </p>

      {/* Keyword chips */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "12px 0 20px" }}>
        {KEYWORDS.map((k) => (
          <span
            key={k}
            style={{
              padding: "6px 10px",
              border: "1px solid #E5E7EB",
              borderRadius: 999,
              background: "#F9FAFB"
            }}
          >
            {k}
          </span>
        ))}
      </div>
    </main>
  );
}
