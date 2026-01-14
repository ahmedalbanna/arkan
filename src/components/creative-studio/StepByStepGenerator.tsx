/**
 * Step-by-Step Generator - Core Component
 * المولد التفاعلي خطوة بخطوة - المكون الأساسي
 */

'use client';

import { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Play, 
  SkipForward, 
  RotateCcw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Settings,
  Eye,
  Edit3,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils/cn';
import { GenerationStep } from '@/lib/models/creative-content-config';
import { useCreativeStudio } from '@/hooks/creative-studio/use-creative-studio';
import { SmartControlsPanel } from './SmartControlsPanel';
import { PreviewPanel } from './PreviewPanel';

interface StepProgressItemProps {
  step: GenerationStep;
  isActive: boolean;
  onClick: () => void;
}

function StepProgressItem({ step, isActive, onClick }: StepProgressItemProps) {
  const getStatusIcon = () => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
      case 'skipped':
        return <SkipForward className="h-5 w-5 text-muted-foreground" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    switch (step.status) {
      case 'completed':
        return 'border-green-500 bg-green-500/10';
      case 'in-progress':
        return 'border-primary bg-primary/10';
      case 'skipped':
        return 'border-muted bg-muted/30';
      default:
        return 'border-muted';
    }
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md',
        getStatusColor(),
        isActive && 'ring-2 ring-primary shadow-lg'
      )}
      onClick={onClick}
    >
      <div className="flex-shrink-0 mt-0.5">
        {getStatusIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-muted-foreground">
            الخطوة {step.order}
          </span>
          {step.optional && (
            <Badge variant="outline" className="text-xs">
              اختياري
            </Badge>
          )}
        </div>
        <h4 className={cn(
          'text-sm font-medium truncate',
          isActive ? 'text-primary' : 'text-foreground'
        )}>
          {step.title}
        </h4>
        {step.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
            {step.description}
          </p>
        )}
      </div>
    </div>
  );
}

interface StepActionsProps {
  step: GenerationStep;
  isGenerating: boolean;
  onGenerate: () => void;
  onRegenerate: () => void;
  onSkip: () => void;
  onEdit: () => void;
}

function StepActions({ 
  step, 
  isGenerating, 
  onGenerate, 
  onRegenerate, 
  onSkip,
  onEdit 
}: StepActionsProps) {
  const canGenerate = step.status === 'pending' || step.status === 'skipped';
  const canRegenerate = step.status === 'completed';
  const canSkip = step.optional && step.status === 'pending';
  const canEdit = step.status === 'completed';

  return (
    <div className="flex flex-wrap gap-2">
      {canGenerate && (
        <Button 
          onClick={onGenerate} 
          disabled={isGenerating}
          size="lg"
          className="flex-1 min-w-[200px]"
        >
          {isGenerating ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              جاري التوليد...
            </>
          ) : (
            <>
              <Play className="ml-2 h-4 w-4" />
              توليد هذه الخطوة
            </>
          )}
        </Button>
      )}

      {canRegenerate && (
        <Button 
          onClick={onRegenerate} 
          disabled={isGenerating}
          variant="secondary"
          size="lg"
        >
          <RotateCcw className="ml-2 h-4 w-4" />
          إعادة التوليد
        </Button>
      )}

      {canEdit && (
        <Button 
          onClick={onEdit}
          variant="outline"
          size="lg"
        >
          <Edit3 className="ml-2 h-4 w-4" />
          تعديل يدوياً
        </Button>
      )}

      {canSkip && (
        <Button 
          onClick={onSkip}
          variant="ghost"
          size="lg"
        >
          <SkipForward className="ml-2 h-4 w-4" />
          تخطي
        </Button>
      )}
    </div>
  );
}

