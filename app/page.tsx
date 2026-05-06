"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const DAILY_ID = "2026-05-07";

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
  { title: "Music for the Masses", artist: "Depeche Mode", rating: 3.85, cover: "https://coverartarchive.org/release/4577ed01-57ad-3826-800b-e0c4d4998611/front-250" },
  { title: "Lemonade", artist: "Beyoncé", rating: 3.61, cover: "https://coverartarchive.org/release/f457c3e1-0d98-4904-9d9e-a085bc5b232b/front-250" },
  { title: "Candy-O", artist: "The Cars", rating: 3.52, cover: "https://coverartarchive.org/release/3dad49c9-b067-44b1-b0d5-b28842094e62/front-250" },
  { title: "Sweet Dreams (Are Made of This)", artist: "Eurythmics", rating: 3.35, cover: "https://coverartarchive.org/release/4527d46a-4f8f-422b-8432-fd79418840af/front-250" },
  { title: "Version 2.0", artist: "Garbage", rating: 3.59, cover: "https://coverartarchive.org/release/aac347ae-1d35-47c2-8d03-42420443a718/front-250" },
  { title: "Off the Wall", artist: "Michael Jackson", rating: 3.95, cover: "https://coverartarchive.org/release/6258e39d-bef4-4d5a-a654-440cf4c4c29a/front-250" },
  { title: "The Fame", artist: "Lady Gaga", rating: 3.30, cover: "https://coverartarchive.org/release/9532def5-5d68-4e31-808a-744c7f5c733f/front-250" },
  { title: "Kala", artist: "M.I.A.", rating: 3.67, cover: "https://coverartarchive.org/release/60c1e000-91a8-4749-bd21-bebcbcbea847/front-250" },
  { title: "Sound of Silver", artist: "LCD Soundsystem", rating: 3.96, cover: "https://coverartarchive.org/release/59ce7d03-4fa5-4676-b042-25d0e61f4e8d/front-250" },
  { title: "Remain in Light", artist: "Talking Heads", rating: 4.26, cover: "https://coverartarchive.org/release/f57dbbd3-93b8-487a-a596-761bf838a498/front-250" }
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
  const [picks, setPicks] = useState<number[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [hydrated, setHydrated] = useState(false);

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
    setHydrated(true);
  }, []);

  useEffect(() => {
    DAILY_ALBUMS.forEach((album) => {
      const img = new Image();
      img.src = album.cover;
    });
  }, []);
  
  useEffect(() => {
    if (!revealed) return;

    const nextPair = pairs[round + 1];
    if (!nextPair) return;

    nextPair.forEach((album) => {
      const img = new Image();
      img.src = album.cover;
    });
  }, [revealed, round, pairs]);

  useEffect(() => {
    const saved = localStorage.getItem(saveKey);
    if (saved) {
      const data = JSON.parse(saved);
      const savedResults = data.results || [];
      const savedPicks = data.picks || [];

      setScore(data.score || 0);
      setResults(savedResults);
      setPicks(savedPicks);
      setFinished(data.finished || false);
      setRound(savedResults.length);
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
    localStorage.setItem(saveKey, JSON.stringify({ score, results, finished, picks }));
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
    setPicks((prev) => [...prev, idx]);
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

      return;
    }

    setRevealed(false);
    setLocked(false);

    requestAnimationFrame(() => {
      setRound((r) => r + 1);
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

    if (!hydrated) return null;

    return (
      <main className="relative flex flex-col items-center justify-center min-h-screen p-6 gap-6 bg-gray-950 text-gray-200">

        <button
          onClick={() => setShowHelp(true)}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-900 hover:bg-gray-800 transition duration-300 ease-in-out text-white flex items-center justify-center cursor-pointer"
        >
          ?
        </button>

        <div className="text-center">
          <h1 className="text-2xl font-bold p-1 md:p-2 lg:p-4">
            RYMdle
          </h1>
          <p className="text-xs text-gray-500 p-1">
            A daily RYM rating based guessing game - pick the highest rated album!
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

                <div className="flex-1 bg-gray-950 rounded overflow-hidden">
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

        <button
          onClick={() => setShowSummary(true)}
          className="w-full max-w-xs whitespace-nowrap flex items-center justify-center py-2 px-30 bg-gray-800 hover:bg-gray-700 transition duration-300 ease-in-out text-white rounded-xl cursor-pointer"
        >
          View Summary
        </button>

        <div className="text-center p-4">

          <button onClick={share} className="w-full max-w-xs whitespace-nowrap flex items-center justify-center py-5 px-30 bg-gray-800 hover:bg-gray-700 transition duration-300 ease-in-out text-white rounded-xl cursor-pointer">
            {copied ? "Copied!" : "Copy Results"}
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
          <div className="bg-gray-900 text-white max-w-md w-full p-6 rounded-2xl shadow-2xl border border-white/10">

            <h2 className="text-xl font-semibold text-center mb-4">
              How to Play
            </h2>

            <div className="space-y-3 text-sm text-gray-200 leading-relaxed">
              <p>
                - Pick the album you think has the <span className="text-white font-medium">higher RateYourMusic rating</span>.
              </p>

              <p>
                - There are <span className="text-white font-medium">5 rounds</span>. Try to get the highest score possible.
              </p>

              <p>
                - Score <span className="text-white font-medium">at least 3 points</span> to win!
              </p>
            </div>

            <button
              onClick={() => setShowHelp(false)}
              className="mt-6 w-full py-2.5 bg-green-700 hover:bg-green-800 transition-colors rounded-xl text-sm font-medium border border-white/10 cursor-pointer"
            >
              Got it
            </button>

          </div>
        </div>
      )}

      {showSummary && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
          onClick={() => setShowSummary(false)}
        >
          
          <div
            className="bg-gray-900 text-white max-w-md w-full p-6 rounded-2xl shadow-2xl border border-white/10 overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >

            <h2 className="text-xl font-semibold text-center mb-4">
              Today's Summary
            </h2>

            <div className="space-y-4 text-sm">
              {pairs.map((pair, i) => {
                const [a, b] = pair;
                const pickedIndex = picks[i];
                const correctIndex = a.rating > b.rating ? 0 : 1;

                return (
                  <div key={i} className="border border-white/10 rounded-lg p-3">
                    <p className="mb-2 font-medium">Round {i + 1}</p>

                    {[a, b].map((album, idx) => {
                      const isPicked = pickedIndex === idx;
                      const isCorrect = correctIndex === idx;

                      return (
                        <div
                          key={idx}
                          className={`p-2 rounded mb-1 flex items-center justify-between gap-2 ${
                            isCorrect
                              ? "bg-green-900"
                              : isPicked
                              ? "bg-red-900"
                              : "bg-gray-800"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={album.cover}
                              loading="eager"
                              className="w-10 h-10 rounded object-cover"
                            />
                            <div>
                              <p className="text-xs font-semibold">
                                {album.title}
                                {isPicked && " (Your Pick)"}
                              </p>
                              <p className="text-[10px] opacity-70">{album.artist}</p>
                            </div>
                          </div>
                          <span className="text-xs">{album.rating.toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowSummary(false)}
              className="mt-6 w-full py-2.5 bg-gray-700 hover:bg-gray-600 rounded-xl text-sm cursor-pointer"
            >
              Close
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
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-900 hover:bg-gray-800 transition duration-300 ease-in-out text-white flex items-center justify-center cursor-pointer"
      >
        ?
      </button>
      <div className="text-center mb-20">
        <div className="text-center mb-3">
          <h1 className="text-2xl font-bold p-1 md:p-2 lg:p-4">
            RYMdle
          </h1>
          <p className="text-xs text-gray-500 mb-20">
            A daily RYM rating based guessing game - pick the highest rated album!
          </p>
          <p className="text-sm text-gray-400 md:p-1 lg:p-2">
            Round {round + 1}/5
          </p>
        </div>

        <div key={round} className="w-full max-w-md flex flex-col gap-4 mb-15">
          {currentPair?.map((album, i) => {
            const isCorrect = i === correct;
            const isSelected = picks[round] === i;

            const backColor =
              isCorrect
                ? "bg-green-800"
                : isSelected
                ? "bg-red-800"
                : "bg-gray-900";

            return (
              <motion.button
                key={i}
                onClick={() => pick(i)}
                disabled={locked || revealed}
                className="relative h-24"
              >
                <motion.div className="relative w-full h-full">

                  {/* FRONT */}
                  <motion.div className={`absolute inset-0 flex items-center gap-4 p-4 rounded-xl bg-gray-900 hover:bg-gray-800 text-white cursor-pointer`}>
                    <img
                      src={album.cover}
                      loading="eager"
                      className="w-16 h-16 rounded object-cover"
                    />
                    <div>
                      <h2 className="text-left text-sm font-semibold">{album.title}</h2>
                      <p className="text-left text-xs opacity-70">{album.artist}</p>
                    </div>
                  </motion.div>

                  {/* BACK */}
                  <motion.div
                    className={`absolute inset-0 flex items-center gap-4 p-4 rounded-xl text-white ${backColor}`}
                    initial={{ opacity: 0 }}
                    animate={revealed ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <img
                      src={album.cover}
                      loading="eager"
                      className="w-16 h-16 rounded object-cover"
                    />

                    <div>
                      <h2 className="text-left text-sm font-semibold">{album.title}</h2>
                      <p className="text-left text-xs opacity-70">{album.artist}</p>
                    </div>

                    <div className="ml-auto text-right">
                      <p className="mr-2 text-3xl font-mono">
                        {album.rating.toFixed(2)}
                      </p>
                    </div>
                  </motion.div>

                </motion.div>
              </motion.button>
            );
          })}
        </div>
      

        <div className="w-full max-w-xs h-14 mt-4 mx-auto">
          <motion.button
            onClick={next}
            initial={false}
            animate={{
              opacity: revealed ? 1 : 0,
              y: revealed ? 0 : 10
            }}
            transition={{ duration: 0.25 }}
            className="w-full py-3 bg-gray-800 rounded-xl"
            style={{ pointerEvents: revealed ? "auto" : "none" }}
          >
            {(round === 4 && revealed) ? "Finish" : "Next"}
          </motion.button>
        </div>

      </div>

      {showHelp && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 text-white max-w-md w-full p-6 rounded-2xl shadow-2xl border border-white/10">

            <h2 className="text-xl font-semibold text-center mb-4">
              How to Play
            </h2>

            <div className="space-y-3 text-sm text-gray-200 leading-relaxed">
              <p>
                - Pick the album you think has the <span className="text-white font-medium">higher RateYourMusic rating</span>.
              </p>

              <p>
                - There are <span className="text-white font-medium">5 rounds</span>. Try to get the highest score possible.
              </p>

              <p>
                - Score <span className="text-white font-medium">at least 3 points</span> to win!
              </p>
            </div>

            <button
              onClick={() => setShowHelp(false)}
              className="mt-6 w-full py-2.5 bg-green-700 hover:bg-green-800 transition-colors rounded-xl text-sm font-medium border border-white/10 cursor-pointer"
            >
              Got it
            </button>

          </div>
        </div>
      )}

      {showSummary && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
          onClick={() => setShowSummary(false)}
        >
          
          <div
            className="bg-gray-900 text-white max-w-md w-full p-6 rounded-2xl shadow-2xl border border-white/10 overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >

            <h2 className="text-xl font-semibold text-center mb-4">
              Today's Summary
            </h2>

            <div className="space-y-4 text-sm">
              {pairs.map((pair, i) => {
                const [a, b] = pair;
                const pickedIndex = picks[i];
                const correctIndex = a.rating > b.rating ? 0 : 1;

                return (
                  <div key={i} className="border border-white/10 rounded-lg p-3">
                    <p className="mb-2 font-medium">Round {i + 1}</p>

                    {[a, b].map((album, idx) => {
                      const isPicked = pickedIndex === idx;
                      const isCorrect = correctIndex === idx;

                      return (
                        <div
                          key={idx}
                          className={`p-2 rounded mb-1 flex items-center justify-between gap-2 ${
                            isCorrect
                              ? "bg-green-900"
                              : isPicked
                              ? "bg-red-900"
                              : "bg-gray-800"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={album.cover}
                              loading="eager"
                              className="w-10 h-10 rounded object-cover"
                            />
                            <div>
                              <p className="text-xs font-semibold">
                                {album.title}
                                {isPicked && " (Your Pick)"}
                              </p>
                              <p className="text-[10px] opacity-70">{album.artist}</p>
                            </div>
                          </div>
                          <span className="text-xs">{album.rating.toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowSummary(false)}
              className="mt-6 w-full py-2.5 bg-gray-700 hover:bg-gray-600 rounded-xl text-sm cursor-pointer"
            >
              Close
            </button>

          </div>
        </div>
      )}

    </main>
  );
}