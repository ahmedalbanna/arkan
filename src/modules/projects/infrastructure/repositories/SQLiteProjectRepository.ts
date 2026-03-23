import { injectable } from "tsyringe";
import { db } from "@/infrastructure/db";
import { projects } from "@/infrastructure/db/schema";
import { IProjectRepository } from "../../domain/repositories/IProjectRepository";
import { Project, ProjectProperties } from "../../domain/entities/Project";
import { Result } from "@/lib/utils/result";
import { ProjectError } from "../../domain/errors/ProjectErrors";
import { eq, desc, and } from "drizzle-orm";
import { Telemetry } from "@/lib/utils/telemetry";

@injectable()
export class SQLiteProjectRepository implements IProjectRepository {
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
      Telemetry.logFailure('SQLiteProjectRepo:getById', error);
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
      Telemetry.logFailure('SQLiteProjectRepo:getByUserId', error);
      return Result.fail(ProjectError.internal(error.message));
    }
  }

  async save(project: ProjectProperties): Promise<Result<Project, ProjectError>> {
    try {
      const id = project.id || require('uuid').v4();
      const persistenceData = this.toPersistence({ ...project, id });

      await db.insert(projects).values(persistenceData).onConflictDoUpdate({
        target: projects.id,
        set: persistenceData,
      });

      return this.getById(id);
    } catch (error: any) {
      Telemetry.logFailure('SQLiteProjectRepo:save', error);
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

  private toDomain(result: any): ProjectProperties {
    return {
      ...result,
      teamMembers: result.teamMembers ? JSON.parse(result.teamMembers) : undefined,
      content: result.content ? JSON.parse(result.content) : undefined,
      externalContext: result.externalContext ? JSON.parse(result.externalContext) : undefined,
      behaviors: result.behaviors ? JSON.parse(result.behaviors) : undefined,
      rules: result.rules ? JSON.parse(result.rules) : undefined,
      constraints: result.constraints ? JSON.parse(result.constraints) : undefined,
      meta: {
          author: result.authorId,
          version: result.version,
          created: result.created,
          updated: result.updated
      }
    };
  }

  private toPersistence(project: ProjectProperties): any {
    return {
      ...project,
      authorId: project.meta?.author || 'User',
      version: project.meta?.version || '1.0.0',
      created: project.meta?.created || new Date().toISOString(),
      updated: project.meta?.updated || new Date().toISOString(),
      teamMembers: project.teamMembers ? JSON.stringify(project.teamMembers) : null,
      content: project.content ? JSON.stringify(project.content) : null,
      externalContext: project.externalContext ? JSON.stringify(project.externalContext) : null,
      behaviors: project.behaviors ? JSON.stringify(project.behaviors) : null,
      rules: project.rules ? JSON.stringify(project.rules) : null,
      constraints: project.constraints ? JSON.stringify(project.constraints) : null,
    };
  }
}
