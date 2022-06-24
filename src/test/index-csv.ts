import { readFileSync } from "fs";
import { Timer } from "../utils/timer";
import fetch from "cross-fetch";

const csvContent = readFileSync("src/assets/nft-rewards-tiers.csv", "utf8");

(async function () {
  const time = new Timer();
  const response = await fetch(
    "https://us-central1-ipfs-scratch-space.cloudfunctions.net/pinning",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        csvContent,
      }),
    }
  );

  const { cid } = await response.json();

  console.log(`cloud function execution time took: ${time.time()} ms`);
  console.log(`https://cloudflare-ipfs.com/ipfs/${cid}/`);
})();

(async function () {
  console.log(csvContent);
})();
