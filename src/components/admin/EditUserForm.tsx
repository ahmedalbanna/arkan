
'use client';

import { useEffect, use, useActionState, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { handleUpdateUser, handleDeleteUser } from '@/app/manage-users/actions';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Trash2, AlertCircle, ArrowLeft, MailQuestion, Upload, Camera } from 'lucide-react';
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks';
import { useLocalization } from '@/context/LocalizationContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useSendPasswordReset } from '@/hooks';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { userKeys } from '@/lib/query-keys';
import type { User } from '@/lib/models/user';

const editUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  bio: z.string().max(300, 'Bio must be 300 characters or less').optional(),
  credits: z.coerce.number().int('Credits must be an integer').min(0, 'Credits cannot be negative'),
  role: z.enum(['user', 'admin']),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

// The async function for deleting a user (for the client-side mutation)
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
    return await response.json();
}

async function uploadProfilePictureApi(variables: { userId: string, file: File, token: string }) {
    const formData = new FormData();
    formData.append('file', variables.file);

    const response = await fetch(`/api/users/${variables.userId}/upload-profile-picture`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${variables.token}`,
        },
        body: formData,
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload image');
    }
    return response.json();
}


export default function EditUserForm({ user }: { user: User }) {
  const { toast } = useToast();
  const { t } = useLocalization();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { firebaseUser, userProfile: currentUserProfile } = useAuth();
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(user.profilePictureUrl || null);


  const [updateState, updateFormAction] = useActionState(handleUpdateUser, { errors: {} });
  const [deleteState, deleteFormAction] = useActionState(handleDeleteUser, { error: '' });

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

  // Handle form state from server actions
  useEffect(() => {
    if (updateState.success) {
      toast({ title: t('editUser.successToastTitle'), description: updateState.message });
    }
    // Check if updateState.errors exists and has the _form property
    if (updateState.errors && '_form' in updateState.errors && typeof updateState.errors._form === 'string') {
      toast({ title: t('editUser.errorToastTitle'), description: updateState.errors._form, variant: 'destructive' });
    }
  }, [updateState, t, toast]);

  useEffect(() => {
    if (deleteState?.error) {
      toast({ title: t('editUser.deleteErrorToastTitle'), description: deleteState.error, variant: 'destructive' });
    }
  }, [deleteState, toast, t]);

  const uploadMutation = useMutation({
    mutationFn: uploadProfilePictureApi,
    onSuccess: (data) => {
        toast({ title: "Image Uploaded", description: "Your profile picture has been updated."});
        setPreviewImageUrl(data.profilePictureUrl);
        queryClient.invalidateQueries({ queryKey: userKeys.profile(user.id) });
    },
    onError: (error: Error) => {
        toast({ title: "Upload Failed", description: error.message, variant: 'destructive' });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      setPreviewImageUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadImage = async () => {
      if (!profileImageFile || !firebaseUser) return;
      const token = await firebaseUser.getIdToken();
      uploadMutation.mutate({ userId: user.id, file: profileImageFile, token });
  }

  // This mutation is kept for client-side actions that don't fit Server Actions well, like deletion with optimistic UI
  const deleteUserMutation = useMutation({
      mutationFn: deleteUserApi,
      onSuccess: () => {
          toast({ title: "User Deleted", description: `User ${user.name} has been successfully deleted.`});
          router.push('/admin/manage-users');
      },
      onError: (error: Error) => {
           toast({ title: t('editUser.deleteErrorToastTitle'), description: error.message, variant: 'destructive' });
      }
  });

  const passwordResetMutation = useSendPasswordReset();

  const onDelete = async () => {
    if (!firebaseUser) return;
    const token = await firebaseUser.getIdToken();
    deleteUserMutation.mutate({ userId: user.id, token });
  };

  const onPasswordReset = () => {
    passwordResetMutation.mutate(user.id);
  };

  const isAdmin = currentUserProfile?.role === 'admin';
  const isPending = deleteUserMutation.isPending || passwordResetMutation.isPending || uploadMutation.isPending;

  return (
    <>
      <Form {...form}>
        <form action={updateFormAction}>
            <input type="hidden" name="userId" value={user.id} />
            <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">{t('editUser.cardTitle')}</CardTitle>
                 <CardDescription>
                    {isAdmin ? "As an admin, you can modify all user fields." : "You can update your personal information here."}
                 </CardDescription>
            </CardHeader>
            <CardContent className="p-6 grid gap-6">
                <div className="flex flex-col items-center gap-4">
                    <Avatar className="h-32 w-32 border-4 border-primary/20">
                        <AvatarImage src={previewImageUrl || undefined} alt={user.name} />
                        <AvatarFallback className="text-4xl">{user.getInitials()}</AvatarFallback>
                    </Avatar>
                    <div className="flex gap-2">
                        <Button asChild variant="outline">
                            <Label htmlFor="profile-picture-upload">
                                <Camera className="me-2 h-4 w-4" />
                                Change Picture
                            </Label>
                        </Button>
                        <Input id="profile-picture-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" />
                         <Button onClick={handleUploadImage} disabled={!profileImageFile || uploadMutation.isPending}>
                            {uploadMutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Upload className="me-2 h-4 w-4" />}
                            Upload
                        </Button>
                    </div>
                </div>

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
                 <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} name={field.name} disabled={!isAdmin || isPending}>
                            <FormControl>
                                <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
            <CardFooter className="justify-between">
                 <Button type="submit" disabled={isPending} className="font-headline">
                    <Save className="me-2 h-4 w-4" />
                    {t('editUser.saveButton')}
                </Button>
                 <Button asChild variant="outline">
                    <Link href="/admin/manage-users">
                        <ArrowLeft className="me-2 h-4 w-4" />
                        Back to Manage Users
                    </Link>
                </Button>
            </CardFooter>
            </Card>
        </form>
      </Form>

      {isAdmin && (
         <div className="mt-8 pt-6 border-t border-destructive/20">
            <h3 className="text-lg font-semibold text-destructive">{t('editUser.dangerZoneTitle')}</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
            {t('editUser.dangerZoneDescription')}
            </p>
            <div className="flex gap-2">
                <Button variant="outline" onClick={onPasswordReset} disabled={isPending}>
                    {passwordResetMutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <MailQuestion className="me-2 h-4 w-4" />}
                    Send Password Reset
                </Button>
                {user.id !== firebaseUser?.uid && (
                    <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" type="button" disabled={isPending}>
                            <Trash2 className="me-2 h-4 w-4" />
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
                            {deleteUserMutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : t('editUser.deleteConfirmButton')}
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
        </div>
      )}
    </>
  );
}
