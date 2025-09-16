import type { LucideIcon } from 'lucide-react';

// --- Types moved from types.ts ---

export type UserRole = 'admin' | 'user' | 'owner' | 'member' | 'team_lead';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  credits?: number;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  teams?: string[];
  bio?: string;
  profilePictureUrl?: string;
  hasCompletedOnboarding?: boolean;
}

export interface TeamMember {
  userId: string;
  teamId: string;
  role: 'owner' | 'member';
  joinedAt: string;
  name: string;
  email: string;
  profilePictureUrl?: string;
}

// --- End of moved types ---


// The properties can be a union of UserProfile and a modified TeamMember
// This allows constructing a User object from different data sources.
export type UserProperties = Partial<UserProfile> & Partial<Omit<TeamMember, 'userId' | 'role'> & { id?: string, role?: UserRole }>;

export class User {
    public id: string;
    public name: string;
    public email: string;
    public role: UserRole;
    public credits?: number;
    public createdAt: string;
    public updatedAt: string;
    public teams?: string[];
    public bio?: string;
    public profilePictureUrl?: string;
    public hasCompletedOnboarding?: boolean;

    constructor(props: UserProperties) {
        // The ID can come from `id` (UserProfile) or `userId` (TeamMember)
        this.id = props.id || (props as any).userId || '';
        this.name = props.name || 'Unknown User';
        this.email = props.email || '';
        this.role = props.role || 'user';
        this.credits = props.credits;
        this.createdAt = props.createdAt || '';
        this.updatedAt = props.updatedAt || '';
        this.teams = props.teams;
        this.bio = props.bio;
        this.profilePictureUrl = props.profilePictureUrl;
        this.hasCompletedOnboarding = props.hasCompletedOnboarding;
    }

    /**
     * Returns the user's initials, useful for avatars.
     */
    public getInitials(): string {
        if (!this.name) return '?';
        return this.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
}
