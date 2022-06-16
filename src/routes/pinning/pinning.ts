import * as functions from 'firebase-functions'
// import * as firebase from 'firebase-admin';
import cors from 'cors'
import os from 'os'
import { writeFileSync, existsSync, readFileSync, rmSync } from 'fs'
import { basename } from 'path'
import { NFTStorage, File } from 'nft.storage'

async function time_track<A>(
  asyncFn: () => Promise<A>,
  id: string | undefined = undefined
) {
  const starttime = new Date().getTime()
  const res = await asyncFn()
  const time = (new Date().getTime() - starttime) / 1000
  const id_str = id ? `<${id}>` : ''
  functions.logger.log(`ipfs upload directory Promise ${id_str}`)
  functions.logger.log(`upload ${time} seconds`)
  return res
}

export const pinningFunc = async (
  request: functions.Request,
  response: functions.Response
) => {
  cors({ origin: true })(request, response, async () => {
    try {
      const nft_storage = new NFTStorage({
        token: process.env.NFT_STORAGE_API_KEY,
      })
      const { image, name, externalLink, description } = request.body

      const data: string = image.replace(/^data:image\/\w+;base64,/, '')
      const buf = Buffer.from(data, 'base64')

      const imagePath = `${os.tmpdir()}/image.png`

      writeFileSync(imagePath, buf)

      functions.logger.log('existsSync(imagePath)')
      functions.logger.log(existsSync(imagePath))

      const filename = basename(imagePath)
      const file = new File([readFileSync(imagePath)], filename)
      rmSync(imagePath)

      const imageResult = await time_track(
        () => nft_storage.storeDirectory([file]),
        filename
      )
      const imageStatus = await nft_storage.status(imageResult)

      const metadata = {
        name,
        attributes: [],
        symbol: 'JBX-100',
        description,
        minter: 'tankbottoms.eth',
        decimals: 0,
        creators: [],
        publishers: [],
        genre: [],
        date: '',
        tags: [],
        mimeType: 'image/png',
        artifactUri: `ipfs://${imageStatus.cid}/${filename}`,
        displayUri: `ipfs://${imageStatus.cid}/${filename}`,
        externalUri: externalLink,
        uri: `ipfs://${imageStatus.cid}/${filename}`,
        image: `ipfs://${imageStatus.cid}/${filename}`,
        imageSize: 7251,
        formats: [],
        royalty_info: {},
        rights: '© 2022 JuiceBox DAO, WAGMI Studios.xyz, All rights reserved.',
      }

      const metadataBuffer = Buffer.from(JSON.stringify(metadata), 'utf8')
      const metadataFile = new File([metadataBuffer], '0')

      const metadataResult = await time_track(
        () => nft_storage.storeDirectory([metadataFile]),
        '0'
      )
      const metadataStatus = await nft_storage.status(metadataResult)

      response.status(200).json({
        cid: metadataStatus.cid,
        success: true,
      })
    } catch (e) {
      functions.logger.error(e)
      functions.logger.error(`error loading to ipfs: ${JSON.stringify(e)}`)
      response.status(200).json({
        success: false,
        cid: null,
      })
    }
  })
}
