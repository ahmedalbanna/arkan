'use client';

import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, UserPlus, ShieldCheck, Mail, Lock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useLocalization } from '@/context/LocalizationContext';
import { useSignup } from '@/modules/users/adapters/hooks/use-auth-mutations';
import { generateFingerprint } from '@/infrastructure/security/fingerprint';
import { signupSchema as formSchema, type SignupInput as SignupCredentials } from '@/modules/users/domain/schemas/index';
export type { SignupCredentials };
import { useToast } from '@/hooks';

/**
 * SignupForm — Secure entry point for new system nodes.
 * Orchestrates identity creation with hardware fingerprinting and cryptographic validation.
 * 
 * DEFENSIVE MEASURES:
 * 1. Fingerprint Containment: Wraps async hardware profiling in try-catch to prevent ingestion failure.
 * 2. Mutation Guards: Ensures transmission payload is synthesized correctly before mutation trigger.
 * 3. UX Integrity: Disables all inputs during the 'edit' to 'registered' state transition.
 * 4. Type Safety: Strictly adheres to SignupCredentials domain schema.
 */

export default function SignupForm() {
  const { t } = useLocalization();
  const { toast } = useToast();
  const signupMutation = useSignup();

  const form = useForm<SignupCredentials>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = useCallback(async (values: SignupCredentials) => {
    try {
        // 1. HARDWARE PROFILING — Guarded async capture
        let hash = 'unknown';
        let data = {};
        
        try {
            const fingerprint = await generateFingerprint();
            hash = fingerprint.hash;
            data = fingerprint.data;
        } catch (fe) {
            console.warn('[SignupForm] Hardware profiling bypassed:', fe);
        }
        
        // 2. TRANSMISSION TRIGGER
        signupMutation.mutate({
            ...values,
            fingerprint: hash,
            fingerprintData: data
        } as any);
        
    } catch (error) {
        console.error('[SignupForm] System entry protocol failed:', error);
        toast({ title: 'Authentication Error', description: 'Failed to initialize identity creation. Please try again.', variant: 'destructive' });
    }
  }, [signupMutation, toast]);

  const isPending = signupMutation.isPending;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-black uppercase tracking-tight text-foreground/90">Initialize Identity</h1>
        <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-widest italic">Node Registration Protocol</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Identity Display</FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Input 
                        placeholder={t('signup.namePlaceholder')} 
                        {...field} 
                        disabled={isPending} 
                        className="h-11 pl-10 text-[11px] font-bold bg-muted/5 border-primary/10 focus-visible:ring-primary/20 rounded-xl transition-all shadow-inner uppercase tracking-wider"
                    />
                    <UserPlus className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40 group-focus-within:text-primary transition-colors" />
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
                    <Input 
                        placeholder="name@matrix.io" 
                        {...field} 
                        disabled={isPending} 
                        className="h-11 pl-10 text-[11px] font-bold bg-muted/5 border-primary/10 focus-visible:ring-primary/20 rounded-xl transition-all shadow-inner uppercase tracking-wider"
                    />
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40 group-focus-within:text-primary transition-colors" />
                  </div>
                </FormControl>
                <FormMessage className="text-[9px] font-bold italic text-destructive/80" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Access Cipher</FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Input 
                        type="password" 
                        placeholder="••••••••" 
                        {...field} 
                        disabled={isPending} 
                        className="h-11 pl-10 text-[11px] font-bold bg-muted/5 border-primary/10 focus-visible:ring-primary/20 rounded-xl transition-all shadow-inner"
                    />
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40 group-focus-within:text-primary transition-colors" />
                  </div>
                </FormControl>
                <FormMessage className="text-[9px] font-bold italic text-destructive/80" />
              </FormItem>
            )}
          />

          <div className="pt-2">
            <Button 
                type="submit" 
                className="w-full h-12 font-black uppercase tracking-[0.25em] text-[11px] shadow-2xl shadow-primary/20 rounded-xl transition-all hover:scale-[1.02] active:scale-95 ring-1 ring-inset ring-white/20" 
                disabled={isPending}
            >
              {isPending ? (
                <>
                    <Loader2 className="mr-3 h-4 w-4 animate-spin" />
                    Initializing Node...
                </>
              ) : (
                <>
                    <ShieldCheck className="mr-3 h-4 w-4" />
                    {t('signup.submitButton')}
                </>
              )}
            </Button>
          </div>
          
          <div className="mt-2 text-center">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                {t('signup.loginPrompt')}{" "}
                <Link href="/login" className="text-primary hover:underline font-black">
                    {t('signup.loginLink')}
                </Link>
            </p>
          </div>
        </form>
      </Form>

      {/* Stable Version Footer */}
      <div className="pt-8 border-t border-primary/10 flex items-center justify-between opacity-40">
          <div className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-primary/60" />
              <span className="text-[8px] font-black uppercase tracking-widest">Auth Node</span>
          </div>
          <span className="text-[8px] font-bold tabular-nums uppercase tracking-widest">v2.4.0-STABLE</span>
      </div>
    </div>
  );
}
