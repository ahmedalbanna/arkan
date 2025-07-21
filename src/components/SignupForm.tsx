
'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Phone } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircle } from 'lucide-react';
import { useSignup, useGoogleSignIn } from '@/hooks/use-user';
import type { SignupCredentials } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useLocalization } from '@/context/LocalizationContext';
import { Separator } from './ui/separator';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export default function SignupForm() {
  const router = useRouter();
  const { t } = useLocalization();
  const { toast } = useToast();
  const signupMutation = useSignup();
  const googleSignInMutation = useGoogleSignIn();

  const form = useForm<SignupCredentials>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });
  
  useEffect(() => {
    const errorData = signupMutation.error as any;
    if (errorData?.error) {
      const fieldErrors = errorData.error;
      if (fieldErrors.name) form.setError('name', { message: fieldErrors.name[0] });
      if (fieldErrors.email) form.setError('email', { message: fieldErrors.email[0] });
      if (fieldErrors.password) form.setError('password', { message: fieldErrors.password[0] });
      
      if (fieldErrors._form) {
        toast({
          title: t('signup.errorToastTitle'),
          description: fieldErrors._form[0],
          variant: 'destructive',
        });
      }
    }
  }, [signupMutation.error, form, toast, t]);

  function onSubmit(values: SignupCredentials) {
    signupMutation.mutate(values);
  }

  const isPending = signupMutation.isPending || googleSignInMutation.isPending;
  const formLevelError = (signupMutation.error as any)?.error?._form?.[0];

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">{t('signup.formTitle')}</CardTitle>
            <CardDescription>{t('signup.formDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formLevelError && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{t('signup.errorToastTitle')}</AlertTitle>
                    <AlertDescription>{formLevelError}</AlertDescription>
                </Alert>
            )}
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
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full font-headline" disabled={isPending}>
              {signupMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('signup.submitButton')}
            </Button>
             <div className="relative w-full">
                <Separator className="my-2" />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">OR</span>
            </div>
             <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2">
                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => googleSignInMutation.mutate()}
                    disabled={isPending}
                >
                    {googleSignInMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 172.4 56.2l-62.8 55.7C334.3 88.2 294.2 72 248 72 165.2 72 96 141.2 96 224s69.2 152 152 152c86.4 0 142-51.7 148-118.2H248v-73.6h236.3c2.4 12.4 3.7 26.5 3.7 41.6z"></path></svg>}
                    Sign up with Google
                </Button>
                 <Button asChild type="button" variant="outline" className="w-full" disabled={isPending}>
                    <Link href="/phone-auth">
                        <Phone className="mr-2 h-4 w-4" />
                        Sign up with Phone
                    </Link>
                </Button>
            </div>
             <p className="text-sm text-muted-foreground">
              {t('signup.loginPrompt')}{' '}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                {t('signup.loginLink')}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
