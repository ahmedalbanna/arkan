'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useUpdateUser } from '@/hooks';
import { UserProfile } from '@/modules/users/domain/entities/User';
import { Globe, Loader2, Save, UserIcon } from 'lucide-react';
import { useEffect } from 'react';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface UpdateProfileFormProps {
  userProfile: UserProfile;
}

export function UpdateProfileForm({ userProfile }: UpdateProfileFormProps) {
  const updateUserMutation = useUpdateUser();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: userProfile.name,
      email: userProfile.email,
    },
  });

  useEffect(() => {
    form.reset({
      name: userProfile.name,
      email: userProfile.email,
    });
  }, [userProfile, form]);

  const onSubmit = (data: ProfileFormValues) => {
    updateUserMutation.mutate({ id: userProfile.id, data });
  };

  return (
    <Card className="border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px]">
      <header className="px-8 py-6 border-b bg-muted/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                Personal Matrix
            </h3>
        </div>
      </header>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 md:p-10 space-y-8">
          <div className="grid gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Identity Display</FormLabel>
                  <FormControl>
                    <div className="relative">
                        <Input {...field} disabled={updateUserMutation.isPending} className="h-11 pl-10 text-xs bg-muted/5 border-none ring-1 ring-border/40 focus-visible:ring-primary/40 rounded-xl" />
                        <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
                    </div>
                  </FormControl>
                  <FormMessage />
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
                        <Input type="email" {...field} disabled={updateUserMutation.isPending} className="h-11 pl-10 text-xs bg-muted/5 border-none ring-1 ring-border/40 focus-visible:ring-primary/40 rounded-xl" />
                        <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="pt-4 flex justify-end">
            <Button
                type="submit"
                disabled={updateUserMutation.isPending}
                className="font-bold h-11 px-8 gap-2 rounded-xl shadow-xl shadow-primary/20 transition-all active:scale-95"
            >
              {updateUserMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Commit Changes
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
