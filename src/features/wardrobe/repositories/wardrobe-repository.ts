import { defaultGarments } from "../data/default-garments";
import type { WardrobeItem } from "../types/wardrobe-item";

const databaseName = "nekofit-wardrobe";
const storeName = "garments";

function openWardrobeDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(databaseName, 1);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(storeName)) {
        database.createObjectStore(storeName, { keyPath: "id" });
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

export async function getWardrobeItems() {
  const database = await openWardrobeDatabase();
  const transaction = database.transaction(storeName, "readonly");
  const items = await requestResult(transaction.objectStore(storeName).getAll()) as WardrobeItem[];
  database.close();

  if (items.length > 0) {
    const normalizedItems = items.map((item) => {
      const starterItem = defaultGarments.find((defaultItem) => defaultItem.id === item.id);
      return starterItem ?? item;
    });
    await Promise.all(normalizedItems.map((item) => saveWardrobeItem(item)));
    return normalizedItems;
  }

  await Promise.all(defaultGarments.map((item) => saveWardrobeItem(item)));
  return defaultGarments;
}

export async function saveWardrobeItem(item: WardrobeItem) {
  const database = await openWardrobeDatabase();
  const transaction = database.transaction(storeName, "readwrite");
  await requestResult(transaction.objectStore(storeName).put(item));
  database.close();
  return item;
}

export async function deleteWardrobeItem(id: string) {
  const database = await openWardrobeDatabase();
  const transaction = database.transaction(storeName, "readwrite");
  await requestResult(transaction.objectStore(storeName).delete(id));
  database.close();
}
