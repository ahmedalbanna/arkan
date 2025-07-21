
import ForgotPasswordForm from '@/components/ForgotPasswordForm';
import { HelpCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-headline font-bold text-primary flex items-center justify-center gap-4">
            <HelpCircle className="w-10 h-10" />
            Forgot Password
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Enter your email to receive a password reset link.
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
