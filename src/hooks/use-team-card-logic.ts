
'use client';

import { useAuth } from '@/context/AuthContext';
import type { Team } from '@/lib/models/team';
import { useMemo } from 'react';

export function useTeamCardLogic(team: Team) {
  const { firebaseUser } = useAuth();

  // Memoize the isOwner check to prevent re-calculation on every render
  const isOwner = useMemo(() => team.ownerId === firebaseUser?.uid, [team, firebaseUser]);

  // Memoize the sorted members list
  const members = useMemo(() => team.members.sort((a, b) => a.name.localeCompare(b.name)), [team.members]);

  return { isOwner, members };
}
