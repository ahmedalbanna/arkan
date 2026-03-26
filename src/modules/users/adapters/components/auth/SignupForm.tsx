'use client';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useLocalization } from '@/context/LocalizationContext';
import { useSignup } from '@/modules/users/adapters/hooks/use-auth-mutations';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { generateFingerprint } from '@/lib/utils/security/fingerprint';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export type SignupCredentials = z.infer<typeof formSchema>;

export default function SignupForm() {
  const { t } = useLocalization();
  const signupMutation = useSignup();

  const form = useForm<SignupCredentials>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: SignupCredentials) {
    // Capture Fingerprint
    const { hash, data } = await generateFingerprint();
    
    signupMutation.mutate({
        ...values,
        fingerprint: hash,
        fingerprintData: data
    } as any);
  }

  const isPending = signupMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('signup.nameLabel')}</FormLabel>
              <FormControl>
                <Input placeholder={t('signup.namePlaceholder')} {...field} disabled={isPending} />
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
              <FormLabel>{t('signup.emailLabel')}</FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" {...field} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('signup.passwordLabel')}</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {signupMutation.isPending && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
          {t('signup.submitButton')}
        </Button>
        
        <div className="mt-4 text-center text-sm">
          {t('signup.loginPrompt')}{" "}
          <Link href="/login" className="underline">
            {t('signup.loginLink')}
          </Link>
        </div>
      </form>
    </Form>
  );
}
