import * as functions from "firebase-functions";
// import * as firebase from 'firebase-admin';
import cors from "cors";
// import { v4 as uuidv4 } from "uuid";
import { NFTStorage, File } from "nft.storage";
import { deflateSync } from "zlib";
import { uploadJsonEntries } from "../../utils/ipfs";

// async function time_track<A>(
//   asyncFn: () => Promise<A>,
//   id: string | undefined = undefined
// ) {
//   const starttime = new Date().getTime();
//   const res = await asyncFn();
//   const time = (new Date().getTime() - starttime) / 1000;
//   const id_str = id ? `<${id}>` : "";
//   functions.logger.log(`ipfs upload directory promise ${id_str}`);
//   functions.logger.log(`upload ${time} seconds`);
//   return res;
// }

export const pinningFunc = async (
  request: functions.Request,
  response: functions.Response
) => {
  cors({ origin: true })(request, response, async () => {
    try {
      const nft_storage = new NFTStorage({
        token: process.env.NFT_STORAGE_API_KEY,
      });

      const { tokens } = request.body as { tokens: Record<string, any>[] };

      const compressedFiles: File[] = [];
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const jsonString = JSON.stringify(token, null, "  ");
        const compressedContent = deflateSync(Buffer.from(jsonString), {
          level: 9,
        });
        const file = new File([compressedContent], `compressed/${i + 1}`);
        compressedFiles.push(file);
      }

      const cid = await uploadJsonEntries(tokens, {
        additionalFiles: compressedFiles,
        storage: nft_storage,
      });

      response.status(200).json({
        cid: cid,
        success: true,
      });
    } catch (e) {
      functions.logger.error(e);
      functions.logger.error(`error loading to ipfs: ${JSON.stringify(e)}`);
      response.status(500).json({
        success: false,
        cid: null,
      });
    }
  });
};
