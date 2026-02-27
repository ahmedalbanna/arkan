
import { injectable } from "tsyringe";
import { adminAuth } from "@/infrastructure/firebase/server-init";
import { IAuthRepository } from "../../domain/repositories/IAuthRepository";

@injectable()
export class FirebaseAuthRepository implements IAuthRepository {
    async create(data: { email: string, password?: string, name: string }): Promise<{ uid: string, email?: string }> {
        const userRecord = await adminAuth.createUser({ 
            email: data.email, 
            password: data.password, 
            displayName: data.name 
        });
        return { uid: userRecord.uid, email: userRecord.email };
    }

    async updateEmail(userId: string, email: string): Promise<void> {
        await adminAuth.updateUser(userId, { email });
    }

    async updatePassword(userId: string, password: string): Promise<void> {
        await adminAuth.updateUser(userId, { password });
    }

    async deleteUser(userId: string): Promise<void> {
        await adminAuth.deleteUser(userId);
    }

    async verifyToken(token: string): Promise<{ uid: string, email?: string }> {
        const decodedToken = await adminAuth.verifyIdToken(token, true);
        return { uid: decodedToken.uid, email: decodedToken.email };
    }

    async createSessionCookie(idToken: string, options: { expiresIn: number }): Promise<string> {
        return adminAuth.createSessionCookie(idToken, options);
    }
}
