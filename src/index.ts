import * as functions from "firebase-functions";

import { pinningFunc } from "./routes/pinning";

export const pinning = functions
  .runWith({
    secrets: ["NFT_STORAGE_API_KEY"],
    timeoutSeconds: 540,
  })
  .https.onRequest(pinningFunc);
