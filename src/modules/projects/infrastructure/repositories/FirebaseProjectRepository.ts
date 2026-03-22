
import { injectable } from "tsyringe";
import { adminDb } from "@/infrastructure/firebase/server-init";
import { IProjectRepository } from "../../domain/repositories/IProjectRepository";
import { Project, ProjectProperties } from "../../domain/entities/Project";
import { Result } from "@/lib/utils/result";
import { ProjectError } from "../../domain/errors/ProjectErrors";
import { Telemetry } from "@/lib/utils/telemetry";

@injectable()
export class FirebaseProjectRepository implements IProjectRepository {
  private readonly collection = adminDb.collection("projects");

  async getById(id: string): Promise<Result<Project, ProjectError>> {
    try {
      const doc = await this.collection.doc(id).get();
      if (!doc.exists) {
        return Result.fail(ProjectError.notFound(`Project with id ${id} not found`));
      }
      return Result.ok(new Project(doc.data() as ProjectProperties));
    } catch (error: any) {
      Telemetry.logFailure('FirebaseProjectRepo:getById', error);
      return Result.fail(ProjectError.internal(error.message));
    }
  }

  async getByUserId(userId: string): Promise<Result<Project[], ProjectError>> {
    try {
      const snapshot = await this.collection
        .where("meta.author", "==", userId)
        .orderBy("meta.updated", "desc")
        .get();

      if (snapshot.empty) {
        return Result.ok([]);
      }

      const projects = snapshot.docs.map((doc) => new Project(doc.data() as ProjectProperties));
      return Result.ok(projects);
    } catch (error: any) {
      Telemetry.logFailure('FirebaseProjectRepo:getByUserId', error);
      return Result.fail(ProjectError.internal(error.message));
    }
  }

  async save(project: ProjectProperties): Promise<Result<Project, ProjectError>> {
    try {
      const docRef = project.id ? this.collection.doc(project.id) : this.collection.doc();
      
      const dataToSave: ProjectProperties = {
        ...project,
        id: docRef.id,
        meta: {
          ...project.meta,
          updated: new Date().toISOString(),
        },
      };

      await docRef.set(dataToSave, { merge: true });
      return Result.ok(new Project(dataToSave));
    } catch (error: any) {
      Telemetry.logFailure('FirebaseProjectRepo:save', error);
      return Result.fail(ProjectError.saveError(error.message));
    }
  }

  async delete(id: string): Promise<Result<void, ProjectError>> {
    try {
      await this.collection.doc(id).delete();
      return Result.ok();
    } catch (error: any) {
      return Result.fail(ProjectError.deleteError(error.message));
    }
  }
}
