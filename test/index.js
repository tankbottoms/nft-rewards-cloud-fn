#!/usr/bin/env node
const { fetch } = require('undici')
const args = require('args')
const firebase = require('firebase-admin')

firebase.initializeApp({
  databaseURL: 'http://localhost:9000/?ns=juicebox-svelte',
})

const piningFn = async (_, sub) => {
  const base64Image = `data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==`
  const res = await fetch(
    'http://localhost:5001/juicebox-svelte/us-central1/pining',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Image,
      }),
    }
  )
  const json = await res.json()
  console.log(json)
}

args.command('pining', 'pining', piningFn)

args.parse(process.argv)
