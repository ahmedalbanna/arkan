
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { useLocalization } from '@/context/LocalizationContext';
import { useFeatures, useUpdateFeature } from '@/hooks';
import { Feature } from '@/lib/features';
import { AlertCircle, Settings, SlidersHorizontal, ToggleLeft, Zap } from 'lucide-react';

function FeatureSkeleton() {
  return (
    <AnimatedContainer animation="fade-in-up" delay={100}>
      <Card variant="glass" role="listitem" className="flex items-center justify-between p-6 backdrop-blur-md shadow-soft">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-6 w-20" />
      </Card>
    </AnimatedContainer>
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
    <AnimatedContainer animation="fade-in-up" delay={100}>
      <Card variant="glass" className="flex items-center justify-between p-6 backdrop-blur-md shadow-soft hover:shadow-glow transition-all duration-200 group">
        <div className="flex items-center gap-4 flex-grow">
          <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-blue-500/10 group-hover:from-primary/20 group-hover:to-blue-500/20 transition-all duration-200">
            <Settings className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-200" />
          </div>
          <div className="space-y-1 flex-grow">
            <div className="flex items-center gap-2">
              <CardTitle className="font-headline text-lg group-hover:text-primary transition-colors duration-200">{name}</CardTitle>
              <Badge variant={isEnabled ? "default" : "secondary"} className="text-xs">
                {isEnabled ? "Active" : "Inactive"}
              </Badge>
            </div>
            <CardDescription className="text-sm">{description}</CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              id={`switch-${id}`}
              checked={isEnabled}
              onCheckedChange={handleToggle}
              disabled={updateFeatureMutation.isPending && updateFeatureMutation.variables?.featureId === id}
              aria-label={`Enable ${name}`}
            />
            <Label htmlFor={`switch-${id}`} className="text-sm font-medium">
              {isEnabled ? t('manageFeatures.enabled') : t('manageFeatures.disabled')}
            </Label>
          </div>
        </div>
      </Card>
    </AnimatedContainer>
  );
}

export default function FeatureManager() {
  const { t } = useLocalization();
  const { features, isLoaded, isError } = useFeatures();

  if (isError) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

        <AnimatedContainer animation="fade-in-up" delay={200}>
          <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
            <Card variant="glass" className="p-8 text-center max-w-md backdrop-blur-md shadow-soft">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-full bg-gradient-to-br from-destructive to-destructive/80 shadow-glow">
                  <AlertCircle className="h-12 w-12 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-headline font-semibold mb-2">Error Loading Features</h2>
                  <p className="text-muted-foreground">
                    There was an error loading the features. Please try again later.
                  </p>
                </div>
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Error
                </Badge>
              </div>
            </Card>
          </div>
        </AnimatedContainer>
      </div>
    );
  }

  if (!isLoaded) {
    return <FeatureSkeleton />;
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <AnimatedContainer animation="fade-in-down" delay={200}>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-primary to-primary-600 shadow-glow">
                <SlidersHorizontal className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-headline font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  Feature Management
                </h1>
                <p className="text-muted-foreground text-lg mt-2">
                  Control and manage system features
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <ToggleLeft className="h-3 w-3" />
                Feature Control
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Toggle Management
              </Badge>
            </div>
          </div>
        </AnimatedContainer>

        <AnimatedContainer animation="fade-in-up" delay={400}>
          <div className="space-y-6">
            {features.map((feature) => (
              <FeatureCard key={feature.id} feature={feature} />
            ))}
          </div>
        </AnimatedContainer>
      </div>
    </div>
  );
}
