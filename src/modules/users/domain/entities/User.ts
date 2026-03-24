import { format } from "date-fns";

export type UserRole = 'admin' | 'user';

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
    apiKeys?: Record<string, string>;
    lastDailyCreditUpdate?: string;
    securitySettings?: SecuritySettings;
    isDisabled?: boolean;
    isTwoFactorEnabled?: boolean;
    twoFactorSecret?: string;
    tokenVersion?: number;
}

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
    public isTwoFactorEnabled: boolean;
    public tokenVersion: number;

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
        this.isTwoFactorEnabled = !!props.isTwoFactorEnabled;
        this.tokenVersion = props.tokenVersion || 1;
    }

    public getInitials(): string {
        if (!this.name) return '?';
        return this.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    
    public getFormattedDate(): string {
        if (!this.createdAt) return 'N/A';
        try {
            return format(new Date(this.createdAt), 'd MMM yyyy');
        } catch {
            return 'N/A';
        }
    }
}
