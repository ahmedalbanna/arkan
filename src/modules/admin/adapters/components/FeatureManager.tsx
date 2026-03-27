'use client';

import React from 'react';
import { useFeatures, useUpdateFeature } from '@/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertCircle, SlidersHorizontal, Loader2, Zap, ShieldCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocalization } from '@/context/LocalizationContext';
import { Feature } from '@/modules/admin/domain/entities/Feature';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/infrastructure/utils/cn';

function FeatureSkeleton() {
  return (
    <div className="flex items-center justify-between p-6 rounded-2xl border bg-card animate-pulse">
      <div className="space-y-3">
        <Skeleton className="h-5 w-40 rounded-full" />
        <Skeleton className="h-4 w-64 rounded-full opacity-50" />
      </div>
      <Skeleton className="h-8 w-20 rounded-xl" />
    </div>
  )
}

function FeatureCard({ feature }: { feature: Feature }) {
  const { t } = useLocalization();
  const { id, name, description, isEnabled } = feature;
  const updateFeatureMutation = useUpdateFeature();

  const handleToggle = (checked: boolean) => {
    updateFeatureMutation.mutate({ featureId: id, payload: { isEnabled: checked } });
  }

  const isToggling = updateFeatureMutation.isPending && updateFeatureMutation.variables?.featureId === id;

  return (
    <div className={cn(
        "group relative flex items-center justify-between p-6 rounded-3xl border transition-all duration-500 shadow-sm",
        isEnabled 
            ? "bg-background border-border/60 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5" 
            : "bg-muted/10 opacity-60 border-dashed grayscale hover:grayscale-0 hover:opacity-100 hover:bg-background transition-opacity"
    )}>
      <div className="flex items-center gap-5">
        <div className={cn(
            "h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-inner group-hover:scale-110",
            isEnabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        )}>
            {isEnabled ? <Zap className="h-5 w-5 fill-primary/20" /> : <SlidersHorizontal className="h-5 w-5" />}
        </div>
        <div className="space-y-1">
            <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight">{name}</h3>
                {isEnabled && (
                    <Badge variant="secondary" className="h-4 text-[8px] uppercase tracking-tighter bg-green-500/10 text-green-600 border-none">
                        Active
                    </Badge>
                )}
            </div>
            <p className="text-[11px] text-muted-foreground italic leading-relaxed max-w-md">{description}</p>
        </div>
      </div>

      <div className={cn(
          "flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all duration-300",
          isEnabled ? "bg-primary/5 border-primary/20" : "bg-muted/20 border-border/40"
      )}>
        <Label htmlFor={`switch-${id}`} className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
            {isEnabled ? "Enabled" : "Disabled"}
        </Label>
        <div className="relative">
            {isToggling && <Loader2 className="absolute -left-6 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-primary" />}
            <Switch
                id={`switch-${id}`}
                checked={isEnabled}
                onCheckedChange={handleToggle}
                disabled={isToggling}
                className="scale-90"
                aria-label={`Enable ${name}`}
            />
        </div>
      </div>
    </div>
  );
}

export default function FeatureManager() {
  const { t } = useLocalization();
  const { data: features, isLoading, isError } = useFeatures();

  return (
    <Card className="border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px]">
      <header className="px-8 py-6 border-b bg-muted/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                Runtime Override Manifest
            </h3>
        </div>
        <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-bold border-primary/20 text-primary bg-primary/5">
            System Synchronized
        </Badge>
      </header>

      <CardContent className="p-8 md:p-10">
        {isLoading ? (
            <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => <FeatureSkeleton key={i} />)}
            </div>
        ) : isError ? (
            <div className="py-20 text-center border-2 border-dashed rounded-3xl bg-destructive/5 text-destructive border-destructive/20 max-w-md mx-auto">
                 <AlertCircle className="mx-auto h-10 w-10 mb-4 opacity-40" />
                 <h4 className="text-xs font-bold uppercase tracking-wider mb-1">Matrix Error</h4>
                 <p className="text-[11px] italic leading-relaxed px-8 opacity-80">{t('manageFeatures.errorLoading')}</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {(features || []).map((feature: any) => (
                    <FeatureCard key={feature.id} feature={feature} />
                ))}
            </div>
        )}
      </CardContent>

      <footer className="px-8 py-4 border-t bg-muted/5 flex items-center justify-between">
          <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest">
              Arkan Feature Engine • Node V1.0 Stable
          </p>
          <div className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-primary/40" />
              <span className="text-[9px] text-muted-foreground/40 font-bold uppercase tracking-tighter">
                  Policy Enforced
              </span>
          </div>
      </footer>
    </Card>
  );
}
