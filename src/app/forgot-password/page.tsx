
import ForgotPasswordForm from '@/modules/users/adapters/components/auth/ForgotPasswordForm';
import Image from 'next/image';

import { Badge } from '@/components/ui/badge';
import { KeyRound, ShieldAlert, BookOpenText } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function ForgotPasswordPage() {
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 bg-background relative overflow-hidden">
      {/* Immersive Visual Manifest (Left) */}
      <div className="hidden lg:block relative group overflow-hidden border-r border-border/40">
        <div className="absolute inset-0 z-0 bg-[#0d1117]">
            <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,hsl(var(--primary)/0.15),transparent_50%)]" />
        </div>
        
        <Image
          src="https://placehold.co/1920x1080/0d1117/ffffff.png?text=RECOVERY+PROTOCOL+INITIALIZED"
          alt="Recovery Manifest"
          layout="fill"
          className="object-cover opacity-40 grayscale group-hover:scale-105 group-hover:opacity-50 transition-all duration-1000"
        />

        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-20 text-center space-y-8">
            <div className="h-20 w-20 rounded-[32px] bg-destructive/10 border border-destructive/20 flex items-center justify-center shadow-2xl shadow-destructive/20 animate-in zoom-in-50 duration-700">
                <KeyRound className="h-10 w-10 text-destructive" />
            </div>
            <div className="space-y-4">
                <h2 className="text-4xl font-bold font-headline tracking-tighter text-white leading-tight">
                    Identity <span className="text-destructive italic underline decoration-destructive/20 decoration-4 underline-offset-8">Recovery</span> Protocol
                </h2>
                <p className="text-white/60 text-lg italic font-serif max-w-md mx-auto leading-relaxed">
                    Initiate a secure logic bypass to restore access to your encrypted workspace and production assets.
                </p>
            </div>
            <div className="pt-10">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm shadow-2xl">
                    <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/80">Security Overlay Active</span>
                </div>
            </div>
        </div>

        <div className="absolute bottom-10 left-10 z-10">
            <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/20">
                Arkan Protocol • Recovery Node V1.0
            </p>
        </div>
      </div>

      {/* Auth HUD (Right) */}
      <div className="flex items-center justify-center py-12 relative bg-background">
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        
        <div className="mx-auto grid w-full max-w-[400px] gap-10 p-10 relative z-10">
          <div className="grid gap-3 text-center">
            <div className="flex justify-center mb-2 lg:hidden">
                <div className="h-12 w-12 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive shadow-inner">
                    <KeyRound className="h-6 w-6" />
                </div>
            </div>
            <div className="inline-flex items-center justify-center gap-2 mb-2">
                <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-bold border-destructive/20 text-destructive bg-destructive/5">Access Bypass</Badge>
            </div>
            <h1 className="text-4xl font-headline font-bold tracking-tighter text-foreground flex items-center justify-center gap-4">
                <ShieldAlert className="h-8 w-8 text-destructive" />
                Reset Key
            </h1>
            <p className="text-sm text-muted-foreground italic font-serif opacity-80 px-4">
                Enter your system identifier to receive a secure restoration link.
            </p>
          </div>

          <div className="p-8 rounded-[32px] border bg-card shadow-2xl shadow-destructive/5 relative group">
            <ForgotPasswordForm />
          </div>

          <footer className="text-center space-y-4">
            <Separator className="bg-border/40" />
            <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-widest leading-none">
                Identity Verified • Secure Transmission
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
