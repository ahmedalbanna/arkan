'use client';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useToast } from '@/hooks';
import { teamKeys } from '@/lib/core/query-keys';
import { inviteMember } from '@/services';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const inviteSchema = z.object({
    email: z.string().email('Please enter a valid email address.'),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

export function InviteMemberForm({ teamId }: { teamId: string }) {
    const { toast } = useToast();
    const { t } = useLocalization();
    const { firebaseUser } = useAuth();
    const queryClient = useQueryClient();

    const form = useForm<InviteFormValues>({
        resolver: zodResolver(inviteSchema),
        defaultValues: {
            email: '',
        },
    });

    const mutation = useMutation({
        mutationFn: async (data: InviteMemberData) => {
            const token = await firebaseUser?.getIdToken();
            if (!token) throw new Error('No token available');
            return inviteMember(teamId, data, token);
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
            toast({
                title: t('team.inviteSuccessTitle'),
                description: t('team.inviteSuccessDescription').replace('{email}', variables.email),
            });
            form.reset();
        },
        onError: (error: Error) => {
            toast({
                title: t('team.inviteErrorTitle'),
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    const onSubmit = async (data: InviteFormValues) => {
        if (!firebaseUser) return;
        const token = await firebaseUser.getIdToken();
        mutation.mutate({ teamId, email: data.email, token });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem className="flex-grow">
                            <FormControl>
                                <Input
                                    type="email"
                                    placeholder={t('team.emailPlaceholder')}
                                    {...field}
                                    disabled={mutation.isPending}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
            </form>
        </Form>
    );
}
