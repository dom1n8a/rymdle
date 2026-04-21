"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const DAILY_ID = "2026-04-21";

type Album = {
  title: string;
  artist: string;
  rating: number;
  cover: string;
};

type Stats = {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  history: number[];
  lastPlayedId: string;
};

const DAILY_ALBUMS: Album[] = [
  { title: "OK Computer", artist: "Radiohead", rating: 4.30, cover: "https://e.snmc.io/i/600/w/91f41d53d83f36ac3bb0cee7d6dffca3/11993756/radiohead-ok-computer-Cover-Art.jpg" },
  { title: "To Pimp a Butterfly", artist: "Kendrick Lamar", rating: 4.38, cover: "https://e.snmc.io/i/600/w/a47f7eef08776272f5525d5a1f7c9c6a/8121875/kendrick-lamar-to-pimp-a-butterfly-Cover-Art.jpg" },
  { title: "Abbey Road", artist: "The Beatles", rating: 4.30, cover: "https://e.snmc.io/i/600/w/b7d49832f4958688cd82b6dbb9f4dd31/12188855/the-beatles-abbey-road-Cover-Art.jpg" },
  { title: "The Dark Side of the Moon", artist: "Pink Floyd", rating: 4.27, cover: "https://e.snmc.io/i/600/w/b87ea178beaaaf0e0e4a39aaf9d1b834/12206378/pink-floyd-the-dark-side-of-the-moon-Cover-Art.jpg" },
  { title: "Blonde", artist: "Frank Ocean", rating: 4.09, cover: "https://e.snmc.io/i/600/w/3bc698315ea2ed723fe714b7dd1f84af/8060362/frank-ocean-blonde-Cover-Art.jpg" },
  { title: "Madvillainy", artist: "Madvillain", rating: 4.33, cover: "https://e.snmc.io/i/600/w/9c52ece824b06220dd56f69119aa5739/13200445/madvillain-madvillainy-Cover-Art.jpg" },
  { title: "In Rainbows", artist: "Radiohead", rating: 4.33, cover: "https://e.snmc.io/i/600/w/fadce3351784e528a8257b7c78f0b55a/14126517/radiohead-in-rainbows-Cover-Art.jpg" },
  { title: "Loveless", artist: "My Bloody Valentine", rating: 4.25, cover: "https://e.snmc.io/i/600/w/47da1d4284997ca321af967068f34d7b/11569981/my-bloody-valentine-loveless-Cover-Art.jpg" },
  { title: "Discovery", artist: "Daft Punk", rating: 4.14, cover: "https://e.snmc.io/i/600/w/f257109d44300506428e21138338e884/13215963/daft-punk-discovery-Cover-Art.jpg" },
  { title: "Kid A", artist: "Radiohead", rating: 4.25, cover: "https://e.snmc.io/i/600/w/076215c80b1810341e978bbdbf47af69/12580450/radiohead-kid-a-Cover-Art.jpg" }
];

function makePairs(albums: Album[]): [Album, Album][] {
  const p: [Album, Album][] = [];
  for (let i = 0; i < 10; i += 2) {
    p.push([albums[i], albums[i + 1]]);
  }
  return p;
}

function getCountdown() {
  const now = new Date();
  const nz = new Date(now.toLocaleString("en-US", { timeZone: "Pacific/Auckland" }));
  const next = new Date(nz);
  next.setHours(24, 0, 0, 0);
  const diff = next.getTime() - nz.getTime();

  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  return `${h}h ${m}m ${s}s`;
}

