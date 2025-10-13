
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import { AnimatedContainer } from '@/components/ui/animation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, KeyRound, Mail, Shield } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 w-full lg:grid lg:min-h-screen lg:grid-cols-2">
        {/* Left Side - Forgot Password Form */}
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <AnimatedContainer animation="fade-in-up" delay={200}>
            <div className="mx-auto w-full max-w-md">
              {/* Back Button */}
              <AnimatedContainer animation="fade-in-down" delay={200}>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Link>
              </AnimatedContainer>

              {/* Header */}
              <div className="text-center mb-8">
                <AnimatedContainer animation="fade-in-down" delay={400}>
                  <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 shadow-glow">
                      <KeyRound className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-headline font-bold bg-gradient-to-r from-orange-500 via-primary to-pink-500 bg-clip-text text-transparent">
                    Reset Password
                  </h1>
                  <p className="text-balance text-muted-foreground mt-2">
                    Don&apos;t worry, it happens to the best of us
                  </p>
                </AnimatedContainer>
              </div>

              {/* Forgot Password Form Card */}
              <AnimatedContainer animation="fade-in-up" delay={600}>
                <Card variant="glass" className="backdrop-blur-md shadow-soft">
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl text-center">Forgot Password?</CardTitle>
                    <CardDescription className="text-center">
                      Enter your email address and we&apos;ll send you a reset link
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ForgotPasswordForm />
                  </CardContent>
                </Card>
              </AnimatedContainer>

              {/* Security Info */}
              <AnimatedContainer animation="fade-in-up" delay={800}>
                <div className="mt-8 p-4 rounded-lg bg-background/50 backdrop-blur-sm border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-emerald-500/10">
                      <Shield className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Secure Process</p>
                      <p className="text-xs text-muted-foreground">Your password reset link will expire in 1 hour</p>
                    </div>
                  </div>
                </div>
              </AnimatedContainer>
            </div>
          </AnimatedContainer>
        </div>

        {/* Right Side - Help Info */}
        <div className="hidden bg-gradient-to-br from-orange-500/10 via-background to-primary/10 lg:flex lg:items-center lg:justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <AnimatedContainer animation="fade-in-left" delay={400}>
            <div className="relative z-10 text-center p-8">
              <div className="mb-6">
                <div className="p-4 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 mx-auto w-fit mb-4 shadow-glow">
                  <KeyRound className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-3xl font-headline font-bold mb-2">Need Help?</h2>
                <p className="text-lg text-muted-foreground">
                  We&apos;re here to help you get back into your account
                </p>
              </div>

              <div className="space-y-4 text-left max-w-sm mx-auto">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 backdrop-blur-sm">
                  <div className="p-1 rounded bg-primary/10">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Check Your Email</p>
                    <p className="text-xs text-muted-foreground">Look for our password reset email</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 backdrop-blur-sm">
                  <div className="p-1 rounded bg-emerald-500/10">
                    <Shield className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Secure Link</p>
                    <p className="text-xs text-muted-foreground">Your reset link is encrypted and secure</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 backdrop-blur-sm">
                  <div className="p-1 rounded bg-orange-500/10">
                    <KeyRound className="h-4 w-4 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Quick Reset</p>
                    <p className="text-xs text-muted-foreground">Reset your password in just a few clicks</p>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedContainer>
        </div>
      </div>
    </div>
  );
}
