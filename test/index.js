#!/usr/bin/env node
const { fetch } = require('undici')
const args = require('args')
const { readFileSync } = require('fs')

const piningFn = async (_, sub) => {
  const base64Image = readFileSync('test/0.png').toString('base64')
  const res = await fetch(
    'http://localhost:5001/ipfs-scratch-space/us-central1/pining',
    // 'https://us-central1-ipfs-scratch-space.cloudfunctions.net/pining',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Image,
        name: 'Test',
        externalLink: '',
        description: 'Test description',
        totalSupply: '10',
      }),
    }
  )
  const json = await res.json()
  console.log(json)
}

args.command('pining', 'pining', piningFn)

args.parse(process.argv)
