
'use client';

import { useFeatures, useUpdateFeature } from '@/hooks/use-features';
import type { Feature } from '@/hooks/use-features';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocalization } from '@/context/LocalizationContext';

function FeatureSkeleton() {
  return (
    <Card role="listitem" className="flex items-center justify-between p-6 animate-pulse">
      <div className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-6 w-20" />
    </Card>
  )
}

function FeatureCard({ feature }: { feature: Feature }) {
  const { t } = useLocalization();
  const { id, name, description, isEnabled } = feature;
  const updateFeatureMutation = useUpdateFeature();
  
  const handleToggle = (checked: boolean) => {
    updateFeatureMutation.mutate({ featureId: id, payload: { isEnabled: checked } });
  }

  return (
    <Card className="flex items-center justify-between p-6">
      <div className="space-y-1">
        <CardTitle className="font-headline text-lg">{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </div>
       <div className="flex items-center gap-2">
        <Switch
          id={`switch-${id}`}
          checked={isEnabled}
          onCheckedChange={handleToggle}
          disabled={updateFeatureMutation.isPending && updateFeatureMutation.variables?.featureId === id}
          aria-label={`Enable ${name}`}
        />
        <Label htmlFor={`switch-${id}`}>{isEnabled ? t('manageFeatures.enabled') : t('manageFeatures.disabled')}</Label>
      </div>
    </Card>
  );
}

export default function FeatureManager() {
  const { t } = useLocalization();
  const { features, isLoaded, isError } = useFeatures();

  if (!isLoaded) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => <FeatureSkeleton key={i} />)}
      </div>
    );
  }

  if (isError) {
    return (
        <Card className="p-8 text-center text-destructive">
            <AlertCircle className="mx-auto h-8 w-8 mb-2" />
            <p>{t('manageFeatures.errorLoading')}</p>
        </Card>
    );
  }

  return (
    <div className="space-y-4">
      {features.map((feature) => (
        <FeatureCard key={feature.id} feature={feature} />
      ))}
    </div>
  );
}
