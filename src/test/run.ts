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
    const replicatedByTier: any[] = [];
    const compressedFiles: File[] = [];
    let tokenCount = 0;
    for (let i = 0; i < sortedByTier.length; i++) {
        for (let j = 0; j < sortedByTier[i].supply; j++) {
            tokenCount === 0 ? (tokenCount = 1) : tokenCount++;
            false &&
                process.stdout.write(
                    `${sortedByTier[i].tiers} | ${sortedByTier[i].name} | ${sortedByTier[i].supply} | ${tokenCount}` +
                        `\n`
                );
            const entry = sortedByTier[i];
            const jsonString = JSON.stringify(entry, null, "  ");
            replicatedByTier.push(jsonString);

            const compressedContent = deflateSync(
                Buffer.from(replicatedByTier),
                {
                    level: 9,
                }
            );
            const file = new File(
                [compressedContent],
                `compressed/${tokenCount}`
            );
            compressedFiles.push(file);
        }
    }

    false && console.log(replicatedByTier.length, replicatedByTier);

    const cid = await uploadJsonEntries(replicatedByTier, {
        additionalFiles: compressedFiles,
    });

    console.log(
        `https://cloudflare-ipfs.com/ipfs/${cid}/${replicatedByTier.length - 1}`
    );
}

main();
