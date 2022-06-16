import * as admin from 'firebase-admin';
// const serviceAccount = require('../juicebox-svelte-firebase-adminsdk-dcrl6-5bbff7a999.json');

// const options = {
//   credential: admin.credential.cert(serviceAccount),
//   storageBucket: "juicebox-svelte.appspot.com",
//   databaseURL: "https://juicebox-svelte-default-rtdb.firebaseio.com"
// };

export const firebaseApp = admin.initializeApp();
export const firestore = firebaseApp.firestore();
export const storage = admin.storage(firebaseApp);
