#!/usr/bin/env node
const { fetch } = require('undici')
const args = require('args')
const firebase = require('firebase-admin')
const { readFileSync } = require('fs')

firebase.initializeApp({
  databaseURL: 'http://localhost:9000/?ns=juicebox-svelte',
})

const piningFn = async (_, sub) => {
  const base64Image = readFileSync('test/0.png').toString('base64')
  const res = await fetch(
    'http://localhost:5001/juicebox-svelte/us-central1/pining',
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
