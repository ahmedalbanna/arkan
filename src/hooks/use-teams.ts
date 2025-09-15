
'use client';

import { useQuery, useMutation, useQueryClient, useQueryClient as useTanstackQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks';
import { teamKeys } from '@/lib/query-keys';
import { useAuth } from '@/context/AuthContext';
import { handleErrorUtility } from '@/lib/errorUtils';
import { getAuthenticatedToken } from '@/lib/authUtils';
import {
    createTeam as createTeamApi,
    inviteMember as inviteMemberApi,
    fetchUserTeams as fetchUserTeamsApi,
} from '@/services';
// Import the plain object type for API responses
import type { TeamWithMembers, TeamMember } from '@/services'; 
// Import our new class
import { Team, type TeamProperties } from '@/lib/models/team'; 
import { useEffect } from 'react';
import { getFirestore, collection, onSnapshot, query, where } from 'firebase/firestore';
import { app } from '@/lib';

/**
 * Fetches the user's teams in real-time.
 * Returns instances of the Team CLASS.
 */
export function useTeams() {
    const { firebaseUser } = useAuth();
    const queryClient = useTanstackQueryClient();
    const queryKey = teamKeys.lists();

    useEffect(() => {
        if (!firebaseUser) {
            queryClient.setQueryData(queryKey, []);
            return;
        }

        const teamsCollectionRef = collection(getFirestore(app), 'teams');
        // Listen to teams where the current user is a member
        const q = query(teamsCollectionRef, where('memberIds', 'array-contains', firebaseUser.uid));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const teams: Team[] = [];
            const memberPromises: Promise<any>[] = [];

            snapshot.forEach(doc => {
                const teamData = { id: doc.id, ...doc.data() } as TeamProperties;
                const membersCollectionRef = collection(doc.ref, 'members');
                // Fetch members for each team
                const promise = getDocs(membersCollectionRef).then(membersSnapshot => {
                    const members = membersSnapshot.docs.map(memberDoc => memberDoc.data() as TeamMember);
                    teamData.members = members;
                    teams.push(new Team(teamData));
                });
                memberPromises.push(promise);
            });
            
            // Once all members for all teams are fetched, update the query cache
            Promise.all(memberPromises).then(() => {
                 teams.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                 queryClient.setQueryData(queryKey, teams);
            });
        }, (error) => {
            console.error("Error listening to teams collection:", error);
            handleErrorUtility(error, "Failed to fetch real-time team data");
        });

        return () => unsubscribe();

    }, [firebaseUser, queryClient, queryKey]);

    // The component will use the data from the cache, which is kept up-to-date
    return useQuery<Team[]>({
        queryKey: queryKey,
        queryFn: async () => {
            // Initial fetch can still happen here if needed, but listener will keep it fresh
            const existingData = queryClient.getQueryData<Team[]>(queryKey);
            return existingData || [];
        },
        staleTime: Infinity, // Data is live, so it's always "fresh"
        enabled: !!firebaseUser,
    });
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
            // Invalidation might not be strictly necessary with the real-time listener,
            // but it's good practice to ensure immediate consistency.
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
             // Invalidation will trigger a refetch, but the real-time listener will also update.
             queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
        },
         onError: (error) => {
             handleErrorUtility(error, "Failed to invite member");
        }
    })
}

    