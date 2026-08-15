import type { ProgressEntry } from "../types/progress-entry";

const databaseName = "nekofit-progress";
const storeName = "measurements";

function openProgressDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(storeName)) {
        request.result.createObjectStore(storeName, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function requestResult<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getProgressEntries() {
  const database = await openProgressDatabase();
  const transaction = database.transaction(storeName, "readonly");
  const entries = await requestResult(transaction.objectStore(storeName).getAll()) as ProgressEntry[];
  database.close();
  return entries.sort((entryA, entryB) => entryB.date.localeCompare(entryA.date) || entryB.createdAt.localeCompare(entryA.createdAt));
}

export async function saveProgressEntry(entry: ProgressEntry) {
  const database = await openProgressDatabase();
  const transaction = database.transaction(storeName, "readwrite");
  await requestResult(transaction.objectStore(storeName).put(entry));
  database.close();
  return entry;
}

export async function deleteProgressEntry(id: string) {
  const database = await openProgressDatabase();
  const transaction = database.transaction(storeName, "readwrite");
  await requestResult(transaction.objectStore(storeName).delete(id));
  database.close();
}
