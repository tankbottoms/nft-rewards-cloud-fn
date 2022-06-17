import * as functions from 'firebase-functions'

import { pinningFunc } from './routes/pinning'

export const pining = functions.https.onRequest(pinningFunc)
