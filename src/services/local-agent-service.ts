'use client';

import { openDB, type IDBPDatabase } from 'idb';
import type { Agent } from '@/types/agent';

const DB_NAME = 'AgentLabDB';
const DB_VERSION = 1;
const STORE_NAME = 'agents';

interface AgentLabDB {
  [STORE_NAME]: {
    key: string;
    value: Agent;
  };
}

class LocalAgentService {
  private dbPromise: Promise<IDBPDatabase<AgentLabDB>>;

  constructor() {
    if (typeof window === 'undefined') {
      // Return a mock implementation on the server
      this.dbPromise = new Promise(() => {});
    } else {
      this.dbPromise = openDB<AgentLabDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          }
        },
      });
    }
  }

  public async getAllAgents(): Promise<Agent[]> {
    const db = await this.dbPromise;
    return db.getAll(STORE_NAME);
  }

  public async getAgent(id: string): Promise<Agent | undefined> {
    const db = await this.dbPromise;
    return db.get(STORE_NAME, id);
  }

  public async saveAgent(agent: Agent): Promise<Agent> {
    const db = await this.dbPromise;
    await db.put(STORE_NAME, agent);
    return agent;
  }

  public async deleteAgent(id: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete(STORE_NAME, id);
  }
}

export const localAgentService = new LocalAgentService();
