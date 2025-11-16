import React, { useState, useEffect } from "react";

type KeywordStat = { label: string; total: number };

type LeaderEntry = {
  id: string;
  name: string;
  handle: string;
  avatarUrl?: string; // data URL veya normal URL
  totalKeywords: number;
  lastUpdated: string; // ISO tarih
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

const LEADERBOARD_STORAGE_KEY = "sentient_keyword_counter_leaderboard_v1";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "parsing" | "done" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<KeywordStat[] | null>(null);
  const [totalKeywords, setTotalKeywords] = useState<number>(0);

  // Leaderboard için kullanıcı bilgileri
  const [displayName, setDisplayName] = useState<string>("");
  const [handle, setHandle] = useState<string>("");
  const [avatarFileName, setAvatarFileName] = useState<string>("");
  const [avatarDataUrl, setAvatarDataUrl] = useState<string>("");

  // Leaderboard: localStorage'dan lazy-load
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(LEADERBOARD_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as LeaderEntry[]) : [];
    } catch {
      return [];
    }
  });

  // Leaderboard değiştiğinde localStorage'a yaz
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        LEADERBOARD_STORAGE_KEY,
        JSON.stringify(leaderboard)
      );
    } catch {
      // sessizce yut, UI çalışmaya devam etsin
    }
  }, [leaderboard]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setError(null);
    setStats(null);
    setTotalKeywords(0);

    if (f) {
      setFileName(f.name);
    } else {
      setFileName("");
    }
  }

  function handleAvatarFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setAvatarDataUrl("");
    setAvatarFileName("");

    if (!f) return;

    setAvatarFileName(f.name);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setAvatarDataUrl(result); // data URL olarak kaydediyoruz
      }
    };
    reader.readAsDataURL(f);
  }

  function splitCsvLine(line: string): string[] {
    // Virgülleri, tırnak içlerindeki virgülleri bozmadan ayırmak için basit regex
    return line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
  }

  async function analyzeArchive() {
    if (!file) {
      setError("Please choose a tweets.js or tweets.csv file first.");
      return;
    }

    setStatus("parsing");
    setError(null);

    try {
      const text = await file.text();
      let tweets: string[] = [];

      if (file.name.endsWith(".js")) {
        // tweets.js → window.YTD.tweets.part0 = [ ... ];
        const firstBracket = text.indexOf("[");
        const lastBracket = text.lastIndexOf("]");

        if (firstBracket === -1 || lastBracket === -1) {
          throw new Error(
            "Could not find JSON array in tweets.js. Please upload the original file from X."
          );
        }

        const jsonArray = text.slice(firstBracket, lastBracket + 1);
        const parsed = JSON.parse(jsonArray);

        if (!Array.isArray(parsed)) {
          throw new Error("Parsed tweets.js is not an array.");
        }

        for (const item of parsed) {
          const t =
            item?.tweet?.full_text ||
            item?.tweet?.text ||
            item?.full_text ||
            item?.text;
          if (typeof t === "string") {
            tweets.push(t);
          }
        }
      } else if (file.name.endsWith(".csv")) {
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          throw new Error("CSV file seems to be empty.");
        }

        const headerCols = splitCsvLine(lines[0]);
        const textIndex = headerCols.findIndex((h) =>
          /full_text|text/i.test(h)
        );

        if (textIndex === -1) {
          throw new Error(
            "Could not find a text/full_text column in CSV header."
          );
        }

        for (let i = 1; i < lines.length; i++) {
          const cols = splitCsvLine(lines[i]);
          const t = cols[textIndex];
          if (t && t.trim().length > 0) {
            // Baş ve sondaki tırnakları temizle
            let clean = t.trim();
            if (clean.startsWith('"') && clean.endsWith('"')) {
              clean = clean.slice(1, -1);
            }
            tweets.push(clean);
          }
        }
      } else {
        throw new Error("Please upload tweets.js or tweets.csv file.");
      }

      if (tweets.length === 0) {
        throw new Error(
          "We couldn’t detect tweets in this file. Please upload tweets.js or tweets.csv from your X archive."
        );
      }

      // Keyword sayımı (case-insensitive, substring)
      const statsResult: KeywordStat[] = KEYWORDS.map((label) => {
        const kw = label.toLowerCase();
        let total = 0;

        for (const raw of tweets) {
          const txt = raw.toLowerCase();
          let idx = txt.indexOf(kw);
          while (idx !== -1) {
            total += 1;
            idx = txt.indexOf(kw, idx + kw.length);
          }
        }

        return { label, total };
      });

      const tk = statsResult.reduce((s, k) => s + k.total, 0);

      setStats(statsResult);
      setTotalKeywords(tk);
      setStatus("done");

      // Leaderboard güncelle (aynı handle varsa entry'yi güncelle)
      const normalizedHandle = handle ? handle.toLowerCase() : "";
      const id =
        (normalizedHandle && `@${normalizedHandle.replace(/^@/, "")}`) ||
        (displayName && displayName.toLowerCase()) ||
        "anonymous";

      const nowIso = new Date().toISOString();

      const entry: LeaderEntry = {
        id,
        name: displayName || "Anonymous",
        handle: handle
          ? handle.startsWith("@")
            ? handle
            : "@" + handle
          : "",
        avatarUrl: avatarDataUrl || undefined, // upload ettiyse data URL, yoksa undefined
        totalKeywords: tk,
        lastUpdated: nowIso,
      };

      setLeaderboard((prev) => {
        const others = prev.filter((p) => p.id !== id);
        const next = [...others, entry];
        next.sort((a, b) => b.totalKeywords - a.totalKeywords);
        return next;
      });
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setError(
        err?.message ||
          "We couldn’t detect tweets in this file. Please upload tweets.js or tweets.csv from your X archive."
      );
    }
  }

  const styles = {
    main: {
      maxWidth: 960,
      margin: "40px auto",
      padding: "0 16px 40px",
      fontFamily:
        "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      color: "#111827",
    },
    title: {
      fontSize: 40,
      fontWeight: 800,
      textAlign: "center" as const,
      marginBottom: 8,
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
    uploadCard: {
      background: "#FFFFFF",
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
    fileInput: {
      padding: "8px 0",
    },
    btnPrimary: {
      background: "#2563EB",
      color: "#FFFFFF",
      border: "none",
      borderRadius: 999,
      padding: "10px 22px",
      fontSize: 14,
      fontWeight: 600,
      cursor: "pointer",
      marginTop: 12,
    },
    smallInputRow: {
      display: "flex",
      flexWrap: "wrap" as const,
      gap: 12,
      marginTop: 16,
      alignItems: "center",
    },
    textInput: {
      flex: "1 1 160px",
      minWidth: 0,
      padding: "8px 10px",
      borderRadius: 999,
      border: "1px solid #E5E7EB",
      fontSize: 13,
    },
    errorText: {
      marginTop: 12,
      fontSize: 13,
      color: "#DC2626",
    },
    resultCard: {
      background: "#FFFFFF",
      borderRadius: 16,
      padding: "16px 20px",
      boxShadow: "0 10px 24px rgba(15,23,42,0.04)",
      border: "1px solid #E5E7EB",
      marginTop: 20,
      marginBottom: 20,
    },
    totalLine: {
      fontSize: 18,
      fontWeight: 600,
      color: "#111827",
    },
    tableCard: {
      background: "#FFFFFF",
      borderRadius: 16,
      border: "1px solid #E5E7EB",
      overflow: "hidden",
    },
    tableHeaderRow: {
      background: "#F9FAFB",
    },
    th: {
      textAlign: "left" as const,
      padding: "10px 16px",
      fontSize: 13,
      fontWeight: 600,
      color: "#6B7280",
      borderBottom: "1px solid #E5E7EB",
    },
    td: {
      padding: "10px 16px",
      fontSize: 14,
      color: "#111827",
      borderBottom: "1px solid #F3F4F6",
    },
    leaderboardCard: {
      background: "#FFFFFF",
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
      background: "#F9FAFB",
    },
    avatarFallback: {
      width: 40,
      height: 40,
      borderRadius: "50%",
      background: "#2563EB",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#FFFFFF",
      fontWeight: 700,
    },
    lbMeta: {
      fontSize: 12,
      color: "#9CA3AF",
    },
    footer: {
      marginTop: 32,
      fontSize: 12,
      color: "#9CA3AF",
      textAlign: "center" as const,
    },
    footerLink: {
      color: "#2563EB",
      textDecoration: "none",
      fontWeight: 600,
      marginLeft: 4,
    },
  };

  return (
    <main style={styles.main}>
      <h1 style={styles.title}>Sentient Keyword Counter</h1>
      <p style={styles.tagline}>
        Download your data from X, upload the <b>tweets.js</b> or{" "}
        <b>tweets.csv</b> file, and we’ll analyze your entire history for
        Sentient-related keywords.
      </p>
      <p style={styles.tagline2}>
        See how much you contribute to Sentient on X. We count posts, replies,
        quotes and retweets containing <b>gsent</b>, <b>Sentient</b>,{" "}
        <b>Dobby</b>, <b>GRID</b>, <b>ROMA</b>, <b>OML</b>, <b>Fingerprint</b>,{" "}
        <b>Loyal AI</b>.
      </p>

      {/* Upload card */}
      <section style={styles.uploadCard}>
        <div style={{ fontSize: 14, color: "#374151", fontWeight: 600 }}>
          Upload your X archive file
        </div>

        {/* Yeni açıklama metni */}
        <p style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>
          <strong>How to download your X archive?</strong>
          <br />
          X → Settings &amp; Privacy → Your Account →{" "}
          <span style={{ fontWeight: 600 }}>Download an archive of your data</span>.
          <br />
          (Archive preparation may take up to ~24 hours. When ready, X will
          notify you.)
        </p>

        <p style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>
          <strong>How to upload?</strong>
          <br />
          Open the downloaded ZIP file → go to{" "}
          <span style={{ fontWeight: 600 }}>data</span> → upload{" "}
          <code>tweets.js</code> or <code>tweets.csv</code> here.
          <br />
          We only read the tweet text in your browser —{" "}
          <span style={{ fontWeight: 600 }}>nothing is sent to a server</span>.
        </p>

        <div style={styles.fileRow}>
          <div style={styles.fileInput}>
            <input type="file" accept=".js,.csv" onChange={handleFileChange} />
          </div>
          {fileName && (
            <span style={{ fontSize: 13, color: "#4B5563" }}>{fileName}</span>
          )}
        </div>

        <div style={styles.smallInputRow}>
          <input
            style={styles.textInput}
            placeholder="Display name (for leaderboard)"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <input
            style={styles.textInput}
            placeholder="X handle (e.g. kubilay)"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
          />
          <div>
            <label
              style={{
                display: "block",
                fontSize: 12,
                color: "#6B7280",
                marginBottom: 4,
              }}
            >
              Avatar (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarFileChange}
            />
            {avatarFileName && (
              <div
                style={{
                  fontSize: 11,
                  color: "#9CA3AF",
                  marginTop: 2,
                }}
              >
                {avatarFileName}
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          style={styles.btnPrimary}
          onClick={analyzeArchive}
          disabled={status === "parsing"}
        >
          {status === "parsing" ? "Parsing archive…" : "Analyze Archive"}
        </button>

        {error && <div style={styles.errorText}>{error}</div>}
      </section>

      {/* Result summary */}
      {stats && (
        <>
          <section style={styles.resultCard}>
            <div style={{ fontSize: 14, color: "#6B7280", marginBottom: 4 }}>
              All-time summary
            </div>
            <div style={styles.totalLine}>
              Total Keywords:{" "}
              <span style={{ color: "#2563EB" }}>{totalKeywords}</span>
            </div>
          </section>

          {/* Keyword breakdown table */}
          <section style={styles.tableCard}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={styles.tableHeaderRow}>
                <tr>
                  <th style={styles.th}>Keyword</th>
                  <th style={styles.th}>Total</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((row) => (
                  <tr key={row.label}>
                    <td style={styles.td}>{row.label}</td>
                    <td style={styles.td}>{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}

      {/* Local leaderboard */}
      {leaderboard.length > 0 && (
        <section style={styles.leaderboardCard}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#374151",
              marginBottom: 8,
            }}
          >
            Leaderboard (this browser)
          </div>
          <div
            style={{
              fontSize: 12,
              color: "#9CA3AF",
              marginBottom: 8,
            }}
          >
            Sorted by total keyword count. Each new archive you analyze updates
            your entry here.
          </div>
          {leaderboard.map((user, index) => (
            <div key={user.id} style={styles.lbRow}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    style={styles.avatar}
                  />
                ) : (
                  <div style={styles.avatarFallback}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#111827",
                    }}
                  >
                    {index + 1}. {user.name}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#6B7280",
                    }}
                  >
                    {user.handle}
                  </div>
                  {user.lastUpdated && (
                    <div style={styles.lbMeta}>
                      Last updated:{" "}
                      {new Date(user.lastUpdated).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#2563EB",
                }}
              >
                {user.totalKeywords}
              </div>
            </div>
          ))}
        </section>
      )}

      <footer style={styles.footer}>
        <span>Built by</span>
        <a
          href="https://x.com/avaxcrypto"
          target="_blank"
          rel="noreferrer"
          style={styles.footerLink}
        >
          kubilavax (@avaxcrypto)
        </a>
      </footer>
    </main>
  );
}
