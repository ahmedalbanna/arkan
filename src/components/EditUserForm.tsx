
'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { UserProfile } from '@/lib/db/queries';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Trash2, AlertCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { useToast } from '@/hooks/use-toast';
import { useLocalization } from '@/context/LocalizationContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { userKeys } from '@/lib/query-keys';

const editUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  bio: z.string().max(300, 'Bio must be 300 characters or less').optional(),
  credits: z.coerce.number().int().min(0, 'Credits cannot be negative'),
  role: z.enum(['user', 'admin']),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

// The async function for the mutation
async function updateUser(variables: { userId: string; data: EditUserFormValues; token: string }) {
    const response = await fetch(`/api/users/${variables.userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${variables.token}`,
        },
        body: JSON.stringify(variables.data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update user');
    }
    return response.json();
}

async function deleteUserApi(variables: { userId: string, token: string }) {
     const response = await fetch(`/api/users/${variables.userId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${variables.token}`,
        },
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete user');
    }
    return response.json();
}


export default function EditUserForm({ user }: { user: UserProfile }) {
  const { toast } = useToast();
  const { t } = useLocalization();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { firebaseUser, userProfile: currentUserProfile } = useAuth();
  
  const form = useForm<EditUserFormValues>({
      resolver: zodResolver(editUserSchema),
      defaultValues: {
        name: user.name,
        email: user.email,
        bio: user.bio ?? '',
        credits: user.credits,
        role: user.role,
      }
  });
  
  const updateUserMutation = useMutation({
      mutationFn: updateUser,
      onSuccess: (updatedUser) => {
          queryClient.invalidateQueries({ queryKey: userKeys.lists() });
          queryClient.setQueryData(userKeys.profile(user.id), updatedUser);
          toast({ title: t('editUser.successToastTitle'), description: t('editUser.successToastDescription') });
      },
      onError: (error: Error) => {
          toast({
            title: t('editUser.errorToastTitle'),
            description: error.message,
            variant: 'destructive',
          });
      }
  });

  const deleteUserMutation = useMutation({
      mutationFn: deleteUserApi,
      onSuccess: () => {
          toast({ title: "User Deleted", description: `User ${user.name} has been successfully deleted.`});
          queryClient.invalidateQueries({ queryKey: userKeys.lists() });
          router.push('/manage-users');
      },
      onError: (error: Error) => {
           toast({ title: t('editUser.deleteErrorToastTitle'), description: error.message, variant: 'destructive' });
      }
  });

  const onSubmit = async (data: EditUserFormValues) => {
      if (!firebaseUser) return;
      const token = await firebaseUser.getIdToken();
      updateUserMutation.mutate({ userId: user.id, data, token });
  };

  const onDelete = async () => {
    if (!firebaseUser) return;
    const token = await firebaseUser.getIdToken();
    deleteUserMutation.mutate({ userId: user.id, token });
  };

  const isAdmin = currentUserProfile?.role === 'admin';
  const isPending = updateUserMutation.isPending || deleteUserMutation.isPending;

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">{t('editUser.cardTitle')}</CardTitle>
                 <CardDescription>
                    {isAdmin ? "As an admin, you can modify all user fields." : "You can update your personal information here."}
                 </CardDescription>
            </CardHeader>
            <CardContent className="p-6 grid gap-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t('editUser.nameLabel')}</FormLabel>
                        <FormControl>
                            <Input {...field} disabled={isPending} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t('editUser.emailLabel')}</FormLabel>
                        <FormControl>
                            <Input type="email" {...field} disabled={!isAdmin || isPending} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t('editUser.bioLabel')}</FormLabel>
                        <FormControl>
                            <Textarea {...field} disabled={isPending} rows={4} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="credits"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t('editUser.creditsLabel')}</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} disabled={!isAdmin || isPending} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
            <CardFooter>
                 <Button type="submit" disabled={isPending} className="font-headline">
                    {updateUserMutation.isPending ? (
                        <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('editUser.savingButton')}
                        </>
                    ) : (
                        <>
                        <Save className="mr-2 h-4 w-4" />
                        {t('editUser.saveButton')}
                        </>
                    )}
                </Button>
            </CardFooter>
            </Card>
        </form>
      </Form>
      
      {isAdmin && user.id !== firebaseUser?.uid && (
         <div className="mt-8 pt-6 border-t border-destructive/20">
            <h3 className="text-lg font-semibold text-destructive">{t('editUser.dangerZoneTitle')}</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
            {t('editUser.dangerZoneDescription')}
            </p>
            <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" type="button" disabled={isPending}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('editUser.deleteUserButton')}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>{t('editUser.deleteDialogTitle')}</AlertDialogTitle>
                <AlertDialogDescription>
                    {t('editUser.deleteDialogDescription')}
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} disabled={deleteUserMutation.isPending}>
                     {deleteUserMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : t('editUser.deleteConfirmButton')}
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
            </AlertDialog>
        </div>
      )}
    </>
  );
}

