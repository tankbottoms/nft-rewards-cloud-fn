# Readme

## Quick Start

### Install and build cloud-functions

```sh
  yarn && yarn build
```

### Start emulator, run tests

```sh
  yarn dev
```

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

const csvContent = readFileSync(PATH_TO_CSV, "utf8");

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
```

### EXAMPLE 2:

```ts
import { readFileSync } from "fs";
import { parseCsv } from "src/utils/csv";

const csvContent = readFileSync(PATH_TO_CSV, "utf8");

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
```
