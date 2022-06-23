# Readme

## Quick Start

### Install and build cloud-functions

```sh
  yarn && yarn build
```

### Start emulator, run tests

```sh
yarn dev
ts-node ./src/test/index.ts
```

### Starting emulators

```sh
  yarn emulators:start
```

### Export env variables

Open another terminal and export the env variables.

```sh
export FIREBASE_STORAGE_EMULATOR_HOST="localhost:9199"
```

```sh
export FIREBASE_AUTH_EMULATOR_HOST="localhost:9099"
```

```sh
export FIREBASE_DATABASE_EMULATOR_HOST="localhost:9000"
```

```sh
export GCLOUD_PROJECT="your-project-id"
```

**"your-project-id"** see in file _.firebaserc_.

```sh
  yarn pinning
```

#### Setting up Firebase Cloud Functions

- make sure you are using node 16.x Firebase is picky
- additional packages:
  - firebase-tools

```
nvm use 16.15.1

```

### Deployment

- https://us-central1-ipfs-scratch-space.cloudfunctions.net/pinning

### Develop
- create .env 
- start emulator
  run `yarn dev`
- http://localhost:5005/ipfs-scratch-space/us-central1/pinning
- test
  run `ts-node src/test/upload.ts`

### EXAMPLE 1:

```ts
import { readFileSync } from "fs";
import fetch from 'cross-fetch';

const csvContent = readFileSync("src/assets/nft-rewards-tiers.csv", "utf8");

(async function () {
  const response = await fetch(
    "https://us-central1-ipfs-scratch-space.cloudfunctions.net/pinning",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        csvContent,
      }),
    }
  );

  const { cid } = await response.json();

  console.log({ cid });
})();
```

### EXAMPLE 2:

```ts
import { readFileSync } from "fs";
import fetch from 'cross-fetch';
import { parseCsv } from '../utils/csv';

const csvContent = readFileSync("src/assets/nft-rewards-tiers.csv", "utf8");

(async function () {
  const response = await fetch(
    "https://us-central1-ipfs-scratch-space.cloudfunctions.net/pinning",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entries: parseCsv(csvContent),
      }),
    }
  );

  const { cid } = await response.json();

  console.log({ cid });
})();
```
