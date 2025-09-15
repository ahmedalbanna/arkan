'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Phone } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useSignup, useGoogleSignIn } from '@/hooks';
import { useToast } from '@/hooks';
import { useLocalization } from '@/context/LocalizationContext';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export interface SignupCredentials extends z.infer<typeof formSchema> {}

export default function SignupForm() {
  const router = useRouter();
  const { t } = useLocalization();
  const { toast } = useToast();

  const form = useForm<SignupCredentials>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const signupMutation = useSignup({
    onError: (error: any) => {
      // The useSignup hook now handles toast for general errors.
      // We only need to set form-specific errors here.
      if (error?.errors) {
        Object.keys(error.errors).forEach((key) => {
          form.setError(key as keyof SignupCredentials, {
            type: 'server',
            message: error.errors[key][0],
          });
        });
      }
    }
  });

  const googleSignInMutation = useGoogleSignIn();

  function onSubmit(values: SignupCredentials) {
    signupMutation.mutate(values);
  }

  const isPending = signupMutation.isPending || googleSignInMutation.isPending;

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
        <Button variant="outline" className="w-full" type="button" onClick={() => googleSignInMutation.mutate()} disabled={isPending}>
          {googleSignInMutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <svg className="me-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 172.4 56.2l-62.8 55.7C334.3 88.2 294.2 72 248 72 165.2 72 96 141.2 96 224s69.2 152 152 152c86.4 0 142-51.7 148-118.2H248v-73.6h236.3c2.4 12.4 3.7 26.5 3.7 41.6z"></path></svg>}
          Sign up with Google
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
