import type { SaveData } from '../blocks/schemas';

const DB_NAME = 'kidsprogedu@v1';
const STORE_SAVE = 'saveData';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('IndexedDB is not available on server'));
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_SAVE)) {
        db.createObjectStore(STORE_SAVE, { keyPath: 'profileId' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getSave(profileId: string): Promise<SaveData | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SAVE, 'readonly');
    const store = tx.objectStore(STORE_SAVE);
    const req = store.get(profileId);
    req.onsuccess = () => resolve(req.result as SaveData | undefined);
    req.onerror = () => reject(req.error);
  });
}

export async function putSave(data: SaveData): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SAVE, 'readwrite');
    const store = tx.objectStore(STORE_SAVE);
    const req = store.put(data);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function clearAll(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SAVE, 'readwrite');
    const store = tx.objectStore(STORE_SAVE);
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export const DEFAULT_PROFILE = 'local';

export async function getOrCreateDefault(): Promise<SaveData> {
  const existing = await getSave(DEFAULT_PROFILE);
  if (existing) return existing;
  const fresh: SaveData = { profileId: DEFAULT_PROFILE, clearedLessonIds: [], creations: [] };
  await putSave(fresh);
  return fresh;
}

export async function markLessonCleared(lessonId: string): Promise<SaveData> {
  const data = await getOrCreateDefault();
  if (!data.clearedLessonIds.includes(lessonId)) {
    data.clearedLessonIds = [...data.clearedLessonIds, lessonId];
    await putSave(data);
  }
  return data;
}

