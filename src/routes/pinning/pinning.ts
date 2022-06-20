import * as functions from "firebase-functions";
// import * as firebase from 'firebase-admin';
import cors from "cors";
// import { v4 as uuidv4 } from "uuid";
import { NFTStorage, File } from "nft.storage";
import { deflateSync } from "zlib";
import { uploadJsonEntries } from "../../utils/ipfs";
import { parseCsv } from "../../utils/csv";

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

function handleEntry(entry: any) {
  const obj: Record<string, any> = {};
  for (const key in entry) {
    if (key.startsWith("attributes_")) {
      const attribute_name = key.replace("attributes_", "");
      const attribute_value = entry[key];
      const attributes = obj.attributes || [];
      attributes.push(
        handleEntry({
          trait_type: attribute_name,
          value: attribute_value,
        })
      );
      obj.attributes = attributes;
    } else if (entry[key].toLowerCase() === "true") {
      obj[key] = true;
    } else if (entry[key].toLowerCase() === "false") {
      obj[key] = false;
    } else {
      let res = entry[key];
      try {
        res = JSON.parse(entry[key]);
      } catch (e) {}
      obj[key] = res;
    }
  }
  return obj;
}

export const pinningFunc = async (
  request: functions.Request,
  response: functions.Response
) => {
  cors({ origin: true })(request, response, async () => {
    try {
      const nft_storage = new NFTStorage({
        token: process.env.NFT_STORAGE_API_KEY,
      });

      let { entries, csvContent } = request.body as {
        entries?: Record<string, any>[];
        csvContent?: string;
      };

      if (typeof csvContent === "string") {
        entries = parseCsv(csvContent)
          .map(handleEntry)
          .sort(
            (a, b) =>
              Number(a.attributes[0].value) - Number(b.attributes[0].value)
          );
      } else {
        entries = entries.map(handleEntry);
      }
      const tokens: any[] = [];

      const compressedFiles: File[] = [];
      let tokenCount = 0;
      for (let i = 0; i < entries.length; i++) {
        for (let j = 0; j < entries[i].attributes[1].value; j++) {
          tokenCount++;
          const token = entries[i];
          tokens.push(token);
          const jsonString = JSON.stringify(token, null, "  ");
          const compressedContent = deflateSync(Buffer.from(jsonString), {
            level: 9,
          });
          const file = new File(
            [compressedContent],
            `compressed/${tokenCount}`
          );
          compressedFiles.push(file);
        }
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
