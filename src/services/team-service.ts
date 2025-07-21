
'use client';

import { Team, TeamMember } from '@/lib/db/queries';
import { useAuth } from '@/context/AuthContext';

export interface TeamWithMembers extends Team {
    members: (TeamMember & { name: string; email: string; profilePictureUrl?: string; })[];
}

export async function fetchUserTeams(token: string): Promise<TeamWithMembers[]> {
    if (!token) throw new Error('User not authenticated');

    const response = await fetch('/api/teams', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch teams');
    }
    return response.json();
}

export async function createTeam({ name, token }: { name: string, token: string }): Promise<Team> {
    if (!token) throw new Error('User not authenticated');
    
    const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ name }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create team');
    }
    return response.json();
}

export async function inviteMember({ teamId, email, token }: { teamId: string, email: string, token: string }) {
    if (!token) throw new Error('User not authenticated');

    const response = await fetch(`/api/teams/${teamId}/invitations`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to invite member');
    }
    return response.json();
}
