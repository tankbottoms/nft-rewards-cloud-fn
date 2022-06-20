import fetch from "cross-fetch";
import args from "args";
import { readFileSync } from "fs";

const is_emulated = true;
const pinningUri = is_emulated
    ? "http://localhost:5005/ipfs-scratch-space/us-central1/pining"
    : "https://us-central1-ipfs-scratch-space.cloudfunctions.net/pining";

const pinningFn = async (_, sub) => {
    console.log(`pinningFn, ${pinningUri}`);

    const base64Image = readFileSync("src/assets/nft-rewards.png").toString(
        "base64"
    );
    console.log(`base64Image: ${base64Image.length}`);

    const res = await fetch(pinningUri, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            image: base64Image,
            name: "This is a name of an NFT",
            externalLink: "https://juicebox.money",
            description: "This is a description of an NFT.",
            totalSupply: "7000",
        }),
    });

    const json = await res.json();
    console.log(json);
};

args.command("pinning", "pinning", pinningFn);
args.parse(process.argv);
