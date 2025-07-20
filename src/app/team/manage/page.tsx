'use client';

import TeamManager from '@/components/team/TeamManager';
import { useLocalization } from '@/context/LocalizationContext';
import { Users } from 'lucide-react';

export default function ManageTeamPage() {
  const { t } = useLocalization();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <Users className="w-10 h-10" />
          {t('team.manageTeams')}
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          {t('team.manageTeamsSubtitle')}
        </p>
      </div>
      <TeamManager />
    </div>
  );
}
