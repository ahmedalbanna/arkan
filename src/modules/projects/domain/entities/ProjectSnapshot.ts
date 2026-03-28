import { ProjectProperties } from "./Project";

export interface ProjectSnapshotProperties {
  id: string;
  projectId: string;
  name: string;
  snapshotData: ProjectProperties;
  created: string;
}

export class ProjectSnapshot {
  public readonly id: string;
  public readonly projectId: string;
  public readonly name: string;
  public readonly snapshotData: ProjectProperties;
  public readonly created: string;

  constructor(props: ProjectSnapshotProperties) {
    this.id = props.id;
    this.projectId = props.projectId;
    this.name = props.name;
    this.snapshotData = props.snapshotData;
    this.created = props.created;
  }

  public toJSON(): ProjectSnapshotProperties {
    return {
      id: this.id,
      projectId: this.projectId,
      name: this.name,
      snapshotData: this.snapshotData,
      created: this.created,
    };
  }
}
