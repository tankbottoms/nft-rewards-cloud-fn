import fs from "fs";
import path from "path";
import { config } from "dotenv";
import { parseCsv } from "../utils/csv";
import { uploadJsonEntries } from "../utils/ipfs";
import { File } from "nft.storage";
import { deflateSync } from "zlib";

config();

const csvPath = path.join(__dirname, "../assets/nft-rewards-tiers.csv");
const content = fs.readFileSync(csvPath, "utf8");

async function main() {
  const sortedByTier = parseCsv(content).sort(
    (a, b) => Number(a.tiers) - Number(b.tiers)
  );
  const compressedFiles: File[] = [];
  for (let i = 0; i < sortedByTier.length; i++) {
    const entry = sortedByTier[i];
    const jsonString = JSON.stringify(entry, null, "  ");
    const compressedContent = deflateSync(Buffer.from(jsonString), {
      level: 9,
    });
    const file = new File([compressedContent], `compressed/${i + 1}`);
    compressedFiles.push(file);
  }
  const cid = await uploadJsonEntries(sortedByTier, {
    additionalFiles: compressedFiles,
  });
  console.log(`https://cloudflare-ipfs.com/ipfs/${cid}/1`);
}

main();
