'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useGoogleSignIn, useLogin } from '@/hooks/auth/use-auth-mutations';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { useToast } from '@/hooks/util/use-toast';

import { LoginCredentials } from '@/lib/types';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export default function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const loginMutation = useLogin();
  const googleSignInMutation = useGoogleSignIn();

  const form = useForm<LoginCredentials>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    const errorData = loginMutation.error;
    if (errorData && typeof errorData === 'object' && 'message' in errorData) {
      form.setError("root.serverError", {
        type: "manual",
        message: String(errorData.message)
      });
    }
  }, [loginMutation.error, form]);


  async function onSubmit(values: LoginCredentials) {
    // Clear previous server errors before submitting
    form.clearErrors("root.serverError");
    
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        form.setError("root.serverError", {
          type: "manual",
          message: result.error
        });
        toast({
          title: 'Login Error',
          description: result.error,
          variant: 'destructive',
        });
      } else if (result?.ok) {
        toast({
          title: 'Login Successful',
          description: 'Welcome back!',
        });
        router.push('/builder');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during login';
      form.setError("root.serverError", {
        type: "manual",
        message: errorMessage
      });
      toast({
        title: 'Login Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const isPending = isLoading || loginMutation.isPending || googleSignInMutation.isPending;
  const formLevelError = form.formState.errors.root?.serverError;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        {formLevelError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Login Error</AlertTitle>
            <AlertDescription>{formLevelError.message}</AlertDescription>
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
              <div className="flex items-center">
                <FormLabel>Password</FormLabel>
                <Link href="/forgot-password" className="ml-auto inline-block text-sm underline">
                  Forgot your password?
                </Link>
              </div>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
          Login
        </Button>
        <Button variant="outline" className="w-full" type="button" onClick={() => googleSignInMutation.mutate()} disabled={isPending}>
          {googleSignInMutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <svg className="me-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 172.4 56.2l-62.8 55.7C334.3 88.2 294.2 72 248 72 165.2 72 96 141.2 96 224s69.2 152 152 152c86.4 0 142-51.7 148-118.2H248v-73.6h236.3c2.4 12.4 3.7 26.5 3.7 41.6z"></path></svg>}
          Login with Google
        </Button>
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="underline">
            Sign up
          </Link>
        </div>
      </form>
    </Form>
  );
}
