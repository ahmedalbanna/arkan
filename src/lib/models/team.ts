
import { User } from './user';
import type { TeamWithMembers, TeamMember } from '@/lib/types';

// The properties for our class constructor will be the API response type
export interface TeamProperties {
    id: string;
    name: string;
    ownerId: string;
    createdAt: string;
    members: TeamMember[];
}

export class Team {
    public id: string;
    public name: string;
    public ownerId: string;
    public createdAt: string;
    public members: User[]; // This will hold instances of the User class

    constructor(props: TeamProperties) {
        this.id = props.id;
        this.name = props.name;
        this.ownerId = props.ownerId;
        this.createdAt = props.createdAt;

        // When a Team is instantiated, transform the plain member objects
        // from the API into instances of the User class.
        this.members = (props.members || []).map(memberData => new User(memberData as TeamMember));
    }

    /**
     * Adds a new member to the team locally.
     * Note: In a real app, this would be followed by an API call.
     * @param user The User object to add.
     */
    public addMember(user: User): void {
        if (!this.members.find(m => m.id === user.id)) {
            this.members.push(user);
        }
    }

    /**
     * Removes a member from the team locally by their ID.
     * @param userId The ID of the user to remove.
     */
    public removeMember(userId: string): void {
        this.members = this.members.filter(m => m.id !== userId);
    }

    /**
     * Get the User instance for the team owner.
     */
    public getOwner(): User | undefined {
        return this.members.find(m => m.id === this.ownerId);
    }
}
