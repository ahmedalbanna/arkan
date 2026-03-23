

import { format } from "date-fns";

// --- Types moved from types.ts ---

export type UserRole = 'admin' | 'user'; // Removed team-specific roles

export interface SecuritySettings {
    enableLoginAlerts: boolean;
}

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
    apiKeys?: Record<string, string>; // To store keys for services like 'gemini', 'chatgpt'
    lastDailyCreditUpdate?: string; // Timestamp for the last daily credit refresh
    securitySettings?: SecuritySettings;
    isDisabled?: boolean;
}

// TeamMember is no longer needed
// export interface TeamMember { ... }

// --- End of moved types ---

export type UserProperties = Partial<UserProfile> & { id?: string };

export class User {
    public id: string;
    public name: string;
    public email: string;
    public role: UserRole;
    public credits?: number;
    public createdAt: string;
    public updatedAt: string;
    public bio?: string;
    public profilePictureUrl?: string;
    public hasCompletedOnboarding?: boolean;
    public apiKeys?: Record<string, string>;
    public readonly lastDailyCreditUpdate?: string;
    public securitySettings: SecuritySettings;
    public isDisabled: boolean;

    constructor(props: UserProperties) {
        this.id = props.id || '';
        this.name = props.name || 'Unknown User';
        this.email = props.email || '';
        this.role = props.role || 'user';
        this.credits = props.credits;
        this.createdAt = props.createdAt || '';
        this.updatedAt = props.updatedAt || '';
        this.bio = props.bio;
        this.profilePictureUrl = props.profilePictureUrl;
        this.hasCompletedOnboarding = props.hasCompletedOnboarding;
        this.apiKeys = props.apiKeys;
        this.lastDailyCreditUpdate = props.lastDailyCreditUpdate;
        this.securitySettings = props.securitySettings || { enableLoginAlerts: true };
        this.isDisabled = !!props.isDisabled;
    }

    /**
     * Returns the user's initials, useful for avatars.
     */
    public getInitials(): string {
        if (!this.name) return '?';
        return this.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    
    /**
     * Returns a formatted string for the creation date.
     */
    public getFormattedDate(): string {
        if (!this.createdAt) return 'N/A';
        return format(new Date(this.createdAt), 'd MMM yyyy');
    }
}
