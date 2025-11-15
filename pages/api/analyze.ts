import type { NextApiRequest, NextApiResponse } from "next";

type KeywordStat = { label: string; total: number };

const KEYWORD_LABELS = [
  "Sentient",
  "ROMA",
  "Dobby",
  "OML",
  "Fingerprint",
  "Loyal AI",
  "gsent",
  "GRID",
];

type ProfileInfo = {
  name: string;
  username: string;
  avatarUrl: string;
};

type AnalyzeResponse = {
  stats: KeywordStat[];
  totalKeywords: number;
  tweetCount: number;
  profile: ProfileInfo | null;
};

const X_API_BASE = "https://api.twitter.com/2";

// Kaç sayfa arama yapacağımız (100 sonuç x 40 sayfa = max ~4000 tweet)
const MAX_PAGES = 40;

async function fetchJson(url: string) {
  const token = process.env.X_BEARER_TOKEN;
  if (!token) {
    throw new Error("X_BEARER_TOKEN is not set");
  }

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`X API error ${res.status}: ${text}`);
  }

  return res.json();
}

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AnalyzeResponse | { error: string }>
) {
  const { username } = req.query;
  const handle = String(username || "").replace(/^@/, "").trim();

  if (!handle) {
    return res.status(400).json({ error: "username is required" });
  }

  try {
    // 1) username → user id + profil bilgisi
    const userData = await fetchJson(
      `${X_API_BASE}/users/by/username/${encodeURIComponent(
        handle
      )}?user.fields=profile_image_url,name,username`
    );

    const user = userData.data;
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = user.id as string;

    // ---- 2) Keyword odaklı arama sorgusu ----
    // Ör: from:kubilay ("Sentient" OR "ROMA" OR ...)
    const keywordQuery = KEYWORD_LABELS.map((kw) =>
      `"${kw}"`
    ).join(" OR ");

    const baseQuery = `from:${user.username} (${keywordQuery})`;

    // Son 1 yıl için start_time (eğer plan desteklerse kullanılır)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const startTimeIso = oneYearAgo.toISOString();

    const collectedTexts: string[] = [];
    let nextToken: string | undefined;
    let pageCount = 0;

    while (pageCount < MAX_PAGES) {
      let url =
        `${X_API_BASE}/tweets/search/recent?max_results=100` +
        `&tweet.fields=created_at,author_id` +
        `&query=${encodeURIComponent(baseQuery)}` +
        `&start_time=${encodeURIComponent(startTimeIso)}`;

      if (nextToken) {
        url += `&next_token=${encodeURIComponent(nextToken)}`;
      }

      const page = await fetchJson(url);

      const tweets = page.data || [];
      if (!tweets.length) break;

      for (const t of tweets) {
        const text: string = t.text;
        collectedTexts.push(text);
      }

      pageCount += 1;

      const meta = page.meta || {};
      if (!meta.next_token) {
        break;
      }

      nextToken = meta.next_token;
    }

    const stats = countKeywordsInTweets(collectedTexts, KEYWORD_LABELS);
    const totalKeywords = stats.reduce((s, k) => s + k.total, 0);

    const profile: ProfileInfo = {
      name: user.name,
      username: user.username,
      avatarUrl: user.profile_image_url || "",
    };

    res.status(200).json({
      stats,
      totalKeywords,
      tweetCount: collectedTexts.length,
      profile,
    });
  } catch (err: any) {
    console.error("Analyze error:", err);
    res.status(500).json({ error: err.message || "Internal error" });
  }
}
