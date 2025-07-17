
import SignupForm from '@/components/SignupForm';
import { UserPlus } from 'lucide-react';

export default function SignupPage() {
  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-headline font-bold text-primary flex items-center justify-center gap-4">
            <UserPlus className="w-10 h-10" />
            Create Your Account
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Join Arkan today and start building with AI.
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