export default function Page() {
  const [pairs] = useState(makePairs(DAILY_ALBUMS));
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  const [countdown, setCountdown] = useState("");
  const [results, setResults] = useState<boolean[]>([]);
  const [locked, setLocked] = useState(false);
  const [copied, setCopied] = useState(false);

  const [stats, setStats] = useState<Stats>({
    played: 0,
    wins: 0,
    currentStreak: 0,
    maxStreak: 0,
    history: [],
    lastPlayedId: ""
  });

  const saveKey = `rym_save_${DAILY_ID}`;
  const statsKey = "rym_stats";

  useEffect(() => {
    const saved = localStorage.getItem(saveKey);
    if (saved) {
      const data = JSON.parse(saved);
      setScore(data.score || 0);
      setResults(data.results || []);
      setFinished(data.finished || false);
    }

    const savedStats = localStorage.getItem(statsKey);
    if (savedStats) {
      const parsed = JSON.parse(savedStats);
      setStats({
        played: parsed.played || 0,
        wins: parsed.wins || 0,
        currentStreak: parsed.currentStreak || 0,
        maxStreak: parsed.maxStreak || 0,
        history: parsed.history || [],
        lastPlayedId: parsed.lastPlayedId || ""
      });
    }

    const i = setInterval(() => setCountdown(getCountdown()), 1000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    localStorage.setItem(saveKey, JSON.stringify({ score, results, finished }));
  }, [score, results, finished]);

  useEffect(() => {
    localStorage.setItem(statsKey, JSON.stringify(stats));
  }, [stats]);

  const pick = (idx: number) => {
    if (revealed || finished || locked) return;

    setLocked(true);

    const [a, b] = pairs[round];
    const correct = a.rating > b.rating ? 0 : 1;
    const isCorrect = idx === correct;

    setResults((prev) => [...prev, isCorrect]);
    if (isCorrect) setScore((s) => s + 1);

    setTimeout(() => {
      setRevealed(true);
      setLocked(false);
    }, 200);
  };

  const next = () => {
    if (round === 4) {
      setFinished(true);

      setStats((prev) => {
        if (prev.lastPlayedId === DAILY_ID) return prev;

        const won = score >= 3;
        const newStreak = won ? prev.currentStreak + 1 : 0;

        return {
          played: prev.played + 1,
          wins: won ? prev.wins + 1 : prev.wins,
          currentStreak: newStreak,
          maxStreak: Math.max(prev.maxStreak, newStreak),
          history: [...prev.history, score],
          lastPlayedId: DAILY_ID
        };
      });
    } else {
      setRound((r) => r + 1);
      setRevealed(false);
    }
  };

  const buildEmojiGrid = () => results.map((r) => (r ? "🟩" : "🟥")).join("");

  const share = async () => {
    await navigator.clipboard.writeText(
      `Rymdle ${DAILY_ID} ${score}/5\n${buildEmojiGrid()}\nhttps://rymdle.vercel.app`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const [a, b] = pairs[round];
  const correct = a.rating > b.rating ? 0 : 1;

  if (finished) {
    const winPercent = stats.played
      ? Math.round((stats.wins / stats.played) * 100)
      : 0;

    const distribution = [0, 0, 0, 0, 0, 0];
    (stats.history || []).forEach((s) => {
      if (s >= 0 && s <= 5) distribution[s]++;
    });

    const max = Math.max(...distribution, 1);

    return (
      <main className="flex flex-col items-center justify-center min-h-screen p-6 gap-6">
        <h1 className="text-2xl font-bold">Rymdle</h1>
        <p className="text-xl">{score}/5</p>

        <button onClick={share} className="w-full max-w-xs py-3 bg-black text-white rounded-xl">
          {copied ? "Copied!" : "Share"}
        </button>

        <div className="w-full max-w-md text-center">
          <h2 className="font-bold mb-2">STATISTICS</h2>
          <div className="grid grid-cols-4 gap-2 text-sm">
            <div><div className="text-xl">{stats.played}</div><div>Played</div></div>
            <div><div className="text-xl">{winPercent}</div><div>Win %</div></div>
            <div><div className="text-xl">{stats.currentStreak}</div><div>Streak</div></div>
            <div><div className="text-xl">{stats.maxStreak}</div><div>Max</div></div>
          </div>
        </div>

        <div className="w-full max-w-md">
          <h2 className="font-bold mb-2 text-center">SCORES</h2>

          {distribution.map((count, i) => {
            const width = (count / max) * 100;
            const isToday = i === score;

            return (
              <div key={i} className="flex items-center gap-2 text-sm mb-2">
                <span className="w-4">{i}</span>

                <div className="flex-1 bg-gray-300 rounded overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${width}%` }}
                    transition={{ duration: 0.6, delay: i * 0.05 }}
                    className={`text-white text-right pr-2 ${
                      isToday ? "bg-green-600" : "bg-gray-500"
                    }`}
                  >
                    {count > 0 && count}
                  </motion.div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-sm text-gray-500">
          Next puzzle in {countdown}
        </p>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 gap-4">
      <h1 className="text-2xl font-bold">Rymdle</h1>
      <p className="text-sm text-gray-500">Round {round + 1}/5</p>

      <div className="w-full max-w-md flex flex-col gap-4">
        {[a, b].map((album, i) => {
          const state = revealed ? (i === correct ? "correct" : "wrong") : "idle";

          return (
            <motion.button
              key={i}
              onClick={() => pick(i)}
              disabled={locked || revealed}
              className="relative h-24"
              style={{ perspective: 1000 }}
            >
              <motion.div
                animate={{ rotateX: revealed ? 180 : 0 }}
                transition={{ duration: 0.45 }}
                className="relative w-full h-full"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div
                  className="absolute inset-0 flex items-center gap-4 p-4 rounded-xl bg-gray-900 text-white"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <img src={album.cover} className="w-16 h-16 rounded object-cover" />
                  <div>
                    <h2 className="text-sm font-semibold">{album.title}</h2>
                    <p className="text-xs opacity-70">{album.artist}</p>
                  </div>
                </div>

                <div
                  className={`absolute inset-0 flex flex-col items-center justify-center rounded-xl text-white ${
                    state === "correct" ? "bg-green-600" : "bg-red-600"
                  }`}
                  style={{ transform: "rotateX(180deg)", backfaceVisibility: "hidden" }}
                >
                  <p className="text-sm font-semibold">{album.title}</p>
                  <p className="text-xs opacity-80">{album.artist}</p>
                  <p className="text-sm mt-1">{album.rating}</p>
                </div>
              </motion.div>
            </motion.button>
          );
        })}
      </div>

      {revealed && (
        <button onClick={next} className="w-full max-w-xs py-3 bg-black text-white rounded-xl">
          {round === 4 ? "Finish" : "Next"}
        </button>
      )}
    </main>
  );
}