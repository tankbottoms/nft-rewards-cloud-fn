import * as functions from "firebase-functions";
import cors from "cors";
// import { v4 as uuidv4 } from "uuid";
import { NFTStorage, File } from "nft.storage";
import { deflateSync } from "zlib";
import { uploadJsonEntries } from "../../utils/ipfs";
import { parseCsv } from "../../utils/csv";

/*
async function time_track<A>(
  asyncFn: () => Promise<A>,
  id: string | undefined = undefined
) {
  const starttime = new Date().getTime();
  const res = await asyncFn();
  const time = (new Date().getTime() - starttime) / 1000;
  const id_str = id ? `<${id}>` : "";
  functions.logger.log(`ipfs upload directory promise ${id_str}`);
  functions.logger.log(`upload ${time} seconds`);
  return res;
}
*/

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
    } else if (
      typeof entry[key] === "string" &&
      entry[key]?.toLowerCase() === "true"
    ) {
      obj[key] = true;
    } else if (
      typeof entry[key] === "string" &&
      entry[key]?.toLowerCase() === "false"
    ) {
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

      const { format, ...body } = request.body as
        | {
            json: Record<string, any>[];
            format: "csv" | "json";
          }
        | {
            csv: string;
            format: "csv" | "json";
          };

      let entries: Record<string, any>[] = [];

      if (format === "csv" && body["csv"]) {
        entries = parseCsv(body["csv"]);
      } else if (format === "json" && body["json"] instanceof Array) {
        entries = body["json"];
      } else {
        response.status(500).json({
          cid: null,
          success: false,
          error: "invalid request",
        });
        return;
      }

      if (
        entries.find(
          (entry) =>
            typeof entry.attributes_tiers === "undefined" ||
            typeof entry.attributes_supply === "undefined"
        )
      ) {
        response.status(500).json({
          cid: null,
          success: false,
          error: "missing column `attributes_tiers` or `attributes_supply`",
        });
        return;
      }

      entries = entries
        .sort((a, b) => Number(a.attributes_tiers) - Number(b.attributes_tiers))
        .map(handleEntry);

      if ((entries?.length || 0) === 0) {
        response.status(500).json({
          cid: null,
          success: false,
          error: "something went wrong",
        });
        return;
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
