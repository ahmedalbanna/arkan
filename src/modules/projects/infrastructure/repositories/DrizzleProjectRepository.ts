import { injectable } from "tsyringe";
import { db } from "@/infrastructure/db";
import { projects, projectSnapshots } from "@/infrastructure/db/schema";
import { IProjectRepository } from "../../domain/repositories/IProjectRepository";
import { Project, ProjectProperties } from "../../domain/entities/Project";
import { ProjectSnapshot } from "../../domain/entities/ProjectSnapshot";
import { Result } from "@/infrastructure/utils/result";
import { ProjectError } from "../../domain/errors/ProjectErrors";
import { eq, desc } from "drizzle-orm";
import { Telemetry } from "@/modules/ai/infrastructure/services/Telemetry";
import { v4 as uuidv4 } from 'uuid';

@injectable()
export class DrizzleProjectRepository implements IProjectRepository {
  async getById(id: string): Promise<Result<Project, ProjectError>> {
    try {
      const result = await db.query.projects.findFirst({
        where: eq(projects.id, id),
      });
      if (!result) {
        return Result.fail(ProjectError.notFound(`Project with id ${id} not found`));
      }
      return Result.ok(new Project(this.toDomain(result)));
    } catch (error: any) {
      Telemetry.logFailure('DrizzleProjectRepo:getById', error);
      return Result.fail(ProjectError.internal(error.message));
    }
  }

  async getByUserId(userId: string): Promise<Result<Project[], ProjectError>> {
    try {
      const results = await db.query.projects.findMany({
        where: eq(projects.authorId, userId),
        orderBy: [desc(projects.updated)],
      });

      const projectsList = results.map((result) => new Project(this.toDomain(result)));
      return Result.ok(projectsList);
    } catch (error: any) {
      Telemetry.logFailure('DrizzleProjectRepo:getByUserId', error);
      return Result.fail(ProjectError.internal(error.message));
    }
  }

  async save(project: ProjectProperties): Promise<Result<Project, ProjectError>> {
    try {
      const id = project.id || uuidv4();
      const persistenceData = this.toPersistence({ ...project, id });

      await db.insert(projects).values(persistenceData).onConflictDoUpdate({
        target: projects.id,
        set: persistenceData,
      });

      return this.getById(id);
    } catch (error: any) {
      Telemetry.logFailure('DrizzleProjectRepo:save', error);
      return Result.fail(ProjectError.saveError(error.message));
    }
  }

  async delete(id: string): Promise<Result<void, ProjectError>> {
    try {
      await db.delete(projects).where(eq(projects.id, id));
      return Result.ok();
    } catch (error: any) {
      return Result.fail(ProjectError.deleteError(error.message));
    }
  }

  async saveSnapshot(snapshot: ProjectSnapshot): Promise<Result<ProjectSnapshot, ProjectError>> {
    try {
      const persistenceData = {
        id: snapshot.id,
        projectId: snapshot.projectId,
        name: snapshot.name,
        snapshotData: JSON.stringify(snapshot.snapshotData),
        created: snapshot.created,
      };

      await db.insert(projectSnapshots).values(persistenceData).onConflictDoUpdate({
        target: projectSnapshots.id,
        set: persistenceData,
      });

      return Result.ok(snapshot);
    } catch (error: any) {
      Telemetry.logFailure('DrizzleProjectRepo:saveSnapshot', error);
      return Result.fail(ProjectError.saveError(error.message));
    }
  }

  async getSnapshots(projectId: string): Promise<Result<ProjectSnapshot[], ProjectError>> {
    try {
      const results = await db.query.projectSnapshots.findMany({
        where: eq(projectSnapshots.projectId, projectId),
        orderBy: [desc(projectSnapshots.created)],
      });

      const snapshots = results.map((res) => new ProjectSnapshot({
        id: res.id,
        projectId: res.projectId,
        name: res.name,
        snapshotData: JSON.parse(res.snapshotData),
        created: res.created,
      }));

      return Result.ok(snapshots);
    } catch (error: any) {
      Telemetry.logFailure('DrizzleProjectRepo:getSnapshots', error);
      return Result.fail(ProjectError.internal(error.message));
    }
  }

  async deleteSnapshot(id: string): Promise<Result<void, ProjectError>> {
    try {
      await db.delete(projectSnapshots).where(eq(projectSnapshots.id, id));
      return Result.ok();
    } catch (error: any) {
      return Result.fail(ProjectError.deleteError(error.message));
    }
  }

  private toDomain(result: any): ProjectProperties {
    const parseJson = (val: any) => {
        if (!val) return undefined;
        try {
            return typeof val === 'string' ? JSON.parse(val) : val;
        } catch (e) {
            console.error('Failed to parse JSON field:', val, e);
            return undefined;
        }
    };

    return {
      ...result,
      teamMembers: parseJson(result.teamMembers),
      content: parseJson(result.content),
      externalContext: parseJson(result.externalContext),
      behaviors: parseJson(result.behaviors),
      rules: parseJson(result.rules),
      constraints: parseJson(result.constraints),
      meta: {
          author: result.authorId || 'User',
          version: result.version || '1.0.0',
          created: result.created || new Date().toISOString(),
          updated: result.updated || new Date().toISOString()
      }
    };
  }

  private toPersistence(project: ProjectProperties): any {
    const stringifyJson = (val: any) => val ? JSON.stringify(val) : null;

    return {
      id: project.id,
      name: project.name || 'Untitled Project',
      description: project.description || null,
      projectDescription: project.projectDescription || null,
      projectType: project.projectType || null,
      specialization: project.specialization || null,
      university: project.university || null,
      supervisor: project.supervisor || null,
      course: project.course || null,
      educationalLevel: project.educationalLevel || null,
      logoUrl: project.logoUrl || null,
      universityLogoUrl: project.universityLogoUrl || null,
      tableOfContentsMarkdown: project.tableOfContentsMarkdown || null,
      activeSectionId: project.activeSectionId || null,
      language: project.language || null,
      complexity: project.complexity ?? 50,
      formality: project.formality ?? 70,
      tone: project.tone || null,
      citationStyle: project.citationStyle || null,
      authorId: project.meta?.author || 'User',
      version: project.meta?.version || '1.0.0',
      created: project.meta?.created || new Date().toISOString(),
      updated: project.meta?.updated || new Date().toISOString(),
      teamMembers: stringifyJson(project.teamMembers),
      content: stringifyJson(project.content),
      externalContext: stringifyJson(project.externalContext),
      behaviors: stringifyJson(project.behaviors),
      rules: stringifyJson(project.rules),
      constraints: stringifyJson(project.constraints),
    };
  }
}
