/**
 * مكون التحقق الذكي الرئيسي
 * يوفر تحليل شامل للمدخلات وتوصيات ذكية
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QualityIndicator, SmartSuggestions, ValidationPanel } from '@/components/ui/validation-components';
import { useSmartSuggestions, useSmartValidation, type SmartValidationConfig } from '@/hooks/use-smart-validation';
import { cn } from '@/lib/utils';
import { CheckCircle, ChevronDown, ChevronUp, Lightbulb, RefreshCw } from 'lucide-react';
import { useState } from 'react';

interface SmartValidationPanelProps {
    config: SmartValidationConfig;
    onConfigUpdate?: (config: Partial<SmartValidationConfig>) => void;
    className?: string;
}

/**
 * لوحة التحقق الذكي الرئيسية
 */
export function SmartValidationPanel({
    config,
    onConfigUpdate,
    className
}: SmartValidationPanelProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    const validation = useSmartValidation(config);
    const suggestions = useSmartSuggestions(config);

    const handleSuggestionApply = (suggestion: any) => {
        // تطبيق الاقتراح على التكوين
        if (onConfigUpdate) {
            switch (suggestion.type) {
                case 'add':
                    if (suggestion.title.includes('مقترح المشروع')) {
                        onConfigUpdate({ proposal: { title: 'New Project Proposal' } });
                    } else if (suggestion.title.includes('خطة المشروع')) {
                        onConfigUpdate({ projectPlan: { title: 'New Project Plan' } });
                    } else if (suggestion.title.includes('ملفات السياق')) {
                        onConfigUpdate({ contextFiles: [{ fileName: 'context.txt', content: '', type: 'context' }] });
                    } else if (suggestion.title.includes('ملفات أمثلة')) {
                        onConfigUpdate({ exampleFiles: [{ fileName: 'example.txt', content: '' }] });
                    }
                    break;
                case 'improve':
                    if (suggestion.title.includes('توجيهات')) {
                        onConfigUpdate({ guidelines: ['استخدم اللغة العربية الفصحى', 'اجعل المحتوى مهنياً'] });
                    }
                    break;
            }
        }
    };

    return (
        <Card className={cn("w-full transition-all duration-300", className)}>
            <CardHeader
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <CheckCircle className={cn(
                                "h-5 w-5",
                                validation.canGenerate ? "text-green-500" : "text-gray-400"
                            )} />
                            <div>
                                <CardTitle className="text-lg">Smart Validation</CardTitle>
                                <CardDescription>
                                    AI-powered input analysis and recommendations
                                </CardDescription>
                            </div>
                        </div>

                        <Badge
                            variant={validation.score >= 80 ? "default" : validation.score >= 60 ? "secondary" : "destructive"}
                            className={cn(
                                validation.score >= 80 ? "bg-green-500" :
                                    validation.score >= 60 ? "bg-yellow-500" : "bg-red-500"
                            )}
                        >
                            {validation.score}/100
                        </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                // إعادة تحليل التكوين
                                window.location.reload();
                            }}
                        >
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                </div>
            </CardHeader>

            {isExpanded && (
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="issues">Issues</TabsTrigger>
                            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-4">
                            <ValidationPanel
                                result={validation}
                                onAction={(action) => {
                                    // معالجة الإجراءات
                                    console.log('Action requested:', action);
                                }}
                            />
                        </TabsContent>

                        <TabsContent value="issues" className="space-y-4">
                            {validation.issues.length > 0 ? (
                                <div className="space-y-3">
                                    <h3 className="font-medium text-sm">Issues Found</h3>
                                    {validation.issues.map((issue, index) => (
                                        <div
                                            key={index}
                                            className={cn(
                                                "p-3 border rounded-lg",
                                                issue.type === 'error' ? "border-red-200 bg-red-50/50" :
                                                    issue.type === 'warning' ? "border-yellow-200 bg-yellow-50/50" :
                                                        "border-blue-200 bg-blue-50/50"
                                            )}
                                        >
                                            <div className="flex items-start gap-2">
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-sm">{issue.title}</h4>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {issue.description}
                                                    </p>
                                                    {issue.action && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="mt-2 text-xs"
                                                            onClick={() => handleSuggestionApply({ type: 'fix', title: issue.action })}
                                                        >
                                                            {issue.action}
                                                        </Button>
                                                    )}
                                                </div>
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "text-xs",
                                                        issue.priority === 'high' ? 'border-red-200 text-red-600' :
                                                            issue.priority === 'medium' ? 'border-yellow-200 text-yellow-600' :
                                                                'border-blue-200 text-blue-600'
                                                    )}
                                                >
                                                    {issue.priority}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                                    <h3 className="font-medium">No Issues Found</h3>
                                    <p className="text-sm">Your input configuration looks good!</p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="suggestions" className="space-y-4">
                            <SmartSuggestions
                                suggestions={suggestions}
                                onApply={handleSuggestionApply}
                            />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            )}
        </Card>
    );
}

/**
 * مؤشر الجودة السريع
 */
export function QuickQualityIndicator({
    config,
    className
}: {
    config: SmartValidationConfig;
    className?: string;
}) {
    const validation = useSmartValidation(config);

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <QualityIndicator
                score={validation.score}
                label="Input Quality"
                description={validation.canGenerate ? "Ready to generate" : "Needs improvement"}
            />
            {validation.issues.length > 0 && (
                <Badge variant="destructive" className="text-xs">
                    {validation.issues.length} issues
                </Badge>
            )}
        </div>
    );
}

/**
 * مكون التحقق المدمج في الشريط الجانبي
 */
export function InlineValidationPanel({
    config,
    onConfigUpdate,
    className
}: {
    config: SmartValidationConfig;
    onConfigUpdate?: (config: Partial<SmartValidationConfig>) => void;
    className?: string;
}) {
    const validation = useSmartValidation(config);

    if (validation.score >= 80) {
        return (
            <div className={cn("p-3 bg-green-50 border border-green-200 rounded-lg", className)}>
                <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-700">
                        Excellent input quality ({validation.score}/100)
                    </span>
                </div>
            </div>
        );
    }

    if (validation.score >= 60) {
        return (
            <div className={cn("p-3 bg-yellow-50 border border-yellow-200 rounded-lg", className)}>
                <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-700">
                        Good input quality ({validation.score}/100) - can be improved
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("p-3 bg-red-50 border border-red-200 rounded-lg", className)}>
            <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium text-red-700">
                    Input quality needs improvement ({validation.score}/100)
                </span>
            </div>
            {validation.issues.length > 0 && (
                <div className="mt-2 text-xs text-red-600">
                    {validation.issues.length} issues found
                </div>
            )}
        </div>
    );
}
