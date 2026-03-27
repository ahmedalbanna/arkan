'use client';

import { TemplateManagementConsole } from '@/modules/templates/adapters/components/admin/templates/TemplateManagementConsole';
import { useLocalization } from '@/context/LocalizationContext';
import { Palette } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

export default function ManageTemplatesPage() {
  const { t } = useLocalization();

  return (
    <div className="flex flex-col space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-bold border-primary/20 text-primary bg-background">Visual Assets</Badge>
              <div className="h-3 w-px bg-primary/20" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80">Style Repository</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tighter text-foreground flex items-center gap-4">
              <Palette className="w-10 h-10 text-primary animate-pulse" />
              {t('manageTemplates.pageTitle')}
            </h1>
            <p className="text-lg text-muted-foreground italic font-serif opacity-80 max-w-2xl leading-relaxed">
              {t('manageTemplates.pageSubtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-background border shadow-sm flex flex-col items-end">
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Asset Node</span>
                <span className="text-xs font-bold text-primary flex items-center gap-1.5 mt-1 uppercase tracking-tighter">
                    Themes Active
                </span>
            </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute -top-6 inset-x-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
        <TemplateManagementConsole />
      </div>
    </div>
  );
}
