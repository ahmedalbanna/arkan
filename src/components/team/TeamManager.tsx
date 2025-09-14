
'use client';

import { useTeams } from '@/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion } from '@/components/ui/accordion';
import { TeamCard } from './TeamCard';
import { CreateTeamForm } from './CreateTeamForm';
import { useLocalization } from '@/context/LocalizationContext';
import { Team } from '@/lib/models/team';

function TeamManagerSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
        </div>
    );
}

export default function TeamManager() {
    const { t } = useLocalization();
    const { data: teams, isLoading, isError, error } = useTeams();

    if (isLoading) {
        return <TeamManagerSkeleton />;
    }

    if (isError) {
        return (
            <Card>
                <CardContent className="p-8 text-center text-destructive">
                    <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                    <p>{t('team.errorLoading')}: {error.message}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-8">
            <CreateTeamForm />

            <Accordion type="multiple" className="w-full space-y-4">
                {teams?.map(team => (
                    <TeamCard key={team.id} team={team} />
                ))}
            </Accordion>

            {teams?.length === 0 && (
                <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                        <p>{t('team.noTeams')}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
