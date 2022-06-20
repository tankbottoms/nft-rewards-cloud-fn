import { NFTStorage, File } from "nft.storage";
import { rotateNFTStorageKey } from "./env";

let NFT_TOKEN: string = "";

async function setNftToken() {
  NFT_TOKEN = await rotateNFTStorageKey();
}

setNftToken();

export async function uploadJsonEntries(
  entries: any[],
  {
    storage = new NFTStorage({
      token: NFT_TOKEN || process.env.NFT_STORAGE_API_KEY,
    }),
    additionalFiles = [] as File[],
  }
) {
  const files: File[] = [];
  for (let i = 0; i < entries.length; i++) {
    const tokenId = i + 1;
    const entry = entries[i];
    const jsonString = JSON.stringify(entry, null, "  ");
    const file = new File([jsonString], `${tokenId}`);
    files.push(file);
  }
  const allFiles = [...files, ...additionalFiles];

  console.log(files.map((file) => `${file.name}`).join(", "));
  const cid = await storage.storeDirectory(allFiles);
  return cid;
}
