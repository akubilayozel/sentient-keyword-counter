import { useState } from "react";
import type React from "react";

type KeywordStat = { label: string; total: number };

// Ekranda görünecek keyword label'ları
const KEYWORD_LABELS = [
  "Sentient",
  "GRID",
  "ROMA",
  "Dobby",
  "OML",
  "Fingerprint",
  "Loyal AI",
  "gsent",
];

// Şimdilik örnek tweet metinleri (ileride Twitter API'den gelecek)
const SAMPLE_TWEETS: string[] = [
  "gm gsent fam, building crazy stuff with Sentient and ROMA today",
  "Dobby is cooking something big for OML and Loyal AI",
  "I love the Sentient community, gsent forever",
  "Fingerprint tech + OML + Sentient = wild combo",
  "No keyword in this tweet, just vibes",
];

// Tweetler içinde substring olarak kelime sayan fonksiyon
function countKeywordsInTweets(
  tweets: string[],
  labels: string[]
): KeywordStat[] {
  return labels.map((label) => {
    const kw = label.toLowerCase();
    let total = 0;

    for (const raw of tweets) {
      const text = raw.toLowerCase();
      let idx = text.indexOf(kw);

      // aynı tweette birden fazla geçişi de say
      while (idx !== -1) {
        total += 1;
        idx = text.indexOf(kw, idx + kw.length);
      }
    }

    return { label, total };
  });
}

export default function Home() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [stats, setStats] = useState<KeywordStat[]>(
    KEYWORD_LABELS.map((label) => ({ label, total: 0 }))
  );

  const totalKeywords = stats.reduce((s, k) => s + k.total, 0);

  const runCalculation = () => {
    // Burada ileride gerçek OAuth + Twitter API çağrısı olacak.
    // Şimdilik sadece dummy tweetler üzerinde sayım yapıyoruz.
    const newStats = countKeywordsInTweets(SAMPLE_TWEETS, KEYWORD_LABELS);
    setStats(newStats);
  };

  const handleClick = () => {
    setIsLoading(true);

    setTimeout(() => {
      runCalculation();
      setIsLoading(false);
      setIsAuthed(true);
    }, 900);
  };

  const buttonLabel = isAuthed ? "Recalculate" : "Sign in with X";

  return (
    <main style={styles.main}>
      {/* ---- SENTIENT LOGO / HERO ---- */}
      <div style={styles.hero}>
        <div style={styles.logoText}>Sentient</div>

        <p style={styles.tagline}>
          Connect your X (Twitter) account. See how much you contribute to
          Sentient on X.
          <br />
          We count posts, replies, quotes and retweets containing{" "}
          <b>
            Sentient, GRID, ROMA, Dobby, OML, Fingerprint, Loyal AI, gsent
          </b>
          .
        </p>

        <button
          onClick={handleClick}
          style={{
            ...styles.signBtn,
            opacity: isLoading ? 0.7 : 1,
            cursor: isLoading ? "default" : "pointer",
          }}
          disabled={isLoading}
        >
          {isLoading ? "Calculating…" : buttonLabel}
        </button>
      </div>

      {/* ---- LOADING SKELETON ---- */}
      {isLoading ? (
        <>
          <section style={styles.skeletonCard}>
            <div style={styles.skeletonAvatar} />
            <div style={{ flex: 1 }}>
              <div style={styles.skeletonLineWide} />
              <div style={styles.skeletonLineNarrow} />
            </div>
          </section>

          <section style={{ marginTop: 18 }}>
            <div style={styles.skeletonTableHeader} />
            <div style={styles.skeletonTableRow} />
            <div style={styles.skeletonTableRow} />
            <div style={styles.skeletonTableRow} />
          </section>
        </>
      ) : (
        <>
          {/* ---- PROFILE CARD (mock, sadece sign-in sonrası) ---- */}
          {isAuthed && (
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
              <div style={styles.tableHeaderRow}>
                <span style={styles.tableTitle}>Keyword Breakdown</span>
                {isAuthed && (
                  <button
                    style={styles.recalcBtn}
                    onClick={handleClick}
                    disabled={isLoading}
                  >
                    Recalculate
                  </button>
                )}
              </div>

              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Keyword</th>
                    <th style={styles.thRight}>Total</th>
                  </tr>
                </thead>

                <tbody>
                  {stats.map((row) => (
                    <tr key={row.label}>
                      <td style={styles.td}>{row.label}</td>
                      <td style={styles.tdRight}>{row.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
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

  tableHeaderRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 14px",
    borderBottom: "1px solid #e5e7eb",
    background: "#f8fafc",
  },

  tableTitle: {
    fontWeight: 600,
    fontSize: 14,
    color: "#0f172a",
  },

  recalcBtn: {
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    background: "#ffffff",
    fontSize: 12,
    cursor: "pointer",
  },

  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
  },

  th: {
    textAlign: "left",
    padding: "10px 14px",
    fontWeight: 700,
    background: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
  },

  thRight: {
    textAlign: "right",
    padding: "10px 14px",
    fontWeight: 700,
    background: "#f9fafb",
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

  /* --- Skeleton styles --- */
  skeletonCard: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginTop: 32,
    padding: 18,
    borderRadius: 14,
    background: "#f3f4f6",
  },

  skeletonAvatar: {
    width: 64,
    height: 64,
    borderRadius: "50%",
    background: "linear-gradient(90deg,#e5e7eb,#f3f4f6,#e5e7eb)",
    backgroundSize: "200% 100%",
    animation: "pulse 1.2s ease-in-out infinite",
  },

  skeletonLineWide: {
    height: 16,
    width: "60%",
    borderRadius: 999,
    marginBottom: 8,
    background: "#e5e7eb",
  },

  skeletonLineNarrow: {
    height: 12,
    width: "40%",
    borderRadius: 999,
    background: "#e5e7eb",
  },

  skeletonTableHeader: {
    height: 36,
    borderRadius: 10,
    background: "#e5e7eb",
    marginBottom: 8,
  },

  skeletonTableRow: {
    height: 32,
    borderRadius: 8,
    background: "#f3f4f6",
    marginBottom: 6,
  },
};
