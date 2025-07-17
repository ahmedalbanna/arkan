
'use client';

import { useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { handleUpdateUser, handleDeleteUser } from '@/app/manage-users/actions';
import type { UserProfile } from '@/lib/db/queries';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Trash2 } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto font-headline">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Saving...
        </>
      ) : (
        <>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </>
      )}
    </Button>
  );
}

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="destructive" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Yes, delete user'}
    </Button>
  );
}

export default function EditUserForm({ user }: { user: UserProfile }) {
  const { toast } = useToast();
  
  const [updateState, updateFormAction] = useActionState(handleUpdateUser, { errors: {} });
  const [deleteState, deleteFormAction] = useActionState(handleDeleteUser, {});

  useEffect(() => {
    if (updateState?.success) {
      toast({ title: 'Success', description: 'User has been updated successfully.' });
    }
    if (updateState?.errors?._form) {
      // Use toast for consistent form-level error feedback
      toast({
        title: 'Error updating user',
        description: updateState.errors._form,
        variant: 'destructive',
      });
    }
  }, [updateState, toast]);

  useEffect(() => {
    if (deleteState?.error) {
      toast({ title: 'Error deleting user', description: deleteState.error, variant: 'destructive' });
    }
  }, [deleteState, toast]);

  return (
    <>
      <form action={updateFormAction}>
        <input type="hidden" name="userId" value={user.id} />
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">User Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid gap-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" defaultValue={user.name} required />
                {updateState.errors?.name && <p className="text-sm text-destructive">{updateState.errors.name[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" defaultValue={user.email} type="email" required />
                {updateState.errors?.email && <p className="text-sm text-destructive">{updateState.errors.email[0]}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" name="bio" defaultValue={user.bio ?? ''} rows={4} />
              {updateState.errors?.bio && <p className="text-sm text-destructive">{updateState.errors.bio[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="credits">AI Credits</Label>
              <Input id="credits" name="credits" defaultValue={user.credits} type="number" required />
              {updateState.errors?.credits && <p className="text-sm text-destructive">{updateState.errors.credits[0]}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-4 p-6 border-t">
            {/* The form-level error is now handled by the toast, but we can keep this as a fallback if needed */}
            {updateState.errors?._form && (
              <p className="text-sm font-medium text-destructive">{updateState.errors._form}</p>
            )}
            <SubmitButton />
          </CardFooter>
        </Card>
      </form>
      <div className="mt-8 pt-6 border-t border-destructive/20">
        <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Deleting a user is permanent and cannot be undone. All their projects and comments will be deleted.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" type="button">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete User
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the user and all of their associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <form action={deleteFormAction}>
                <input type="hidden" name="userId" value={user.id} />
                <DeleteButton />
              </form>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
