// --- UI CONFIG ---
const KEYWORDS: { label: string; total: number }[] = [
  { label: "gsent", total: 100 },
  { label: "Sentient", total: 50 },
  { label: "Dobby", total: 20 },
  { label: "GRID", total: 5 },
  { label: "ROMA", total: 0 },
];
// UI’yi görmek için true/false yapabilirsin (auth henüz yok)
const SHOW_PROFILE = true;

export default function Home() {
  const totalKeywords = KEYWORDS.reduce((s, k) => s + k.total, 0);

  return (
    <main style={styles.main}>
      {/* ---- Sentient "logo" başlığı ---- */}
      <div style={styles.logoWrap}>
        <span style={styles.logoText}>Sentient</span>
      </div>

      {/* ---- Proje tagline (Türkçe metin) ---- */}
      <p style={styles.tagline}>
        <b>X (Twitter)</b> hesabını bağla. X’te Sentient’e ne kadar katkı verdiğini gör.
        <br />
        <span style={{ opacity: 0.9 }}>
          <b>gsent, Sentient, Dobby, GRID, ROMA</b> kelimelerini içeren postları, yorumları, alıntıları ve RT’leri sayar.
        </span>
      </p>

      {/* ---- Sign in with X (UI only) ---- */}
      <div style={{ textAlign: "center", marginTop: 12 }}>
        <button onClick={() => {}} style={styles.signBtn}>Sign in with X</button>
      </div>

      {/* ---- Profil kartı (placeholder) ---- */}
      {SHOW_PROFILE && (
        <section style={styles.profileCard}>
          <img
            alt="Twitter Avatar"
            // İstersen burada @kullanici için unavatar kullanabilirsin: https://unavatar.io/twitter/<handle>
            src="https://unavatar.io/twitter/sentientagi"
            style={styles.avatar}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={styles.nameRow}>
              <span style={styles.displayName}>Maje</span>
              <span style={styles.handle}>@maje53</span>
            </div>
            <div style={styles.kpi}>
              <span style={{ fontSize: 12, color: "#6b7280", letterSpacing: 0.2 }}>Total Keywords</span>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{totalKeywords.toLocaleString("tr-TR")}</div>
            </div>
          </div>
        </section>
      )}

      {/* ---- Ana tablo (yuvarlatılmış) ---- */}
      <section style={{ marginTop: 18 }}>
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Keyword</th>
                <th style={styles.thRight}>Total</th>
              </tr>
            </thead>
            <tbody>
              {KEYWORDS.map((row) => (
                <tr key={row.label}>
                  <td style={styles.td}>{row.label}</td>
                  <td style={styles.tdRight}>{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

/* ---------- inline stiller ---------- */
const styles: Record<string, React.CSSProperties> = {
  main: {
    maxWidth: 920,
    margin: "28px auto",
    padding: "0 16px",
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
    color: "#0f172a",
  },
  logoWrap: {
    display: "flex",
    justifyContent: "center",
    marginTop: 8,
  },
  logoText: {
    fontSize: 72,
    lineHeight: 1,
    fontWeight: 800,
    letterSpacing: -1.2,
  },
  tagline: {
    textAlign: "center",
    marginTop: 14,
    fontSize: 16,
    color: "#475569",
  },
  signBtn: {
    padding: "12px 20px",
    borderRadius: 10,
    border: "1px solid #1d4ed8",
    background: "#2563eb",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 6px 14px rgba(37,99,235,0.18)",
  },
  profileCard: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginTop: 28,
    padding: 16,
    borderRadius: 14,
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: "50%",
    objectFit: "cover",
  },
  nameRow: {
    display: "flex",
    alignItems: "baseline",
    gap: 10,
  },
  displayName: {
    fontSize: 18,
    fontWeight: 700,
  },
  handle: {
    fontSize: 14,
    color: "#6b7280",
  },
  kpi: {
    marginTop: 4,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  tableWrap: {
    borderRadius: 12,
    overflow: "hidden", // köşeleri gerçekten yuvarlatmak için önemli
    border: "1px solid #e5e7eb",
    background: "#fff",
    boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
  },
  th: {
    textAlign: "left" as const,
    padding: "12px 14px",
    fontWeight: 700,
    background: "#f8fafc",
    borderBottom: "1px solid #e5e7eb",
  },
  thRight: {
    textAlign: "right" as const,
    padding: "12px 14px",
    fontWeight: 700,
    background: "#f8fafc",
    borderBottom: "1px solid #e5e7eb",
  },
  td: {
    padding: "12px 14px",
    borderBottom: "1px solid #f1f5f9",
  },
  tdRight: {
    padding: "12px 14px",
    borderBottom: "1px solid #f1f5f9",
    textAlign: "right" as const,
    fontWeight: 600,
  },
};
