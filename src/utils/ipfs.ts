import { NFTStorage, File } from "nft.storage";

export async function uploadJsonEntries(
  entries: any[],
  {
    storage = new NFTStorage({ token: process.env.NFT_STORAGE_API_KEY }),
    additionalFiles = [] as File[],
  }
) {
  const files: File[] = [];
  for (let i = 0; i < entries.length; i++) {
    const tokenId = i + 1;
    const entry = entries[tokenId];
    const jsonString = JSON.stringify(entry, null, "  ");
    const file = new File([jsonString], `${tokenId}`);
    files.push(file);
  }
  console.log(files.map((file) => `${file.name}`).join(", "));
  const cid = await storage.storeDirectory([...files, ...additionalFiles]);
  return cid;
}
