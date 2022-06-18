import * as functions from 'firebase-functions'
// import * as firebase from 'firebase-admin';
import cors from 'cors'
import { v4 as uuidv4 } from 'uuid'
import { NFTStorage, File } from 'nft.storage'

async function time_track<A>(
  asyncFn: () => Promise<A>,
  id: string | undefined = undefined
) {
  const starttime = new Date().getTime()
  const res = await asyncFn()
  const time = (new Date().getTime() - starttime) / 1000
  const id_str = id ? `<${id}>` : ''
  functions.logger.log(`ipfs upload directory promise ${id_str}`)
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
      const { image, name, externalLink, description, totalSupply } =
        request.body as {
          [key: string]: string
        }
      const totalSupplyCount = Number(totalSupply)

      const data: string = image.replace(/^data:image\/\w+;base64,/, '')
      const fileBuffer = Buffer.from(data, 'base64')

      const imageSize = fileBuffer.length
      const filename = `${uuidv4()}.png`

      const file = new File([fileBuffer], filename)

      const imageResult = await time_track(
        () => nft_storage.storeDirectory([file]),
        filename
      )
      const imageStatus = await nft_storage.status(imageResult)

      const metadataFolder: File[] = []

      for (let index = 0; index < totalSupplyCount; index++) {
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
          imageSize,
          formats: [],
          royalty_info: {},
          rights:
            '© 2022 JuiceBox DAO, WAGMI Studios.xyz, All rights reserved.',
        }

        const metadataBuffer = Buffer.from(JSON.stringify(metadata), 'utf8')
        const metadataFile = new File([metadataBuffer], `${index}`)

        metadataFolder.push(metadataFile)
      }

      const metadataResult = await time_track(() =>
        nft_storage.storeDirectory(metadataFolder)
      )
      const metadataStatus = await nft_storage.status(metadataResult)

      response.status(200).json({
        cid: metadataStatus.cid,
        success: true,
      })
    } catch (e) {
      functions.logger.error(e)
      functions.logger.error(`error loading to ipfs: ${JSON.stringify(e)}`)
      response.status(500).json({
        success: false,
        cid: null,
      })
    }
  })
}
