import { readFileSync } from "fs";
import { Timer } from "../utils/timer";
import fetch from "cross-fetch";
import { config } from "dotenv";
config();

const jsonContent = readFileSync("src/assets/nft-rewards-tiers.json", "utf8");

(async function () {
  const time = new Timer();
  const jsonArray: any[] = JSON.parse(jsonContent);

  console.log(jsonArray);

  const response = await fetch(
    "https://us-central1-ipfs-scratch-space.cloudfunctions.net/pinning",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        json: jsonArray,
        format: "json",
      }),
    }
  );

  if (response.status >= 200 && response.status < 400) {
    const { cid, ...rest } = await response.json();
    console.log(rest);
    console.log(`https://cloudflare-ipfs.com/ipfs/${cid}/`);
  } else {
    console.log(response.statusText);
    console.log(await response.json());
  }

  console.log(`cloud function execution time took: ${time.time()} ms`);
})();
