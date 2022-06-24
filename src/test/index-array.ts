import { readFileSync } from "fs";
import { Timer } from "../utils/timer";
import fetch from "cross-fetch";

const jsonContent = readFileSync("src/assets/nft-rewards-tiers.json", "utf8");

function arrayToCSV(entries) {
  const items = entries;
  const replacer = (key, value) => (value === null ? "" : value);
  const header = Object.keys(items[0]);
  const csv = [
    header.join(","),
    ...items.map((row) =>
      header
        .map((fieldName) => JSON.stringify(row[fieldName], replacer))
        .join(",")
    ),
  ].join("\r\n");
  return csv;
}

(async function () {
  const time = new Timer();
  const csv = arrayToCSV(JSON.parse(jsonContent));
  console.log(`${csv}`);

  const response = await fetch(
    "https://us-central1-ipfs-scratch-space.cloudfunctions.net/pinning",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv }),
    }
  );

  const { cid } = await response.json();
  console.log(`https://cloudflare-ipfs.com/ipfs/${cid}/`);
  console.log(`cloud function execution time took: ${time.time()} ms`);
})();
