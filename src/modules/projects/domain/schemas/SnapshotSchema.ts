
import { z } from 'zod';
import { ProjectPropertiesSchema } from './ProjectSchema';

export const ProjectSnapshotPropertiesSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  name: z.string(),
  snapshotData: ProjectPropertiesSchema,
  created: z.string().datetime('Invalid date format'),
});

export const ProjectSnapshotSchema = z.object({
  id: z.string().optional(),
  projectId: z.string(),
  name: z.string().min(1, 'Snapshot name is required'),
  snapshotData: ProjectPropertiesSchema,
  created: z.string().optional(),
});

export type ProjectSnapshotPropertiesType = z.infer<typeof ProjectSnapshotPropertiesSchema>;
export type ProjectSnapshotSchemaType = z.infer<typeof ProjectSnapshotSchema>;
