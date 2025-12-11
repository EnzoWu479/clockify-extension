export type ProjectMapping = {
  id: string;
  clockifyProjectName: string;
  excelValue: string;
};

export interface ProjectMappingRepository {
  listAll(): Promise<ProjectMapping[]>;
  upsert(mapping: ProjectMapping): Promise<void>;
  delete(id: string): Promise<void>;
  findByClockifyProjectName(
    name: string,
  ): Promise<ProjectMapping | undefined>;
}
