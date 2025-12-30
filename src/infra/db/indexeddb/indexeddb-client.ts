const DB_NAME = "clockify-extension";
const DB_VERSION = 2;
export const PROJECT_MAPPINGS_STORE = "projectMappings";
export const EXPORT_PROFILES_STORE = "exportProfiles";
export const ACTIVE_PROFILE_STORE = "activeProfile";

export async function openProjectMappingsDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    throw new Error("IndexedDB não está disponível neste ambiente.");
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      const oldVersion = (event as IDBVersionChangeEvent).oldVersion;
      
      if (oldVersion < 1) {
        if (!db.objectStoreNames.contains(PROJECT_MAPPINGS_STORE)) {
          db.createObjectStore(PROJECT_MAPPINGS_STORE, { keyPath: "id" });
        }
      }
      
      if (oldVersion < 2) {
        if (!db.objectStoreNames.contains(EXPORT_PROFILES_STORE)) {
          db.createObjectStore(EXPORT_PROFILES_STORE, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(ACTIVE_PROFILE_STORE)) {
          db.createObjectStore(ACTIVE_PROFILE_STORE, { keyPath: "key" });
        }
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
