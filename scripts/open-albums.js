const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const INPUT_FILE = path.join(__dirname, "daily_albums.input.json");

const CHROME_COMMAND =
  process.platform === "win32"
    ? 'start chrome'
    : process.platform === "darwin"
    ? 'open -a "Google Chrome"'
    : 'google-chrome';

const albums = JSON.parse(fs.readFileSync(INPUT_FILE, "utf-8"));

function buildMBUrl(title, artist) {
  const query = encodeURIComponent(`${title} ${artist}`);
  return `https://musicbrainz.org/search?query=${query}&type=release`;
}

function openUrl(url) {
  exec(`${CHROME_COMMAND} "${url}"`);
}

async function run() {
  console.log("Opening album search tabs...\n");

  albums.forEach((album, i) => {
    const url = buildMBUrl(album.title, album.artist);

    console.log(`${i + 1}. ${album.title} — ${album.artist}`);
    openUrl(url);
  });

  console.log("\nDone. Tabs opened in Chrome.");
}

run();