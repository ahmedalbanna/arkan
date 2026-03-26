
'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAdminUpdateUser, useNotifications } from '@/hooks';
import { UserProfile } from '@/modules/users/domain/entities/User';
import { Loader2, Save, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/util/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email address').optional(),
  bio: z.string().optional(),
  credits: z.coerce.number().int().min(0).optional(),
  role: z.enum(['user', 'admin']).optional(),
  hasCompletedOnboarding: z.boolean().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface EditUserFormProps {
  user: UserProfile;
}

export default function EditUserForm({ user }: EditUserFormProps) {
  const { userProfile: adminProfile } = useAuth();
  const { toast } = useToast();
  const updateUserMutation = useAdminUpdateUser();
  const { sendNotification, isSending: isSendingNotification } = useNotifications();

  const [isConfirming, setIsConfirming] = useState(false);
  const [pendingData, setPendingData] = useState<Partial<ProfileFormValues> | null>(null);
  const [notificationMessage, setNotificationMessage] = useState('');

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || '',
      email: user.email || '',
      bio: user.bio || '',
      credits: user.credits || 0,
      role: user.role || 'user',
      hasCompletedOnboarding: user.hasCompletedOnboarding || false,
    },
  });

  useEffect(() => {
    form.reset({
      name: user.name || '',
      email: user.email || '',
      bio: user.bio || '',
      credits: user.credits || 0,
      role: user.role || 'user',
      hasCompletedOnboarding: user.hasCompletedOnboarding || false,
    });
  }, [user, form]);

  function onSubmit(data: ProfileFormValues) {
    const dirtyFields = form.formState.dirtyFields;
    const payload: Partial<ProfileFormValues> = {};

    (Object.keys(dirtyFields) as Array<keyof typeof dirtyFields>).forEach(key => {
        if (dirtyFields[key]) {
            (payload as any)[key] = data[key];
        }
    });

    if (Object.keys(payload).length === 0) {
      toast({ title: 'No Changes', description: 'No changes were made to the user profile.' });
      return;
    }
    setPendingData(payload);
    setIsConfirming(true);
  }

  function handleConfirmUpdate() {
    if (!pendingData) return;

    updateUserMutation.mutate(
      { id: user.id, data: pendingData as any },
      {
        onSuccess: () => {
          if (notificationMessage.trim()) {
            sendNotification({
              userId: user.id,
              title: 'Your Account Has Been Updated',
              description: `An administrator made changes to your account. Reason: "${notificationMessage}"`,
              type: 'info',
              link: `/profile/${user.id}`,
            });
          }
        },
      }
    );
    setIsConfirming(false);
    setNotificationMessage('');
  }

  const isMutating = updateUserMutation.isPending || isSendingNotification;
  const isAdmin = adminProfile?.role === 'admin';

  return (
    <>
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
              <CardDescription>Edit the user's information below.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isMutating} />
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} disabled={!isAdmin || isMutating} />
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
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea {...field} disabled={isMutating} placeholder="A short bio about the user..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {isAdmin && (
                <>
                  <FormField
                    control={form.control}
                    name="credits"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>AI Credits</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} disabled={isMutating} />
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
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isMutating}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
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
                  <FormField
                    control={form.control}
                    name="hasCompletedOnboarding"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Onboarding Completed</FormLabel>
                          <FormDescription>
                            If disabled, the user will see the onboarding guide on their next visit.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isMutating}>
                {isMutating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      <Dialog open={isConfirming} onOpenChange={setIsConfirming}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm and Notify User</DialogTitle>
            <DialogDescription>
              Please provide a reason for the update. This will be sent as a notification to the user.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={notificationMessage}
              onChange={(e) => setNotificationMessage(e.target.value)}
              placeholder="e.g., 'Updated your credits as a reward for your feedback.'"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button onClick={handleConfirmUpdate} disabled={isMutating}>
              {isMutating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Confirm & Notify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
