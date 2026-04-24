const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const INPUT_FILE = path.join(__dirname, "release_urls.json");

// Chrome launcher
const CHROME_COMMAND =
  process.platform === "win32"
    ? 'start chrome'
    : process.platform === "darwin"
    ? 'open -a "Google Chrome"'
    : 'google-chrome';

function openUrl(url) {
  exec(`${CHROME_COMMAND} "${url}"`);
}

// extract MBID from URL
function getMBID(url) {
  const match = url.match(/release\/([a-f0-9-]+)/);
  return match ? match[1] : null;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function run() {
  const urls = JSON.parse(fs.readFileSync(INPUT_FILE, "utf-8"));

  console.log("Opening Cover Art Archive pages...\n");

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const mbid = getMBID(url);

    if (!mbid) {
      console.log(`❌ Invalid URL: ${url}`);
      continue;
    }

    const caaUrl = `https://coverartarchive.org/release/${mbid}/front-250`;

    console.log(`${i + 1}. ${caaUrl}`);

    openUrl(caaUrl);

    await sleep(800);
  }

  console.log("\nDone!");
}

run();