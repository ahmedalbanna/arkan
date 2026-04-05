
import { History, Cpu, Binary } from "lucide-react";
import { getTranslator } from '@/infrastructure/i18n/i18n';
import GenerationLogViewer from "@/modules/ai/adapters/components/admin/GenerationLogViewer";
import { Badge } from '@/components/ui/badge';

/**
 * ManageGenerationsPage — Administrative hub for AI telemetry oversight.
 * High-fidelity audit manifest for global neural operations.
 */

export default async function ManageGenerationsPage() {
  const t = await getTranslator();

  return (
    <div className="flex flex-col space-y-12 animate-in fade-in duration-700 relative">
      {/* 28px Dot-grid Background Atmospheric Layer */}
      <div 
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] bg-[radial-gradient(circle_at_center,_var(--primary)_1px,_transparent_1px)] bg-[size:28px_28px] pointer-events-none -m-10" 
        style={{ backgroundSize: '28px 28px' }}
      />

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1 relative z-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-black border-primary/20 text-primary bg-background">Audit Node</Badge>
              <div className="h-3 w-px bg-primary/20" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary/80">Generation Archive</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-4xl md:text-6xl font-headline font-black tracking-tighter text-foreground flex items-center gap-4 uppercase">
              <History className="w-10 h-10 text-primary" />
              {t('manageGenerations.pageTitle')}
            </h1>
            <p className="text-lg text-muted-foreground italic font-serif opacity-80 max-w-2xl leading-relaxed">
              {t('manageGenerations.pageSubtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
            <div className="px-5 py-2.5 rounded-2xl bg-background border border-primary/10 shadow-sm flex flex-col items-end group">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 group-hover:text-primary transition-colors">Stream Vector</span>
                <span className="text-xs font-black text-primary flex items-center gap-2 mt-1 uppercase tracking-tight tabular-nums">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
                    Operational
                </span>
            </div>
        </div>
      </header>

      <div className="relative z-10">
        <div className="absolute -top-6 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
        <GenerationLogViewer />
      </div>

      {/* High-Fidelity Technical Metadata Footer */}
      <footer className="pt-12 pb-6 flex items-center justify-between opacity-40 px-1 relative z-10">
          <div className="flex items-center gap-3">
              <Cpu className="h-4 w-4" />
              <p className="text-[9px] font-black uppercase tracking-[0.3em]">
                  Telemetry Core • Stable Build 2.4.0
              </p>
          </div>
          <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                  <Binary className="h-3 w-3" />
                  <span className="text-[8px] font-bold uppercase tracking-widest">LOG_RECOVERY_ENCRYPTED</span>
              </div>
          </div>
      </footer>
    </div>
  );
}
