
import { injectable } from "tsyringe";
import { adminDb } from "@/infrastructure/firebase/server-init";
import { IProjectRepository } from "../../domain/repositories/IProjectRepository";
import { Project, ProjectProperties } from "../../domain/entities/Project";

@injectable()
export class FirebaseProjectRepository implements IProjectRepository {
  private readonly collection = adminDb.collection("projects");

  async getById(id: string): Promise<Project | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return new Project(doc.data() as ProjectProperties);
  }

  async getByUserId(userId: string): Promise<Project[]> {
    const snapshot = await this.collection
      .where("meta.author", "==", userId)
      .orderBy("meta.updated", "desc")
      .get();

    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map((doc) => new Project(doc.data() as ProjectProperties));
  }

  async save(project: ProjectProperties): Promise<Project> {
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
    return new Project(dataToSave);
  }

  async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }
}
