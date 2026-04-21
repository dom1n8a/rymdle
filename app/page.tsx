"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const DAILY_ID = "2026-04-22";

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
  { title: "Monarch of Monsters", artist: "Vylet Pony", rating: 3.72, cover: "https://e.snmc.io/i/600/w/1cd47f9faeda859529439eab4f2636f5/14456726/vylet-pony-monarch-of-monsters-Cover-Art.jpg" },
  { title: "U", artist: "underscores", rating: 3.74, cover: "https://e.snmc.io/i/600/w/5aec7be1173d2ac0ff4a83faf83ef7a6/14332342/underscores-u-Cover-Art.jpg" },
  { title: "Vol.II", artist: "Angine de Poitrine", rating: 3.62, cover: "https://e.snmc.io/i/600/w/5f2c4cde64f4ee10759cd0d4ed144fab/14461846/angine-de-poitrine-vol_ii-Cover-Art.jpg" },
  { title: "Something Beautiful", artist: "Miley Cyrus", rating: 3.56, cover: "https://e.snmc.io/i/600/w/690e767617460647b086507515e1500c/13197873/miley-cyrus-something-beautiful-Cover-Art.jpg" },
  { title: "Magic, Alive!", artist: "McKinley Dixon", rating: 3.88, cover: "https://e.snmc.io/i/600/w/4dcc1c721c516b3539da7aedf2fde873/13056599/mckinley-dixon-magic-alive-Cover-Art.jpg" },
  { title: "Getting Killed", artist: "Geese", rating: 3.85, cover: "https://e.snmc.io/i/600/w/d265b3bcc976fa479c9559ef9cbaf0f9/13592904/geese-getting-killed-Cover-Art.jpg" },
  { title: "Beloved! Paradise! Jazz!?", artist: "McKinley Dixon", rating: 3.79, cover: "https://e.snmc.io/i/600/w/cf26c55cd69879fd87f9668d72230227/10775791/mckinley-dixon-beloved-paradise-jazz-Cover-Art.jpg" },
  { title: "3D Country", artist: "Geese", rating: 3.84, cover: "https://e.snmc.io/i/600/w/12007cb306a215c41385600b272e0f61/10816435/geese-3d-country-Cover-Art.jpg" },
  { title: "Dragon New Warm Mountain I Believe in You", artist: "Big Thief", rating: 3.99, cover: "https://e.snmc.io/i/600/w/4cb4a4c9acc69f56e9852789b18f2cd4/9503983/big-thief-dragon-new-warm-mountain-i-believe-in-you-Cover-Art.jpg" },
  { title: "Scaring the Hoes", artist: "JPEGMAFIA & Danny Brown", rating: 3.91, cover: "https://e.snmc.io/i/600/w/cb3d1484e75dd18366f2580344c3000f/10795080/jpegmafia-and-danny-brown-scaring-the-hoes-Cover-Art.jpg" }
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
  const [showHelp, setShowHelp] = useState(false);
  const helpKey = "rym_help_seen";
  const [skipAnim, setSkipAnim] = useState(false);

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
      const savedResults = data.results || [];

      setScore(data.score || 0);
      setResults(savedResults);
      setFinished(data.finished || false);
      setRound(savedResults.length); // 🔥 CRITICAL FIX
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

    const seenHelp = localStorage.getItem(helpKey);
    if (!seenHelp) {
      setShowHelp(true);
      localStorage.setItem(helpKey, "true");
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

    const currentPair = pairs[round];

    let a: Album | undefined;
    let b: Album | undefined;
    let correct = 0;

    if (currentPair) {
      [a, b] = currentPair;
      correct = a.rating > b.rating ? 0 : 1;
    }
    const isCorrect = idx === correct;

    setResults((prev) => [...prev, isCorrect]);
    if (isCorrect) setScore((s) => s + 1);

    setTimeout(() => {
      setRevealed(true);
      setLocked(false);
    }, 200);
  };

  const next = () => {
    setSkipAnim(true);
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

    requestAnimationFrame(() => {
      setSkipAnim(false);
    });

  };

  const buildEmojiGrid = () => results.map((r) => (r ? "🟩" : "🟥")).join("");

  const share = async () => {
    await navigator.clipboard.writeText(
      `RYMdle ${DAILY_ID} ${score}/5\n${buildEmojiGrid()}\nhttps://rymdle.vercel.app`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const currentPair = pairs[round];

  let a: Album | undefined;
  let b: Album | undefined;
  let correct = 0;

  if (currentPair) {
    [a, b] = currentPair;
    correct = a.rating > b.rating ? 0 : 1;
  }

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
      <main className="relative flex flex-col items-center justify-center min-h-screen p-6 gap-6 bg-gray-950 text-gray-200">

        <button
          onClick={() => setShowHelp(true)}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-900 hover:bg-gray-800 transition duration-300 ease-in-out text-white flex items-center justify-center"
        >
          ?
        </button>

        <div className="text-center">
          <h1 className="text-2xl font-bold p-1 md:p-2 lg:p-4">
            RYMdle
          </h1>
          <p className="text-xs text-gray-500 p-1">
            A daily RYM rating based guessing game.
          </p>
        </div>

        

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
        
        <div className="text-center p-4">

          <button onClick={share} className="w-full max-w-xs py-4 px-30 bg-gray-800 hover:bg-gray-700 transition duration-300 ease-in-out text-white rounded-xl">
            {copied ? "Copied!" : "Share"}
          </button>

          <p className="text-xs p-1 md:p-2 lg:p-2 text-gray-500">
            Score at least 3 to win!
          </p>

        </div>
        

        <p className="text-sm text-gray-500">
          Next puzzle in {countdown}
        </p>

      {showHelp && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="text-center bg-gray-900 text-white max-w-md w-full p-6 rounded-xl">
            <h2 className="text-lg font-bold mb-2">How to Play</h2>

            <p className="text-sm mb-2">
              You will be shown two albums each round.
            </p>

            <p className="text-sm mb-2">
              Choose the album you think has the higher RateYourMusic rating.
            </p>

            <p className="text-sm mb-4">
              Get as many correct as possible out of 5 rounds.
            </p>

            <button
              onClick={() => setShowHelp(false)}
              className="w-full py-2 bg-black text-white rounded-lg"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      </main>
    );
  }

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen p-4 gap-4 bg-gray-950 text-gray-200">

      <button
        onClick={() => setShowHelp(true)}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-900 hover:bg-gray-800 transition duration-300 ease-in-out text-white flex items-center justify-center"
      >
        ?
      </button>

      <div className="text-center">
        <h1 className="text-2xl font-bold p-1 md:p-2 lg:p-4">
          RYMdle
        </h1>
        <p className="text-xs text-gray-500 pb-17">
          A daily RYM rating based guessing game.
        </p>
        <p className="text-sm text-gray-400 md:p-1 lg:p-2">
          Round {round + 1}/5
        </p>
      </div>

      <div className="w-full max-w-md flex flex-col gap-4">
        {currentPair?.map((album, i) => {
          const state = revealed
            ? (i === correct ? "correct" : "wrong")
            : "idle";

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
                transition={
                  skipAnim
                    ? { duration: 0 } // instant reset
                    : { duration: 0.45 }
                }
                className="relative w-full h-full"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div
                  className="absolute inset-0 flex items-center gap-4 p-4 rounded-xl bg-gray-900 hover:bg-gray-800 transition duration-300 ease-in-out text-white"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <img src={album.cover} className="w-16 h-16 rounded object-cover" />
                  <div>
                    <h2 className="text-left text-sm font-semibold">{album.title}</h2>
                    <p className="text-left text-xs opacity-70">{album.artist}</p>
                  </div>
                </div>

                <div
                  className={`absolute inset-0 flex flex-col items-center justify-center rounded-xl text-white ${
                    state === "correct" ? "bg-green-800" : "bg-red-800"
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

      <div className="text-center pt-35">
      </div>

      {revealed && (
        <button onClick={next} className="w-full max-w-xs py-3 bg-gray-800 hover:bg-gray-700 transition duration-300 ease-in-out text-white rounded-xl">
          {round === 4 ? "Finish" : "Next"}
        </button>
      )}

      {showHelp && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 text-white max-w-md w-full p-6 rounded-2xl shadow-2xl border border-white/10">

            <h2 className="text-xl font-semibold text-center mb-4">
              How to Play
            </h2>

            <div className="space-y-3 text-sm text-gray-200 leading-relaxed">
              <p>
                You will be shown <span className="text-white font-medium">two albums</span> each round.
              </p>

              <p>
                Pick the one you think has the <span className="text-white font-medium">higher RateYourMusic rating</span>.
              </p>

              <p>
                There are <span className="text-white font-medium">5 rounds</span>. Try to get the highest score possible.
              </p>
            </div>

            <button
              onClick={() => setShowHelp(false)}
              className="mt-6 w-full py-2.5 bg-green-700 hover:bg-green-800 transition-colors rounded-xl text-sm font-medium border border-white/10"
            >
              Got it
            </button>

          </div>
        </div>
      )}

    </main>
  );
}