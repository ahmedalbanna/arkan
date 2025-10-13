/**
 * مكون التحقق الذكي الرئيسي
 * يوفر تحليل شامل للمدخلات وتوصيات ذكية
 */

'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QualityIndicator, SmartSuggestions, ValidationPanel } from '@/components/ui/validation-components';
import { useSmartSuggestions, useSmartValidation, type SmartValidationConfig } from '@/hooks/use-smart-validation';
import { cn } from '@/lib/utils';
import { CheckCircle, ChevronDown, ChevronUp, Lightbulb, RefreshCw, Shield } from 'lucide-react';
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
        <AnimatedContainer animation="fade-in-up" delay={200}>
            <Card variant="glass" className={cn("w-full transition-all duration-300 backdrop-blur-md shadow-soft hover:shadow-glow", className)}>
                <CardHeader
                    className="cursor-pointer hover:bg-gradient-to-r hover:from-primary/5 hover:to-blue-500/5 transition-all duration-200 bg-gradient-to-r from-primary/5 to-blue-500/5"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600">
                                <Shield className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className={cn(
                                    "h-5 w-5",
                                    validation.canGenerate ? "text-green-500" : "text-gray-400"
                                )} />
                                <div>
                                    <CardTitle className="text-lg font-headline font-semibold">Smart Validation</CardTitle>
                                    <CardDescription>
                                        AI-powered input analysis and recommendations
                                    </CardDescription>
                                </div>
                            </div>

                            <Badge
                                variant={validation.score >= 80 ? "default" : validation.score >= 60 ? "secondary" : "destructive"}
                                className={cn(
                                    "shadow-soft",
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
                                className="hover:shadow-soft transition-all duration-200"
                            >
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                    </div>
                </CardHeader>

                {isExpanded && (
                    <AnimatedContainer animation="fade-in-down" delay={300}>
                        <CardContent>
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-background/50 to-primary/5 backdrop-blur-sm">
                                    <TabsTrigger value="overview" className="hover:shadow-soft transition-all duration-200">Overview</TabsTrigger>
                                    <TabsTrigger value="issues" className="hover:shadow-soft transition-all duration-200">Issues</TabsTrigger>
                                    <TabsTrigger value="suggestions" className="hover:shadow-soft transition-all duration-200">Suggestions</TabsTrigger>
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
                                            <h3 className="font-medium text-sm font-headline">Issues Found</h3>
                                            {validation.issues.map((issue, index) => (
                                                <AnimatedContainer key={index} animation="fade-in-up" delay={100 + (index * 100)}>
                                                    <div
                                                        className={cn(
                                                            "p-3 border rounded-lg hover:shadow-soft transition-all duration-200",
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
                                                                        className="mt-2 text-xs hover:shadow-soft transition-all duration-200"
                                                                        onClick={() => handleSuggestionApply({ type: 'fix', title: issue.action })}
                                                                    >
                                                                        {issue.action}
                                                                    </Button>
                                                                )}
                                                            </div>
                                                            <Badge
                                                                variant="outline"
                                                                className={cn(
                                                                    "text-xs shadow-soft",
                                                                    issue.priority === 'high' ? 'border-red-200 text-red-600' :
                                                                        issue.priority === 'medium' ? 'border-yellow-200 text-yellow-600' :
                                                                            'border-blue-200 text-blue-600'
                                                                )}
                                                            >
                                                                {issue.priority}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </AnimatedContainer>
                                            ))}
                                        </div>
                                    ) : (
                                        <AnimatedContainer animation="fade-in-up" delay={200}>
                                            <div className="text-center py-8 text-muted-foreground">
                                                <div className="p-4 rounded-full bg-gradient-to-br from-green-500/10 to-green-600/10 shadow-glow mb-4">
                                                    <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
                                                </div>
                                                <h3 className="font-medium font-headline">No Issues Found</h3>
                                                <p className="text-sm">Your input configuration looks good!</p>
                                            </div>
                                        </AnimatedContainer>
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
                    </AnimatedContainer>
                )}
            </Card>
        </AnimatedContainer>
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
        <AnimatedContainer animation="fade-in-up" delay={200}>
            <div className={cn("flex items-center gap-2", className)}>
                <QualityIndicator
                    score={validation.score}
                    label="Input Quality"
                    description={validation.canGenerate ? "Ready to generate" : "Needs improvement"}
                />
                {validation.issues.length > 0 && (
                    <Badge variant="destructive" className="text-xs shadow-soft">
                        {validation.issues.length} issues
                    </Badge>
                )}
            </div>
        </AnimatedContainer>
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
            <AnimatedContainer animation="fade-in-up" delay={200}>
                <div className={cn("p-3 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg shadow-soft", className)}>
                    <div className="flex items-center gap-2">
                        <div className="p-1 rounded-full bg-gradient-to-br from-green-500 to-green-600">
                            <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-green-700">
                            Excellent input quality ({validation.score}/100)
                        </span>
                    </div>
                </div>
            </AnimatedContainer>
        );
    }

    if (validation.score >= 60) {
        return (
            <AnimatedContainer animation="fade-in-up" delay={200}>
                <div className={cn("p-3 bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg shadow-soft", className)}>
                    <div className="flex items-center gap-2">
                        <div className="p-1 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600">
                            <Lightbulb className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-yellow-700">
                            Good input quality ({validation.score}/100) - can be improved
                        </span>
                    </div>
                </div>
            </AnimatedContainer>
        );
    }

    return (
        <AnimatedContainer animation="fade-in-up" delay={200}>
            <div className={cn("p-3 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg shadow-soft", className)}>
                <div className="flex items-center gap-2">
                    <div className="p-1 rounded-full bg-gradient-to-br from-red-500 to-red-600">
                        <Lightbulb className="h-4 w-4 text-white" />
                    </div>
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
        </AnimatedContainer>
    );
}
