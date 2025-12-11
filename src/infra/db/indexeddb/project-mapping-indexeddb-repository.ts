import type {
  ProjectMapping,
  ProjectMappingRepository,
} from "@/src/domain/project-mapping";
import {
  PROJECT_MAPPINGS_STORE,
  openProjectMappingsDb,
} from "@/src/infra/db/indexeddb/indexeddb-client";

async function getStore(mode: IDBTransactionMode) {
  const db = await openProjectMappingsDb();
  const tx = db.transaction(PROJECT_MAPPINGS_STORE, mode);
  return tx.objectStore(PROJECT_MAPPINGS_STORE);
}

export class ProjectMappingIndexedDbRepository
  implements ProjectMappingRepository
{
  async listAll(): Promise<ProjectMapping[]> {
    const store = await getStore("readonly");

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        resolve((request.result as ProjectMapping[]) ?? []);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async upsert(mapping: ProjectMapping): Promise<void> {
    const store = await getStore("readwrite");

    await new Promise<void>((resolve, reject) => {
      const request = store.put(mapping);
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

  async findByClockifyProjectName(
    name: string,
  ): Promise<ProjectMapping | undefined> {
    const all = await this.listAll();
    const normalizedName = name.trim().toLowerCase();
    return all.find(
      (mapping) =>
        mapping.clockifyProjectName.trim().toLowerCase() === normalizedName,
    );
  }
}
