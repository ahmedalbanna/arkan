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
import { Globe, Loader2, Save, UserIcon, ShieldAlert } from 'lucide-react';
import { useEffect } from 'react';

/**
 * UpdateProfileForm — High-fidelity identity configuration for the user matrix.
 * 
 * DEFENSIVE MEASURES:
 * 1. Existence Guards: Checks for userProfile before rendering core form logic.
 * 2. Submission Containment: Wraps mutation trigger in try-catch logic.
 * 3. Lifecycle Integrity: Correctly resets form state when profile data shifts.
 * 4. Technical Aesthetic: Standardized dot grids and stable version manifests.
 */

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface UpdateProfileFormProps {
  userProfile: UserProfile | null;
}

export function UpdateProfileForm({ userProfile }: UpdateProfileFormProps) {
  const updateUserMutation = useUpdateUser();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: userProfile?.name || '',
      email: userProfile?.email || '',
    },
  });

  // 1. FORM INTEGRITY — Synchronize with profile shifts
  useEffect(() => {
    if (userProfile) {
      form.reset({
        name: userProfile.name,
        email: userProfile.email,
      });
    }
  }, [userProfile, form]);

  // 2. SUBMISSION VECTOR — Guarded persistence logic
  const onSubmit = async (data: ProfileFormValues) => {
    if (!userProfile?.id) return;
    
    try {
        updateUserMutation.mutate({ id: userProfile.id, data });
    } catch (error) {
        console.error('[UpdateProfileForm] Mutation transmission failure:', error);
    }
  };

  if (!userProfile) {
    return (
        <Card className="border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px] p-12 text-center opacity-40">
            <div className="p-6 rounded-[24px] bg-primary/5 border border-dashed border-primary/20 shadow-inner w-fit mx-auto mb-4">
                <ShieldAlert className="h-10 w-10 text-primary/40" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Identity Node Offline</p>
        </Card>
    );
  }

  return (
    <Card className="border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px] relative">
      {/* Dot-grid atmosphere — Standardized alignment (28px) */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(circle_at_center,_var(--primary)_1px,_transparent_1px)] bg-[size:28px_28px]" />

      <header className="px-8 py-6 border-b bg-muted/5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                Personal Matrix
            </h3>
        </div>
      </header>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 md:p-10 space-y-8 relative z-10">
          {/* Depth architectural line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary/20 via-primary/5 to-transparent" />

          <div className="grid gap-8 pl-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Identity Display</FormLabel>
                  <FormControl>
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-transparent rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
                        <Input 
                            {...field} 
                            disabled={updateUserMutation.isPending} 
                            placeholder="Primary Identifier..."
                            className="relative h-11 pl-10 text-[11px] font-bold bg-muted/5 border-primary/10 focus-visible:ring-primary/20 rounded-xl transition-all shadow-inner uppercase tracking-wider" 
                        />
                        <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40 group-focus-within:text-primary transition-colors" />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[9px] font-bold italic text-destructive/80" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Secure Endpoint</FormLabel>
                  <FormControl>
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-transparent rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
                        <Input 
                            type="email" 
                            {...field} 
                            disabled={updateUserMutation.isPending} 
                            placeholder="transmission@matrix.io"
                            className="relative h-11 pl-10 text-[11px] font-bold bg-muted/5 border-primary/10 focus-visible:ring-primary/20 rounded-xl transition-all shadow-inner uppercase tracking-wider" 
                        />
                        <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40 group-focus-within:text-primary transition-colors" />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[9px] font-bold italic text-destructive/80" />
                </FormItem>
              )}
            />
          </div>

          <div className="pt-6 flex justify-end">
            <Button
                type="submit"
                disabled={updateUserMutation.isPending}
                className="font-black h-11 px-8 gap-2.5 rounded-xl shadow-2xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 ring-1 ring-inset ring-white/20 uppercase tracking-[0.2em] text-[10px]"
            >
              {updateUserMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Commit Changes
            </Button>
          </div>
        </form>
      </Form>

      {/* Stable Version Footer */}
      <footer className="px-8 py-4 border-t bg-muted/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-primary/30" />
              <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">Identity Node</span>
          </div>
          <span className="text-[8px] font-bold text-muted-foreground/20 tabular-nums uppercase tracking-widest">v1.4.0-STABLE</span>
      </footer>
    </Card>
  );
}
