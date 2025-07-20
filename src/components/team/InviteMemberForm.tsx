'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { teamKeys } from '@/lib/query-keys';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { inviteMember } from '@/services/team-service';
import { useLocalization } from '@/context/LocalizationContext';

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
        mutationFn: inviteMember,
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
            toast({
                title: t('team.inviteSuccessTitle'),
                description: t('team.inviteSuccessDescription', { email: variables.email }),
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
