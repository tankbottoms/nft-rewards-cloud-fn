import * as functions from 'firebase-functions'

import { pinningFunc } from './routes/pinning'

export const pining = functions
  .runWith({
    timeoutSeconds: 540,
  })
  .https.onRequest(pinningFunc)
