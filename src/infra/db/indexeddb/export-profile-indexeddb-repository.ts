import type {
  ExportProfile,
  ExportProfileRepository,
} from "@/src/domain/export-profile";
import {
  EXPORT_PROFILES_STORE,
  openProjectMappingsDb,
} from "@/src/infra/db/indexeddb/indexeddb-client";

async function getStore(mode: IDBTransactionMode) {
  const db = await openProjectMappingsDb();
  const tx = db.transaction(EXPORT_PROFILES_STORE, mode);
  return tx.objectStore(EXPORT_PROFILES_STORE);
}

export class ExportProfileIndexedDbRepository
  implements ExportProfileRepository
{
  async listAll(): Promise<ExportProfile[]> {
    const store = await getStore("readonly");

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const profiles = (request.result as ExportProfile[]) ?? [];
        profiles.sort((a, b) => 
          a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
        );
        resolve(profiles);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async findById(id: string): Promise<ExportProfile | undefined> {
    const store = await getStore("readonly");

    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => {
        resolve(request.result as ExportProfile | undefined);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async findByName(name: string): Promise<ExportProfile | undefined> {
    const all = await this.listAll();
    const normalizedName = name.trim().toLowerCase();
    return all.find(
      (profile) => profile.name.trim().toLowerCase() === normalizedName
    );
  }

  async create(profile: ExportProfile): Promise<void> {
    const store = await getStore("readwrite");

    await new Promise<void>((resolve, reject) => {
      const request = store.add(profile);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async update(profile: ExportProfile): Promise<void> {
    const store = await getStore("readwrite");

    await new Promise<void>((resolve, reject) => {
      const request = store.put(profile);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async delete(id: string): Promise<void> {
    const store = await getStore("readwrite");

    await new Promise<void>((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}
