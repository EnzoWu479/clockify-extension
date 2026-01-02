import type {
  ActiveProfile,
  ActiveProfileRepository,
} from "@/src/domain/export-profile";
import {
  ACTIVE_PROFILE_STORE,
  openProjectMappingsDb,
} from "@/src/infra/db/indexeddb/indexeddb-client";

async function getStore(mode: IDBTransactionMode) {
  const db = await openProjectMappingsDb();
  const tx = db.transaction(ACTIVE_PROFILE_STORE, mode);
  return tx.objectStore(ACTIVE_PROFILE_STORE);
}

export class ActiveProfileIndexedDbRepository
  implements ActiveProfileRepository
{
  async get(): Promise<ActiveProfile> {
    const store = await getStore("readonly");

    return new Promise((resolve, reject) => {
      const request = store.get('current');
      request.onsuccess = () => {
        const result = request.result as ActiveProfile | undefined;
        resolve(result ?? { key: 'current', profileId: null });
      };
      request.onerror = () => reject(request.error);
    });
  }

  async set(profileId: string | null): Promise<void> {
    const store = await getStore("readwrite");

    await new Promise<void>((resolve, reject) => {
      const request = store.put({ key: 'current', profileId });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(): Promise<void> {
    await this.set(null);
  }
}
