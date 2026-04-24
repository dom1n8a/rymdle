const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const readline = require("readline");

const INPUT_FILE = path.join(__dirname, "daily_albums.input.json");
const OUTPUT_FILE = path.join(__dirname, "release_urls.generated.json");
const FINAL_FILE = path.join(__dirname, "albums_with_covers.generated.txt");

const CHROME_COMMAND =
  process.platform === "win32"
    ? "start chrome"
    : process.platform === "darwin"
    ? 'open -a "Google Chrome"'
    : "google-chrome";

const EDITOR_COMMAND =
  process.platform === "win32"
    ? "notepad"
    : process.platform === "darwin"
    ? "open -a TextEdit"
    : "gedit";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function openUrl(url) {
  exec(`${CHROME_COMMAND} "${url}"`);
}

function openFile(filePath) {
  exec(`${EDITOR_COMMAND} "${filePath}"`);
}

function buildSearchUrl(title, artist) {
  const query = encodeURIComponent(`${title} ${artist}`);
  return `https://musicbrainz.org/search?query=${query}&type=release`;
}

function extractMBID(url) {
  const match = url.match(/release\/([a-f0-9-]+)/);
  return match ? match[1] : null;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

function formatAsJSArray(albums) {
  return `[\n${albums
    .map(
      (a) =>
        `  { title: "${a.title}", artist: "${a.artist}", rating: ${a.rating}, cover: "${a.cover}" }`
    )
    .join(",\n")}\n]`;
}

async function run() {
  const albums = JSON.parse(fs.readFileSync(INPUT_FILE, "utf-8"));

  console.log("\n🎵 STEP 1: Opening MusicBrainz searches...\n");

  for (let i = 0; i < albums.length; i++) {
    const { title, artist } = albums[i];
    const url = buildSearchUrl(title, artist);

    console.log(`${i + 1}. ${title} — ${artist}`);
    openUrl(url);

    await sleep(800);
  }

  console.log("\n✅ All tabs opened.");
  console.log("👉 Paste each MusicBrainz release URL:\n");

  const collectedUrls = [];

  for (let i = 0; i < albums.length; i++) {
    const { title, artist } = albums[i];

    let url = await ask(`Paste URL for "${title} — ${artist}": `);

    while (!extractMBID(url)) {
      console.log("❌ Invalid URL. Must contain /release/{mbid}");
      url = await ask("Try again: ");
    }

    collectedUrls.push(url.trim());
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(collectedUrls, null, 2));
  console.log("\n💾 Saved release URLs →", OUTPUT_FILE);

  const finalAlbums = albums.map((album, i) => {
    const mbid = extractMBID(collectedUrls[i]);
    const cover = `https://coverartarchive.org/release/${mbid}/front-250`;

    return {
      title: album.title,
      artist: album.artist,
      rating: album.rating,
      cover,
    };
  });

  const formatted = formatAsJSArray(finalAlbums);

  fs.writeFileSync(FINAL_FILE, formatted, "utf-8");

  console.log("\n📝 Generated formatted file →", FINAL_FILE);

  openFile(FINAL_FILE);

  console.log("\n🚀 Opened in editor. Done!");

  rl.close();
}

run();