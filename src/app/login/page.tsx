
import LoginForm from '@/components/LoginForm';
import { KeyRound } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-headline font-bold text-primary flex items-center justify-center gap-4">
            <KeyRound className="w-10 h-10" />
            Welcome Back
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Sign in to access your projects and continue creating.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
