
'use client';

import { useAuth } from '@/context/AuthContext';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { teamKeys } from '@/lib/core/query-keys';
import { handleErrorUtility } from '@/lib/errorUtils';
import {
    createTeam as createTeamApi,
    inviteMember as inviteMemberApi
} from '@/services';
import { useMutation, useQuery, useQueryClient as useTanstackQueryClient } from '@tanstack/react-query';
// Import our new class
import app from '@/lib/core/firebase/client-init';
import { Team, type TeamProperties, TeamWithMembers } from '@/lib/models/team';
import type { TeamMember } from '@/lib/models/user';
import { collection, getDocs, getFirestore, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect } from 'react';

export { type TeamWithMembers };

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
        const q = query(teamsCollectionRef, where("memberIds", "array-contains", firebaseUser.uid));

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const teamPromises = snapshot.docs.map(async (doc) => {
                const teamData = { id: doc.id, ...doc.data() } as TeamProperties;
                const membersCollectionRef = collection(doc.ref, 'members');
                const membersSnapshot = await getDocs(membersCollectionRef);
                const members = membersSnapshot.docs.map(memberDoc => memberDoc.data() as TeamMember);
                teamData.members = members;
                return new Team(teamData);
            });

            const teams = await Promise.all(teamPromises);
            teams.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            queryClient.setQueryData(queryKey, teams);

        }, (error) => {
            console.error("Error listening to teams collection:", error);
            handleErrorUtility(error, "Failed to fetch real-time team data");
        });

        return () => unsubscribe();

    }, [firebaseUser, queryClient, queryKey]);

    // The component will use the data from the cache, which is kept up-to-date
    return useQuery<Team[]>({queryKey, 
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
    const queryClient = useTanstackQueryClient();
    const { firebaseUser } = useAuth();

    return useMutation<TeamProperties, Error, { name: string }>({
        mutationFn: async ({ name }) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return createTeamApi({ name, token });
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
    const queryClient = useTanstackQueryClient();
    const { firebaseUser } = useAuth();

    return useMutation<any, Error, { teamId: string, email: string }>({
        mutationFn: async ({ teamId, email }) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return inviteMemberApi({ teamId, email, token });
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: teamKeys.members(variables.teamId) });
        },
        onError: (error) => {
            handleErrorUtility(error, "Failed to invite member");
        }
    })
}
