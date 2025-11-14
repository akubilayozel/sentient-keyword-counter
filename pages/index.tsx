// --- UI CONFIG (placeholder) ---
const KEYWORDS: { label: string; total: number }[] = [
  { label: "gsent", total: 100 },
  { label: "Sentient", total: 50 },
  { label: "Dobby", total: 20 },
  { label: "GRID", total: 5 },
  { label: "ROMA", total: 0 },
];

// Show profile (placeholder until OAuth)
const SHOW_PROFILE = true;

export default function Home() {
  const totalKeywords = KEYWORDS.reduce((s, k) => s + k.total, 0);

  return (
    <main style={styles.main}>
      {/* ---- SENTIENT LOGO / HERO ---- */}
      <div style={styles.hero}>
        <div style={styles.logoText}>Sentient</div>

        <p style={styles.tagline}>
          Connect your X (Twitter) account. See how much you contribute to Sentient on X.
          <br />
          We count posts, replies, quotes and retweets containing{" "}
          <b>gsent, Sentient, Dobby, GRID, ROMA</b>.
        </p>

        <button onClick={() => {}} style={styles.signBtn}>
          Sign in with X
        </button>
      </div>

      {/* ---- PROFILE CARD (mock) ---- */}
      {SHOW_PROFILE && (
        <section style={styles.profileCard}>
          <img
            alt="Twitter Avatar"
            src="https://unavatar.io/twitter/sentientagi"
            style={styles.avatar}
          />

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={styles.nameRow}>
              <span style={styles.displayName}>Kubilay</span>
              <span style={styles.handle}>@username</span>
            </div>

            <div style={styles.kpiRow}>
              <span style={styles.kpiLabel}>Total Keywords</span>
              <span style={styles.kpiValue}>
                {totalKeywords.toLocaleString("en-US")}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* ---- KEYWORD TABLE ---- */}
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

/* ------------ INLINE CSS ------------ */

const styles: Record<string, React.CSSProperties> = {
  main: {
    maxWidth: 920,
    margin: "32px auto",
    padding: "0 16px",
    fontFamily:
      "Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
    color: "#0f172a",
  },

  hero: { textAlign: "center", marginBottom: 24 },

  logoText: {
    fontSize: 72,
    lineHeight: 1,
    fontWeight: 800,
    letterSpacing: -1.2,
  },

  tagline: {
    marginTop: 10,
    fontSize: 16,
    color: "#475569",
  },

  signBtn: {
    marginTop: 20,
    padding: "12px 22px",
    borderRadius: 10,
    border: "1px solid #1d4ed8",
    background: "#2563eb",
    color: "#fff",
    fontWeight: 700,
    fontSize: 16,
    cursor: "pointer",
    boxShadow: "0 6px 14px rgba(37,99,235,0.15)",
  },

  profileCard: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginTop: 32,
    padding: 18,
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

  kpiRow: {
    marginTop: 4,
    display: "flex",
    alignItems: "baseline",
    gap: 8,
  },

  kpiLabel: {
    fontSize: 12,
    color: "#6b7280",
    letterSpacing: 0.3,
  },

  kpiValue: {
    fontSize: 22,
    fontWeight: 800,
  },

  tableWrap: {
    borderRadius: 12,
    overflow: "hidden",
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
    textAlign: "left",
    padding: "12px 14px",
    fontWeight: 700,
    background: "#f8fafc",
    borderBottom: "1px solid #e5e7eb",
  },

  thRight: {
    textAlign: "right",
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
    textAlign: "right",
    fontWeight: 600,
    borderBottom: "1px solid #f1f5f9",
  },
};
