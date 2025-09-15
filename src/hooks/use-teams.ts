
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks';
import { teamKeys } from '@/lib/query-keys';
import { useAuth } from '@/context/AuthContext';
import { handleErrorUtility } from '@/lib/errorUtils';
import { getAuthenticatedToken } from '@/lib/authUtils';
import {
    createTeam as createTeamApi,
    inviteMember as inviteMemberApi,
    fetchUserTeams,
} from '@/services';
// Import the plain object type for API responses
import type { TeamWithMembers } from '@/services'; 
// Import our new class
import { Team, type TeamProperties } from '@/lib/models/team'; 

/**
 * Fetches the user's teams.
 * Returns instances of the Team CLASS.
 */
export function useTeams() {
    const { firebaseUser } = useAuth();
    const queryInfo = useQuery<TeamWithMembers[], Error, Team[]>({
        queryKey: teamKeys.lists(),
        queryFn: async () => {
            if (!firebaseUser) throw new Error("User not authenticated");
            const token = await firebaseUser.getIdToken();
            return fetchUserTeams(token);
        },
        enabled: !!firebaseUser,
        staleTime: 1000 * 60 * 5, // 5 minutes
        // NEW: Transform the raw data into an array of Team instances
        select: (data: TeamWithMembers[]): Team[] => {
            if (!data) return [];
            return data.map(t => new Team(t as TeamProperties));
        }
    });

    return {
        ...queryInfo,
        // The `data` property from queryInfo is now `Team[] | undefined`
        teams: queryInfo.data,
    }
}


export function useCreateTeam() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();

    return useMutation<TeamProperties, Error, { name: string }>({
        mutationFn: async (variables) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return createTeamApi({ ...variables, token });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
        },
        onError: (error) => {
             handleErrorUtility(error, "Failed to create team");
        }
    });
}

export function useInviteMember() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();

    return useMutation<any, Error, { teamId: string, email: string }>({
        mutationFn: async (variables) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return inviteMemberApi({ ...variables, token });
        },
        onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
        },
         onError: (error) => {
             handleErrorUtility(error, "Failed to invite member");
        }
    })
}
