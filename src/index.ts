import * as functions from 'firebase-functions'
import https from 'https'
// import { latest_tweet, user } from './routes/twitter';
import { storage } from './init'
import cors from 'cors'
import { create, type IPFS } from 'ipfs-core'

import { pinningFunc } from './routes/pinning'

let node: IPFS

export const getIpfsFileByCid = functions.https.onRequest(
  (request, response) => {
    cors({ origin: true })(request, response, async () => {
      // TODO: restrict cross origin

      if (request.method !== 'GET') {
        response.status(404).end()
        return
      }

      const cid = request.query.cid as string

      if (!cid) {
        response.status(400).end()
        return
      }

      response.setHeader('access-control-allow-origin', '*')
      const bucketFile = storage.bucket('juicebox-svelte.appspot.com').file(cid)

      try {
        if (await bucketFile.getMetadata()) {
          functions.logger.info('Using bucket file')
          const stream = bucketFile.createReadStream()
          stream.pipe(response)
          stream.on('end', () => response.end())
          return
        }
      } catch (error) {}

      const gateways = [
        'https://ipfs.io/ipfs/',
        'https://cloudflare-ipfs.com/ipfs/',
        'https://ipfs.infura.io/ipfs/',
        'https://ipfs.fleek.co/ipfs/',
        'https://gateway.pinata.cloud/ipfs/',
      ]

      for (const gateway of gateways) {
        const url = `${gateway}${cid}`
        try {
          await new Promise((resolve, reject) => {
            https
              .get(url, (res) => {
                if (200 <= res.statusCode && res.statusCode < 400) {
                  res.pipe(response)
                  let data = []
                  res.on('data', (chunk: Buffer) => {
                    data = [...data, ...Uint8Array.from(chunk)]
                  })
                  res.on('end', async function () {
                    functions.logger.info('\nSaving to bucket\n')
                    await bucketFile.save(Buffer.from(data), {
                      public: true,
                    })
                    response.end()
                    resolve(true)
                  })
                } else throw Error('failed')
              })
              .on('error', (error) => {
                response.status(500).json({
                  error: error.message,
                })
                reject()
              })
          })
          return
        } catch (error) {
          functions.logger.info('GET:', url)
          functions.logger.error(error.message)
        }
      }

      let maxRetries = 3
      let retried = 0
      while (retried++ < maxRetries) {
        try {
          node = (await create()) as IPFS

          let data: number[] = []
          for await (const chunk of node.cat(cid)) {
            response.write(chunk)
            data = [...data, ...Uint8Array.from(chunk)]
          }

          functions.logger.info('\nSaving to bucket\n')
          await bucketFile.save(Buffer.from(data), {
            public: true,
          })
          response.status(200).end()
          return
        } catch (error) {
          response.status(500).json({
            error: 'failed to get file',
          })
        }
      }
    })
  }
)

export const pining = functions.https.onRequest(pinningFunc)
