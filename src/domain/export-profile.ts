export type ExportProfile = {
  id: string;
  name: string;
  hoursColumnIndex: number;
  projectNames: string[];
  createdAt: string;
  updatedAt: string;
};

export type ActiveProfile = {
  key: 'current';
  profileId: string | null;
};

export interface ExportProfileRepository {
  listAll(): Promise<ExportProfile[]>;
  findById(id: string): Promise<ExportProfile | undefined>;
  findByName(name: string): Promise<ExportProfile | undefined>;
  create(profile: ExportProfile): Promise<void>;
  update(profile: ExportProfile): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface ActiveProfileRepository {
  get(): Promise<ActiveProfile>;
  set(profileId: string | null): Promise<void>;
  clear(): Promise<void>;
}
