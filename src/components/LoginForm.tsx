
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
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircle } from 'lucide-react';
import { useLogin, useGoogleSignIn } from '@/hooks/use-user';
import type { LoginCredentials } from '@/lib/types';
import { Separator } from './ui/separator';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export default function LoginForm() {
  const router = useRouter();
  const loginMutation = useLogin();
  const googleSignInMutation = useGoogleSignIn();

  const form = useForm<LoginCredentials>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const formLevelError = loginMutation.error?.message;

  useEffect(() => {
    if(loginMutation.isError && loginMutation.error) {
        if (loginMutation.error.message.includes("Invalid email or password")) {
            form.setError("root.serverError", {
                type: "manual",
                message: loginMutation.error.message
            });
        }
    }
  }, [loginMutation.isError, loginMutation.error, form]);


  function onSubmit(values: LoginCredentials) {
    form.clearErrors("root.serverError");
    loginMutation.mutate(values);
  }

  const isPending = loginMutation.isPending || googleSignInMutation.isPending;

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Login</CardTitle>
            <CardDescription>Enter your credentials to access your account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             {form.formState.errors.root?.serverError && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Login Error</AlertTitle>
                    <AlertDescription>{form.formState.errors.root.serverError.message}</AlertDescription>
                </Alert>
            )}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
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
                  <div className="flex justify-between items-center">
                    <FormLabel>Password</FormLabel>
                    <Link href="/forgot-password" passHref legacyBehavior>
                      <a className="text-sm text-primary hover:underline">Forgot Password?</a>
                    </Link>
                  </div>
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
              {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Login
            </Button>
            
            <div className="relative w-full">
                <Separator className="my-2" />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">OR</span>
            </div>

            <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => googleSignInMutation.mutate()}
                disabled={isPending}
            >
                {googleSignInMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 172.4 56.2l-62.8 55.7C334.3 88.2 294.2 72 248 72 165.2 72 96 141.2 96 224s69.2 152 152 152c86.4 0 142-51.7 148-118.2H248v-73.6h236.3c2.4 12.4 3.7 26.5 3.7 41.6z"></path></svg>}
                Sign in with Google
            </Button>

            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/signup" className="font-semibold text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
