
import { injectable } from "tsyringe";
import { adminDb } from "@/lib/firebase/server-init";
import { IAgentRepository, Agent } from "../../domain/repositories/IAgentRepository";

@injectable()
export class FirebaseAgentRepository implements IAgentRepository {
    private readonly collection = adminDb.collection("agents");

    async getById(id: string): Promise<Agent | null> {
        const doc = await this.collection.doc(id).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() } as Agent;
    }
}
