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

-   make sure you are using node 16.x Firebase is picky
-   additional packages:
    -   firebase-tools

```
nvm use 16.15.1

```

### Develop

Start firebase emulator

```
yarn dev
```

POST: http://localhost:5001/ipfs-scratch-space/us-central1/pinning

body:

```
{
   "tokens": [{"key": "value"}]
}
```
