'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useLocalization } from '@/context/LocalizationContext';
import { useProjectBlueprintLogic } from '@/hooks/writing-tools/use-project-blueprint-logic';
import { markdownComponents } from '@/lib/utils/markdown-styles';
import { Building2, Check, Copy, Download, FileText, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export function ProjectBlueprintTool() {
  const { t } = useLocalization();
  const {
    form,
    generateMutation,
    onSubmit,
    blueprint,
    isCopied,
    handleCopy,
    handleDownload,
  } = useProjectBlueprintLogic();

  const { register, setValue, watch, formState: { errors } } = form;
  const complexityValue = watch('complexity');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            {t('writingTools.projectBlueprint.cardTitle')}
          </CardTitle>
          <CardDescription>{t('writingTools.projectBlueprint.cardDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* Project Name */}
            <div className="space-y-2">
              <Label htmlFor="projectName">{t('writingTools.projectBlueprint.projectNameLabel')}</Label>
              <Input
                id="projectName"
                {...register('projectName')}
                placeholder={t('writingTools.projectBlueprint.projectNamePlaceholder')}
              />
              {errors.projectName && (
                <p className="text-sm text-destructive">{errors.projectName.message}</p>
              )}
            </div>

            {/* Project Type */}
            <div className="space-y-2">
              <Label htmlFor="projectType">{t('writingTools.projectBlueprint.projectTypeLabel')}</Label>
              <Select onValueChange={(value) => setValue('projectType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('writingTools.projectBlueprint.projectTypePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="web-application">Web Application</SelectItem>
                  <SelectItem value="mobile-app">Mobile App</SelectItem>
                  <SelectItem value="e-commerce">E-commerce Platform</SelectItem>
                  <SelectItem value="portfolio">Portfolio Website</SelectItem>
                  <SelectItem value="blog">Blog/Content Site</SelectItem>
                  <SelectItem value="saas">SaaS Platform</SelectItem>
                  <SelectItem value="api">API/Backend Service</SelectItem>
                  <SelectItem value="desktop-app">Desktop Application</SelectItem>
                  <SelectItem value="game">Game/Interactive App</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.projectType && (
                <p className="text-sm text-destructive">{errors.projectType.message}</p>
              )}
            </div>

            {/* Project Description */}
            <div className="space-y-2">
              <Label htmlFor="description">{t('writingTools.projectBlueprint.descriptionLabel')}</Label>
              <Textarea
                id="description"
                {...register('description')}
                rows={4}
                placeholder={t('writingTools.projectBlueprint.descriptionPlaceholder')}
                className="resize-none"
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            {/* Target Audience */}
            <div className="space-y-2">
              <Label htmlFor="targetAudience">{t('writingTools.projectBlueprint.targetAudienceLabel')}</Label>
              <Textarea
                id="targetAudience"
                {...register('targetAudience')}
                rows={3}
                placeholder={t('writingTools.projectBlueprint.targetAudiencePlaceholder')}
                className="resize-none"
              />
              {errors.targetAudience && (
                <p className="text-sm text-destructive">{errors.targetAudience.message}</p>
              )}
            </div>

            {/* Complexity */}
            <div className="space-y-2">
              <Label>{t('writingTools.projectBlueprint.complexityLabel')}</Label>
              <Select onValueChange={(value) => setValue('complexity', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('writingTools.projectBlueprint.complexityPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Simple">Simple (Basic functionality)</SelectItem>
                  <SelectItem value="Medium">Medium (Standard features)</SelectItem>
                  <SelectItem value="Complex">Complex (Advanced features)</SelectItem>
                  <SelectItem value="Enterprise">Enterprise (Full-scale system)</SelectItem>
                </SelectContent>
              </Select>
              {errors.complexity && (
                <p className="text-sm text-destructive">{errors.complexity.message}</p>
              )}
            </div>

            {/* Features */}
            <div className="space-y-2">
              <Label htmlFor="features">{t('writingTools.projectBlueprint.featuresLabel')}</Label>
              <Textarea
                id="features"
                {...register('features')}
                rows={4}
                placeholder={t('writingTools.projectBlueprint.featuresPlaceholder')}
                className="resize-none"
              />
              {errors.features && (
                <p className="text-sm text-destructive">{errors.features.message}</p>
              )}
            </div>

            {/* Tech Stack (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="techStack">{t('writingTools.projectBlueprint.techStackLabel')}</Label>
              <Textarea
                id="techStack"
                {...register('techStack')}
                rows={2}
                placeholder={t('writingTools.projectBlueprint.techStackPlaceholder')}
                className="resize-none"
              />
            </div>

            {/* Budget (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="budget">{t('writingTools.projectBlueprint.budgetLabel')}</Label>
              <Select onValueChange={(value) => setValue('budget', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('writingTools.projectBlueprint.budgetPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under-5k">Under $5,000</SelectItem>
                  <SelectItem value="5k-15k">$5,000 - $15,000</SelectItem>
                  <SelectItem value="15k-50k">$15,000 - $50,000</SelectItem>
                  <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
                  <SelectItem value="over-100k">Over $100,000</SelectItem>
                  <SelectItem value="not-specified">Not Specified</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Timeline (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="timeline">{t('writingTools.projectBlueprint.timelineLabel')}</Label>
              <Select onValueChange={(value) => setValue('timeline', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('writingTools.projectBlueprint.timelinePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-month">1 Month</SelectItem>
                  <SelectItem value="2-3-months">2-3 Months</SelectItem>
                  <SelectItem value="3-6-months">3-6 Months</SelectItem>
                  <SelectItem value="6-12-months">6-12 Months</SelectItem>
                  <SelectItem value="over-1-year">Over 1 Year</SelectItem>
                  <SelectItem value="flexible">Flexible Timeline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              disabled={generateMutation.isPending}
              className="w-full"
              size="lg"
            >
              {generateMutation.isPending ? (
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
              ) : (
                <Building2 className="me-2 h-4 w-4" />
              )}
              {t('writingTools.projectBlueprint.buttonText')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Output */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {t('writingTools.projectBlueprint.blueprintLabel')}
            </span>
            {blueprint && (
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={handleCopy} title="Copy blueprint">
                  {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={handleDownload} title="Download blueprint">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] rounded-md border p-4 bg-muted/30">
            {generateMutation.isPending ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground text-center">
                  {t('writingTools.projectBlueprint.processingMessage')}
                </p>
              </div>
            ) : blueprint ? (
              <div className="prose dark:prose-invert max-w-none text-sm">
                <ReactMarkdown components={markdownComponents}>{blueprint}</ReactMarkdown>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Building2 className="w-12 h-12 mx-auto mb-4" />
                  <p>{t('writingTools.projectBlueprint.emptyState')}</p>
                </div>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
