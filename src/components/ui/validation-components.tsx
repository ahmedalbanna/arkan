/**
 * مكونات التحقق الذكي والتنبيهات
 * توفر تحليل ذكي للمدخلات وتوصيات للتحسين
 */

'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { AlertCircle, AlertTriangle, CheckCircle, Info, Lightbulb } from 'lucide-react';

export interface ValidationIssue {
    type: 'error' | 'warning' | 'info' | 'success';
    title: string;
    description: string;
    action?: string;
    priority: 'high' | 'medium' | 'low';
}

export interface ValidationResult {
    isValid: boolean;
    score: number; // 0-100
    issues: ValidationIssue[];
    recommendations: string[];
    canGenerate: boolean;
}

interface ValidationPanelProps {
    result: ValidationResult;
    onAction?: (action: string) => void;
    className?: string;
}

/**
 * لوحة التحقق الذكي الرئيسية
 */
export function ValidationPanel({ result, onAction, className }: ValidationPanelProps) {
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Fair';
        return 'Poor';
    };

    return (
        <Card className={cn("w-full", className)}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">Input Validation</CardTitle>
                        <CardDescription>
                            Analysis of your input quality and completeness
                        </CardDescription>
                    </div>
                    <div className="text-right">
                        <div className={cn("text-2xl font-bold", getScoreColor(result.score))}>
                            {result.score}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {getScoreLabel(result.score)}
                        </div>
                    </div>
                </div>

                <Progress value={result.score} className="mt-2" />
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Issues */}
                {result.issues.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="font-medium text-sm">Issues Found</h4>
                        {result.issues.map((issue, index) => (
                            <ValidationIssueCard
                                key={index}
                                issue={issue}
                                onAction={onAction}
                            />
                        ))}
                    </div>
                )}

                {/* Recommendations */}
                {result.recommendations.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="font-medium text-sm flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-yellow-500" />
                            Recommendations
                        </h4>
                        <div className="space-y-1">
                            {result.recommendations.map((rec, index) => (
                                <div key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="text-yellow-500 mt-0.5">•</span>
                                    <span>{rec}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Generation Status */}
                <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Ready to Generate</span>
                        <Badge
                            variant={result.canGenerate ? "default" : "secondary"}
                            className={result.canGenerate ? "bg-green-500" : ""}
                        >
                            {result.canGenerate ? "Yes" : "No"}
                        </Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

interface ValidationIssueCardProps {
    issue: ValidationIssue;
    onAction?: (action: string) => void;
}

/**
 * بطاقة مشكلة التحقق الفردية
 */
function ValidationIssueCard({ issue, onAction }: ValidationIssueCardProps) {
    const getIcon = () => {
        switch (issue.type) {
            case 'error':
                return <AlertCircle className="h-4 w-4 text-red-500" />;
            case 'warning':
                return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            case 'info':
                return <Info className="h-4 w-4 text-blue-500" />;
            case 'success':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
        }
    };

    const getPriorityColor = () => {
        switch (issue.priority) {
            case 'high':
                return 'border-red-200 bg-red-50/50';
            case 'medium':
                return 'border-yellow-200 bg-yellow-50/50';
            case 'low':
                return 'border-blue-200 bg-blue-50/50';
        }
    };

    return (
        <Alert className={cn("border-l-4", getPriorityColor())}>
            <div className="flex items-start gap-2">
                {getIcon()}
                <div className="flex-1">
                    <AlertTitle className="text-sm">{issue.title}</AlertTitle>
                    <AlertDescription className="text-sm mt-1">
                        {issue.description}
                    </AlertDescription>
                    {issue.action && onAction && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="mt-2 text-xs"
                            onClick={() => onAction(issue.action!)}
                        >
                            {issue.action}
                        </Button>
                    )}
                </div>
            </div>
        </Alert>
    );
}

interface QualityIndicatorProps {
    score: number;
    label: string;
    description?: string;
    className?: string;
}

/**
 * مؤشر الجودة البسيط
 */
export function QualityIndicator({
    score,
    label,
    description,
    className
}: QualityIndicatorProps) {
    const getColor = (score: number) => {
        if (score >= 80) return 'text-green-600 bg-green-100';
        if (score >= 60) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    return (
        <div className={cn("flex items-center gap-2 p-2 rounded-lg", className)}>
            <div className={cn("px-2 py-1 rounded text-xs font-medium", getColor(score))}>
                {score}/100
            </div>
            <div>
                <div className="text-sm font-medium">{label}</div>
                {description && (
                    <div className="text-xs text-muted-foreground">{description}</div>
                )}
            </div>
        </div>
    );
}

interface SmartSuggestionsProps {
    suggestions: Array<{
        type: 'add' | 'improve' | 'fix';
        title: string;
        description: string;
        impact: 'high' | 'medium' | 'low';
    }>;
    onApply?: (suggestion: any) => void;
    className?: string;
}

/**
 * لوحة الاقتراحات الذكية
 */
export function SmartSuggestions({ suggestions, onApply, className }: SmartSuggestionsProps) {
    if (suggestions.length === 0) return null;

    return (
        <Card className={cn("w-full", className)}>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    Smart Suggestions
                </CardTitle>
                <CardDescription>
                    AI-powered recommendations to improve your report quality
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
                {suggestions.map((suggestion, index) => (
                    <div
                        key={index}
                        className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge
                                        variant={
                                            suggestion.type === 'add' ? 'default' :
                                                suggestion.type === 'improve' ? 'secondary' : 'destructive'
                                        }
                                        className="text-xs"
                                    >
                                        {suggestion.type}
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "text-xs",
                                            suggestion.impact === 'high' ? 'border-red-200 text-red-600' :
                                                suggestion.impact === 'medium' ? 'border-yellow-200 text-yellow-600' :
                                                    'border-blue-200 text-blue-600'
                                        )}
                                    >
                                        {suggestion.impact} impact
                                    </Badge>
                                </div>
                                <h4 className="font-medium text-sm">{suggestion.title}</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {suggestion.description}
                                </p>
                            </div>

                            {onApply && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onApply(suggestion)}
                                    className="ml-2 text-xs"
                                >
                                    Apply
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
