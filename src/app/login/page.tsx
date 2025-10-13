`use client`

import LoginForm from '@/components/auth/LoginForm';
import { AnimatedContainer } from '@/components/ui/animation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KeyRound, Shield, Sparkles, Zap } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 w-full lg:grid lg:min-h-screen lg:grid-cols-2">
        {/* Left Side - Login Form */}
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <AnimatedContainer animation="fade-in-up" delay={200}>
            <div className="mx-auto w-full max-w-md">
              {/* Header */}
              <div className="text-center mb-8">
                <AnimatedContainer animation="fade-in-down" delay={400}>
                  <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full bg-gradient-to-br from-primary to-primary-600 shadow-glow">
                      <KeyRound className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-headline font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                    Welcome Back
                  </h1>
                  <p className="text-balance text-muted-foreground mt-2">
                    Sign in to your account to continue your journey
                  </p>
                </AnimatedContainer>
              </div>

              {/* Login Form Card */}
              <AnimatedContainer animation="fade-in-up" delay={600}>
                <Card variant="glass" className="backdrop-blur-md shadow-soft">
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl text-center">Sign In</CardTitle>
                    <CardDescription className="text-center">
                      Enter your credentials to access your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LoginForm />
                  </CardContent>
                </Card>
              </AnimatedContainer>

              {/* Features */}
              <AnimatedContainer animation="fade-in-up" delay={800}>
                <div className="mt-8 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 mx-auto w-fit mb-2">
                      <Shield className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-xs text-muted-foreground">Secure</p>
                  </div>
                  <div className="text-center">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 mx-auto w-fit mb-2">
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-xs text-muted-foreground">Fast</p>
                  </div>
                  <div className="text-center">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 mx-auto w-fit mb-2">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-xs text-muted-foreground">Smart</p>
                  </div>
                </div>
              </AnimatedContainer>
            </div>
          </AnimatedContainer>
        </div>

        {/* Right Side - Image */}
        <div className="hidden bg-gradient-to-br from-primary/10 via-background to-blue-500/10 lg:flex lg:items-center lg:justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <AnimatedContainer animation="fade-in-left" delay={400}>
            <div className="relative z-10 text-center p-8">
              <div className="mb-6">
                <div className="p-4 rounded-full bg-gradient-to-br from-primary to-primary-600 mx-auto w-fit mb-4 shadow-glow">
                  <KeyRound className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-3xl font-headline font-bold mb-2">Arkan AI</h2>
                <p className="text-lg text-muted-foreground">
                  Your intelligent project management companion
                </p>
              </div>

              <div className="space-y-4 text-left max-w-sm mx-auto">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 backdrop-blur-sm">
                  <div className="p-1 rounded bg-primary/10">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">AI-Powered</p>
                    <p className="text-xs text-muted-foreground">Intelligent project generation</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 backdrop-blur-sm">
                  <div className="p-1 rounded bg-emerald-500/10">
                    <Shield className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Secure</p>
                    <p className="text-xs text-muted-foreground">Enterprise-grade security</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 backdrop-blur-sm">
                  <div className="p-1 rounded bg-blue-500/10">
                    <Zap className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Fast</p>
                    <p className="text-xs text-muted-foreground">Lightning-fast performance</p>
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
