'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { useAdminUpdateUser, useNotifications } from '@/hooks';
import { useToast } from '@/hooks/util/use-toast';
import { cn } from '@/infrastructure/utils/cn';


import { zodResolver } from '@hookform/resolvers/zod';
import { Activity, CheckCircle2, Gem, Globe, Loader2, ShieldCheck, User as UserIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Invalid email address.'),
  bio: z.string().optional(),
  credits: z.coerce.number().int().min(0),
  role: z.enum(['user', 'admin']),
  hasCompletedOnboarding: z.boolean(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface EditUserFormProps {
  user: any;
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

  return (
    <>
      <Card className="border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px] animate-in fade-in duration-700">
        <header className="px-8 py-6 border-b bg-muted/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
              Identity Reconfiguration Manifest
            </h3>
          </div>
          <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-bold border-primary/20 text-primary bg-primary/5">
            Registry Active
          </Badge>
        </header>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 md:p-10 space-y-10">
            <div className="grid gap-10">
              {/* Core Identity Matrix */}
              <div className="space-y-6">
                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 flex items-center gap-2">
                  <UserIcon className="h-3 w-3 text-primary" />
                  Core Identity Matrix
                </Label>
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Legal Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input {...field} disabled={isMutating} className="h-11 pl-10 text-xs bg-muted/5 border-none shadow-inner focus-visible:ring-1 rounded-xl" />
                            <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
                          </div>
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Secure Endpoint</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input type="email" {...field} disabled={isMutating} className="h-11 pl-10 text-xs bg-muted/5 border-none shadow-inner focus-visible:ring-1 rounded-xl" />
                            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
                          </div>
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Identity Abstract</FormLabel>
                      <FormControl>
                        <Textarea {...field} disabled={isMutating} rows={3} className="text-xs bg-muted/5 border-none shadow-inner focus-visible:ring-1 resize-none p-4 leading-relaxed rounded-2xl border-dashed" />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
              </div>

              <Separator className="bg-border/40" />

              {/* Quota & Role Protocol */}
              <div className="space-y-6">
                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 flex items-center gap-2">
                  <ShieldCheck className="h-3 w-3 text-primary" />
                  Quota & Role Protocol
                </Label>
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="credits"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Neural Quota</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input type="number" {...field} disabled={isMutating} className="h-11 pl-10 text-xs bg-muted/5 border-none shadow-inner focus-visible:ring-1 rounded-xl font-bold tabular-nums" />
                            <Gem className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
                          </div>
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">System Privilege</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isMutating}>
                          <FormControl>
                            <SelectTrigger className="h-11 bg-muted/5 border-none shadow-inner rounded-xl text-xs">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl border-border/40 shadow-xl">
                            <SelectItem value="user" className="text-xs">Standard Node</SelectItem>
                            <SelectItem value="admin" className="text-xs">Privileged Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator className="bg-border/40" />

              {/* Automation Toggles */}
              <div className="space-y-6">
                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 flex items-center gap-2">
                  <Activity className="h-3 w-3 text-primary" />
                  Sequence Status
                </Label>
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="hasCompletedOnboarding"
                    render={({ field }) => (
                      <div className={cn(
                        "flex items-center justify-between p-5 rounded-2xl border transition-all duration-300",
                        field.value ? "bg-primary/[0.02] border-primary/20 shadow-sm" : "bg-muted/5 border-border/40"
                      )}>
                        <div className="space-y-0.5">
                          <span className="text-[11px] font-bold tracking-tight">Induction Complete</span>
                          <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Protocol Tutorial Tour</p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isMutating}
                            className="scale-90"
                          />
                        </FormControl>
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="pt-8 flex justify-end">
              <Button type="submit" disabled={isMutating} className="font-bold h-12 px-10 gap-3 rounded-xl shadow-xl shadow-primary/20 transition-all active:scale-95">
                {isMutating ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                Commit Modifications
              </Button>
            </div>
          </form>
        </Form>

        <footer className="px-8 py-4 border-t bg-muted/5 flex items-center justify-between">
          <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest">
            Arkan Identity Engine • Registry Node V1.0 Stable
          </p>
          <div className="flex items-center gap-2 opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-[8px] font-bold uppercase tracking-tighter">Registry Integrity Verified</span>
          </div>
        </footer>
      </Card>

      <AlertDialog open={isConfirming} onOpenChange={setIsConfirming}>
        <AlertDialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-[32px] bg-background">
          <header className="px-8 py-6 border-b bg-muted/5 flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <AlertDialogTitle className="text-xl font-bold font-headline tracking-tight leading-none text-foreground/90 uppercase tracking-widest">Modification Authorization</AlertDialogTitle>
          </header>

          <div className="p-8 space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-primary/[0.03] border border-primary/20">
              <div className="h-12 w-12 rounded-xl bg-background border flex items-center justify-center shadow-sm">
                <UserIcon className="h-6 w-6 text-primary/60" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Target Subject</span>
                <span className="text-sm font-bold truncate tracking-tight">{user.name}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="notification-message" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Administrative Rationale (Optional)</Label>
              <Textarea
                id="notification-message"
                placeholder="Explain the technical requirement for these modifications..."
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                rows={3}
                className="text-xs bg-muted/5 border-none shadow-inner focus-visible:ring-1 resize-none p-4 leading-relaxed rounded-2xl border-dashed"
              />
              <p className="text-[9px] text-muted-foreground italic px-2 leading-relaxed">
                If provided, this manifest summary will be transmitted to the subject as a system notification.
              </p>
            </div>
          </div>

          <footer className="px-8 py-6 border-t bg-muted/5 flex items-center justify-between">
            <AlertDialogCancel className="h-10 px-6 rounded-xl text-[10px] font-bold uppercase tracking-widest">Abort</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmUpdate}
              disabled={isMutating}
              className="h-10 px-8 rounded-xl font-bold shadow-xl shadow-primary/20 gap-2 active:scale-95 transition-all"
            >
              <CheckCircle2 className="h-4 w-4" />
              Authorize Modification
            </AlertDialogAction>
          </footer>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
