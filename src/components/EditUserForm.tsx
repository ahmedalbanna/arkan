
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
import { useLocalization } from '@/context/LocalizationContext';

function SubmitButton() {
  const { t } = useLocalization();
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto font-headline">
      {pending ? (
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
  );
}

function DeleteButton() {
  const { t } = useLocalization();
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="destructive" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : t('editUser.deleteConfirmButton')}
    </Button>
  );
}

export default function EditUserForm({ user }: { user: UserProfile }) {
  const { toast } = useToast();
  const { t } = useLocalization();
  
  const [updateState, updateFormAction] = useActionState(handleUpdateUser, { errors: {} });
  const [deleteState, deleteFormAction] = useActionState(handleDeleteUser, {});

  useEffect(() => {
    if (updateState?.success) {
      toast({ title: t('editUser.successToastTitle'), description: t('editUser.successToastDescription') });
    }
    if (updateState?.errors?._form) {
      toast({
        title: t('editUser.errorToastTitle'),
        description: updateState.errors._form,
        variant: 'destructive',
      });
    }
  }, [updateState, toast, t]);

  useEffect(() => {
    if (deleteState?.error) {
      toast({ title: t('editUser.deleteErrorToastTitle'), description: deleteState.error, variant: 'destructive' });
    }
  }, [deleteState, toast, t]);

  return (
    <>
      <form action={updateFormAction}>
        <input type="hidden" name="userId" value={user.id} />
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">{t('editUser.cardTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid gap-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">{t('editUser.nameLabel')}</Label>
                <Input id="name" name="name" defaultValue={user.name} required />
                {updateState.errors?.name && <p className="text-sm text-destructive">{updateState.errors.name[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('editUser.emailLabel')}</Label>
                <Input id="email" name="email" defaultValue={user.email} type="email" required />
                {updateState.errors?.email && <p className="text-sm text-destructive">{updateState.errors.email[0]}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">{t('editUser.bioLabel')}</Label>
              <Textarea id="bio" name="bio" defaultValue={user.bio ?? ''} rows={4} />
              {updateState.errors?.bio && <p className="text-sm text-destructive">{updateState.errors.bio[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="credits">{t('editUser.creditsLabel')}</Label>
              <Input id="credits" name="credits" defaultValue={user.credits} type="number" required />
              {updateState.errors?.credits && <p className="text-sm text-destructive">{updateState.errors.credits[0]}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-4 p-6 border-t">
            {updateState.errors?._form && (
              <p className="text-sm font-medium text-destructive">{updateState.errors._form}</p>
            )}
            <SubmitButton />
          </CardFooter>
        </Card>
      </form>
      <div className="mt-8 pt-6 border-t border-destructive/20">
        <h3 className="text-lg font-semibold text-destructive">{t('editUser.dangerZoneTitle')}</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          {t('editUser.dangerZoneDescription')}
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" type="button">
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
              <AlertDialogCancel>{t('editUser.cancelButton')}</AlertDialogCancel>
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
