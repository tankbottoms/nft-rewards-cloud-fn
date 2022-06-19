const BLANK = "";
export const NFT_STORAGE_API_KEYS: string[] = [];

const random = (max: number) => {
    return Math.floor(Math.random() * max);
};

const zeroPad = (num: number, places: number) =>
    String(num).padStart(places, "0");

export const rotateNFTStorageKey = async () => {
    const key_count = 6;
    for (let i = 0; i < key_count; i++) {
        const env_key =
            process.env[String(`NFT_STORAGE_API_KEY_` + zeroPad(i, 3))] ||
            BLANK;
        console.log(env_key);
        env_key.length ? NFT_STORAGE_API_KEYS.push(env_key) : null;
    }

    return NFT_STORAGE_API_KEYS.length >= 1
        ? NFT_STORAGE_API_KEYS[random(NFT_STORAGE_API_KEYS.length)]
        : "undefined";
};
