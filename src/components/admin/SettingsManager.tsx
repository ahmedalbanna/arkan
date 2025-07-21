
'use client';

import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, DatabaseZap } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';

async function triggerSync(secret: string | undefined): Promise<{ message: string }> {
    if (!secret) {
        throw new Error("Sync secret is not configured in the client environment.");
    }
    const response = await fetch('/api/sync/firestore-to-sqlite', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${secret}`
        },
    });

    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || 'Failed to trigger synchronization.');
    }
    return result;
}

export default function SettingsManager() {
    const { t } = useLocalization();
    const { toast } = useToast();

    const syncMutation = useMutation({
        mutationFn: () => triggerSync(process.env.NEXT_PUBLIC_SYNC_SECRET),
        onSuccess: (data) => {
            toast({
                title: t('adminSettings.syncSuccessTitle'),
                description: data.message,
            });
        },
        onError: (error: Error) => {
            toast({
                title: t('adminSettings.syncErrorTitle'),
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('adminSettings.dataSyncTitle')}</CardTitle>
                <CardDescription>{t('adminSettings.dataSyncDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    {t('adminSettings.dataSyncWarning')}
                </p>
            </CardContent>
            <CardFooter>
                <Button onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending}>
                    {syncMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <DatabaseZap className="mr-2 h-4 w-4" />
                    )}
                    {t('adminSettings.triggerSyncButton')}
                </Button>
            </CardFooter>
        </Card>
    );
}
