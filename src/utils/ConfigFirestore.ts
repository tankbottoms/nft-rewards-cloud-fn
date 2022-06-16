import type { app, firestore } from "firebase-admin";

class ConfigFirestore {
  db: firestore.Firestore;
  collection: firestore.CollectionReference;
  constructor(firebaseApp: app.App, collectionPath: string) {
    this.db = firebaseApp.firestore();
    this.collection = this.db.collection(collectionPath);
  }
  private async readCollection(collection: firestore.CollectionReference) {
    const snap = await collection.get();
    const finalObject: { [k: string]: any } = {};
    snap.docs.forEach((doc) => {
      finalObject[doc.id] = doc.data();
    });
    return finalObject;
  }
  private async writeCollection(
    collection: firestore.CollectionReference,
    data: { [k: string]: firestore.DocumentData }
  ) {
    const batch = this.db.batch();
    for (const [key, documentData] of Object.entries(data)) {
      const doc = collection.doc(key);
      batch.set(doc, documentData);
    }
    await batch.commit();
    return true;
  }
  async get(path: string[] = []) {
    if (path.length === 0) {
      return await this.readCollection(this.collection);
    } else {
      const isCollection = path.length % 2;
      const _path = `${this.collection.path}/${path.join("/")}`;
      if (isCollection) {
        const collection = this.db.collection(_path);
        return await this.readCollection(collection);
      } else {
        const document = this.db.doc(_path);
        const snapshot = await document.get();
        return snapshot.data();
      }
    }
  }
  async set(data: { [k: string]: firestore.DocumentData }, path: string[] = []) {
    if (!data) throw Error("argument `data` is required");
    if (path.length === 0) {
      return await this.writeCollection(this.collection, data);
    } else {
      const isCollection = path.length % 2;
      const _path = `${this.collection.path}/${path.join("/")}`;
      if (isCollection) {
        const collection = this.db.collection(_path);
        return await this.writeCollection(collection, data);
      } else {
        const document = this.db.doc(_path);
        await document.set(data);
        return true;
      }
    }
  }
};

export default ConfigFirestore;
