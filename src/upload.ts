import fs from "fs";
import path from "path";
import { config } from "dotenv";
// import { parseCsv } from "./utils/csv";
import fetch from "cross-fetch";
import { parseCsv } from "./utils/csv";

config();

const csvPath = path.join(__dirname, "./assets/nft-rewards-tiers.csv");
const content = fs.readFileSync(csvPath, "utf8");

async function main() {
  const response = await fetch(
    process.env.PINNING_FUNCTION_URL ||
      "http://localhost:5005/ipfs-scratch-space/us-central1/pinning",
    {
      method: "POST",
      body: JSON.stringify(
        true
          ? {
              csvContent: content,
            }
          : {
              entries: parseCsv(content),
            }
      ),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  const result = await response.json();

  console.log(result);
  result.cid && console.log(`https://cloudflare-ipfs.com/ipfs/${result.cid}/1`);
}

main();
