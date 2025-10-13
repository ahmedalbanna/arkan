'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { teamKeys } from '@/core/utils/query-keys';
import { useToast } from '@/hooks';
import { createTeam } from '@/services';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, PlusCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';


const createTeamSchema = z.object({
    name: z.string().min(3, 'Team name must be at least 3 characters long.'),
});

type CreateTeamFormValues = z.infer<typeof createTeamSchema>;

export function CreateTeamForm() {
    const { firebaseUser } = useAuth();
    const { toast } = useToast();
    const { t } = useLocalization();
    const queryClient = useQueryClient();

    const form = useForm<CreateTeamFormValues>({
        resolver: zodResolver(createTeamSchema),
        defaultValues: {
            name: '',
        },
    });

    const mutation = useMutation({
        mutationFn: async (data: CreateTeamData) => {
            const token = await firebaseUser?.getIdToken();
            if (!token) throw new Error('No token available');
            return createTeam(data, token);
        },
        onSuccess: () => {
            toast({
                title: t('team.createSuccessTitle'),
                description: t('team.createSuccessDescription'),
            });
            queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
            form.reset();
        },
        onError: (error: Error) => {
            toast({
                title: t('team.createErrorTitle'),
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    const onSubmit = async (data: CreateTeamFormValues) => {
        if (!firebaseUser) return;
        const token = await firebaseUser.getIdToken();
        mutation.mutate({ name: data.name, token });
    };

    return (
        <Card>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardHeader>
                        <CardTitle>{t('team.createTeamTitle')}</CardTitle>
                        <CardDescription>{t('team.createTeamDescription')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('team.teamNameLabel')}</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder={t('team.teamNamePlaceholder')} disabled={mutation.isPending} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <PlusCircle className="me-2 h-4 w-4" />}
                            {t('team.createButton')}
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
}
