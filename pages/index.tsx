import { useState, useEffect } from "react";

type KeywordStat = { label: string; total: number };

type LeaderEntry = {
  id: string;
  name: string;
  handle: string;
  avatarUrl?: string;
  totalKeywords: number;
  date: string;
};

const KEYWORDS = [
  "Sentient",
  "ROMA",
  "Dobby",
  "OML",
  "Fingerprint",
  "Loyal AI",
  "gsent",
  "GRID",
];

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState<"idle" | "parsing" | "done" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<KeywordStat[] | null>(null);
  const [totalKeywords, setTotalKeywords] = useState(0);

  // User info
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [avatarFileName, setAvatarFileName] = useState("");
  const [avatarDataUrl, setAvatarDataUrl] = useState("");

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);

  // Load leaderboard on mount
  useEffect(() => {
    const saved = localStorage.getItem("sentient_leaderboard");
    if (saved) {
      try {
        setLeaderboard(JSON.parse(saved));
      } catch {}
    }
  }, []);

  // Save leaderboard
  useEffect(() => {
    localStorage.setItem("sentient_leaderboard", JSON.stringify(leaderboard));
  }, [leaderboard]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setFileName(f ? f.name : "");
    setError(null);
    setStats(null);
  }

  function handleAvatarFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setAvatarFileName(f.name);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatarDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(f);
  }

  function splitCsvLine(line: string) {
    return line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
  }

  async function analyzeArchive() {
    if (!file) return setError("Please choose a tweets.js or tweets.csv file.");

    setStatus("parsing");
    setError(null);

    try {
      const raw = await file.text();
      let tweets: string[] = [];

      // ---------------------------
      // Parse tweets.js
      // ---------------------------
      if (file.name.endsWith(".js")) {
        const i1 = raw.indexOf("[");
        const i2 = raw.lastIndexOf("]");
        if (i1 === -1 || i2 === -1) throw new Error("Invalid tweets.js format");

        const arr = JSON.parse(raw.slice(i1, i2 + 1));
        for (const t of arr) {
          const txt =
            t?.tweet?.full_text ||
            t?.tweet?.text ||
            t?.full_text ||
            t?.text;
          if (typeof txt === "string") tweets.push(txt);
        }
      }

      // ---------------------------
      // Parse tweets.csv
      // ---------------------------
      else if (file.name.endsWith(".csv")) {
        const lines = raw.split(/\r?\n/).filter((l) => l.trim() !== "");
        const header = splitCsvLine(lines[0]);
        const ti = header.findIndex((h) => /text|full_text/i.test(h));
        if (ti === -1) throw new Error("No text/full_text column found");

        for (let i = 1; i < lines.length; i++) {
          let c = splitCsvLine(lines[i]);
          let txt = c[ti];
          if (txt) {
            txt = txt.replace(/^"/, "").replace(/"$/, "");
            tweets.push(txt);
          }
        }
      } else {
        throw new Error("Upload tweets.js or tweets.csv only.");
      }

      if (!tweets.length) throw new Error("No tweets detected.");

      // ---------------------------
      // Count Keywords
      // ---------------------------
      const statsResult = KEYWORDS.map((label) => {
        const kw = label.toLowerCase();
        let total = 0;

        for (const tweet of tweets) {
          const txt = tweet.toLowerCase();
          let idx = txt.indexOf(kw);
          while (idx !== -1) {
            total++;
            idx = txt.indexOf(kw, idx + kw.length);
          }
        }
        return { label, total };
      });

      const tk = statsResult.reduce((a, b) => a + b.total, 0);

      setStats(statsResult);
      setTotalKeywords(tk);
      setStatus("done");

      // ---------------------------
      // Leaderboard update
      // ---------------------------
      const id =
        (handle || displayName)?.trim().toLowerCase().replace("@", "") ||
        "anonymous";

      const newEntry: LeaderEntry = {
        id,
        name: displayName || "Anonymous",
        handle: handle ? (handle.startsWith("@") ? handle : "@" + handle) : "",
        avatarUrl: avatarDataUrl || undefined,
        totalKeywords: tk,
        date: new Date().toLocaleString(),
      };

      setLeaderboard((prev) => {
        const others = prev.filter((x) => x.id !== id);
        const next = [...others, newEntry].sort(
          (a, b) => b.totalKeywords - a.totalKeywords
        );
        return next;
      });
    } catch (err: any) {
      setStatus("error");
      setError(err.message || "Parsing error");
    }
  }

  const styles = {
    main: {
      maxWidth: 960,
      margin: "40px auto",
      padding: "0 16px 40px",
      fontFamily: "Inter, sans-serif",
      color: "#111827",
    },
    title: {
      fontSize: 40,
      fontWeight: 800,
      textAlign: "center" as const,
    },
    tagline: {
      textAlign: "center" as const,
      fontSize: 15,
      color: "#4B5563",
      marginBottom: 4,
    },
    tagline2: {
      textAlign: "center" as const,
      fontSize: 14,
      color: "#6B7280",
      marginBottom: 32,
    },

    // Upload Card
    uploadCard: {
      background: "#FFF",
      borderRadius: 16,
      padding: "20px 24px",
      boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
      border: "1px solid #E5E7EB",
      marginBottom: 24,
    },

    fileRow: {
      display: "flex",
      flexWrap: "wrap" as const,
      gap: 12,
      alignItems: "center",
      marginTop: 12,
    },

    btnPrimary: {
      background: "#2563EB",
      color: "#FFF",
      padding: "10px 22px",
      borderRadius: 999,
      border: "none",
      cursor: "pointer",
      marginTop: 12,
      fontSize: 14,
      fontWeight: 600,
    },

    textInput: {
      flex: "1 1 160px",
      minWidth: 0,
      padding: "8px 10px",
      borderRadius: 999,
      border: "1px solid #E5E7EB",
      fontSize: 13,
    },

    // Result
    resultCard: {
      background: "#FFF",
      borderRadius: 16,
      padding: "16px 20px",
      border: "1px solid #E5E7EB",
      marginTop: 20,
      marginBottom: 20,
    },

    tableCard: {
      background: "#FFF",
      borderRadius: 16,
      border: "1px solid #E5E7EB",
      overflow: "hidden",
    },

    th: {
      padding: "10px 16px",
      fontSize: 13,
      fontWeight: 600,
      color: "#6B7280",
      borderBottom: "1px solid #E5E7EB",
      textAlign: "left" as const,
    },

    td: {
      padding: "10px 16px",
      fontSize: 14,
      color: "#111827",
      borderBottom: "1px solid #F3F4F6",
    },

    // Leaderboard
    leaderboardCard: {
      background: "#FFF",
      borderRadius: 16,
      border: "1px solid #E5E7EB",
      padding: "16px 20px",
      marginTop: 24,
    },

    lbRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "8px 0",
      borderBottom: "1px solid #F3F4F6",
    },

    avatar: {
      width: 40,
      height: 40,
      borderRadius: "50%",
      objectFit: "cover" as const,
    },
  };

  return (
    <main style={styles.main}>
      <h1 style={styles.title}>Sentient Keyword Counter</h1>

      <p style={styles.tagline}>
        Download your data from X, upload the <b>tweets.js</b> or{" "}
        <b>tweets.csv</b> file.
      </p>

      <p style={styles.tagline2}>
        We count all posts, replies, quotes and retweets containing:{" "}
        <b>gsent</b>, <b>Sentient</b>, <b>Dobby</b>, <b>GRID</b>, <b>ROMA</b>,{" "}
        <b>OML</b>, <b>Fingerprint</b>, <b>Loyal AI</b>.
      </p>

      <section style={styles.uploadCard}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>Upload your X archive</div>
        <p style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>
          How to download your X archive?
          <br />
          Settings &gt; Privacy &gt; Your Account → Download an archive of your data.
          (May take ~24 hours)
          <br />
          <br />
          How to upload?
          <br />
          Open ZIP → go to <b>data</b> → upload <b>tweets.js</b> or{" "}
          <b>tweets.csv</b>. Everything is processed in your browser.
        </p>

        <div style={styles.fileRow}>
          <input type="file" accept=".js,.csv" onChange={handleFileChange} />
          {fileName && <span>{fileName}</span>}
        </div>

        {/* User inputs */}
        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <input
            style={styles.textInput}
            placeholder="Display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <input
            style={styles.textInput}
            placeholder="X handle (without @)"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
          />
        </div>

        {/* Avatar */}
        <div style={{ marginTop: 16 }}>
          <label style={{ fontSize: 12, color: "#6B7280" }}>
            Avatar (optional)
          </label>
          <input type="file" accept="image/*" onChange={handleAvatarFileChange} />
          {avatarFileName && (
            <div style={{ fontSize: 11, color: "#9CA3AF" }}>{avatarFileName}</div>
          )}
        </div>

        <button
          style={styles.btnPrimary}
          onClick={analyzeArchive}
          disabled={status === "parsing"}
        >
          {status === "parsing" ? "Parsing..." : "Analyze Archive"}
        </button>

        {error && <div style={{ color: "#DC2626", marginTop: 8 }}>{error}</div>}
      </section>

      {stats && (
        <>
          <section style={styles.resultCard}>
            <div style={{ fontSize: 14, color: "#6B7280" }}>All-time summary</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>
              Total Keywords: <span style={{ color: "#2563EB" }}>{totalKeywords}</span>
            </div>
          </section>

          <section style={styles.tableCard}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={styles.th}>Keyword</th>
                  <th style={styles.th}>Total</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((s) => (
                  <tr key={s.label}>
                    <td style={styles.td}>{s.label}</td>
                    <td style={styles.td}>{s.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <section style={styles.leaderboardCard}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Leaderboard</div>
          <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 8 }}>
            Sorted by keyword count. Re-analyzing updates your entry.
          </div>

          {leaderboard.map((u, i) => (
            <div key={u.id} style={styles.lbRow}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {u.avatarUrl ? (
                  <img src={u.avatarUrl} style={styles.avatar} />
                ) : (
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "#2563EB",
                      color: "#FFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                    }}
                  >
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>
                    {i + 1}. {u.name}
                  </div>
                  <div style={{ fontSize: 12, color: "#6B7280" }}>
                    {u.handle} — {u.date}
                  </div>
                </div>
              </div>

              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#2563EB",
                }}
              >
                {u.totalKeywords}
              </div>
            </div>
          ))}

          <div
            style={{
              fontSize: 12,
              color: "#9CA3AF",
              marginTop: 20,
              textAlign: "center" as const,
            }}
          >
            built by <b>kubilavax (@avaxcrypto)</b>
          </div>
        </section>
      )}
    </main>
  );
}