export default function StepByStepGenerator() {
  const {
    currentProject,
    currentStep,
    currentStepIndex,
    isGenerating,
    goToStep,
    nextStep,
    previousStep,
    generateStep,
    regenerateStep,
    skipStep,
  } = useCreativeStudio();

  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');

  if (!currentProject || !currentStep) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">لا يوجد مشروع محمل</p>
      </div>
    );
  }

  const completedSteps = currentProject.generationSteps.filter(
    s => s.status === 'completed'
  ).length;
  const totalSteps = currentProject.generationSteps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  const handleGenerate = async () => {
    await generateStep(currentStep.id);
  };

  const handleRegenerate = async () => {
    await regenerateStep(currentStep.id);
  };

  const handleSkip = () => {
    skipStep(currentStep.id);
  };

  const handleEdit = () => {
    setEditedContent(currentStep.result?.content || '');
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    // Save edited content
    setIsEditing(false);
  };

  return (
    <div className="h-screen flex flex-col" dir="rtl">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl font-bold">{currentProject.metadata.title}</h1>
              <p className="text-sm text-muted-foreground">
                {currentProject.metadata.genre && `${currentProject.metadata.genre} • `}
                {currentProject.metadata.language === 'ar' ? 'عربي' : 'English'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                {completedSteps} / {totalSteps} خطوة
              </Badge>
              <Button variant="outline" size="sm">
                <Save className="ml-2 h-4 w-4" />
                حفظ
              </Button>
            </div>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Steps Sidebar */}
          <div className="lg:col-span-3 border-l bg-muted/30">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b">
                <h2 className="font-semibold flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  الخطوات
                </h2>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-2">
                  {currentProject.generationSteps.map((step, index) => (
                    <StepProgressItem
                      key={step.id}
                      step={step}
                      isActive={index === currentStepIndex}
                      onClick={() => goToStep(index)}
                    />
                  ))}
                </div>
              </ScrollArea>
              <div className="p-4 border-t flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={previousStep}
                  disabled={currentStepIndex === 0}
                  className="flex-1"
                >
                  <ChevronRight className="h-4 w-4" />
                  السابق
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextStep}
                  disabled={currentStepIndex === totalSteps - 1}
                  className="flex-1"
                >
                  التالي
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9 overflow-hidden">
            <Tabs defaultValue="generate" className="h-full flex flex-col">
              <div className="border-b px-4">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="generate" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    التوليد
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    المعاينة
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-hidden">
                {/* Generate Tab */}
                <TabsContent value="generate" className="h-full m-0 data-[state=active]:flex flex-col">
                  <ScrollArea className="flex-1">
                    <div className="p-6 space-y-6">
                      {/* Current Step Info */}
                      <Card>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-xl">
                                {currentStep.title}
                              </CardTitle>
                              {currentStep.description && (
                                <CardDescription className="mt-2">
                                  {currentStep.description}
                                </CardDescription>
                              )}
                            </div>
                            <Badge 
                              variant={
                                currentStep.status === 'completed' ? 'default' :
                                currentStep.status === 'in-progress' ? 'secondary' :
                                'outline'
                              }
                            >
                              {currentStep.status === 'completed' ? 'مكتمل' :
                               currentStep.status === 'in-progress' ? 'قيد التنفيذ' :
                               currentStep.status === 'skipped' ? 'متخطى' :
                               'معلق'}
                            </Badge>
                          </div>
                        </CardHeader>
                      </Card>

                      {/* Controls */}
                      <SmartControlsPanel
                        step={currentStep}
                        disabled={isGenerating}
                      />

                      {/* Actions */}
                      <Card>
                        <CardContent className="pt-6">
                          <StepActions
                            step={currentStep}
                            isGenerating={isGenerating}
                            onGenerate={handleGenerate}
                            onRegenerate={handleRegenerate}
                            onSkip={handleSkip}
                            onEdit={handleEdit}
                          />
                        </CardContent>
                      </Card>

                      {/* Generated Content Preview */}
                      {currentStep.result && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">النتيجة</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="prose dark:prose-invert max-w-none bg-muted/50 p-4 rounded-lg">
                              {isEditing ? (
                                <textarea
                                  className="w-full min-h-[300px] bg-transparent border rounded p-2"
                                  value={editedContent}
                                  onChange={(e) => setEditedContent(e.target.value)}
                                />
                              ) : (
                                <div className="whitespace-pre-wrap">
                                  {currentStep.result.content}
                                </div>
                              )}
                            </div>
                            {isEditing && (
                              <div className="flex gap-2 mt-4">
                                <Button onClick={handleSaveEdit}>
                                  <Save className="ml-2 h-4 w-4" />
                                  حفظ التعديلات
                                </Button>
                                <Button 
                                  variant="outline" 
                                  onClick={() => setIsEditing(false)}
                                >
                                  إلغاء
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* Preview Tab */}
                <TabsContent value="preview" className="h-full m-0">
                  <PreviewPanel project={currentProject} />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
