const DB_NAME = "clockify-extension";
const DB_VERSION = 1;
export const PROJECT_MAPPINGS_STORE = "projectMappings";

export async function openProjectMappingsDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    throw new Error("IndexedDB não está disponível neste ambiente.");
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PROJECT_MAPPINGS_STORE)) {
        db.createObjectStore(PROJECT_MAPPINGS_STORE, { keyPath: "id" });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error ?? new Error("Erro ao abrir IndexedDB."));
    };
  });
}
