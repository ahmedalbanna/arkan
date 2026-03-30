
import { type ProjectProperties } from "./Project";
import { type ProjectSnapshotPropertiesType as ProjectSnapshotProperties } from "../schemas/SnapshotSchema";

export type { ProjectSnapshotProperties };

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
    this.snapshotData = props.snapshotData as ProjectProperties;
    this.created = props.created;
  }

  public toJSON(): ProjectSnapshotProperties {
    return {
      id: this.id,
      projectId: this.projectId,
      name: this.name,
      snapshotData: this.snapshotData as any,
      created: this.created,
    };
  }
}
