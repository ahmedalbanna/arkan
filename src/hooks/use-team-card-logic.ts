
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { useState } from 'react';
import type { TeamWithMembers } from '@/lib/types';

export function useTeamCardLogic(team: TeamWithMembers) {
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const { t } = useLocalization();

    const handleInviteOpen = () => {
        setIsInviteOpen(true);
    };

    return {
        isInviteOpen,
        setIsInviteOpen,
        handleInviteOpen,
        t,
    };
}
