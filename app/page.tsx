// Rymdle - Production Ready (FIXED Card Layout + Flip)

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

const DAILY_ALBUMS = [
  { title: "OK Computer", artist: "Radiohead", rating: 4.30, cover: "https://e.snmc.io/i/600/w/91f41d53d83f36ac3bb0cee7d6dffca3/11993756/radiohead-ok-computer-Cover-Art.jpg" },
  { title: "To Pimp a Butterfly", artist: "Kendrick Lamar", rating: 4.38, cover: "https://e.snmc.io/i/600/w/a47f7eef08776272f5525d5a1f7c9c6a/8121875/kendrick-lamar-to-pimp-a-butterfly-Cover-Art.jpg" },
  { title: "Abbey Road", artist: "The Beatles", rating: 4.30, cover: "https://e.snmc.io/i/600/w/b7d49832f4958688cd82b6dbb9f4dd31/12188855/the-beatles-abbey-road-Cover-Art.jpg" },
  { title: "The Dark Side of the Moon", artist: "Pink Floyd", rating: 4.27, cover: "https://e.snmc.io/i/600/w/b87ea178beaaaf0e0e4a39aaf9d1b834/12206378/pink-floyd-the-dark-side-of-the-moon-Cover-Art.jpg" },
  { title: "Blonde", artist: "Frank Ocean", rating: 4.09, cover: "https://e.snmc.io/i/600/w/3bc698315ea2ed723fe714b7dd1f84af/8060362/frank-ocean-blonde-Cover-Art.jpg" },
  { title: "Madvillainy", artist: "Madvillain", rating: 4.33, cover: "https://e.snmc.io/i/600/w/9c52ece824b06220dd56f69119aa5739/13200445/madvillain-madvillainy-Cover-Art.jpg" },
  { title: "In Rainbows", artist: "Radiohead", rating: 4.33, cover: "https://e.snmc.io/i/600/w/fadce3351784e528a8257b7c78f0b55a/14126517/radiohead-in-rainbows-Cover-Art.jpg" },
  { title: "Loveless", artist: "My Bloody Valentine", rating: 4.25, cover: "https://e.snmc.io/i/600/w/47da1d4284997ca321af967068f34d7b/11569981/my-bloody-valentine-loveless-Cover-Art.jpg" },
  { title: "Discovery", artist: "Daft Punk", rating: 4.14, cover: "https://e.snmc.io/i/600/w/f257109d44300506428e21138338e884/13215963/daft-punk-discovery-Cover-Art.jpg" },
  { title: "Kid A", artist: "Radiohead", rating: 4.25, cover: "https://e.snmc.io/i/600/w/076215c80b1810341e978bbdbf47af69/12580450/radiohead-kid-a-Cover-Art.jpg" },
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

  const playKey = `rym_${DAILY_ID}`;
  const saveKey = `rym_save_${DAILY_ID}`;

  useEffect(() => {
    const saved = localStorage.getItem(saveKey);
    if (saved) {
      const data = JSON.parse(saved);
      setScore(data.score);
      setResults(data.results);
      setFinished(data.finished);
    }

    const i = setInterval(() => setCountdown(getCountdown()), 1000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    localStorage.setItem(saveKey, JSON.stringify({ score, results, finished }));
  }, [score, results, finished]);

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
      localStorage.setItem(playKey, "1");
      setFinished(true);
    } else {
      setRound((r) => r + 1);
      setRevealed(false);
    }
  };

  const buildEmojiGrid = () => results.map((r) => (r ? "🟩" : "🟥")).join("");

  const share = () => {
    navigator.clipboard.writeText(`Rymdle ${DAILY_ID} ${score}/5\n${buildEmojiGrid()}`);
  };

  if (finished) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen p-6 text-center gap-4">
        <h1 className="text-2xl font-bold">Rymdle</h1>
        <p className="text-xl">{score}/5</p>
        <button onClick={share} className="w-full max-w-xs py-3 bg-black text-white rounded-xl">Share</button>
        <pre className="text-sm">{buildEmojiGrid()}</pre>
        <p className="text-sm text-gray-500">Next puzzle in {countdown}</p>
      </main>
    );
  }

  const [a, b] = pairs[round];
  const correct = a.rating > b.rating ? 0 : 1;

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
                transition={{ duration: 0.4, delay: i * 0.15 }}
                className="relative w-full h-full"
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* FRONT */}
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

                {/* BACK */}
                <div
                  className={`absolute inset-0 flex items-center justify-center rounded-xl text-white ${
                    state === "correct" ? "bg-green-600" : "bg-red-600"
                  }`}
                  style={{ transform: "rotateX(180deg)", backfaceVisibility: "hidden" }}
                >
                  <p className="text-sm">{album.rating}</p>
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
