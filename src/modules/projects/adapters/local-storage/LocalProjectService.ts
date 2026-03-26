
'use client';

import { injectable } from "tsyringe";
import type { ProjectProperties } from '@/modules/projects/domain/entities/Project';
import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'ArkanProjectsDB';
const DB_VERSION = 1;
const STORE_NAME = 'projects';

// Define the database schema for type safety
interface MyDB {
  [STORE_NAME]: {
    key: string;
    value: ProjectProperties;
  };
}

@injectable()
export class LocalProjectService {
  private dbPromise: Promise<IDBPDatabase<MyDB>> | null = null;

  private getDB(): Promise<IDBPDatabase<MyDB>> {
    // Delay DB initialization until it's actually needed on the client-side
    if (typeof window === 'undefined') {
      return new Promise(() => { }); // Return a promise that never resolves on the server
    }

    if (!this.dbPromise) {
      this.dbPromise = openDB<MyDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          }
        },
      });
    }
    return this.dbPromise;
  }

  public async getAllProjects(): Promise<ProjectProperties[]> {
    const db = await this.getDB();
    const allProjects = await db.getAll(STORE_NAME);
    // Sort projects by updatedAt date in descending order
    return allProjects.sort((a, b) => {
      const dateA = a.meta?.updated ? new Date(a.meta.updated).getTime() : 0;
      const dateB = b.meta?.updated ? new Date(b.meta.updated).getTime() : 0;
      return dateB - dateA;
    });
  }

  public async getProject(id: string): Promise<ProjectProperties | undefined> {
    const db = await this.getDB();
    return db.get(STORE_NAME, id);
  }

  public async saveProject(project: ProjectProperties): Promise<ProjectProperties> {
    const db = await this.getDB();
    const projectToSave = {
      ...project,
      meta: { ...project.meta, updatedAt: new Date().toISOString() },
    };
    await db.put(STORE_NAME, projectToSave);
    return projectToSave;
  }

  public async deleteProject(id: string): Promise<void> {
    const db = await this.getDB();
    await db.delete(STORE_NAME, id);
  }
}
