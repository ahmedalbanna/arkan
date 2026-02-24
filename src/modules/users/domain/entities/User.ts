
export type UserRole = 'admin' | 'user';

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    credits?: number;
    role: UserRole;
    createdAt: string;
    updatedAt: string;
    bio?: string;
    profilePictureUrl?: string;
    hasCompletedOnboarding?: boolean;
    apiKeys?: Record<string, string>;
    lastDailyCreditUpdate?: string;
}
