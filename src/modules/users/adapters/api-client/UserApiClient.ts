
import { injectable } from "tsyringe";
import { apiService } from "@/infrastructure/api/ApiService";
import { UserProfile } from "../../domain/entities/User";
import { doc, onSnapshot, type Firestore } from "firebase/firestore";

@injectable()
export class UserApiClient {
    async fetchUserById(id: string, token: string): Promise<UserProfile> {
        return apiService({ endpoint: `/api/users/${id}`, token });
    }

    async fetchUserProfile(id: string, token: string): Promise<UserProfile> {
        return this.fetchUserById(id, token);
    }

    async updateUser(id: string, data: Partial<UserProfile>, token: string): Promise<UserProfile> {
        return apiService({
            endpoint: `/api/users/${id}`,
            method: 'PUT',
            data,
            token
        });
    }

    async getPaginatedUsers(options: { limit: number, lastVisibleId?: string }, token: string) {
        const params = new URLSearchParams();
        params.append('limit', options.limit.toString());
        if (options.lastVisibleId) params.append('lastVisibleId', options.lastVisibleId);
        
        return apiService({ 
            endpoint: `/api/admin/users?${params.toString()}`, 
            token 
        });
    }

    async createUser(data: any, token: string) {
        return apiService({
            endpoint: '/api/admin/users',
            method: 'POST',
            data,
            token
        });
    }

    async adminUpdateUser(id: string, data: Partial<UserProfile>, token: string): Promise<UserProfile> {
        return apiService({
            endpoint: `/api/admin/users/${id}`,
            method: 'PUT',
            data,
            token
        });
    }

    async deleteUser(id: string, token: string): Promise<{ message: string }> {
        return apiService({
            endpoint: `/api/admin/users/${id}`,
            method: 'DELETE',
            token
        });
    }

    async sendNotification(variables: any, token: string): Promise<{ messageId: string }> {
        return apiService({
            endpoint: '/api/admin/notifications/send',
            method: 'POST',
            data: variables,
            token
        });
    }

    subscribeToUserProfile(userId: string, firestore: Firestore, callback: (user: UserProfile | null) => void) {
        // Pass firestore instance from outside to avoid mixed library versions
        if (typeof window === 'undefined' || !firestore) {
            return () => {}; 
        }

        const userDocRef = doc(firestore, "users", userId);

        const unsubscribe = onSnapshot(userDocRef, (snapshot: any) => {
            if (snapshot.exists()) {
                callback({ id: snapshot.id, ...snapshot.data() } as UserProfile);
            } else {
                callback(null);
            }
        }, (error: any) => {
            console.error("Error listening to user profile:", error);
            callback(null);
        });

        return unsubscribe;
    }
}
