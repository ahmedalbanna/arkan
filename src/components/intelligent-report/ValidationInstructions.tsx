/**
 * مكون تعليمات التحقق من صحة المدخلات
 * يعرض تعليمات واضحة عند نقص المعلومات المطلوبة
 */

'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import type { RequiredAction, ValidationResult } from '@/hooks/use-report-validation';
import {
    AlertCircle,
    CheckCircle,
    ChevronDown,
    FileText,
    HelpCircle,
    Info,
    Lightbulb,
    Plus,
    Settings,
    Upload,
    X
} from 'lucide-react';
import { useState } from 'react';

interface ValidationInstructionsProps {
    validation: ValidationResult;
    onAddContext?: () => void;
    onAddProjectInfo?: () => void;
    onUploadFiles?: () => void;
    onConfigureSettings?: () => void;
    className?: string;
}

export function ValidationInstructions({
    validation,
    onAddContext,
    onAddProjectInfo,
    onUploadFiles,
    onConfigureSettings,
    className
}: ValidationInstructionsProps) {
    const [showDetails, setShowDetails] = useState(false);

    // حساب نسبة الاكتمال
    const completionPercentage = validation.canGenerate ? 100 :
        (validation.missingInputs.length === 0 ? 70 : 30);

    // تجميع الإجراءات حسب النوع
    const errorActions = validation.requiredActions.filter(action => action.type === 'error');
    const warningActions = validation.requiredActions.filter(action => action.type === 'warning');
    const infoActions = validation.requiredActions.filter(action => action.type === 'info');

    const ActionCard = ({ action, variant }: { action: RequiredAction; variant: 'error' | 'warning' | 'info' }) => {
        const iconMap = {
            error: AlertCircle,
            warning: HelpCircle,
            info: Info
        };
        const Icon = iconMap[variant];

        const colorMap = {
            error: 'text-red-600 dark:text-red-400',
            warning: 'text-amber-600 dark:text-amber-400',
            info: 'text-blue-600 dark:text-blue-400'
        };

        const bgColorMap = {
            error: 'bg-red-50 dark:bg-red-950',
            warning: 'bg-amber-50 dark:bg-amber-950',
            info: 'bg-blue-50 dark:bg-blue-950'
        };

        return (
            <Alert className={bgColorMap[variant]}>
                <Icon className={`h-4 w-4 ${colorMap[variant]}`} />
                <AlertTitle className={colorMap[variant]}>{action.title}</AlertTitle>
                <AlertDescription>
                    <p className="mb-2">{action.description}</p>
                    {action.action && (
                        <Badge variant="outline" className="text-xs">
                            💡 {action.action}
                        </Badge>
                    )}
                </AlertDescription>
            </Alert>
        );
    };

    if (validation.canGenerate && errorActions.length === 0) {
        return (
            <Card className={`border-green-200 dark:border-green-800 ${className}`}>
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <CardTitle className="text-green-700 dark:text-green-300">
                            جاهز للتوليد
                        </CardTitle>
                    </div>
                    <CardDescription>
                        جميع المعلومات المطلوبة متوفرة ويمكن بدء التوليد
                    </CardDescription>
                </CardHeader>

                {(warningActions.length > 0 || infoActions.length > 0) && (
                    <CardContent className="pt-0">
                        <Collapsible>
                            <CollapsibleTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-between p-2"
                                    onClick={() => setShowDetails(!showDetails)}
                                >
                                    <span className="flex items-center gap-2">
                                        <Lightbulb className="h-4 w-4" />
                                        عرض التوصيات ({warningActions.length + infoActions.length})
                                    </span>
                                    <ChevronDown className={`h-4 w-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="space-y-3 mt-3">
                                {infoActions.map((action, index) => (
                                    <ActionCard key={`info-${index}`} action={action} variant="info" />
                                ))}
                                {warningActions.map((action, index) => (
                                    <ActionCard key={`warning-${index}`} action={action} variant="warning" />
                                ))}
                            </CollapsibleContent>
                        </Collapsible>
                    </CardContent>
                )}
            </Card>
        );
    }

    return (
        <Card className={`border-amber-200 dark:border-amber-800 ${className}`}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        <CardTitle className="text-amber-700 dark:text-amber-300">
                            معلومات إضافية مطلوبة
                        </CardTitle>
                    </div>
                    <Badge variant="outline">
                        {completionPercentage}% مكتمل
                    </Badge>
                </div>
                <CardDescription>
                    لضمان أفضل جودة للتوليد، يرجى إكمال المعلومات التالية
                </CardDescription>

                {/* شريط التقدم */}
                <div className="space-y-2">
                    <Progress value={completionPercentage} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>المعلومات المطلوبة</span>
                        <span>{completionPercentage}%</span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* الأخطاء */}
                {errorActions.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="font-medium text-red-700 dark:text-red-300 flex items-center gap-2">
                            <X className="h-4 w-4" />
                            مطلوب للمتابعة ({errorActions.length})
                        </h4>
                        {errorActions.map((action, index) => (
                            <ActionCard key={`error-${index}`} action={action} variant="error" />
                        ))}
                    </div>
                )}

                {/* أزرار الإجراءات السريعة */}
                {errorActions.length > 0 && (
                    <>
                        <Separator />
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onAddProjectInfo}
                                className="justify-start"
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                إضافة معلومات المشروع
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onUploadFiles}
                                className="justify-start"
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                رفع ملفات السياق
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onAddContext}
                                className="justify-start"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                إضافة سياق مخصص
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onConfigureSettings}
                                className="justify-start"
                            >
                                <Settings className="h-4 w-4 mr-2" />
                                تكوين الإعدادات
                            </Button>
                        </div>
                    </>
                )}

                {/* التحذيرات والمعلومات */}
                {(warningActions.length > 0 || infoActions.length > 0) && errorActions.length === 0 && (
                    <div className="space-y-3">
                        {infoActions.map((action, index) => (
                            <ActionCard key={`info-${index}`} action={action} variant="info" />
                        ))}
                        {warningActions.map((action, index) => (
                            <ActionCard key={`warning-${index}`} action={action} variant="warning" />
                        ))}
                    </div>
                )}

                {/* التوصيات */}
                {validation.recommendations.length > 0 && (
                    <Collapsible>
                        <CollapsibleTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-between p-2"
                                onClick={() => setShowDetails(!showDetails)}
                            >
                                <span className="flex items-center gap-2">
                                    <Lightbulb className="h-4 w-4" />
                                    نصائح لتحسين الجودة ({validation.recommendations.length})
                                </span>
                                <ChevronDown className={`h-4 w-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-3">
                            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg space-y-2">
                                {validation.recommendations.map((recommendation, index) => (
                                    <div key={index} className="text-sm text-blue-700 dark:text-blue-300">
                                        {recommendation}
                                    </div>
                                ))}
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                )}
            </CardContent>
        </Card>
    );
}
