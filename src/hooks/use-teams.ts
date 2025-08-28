'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks';
import { teamKeys,  } from '@/lib/query-keys';
import { useAuth } from '@/context/AuthContext';
import { handleErrorUtility } from '@/lib/errorUtils';
import { getAuthenticatedToken } from '@/lib/authUtils';
import {
    createTeam as createTeamApi,
    inviteMember as inviteMemberApi,
    fetchUserTeams,
} from '@/services';
import type { Team, TeamWithMembers } from '@/lib/types';


export function useTeams() {
    const { firebaseUser } = useAuth();
    return useQuery<TeamWithMembers[]>({
        queryKey: teamKeys.lists(),
        queryFn: async () => {
            if (!firebaseUser) throw new Error("User not authenticated");
            const token = await firebaseUser.getIdToken();
            return fetchUserTeams(token);
        },
        enabled: !!firebaseUser,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}


export function useCreateTeam() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();

    return useMutation<Team, Error, { name: string }>({
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
