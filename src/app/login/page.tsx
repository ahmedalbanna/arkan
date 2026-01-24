

import LoginForm from '@/components/auth/LoginForm';
import Image from 'next/image';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

export default function LoginPage() {
  return (
    <ErrorBoundary>
      <div className="w-full lg:grid lg:min-h-[calc(100vh-65px)] lg:grid-cols-2 xl:min-h-[calc(100vh-65px)]">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold text-primary">Login</h1>
            <p className="text-balance text-muted-foreground">
              Enter your email below to login to your account
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <Image
          src="https://placehold.co/1920x1080.png"
          alt="Image"
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          data-ai-hint="login illustration"
        />
      </div>
    </div>
   </ErrorBoundary>
  );
}
