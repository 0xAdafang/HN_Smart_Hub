import { openDB } from 'idb';

const DB_NAME = 'hn_offline_db';
const STORE_NAME = 'offlineQueue';

const dbPromise = openDB(DB_NAME, 1, {
    upgrade(db) {
        if(!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, {
            keyPath: 'id',
            autoIncrement: true,
          });
        }
    },
});

export async function addToQueue(action: any) {
    const db = await dbPromise;
    const tx = db.transaction(STORE_NAME, 'readwrite')
    await tx.store.add(action);
    await tx.done;
}

export async function getQueue() {
    const db = await dbPromise;
    return db.getAll(STORE_NAME);
}

export async function removeFromQueue(id: number) {
    const db = await dbPromise;
    await db.delete(STORE_NAME, id);
}