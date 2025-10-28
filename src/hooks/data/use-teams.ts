
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks';
import { fetchUserTeams, createTeam, inviteMember } from '@/services';
import type { TeamWithMembers } from '@/lib/types';
import { TeamProperties } from '@/lib/models';


export function useTeams() {
    const { firebaseUser, isLoading: authLoading } = useAuth();

    return useQuery<TeamWithMembers[]>({
        queryKey: ['teams', firebaseUser?.uid],
        queryFn: async () => {
            if (!firebaseUser) return [];
            const token = await firebaseUser.getIdToken();
            return fetchUserTeams(token);
        },
        enabled: !authLoading && !!firebaseUser,
    });
}

export function useCreateTeam() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();

    return useMutation<TeamProperties, Error, { name: string }>({
        mutationFn: async ({ name }) => {
            if (!firebaseUser) throw new Error('User not authenticated');
            const token = await firebaseUser.getIdToken();
            return createTeam({ name, token });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams', firebaseUser?.uid] });
            toast({ title: "Team Created", description: "Your new team has been successfully created." });
        },
        onError: (error) => {
            toast({ title: 'Creation Failed', description: error.message, variant: 'destructive' });
        }
    });
}


export function useInviteMember() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();

    return useMutation({
        mutationFn: async (variables: { teamId: string; email: string }) => {
            if (!firebaseUser) throw new Error('User not authenticated');
            const token = await firebaseUser.getIdToken();
            return inviteMember({ ...variables, token });
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['teams', firebaseUser?.uid] });
            toast({ title: "Invitation Sent", description: `An invitation has been sent to ${variables.email}.` });
        },
        onError: (error: Error) => {
             toast({ title: 'Invitation Failed', description: error.message, variant: 'destructive' });
        }
    });
}
