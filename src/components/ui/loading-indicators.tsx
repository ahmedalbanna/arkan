/**
 * مكونات مؤشرات التحميل المحسنة
 * توفر تجربة مستخدم أفضل مع مؤشرات بصرية واضحة
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, Clock, Loader2 } from 'lucide-react';

export interface LoadingState {
    isLoading: boolean;
    isSuccess?: boolean;
    isError?: boolean;
    progress?: number;
    message?: string;
    estimatedTime?: number;
}

interface LoadingIndicatorProps {
    state: LoadingState;
    size?: 'sm' | 'md' | 'lg';
    showProgress?: boolean;
    showMessage?: boolean;
    className?: string;
}

/**
 * مؤشر التحميل الأساسي مع حالات متعددة
 */
export function LoadingIndicator({
    state,
    size = 'md',
    showProgress = true,
    showMessage = true,
    className
}: LoadingIndicatorProps) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8'
    };

    const textSizeClasses = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base'
    };

    if (state.isSuccess) {
        return (
            <div className={cn("flex items-center gap-2", className)}>
                <CheckCircle className={cn(sizeClasses[size], "text-green-500")} />
                {showMessage && state.message && (
                    <span className={cn(textSizeClasses[size], "text-green-600")}>
                        {state.message}
                    </span>
                )}
            </div>
        );
    }

    if (state.isError) {
        return (
            <div className={cn("flex items-center gap-2", className)}>
                <AlertCircle className={cn(sizeClasses[size], "text-red-500")} />
                {showMessage && state.message && (
                    <span className={cn(textSizeClasses[size], "text-red-600")}>
                        {state.message}
                    </span>
                )}
            </div>
        );
    }

    if (state.isLoading) {
        return (
            <div className={cn("flex items-center gap-2", className)}>
                <Loader2 className={cn(sizeClasses[size], "animate-spin text-blue-500")} />
                {showMessage && state.message && (
                    <span className={cn(textSizeClasses[size], "text-blue-600")}>
                        {state.message}
                    </span>
                )}
                {showProgress && state.progress !== undefined && (
                    <div className="flex items-center gap-1">
                        <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div
                                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${state.progress}%` }}
                            />
                        </div>
                        <span className={cn(textSizeClasses[size], "text-gray-600")}>
                            {state.progress}%
                        </span>
                    </div>
                )}
                {state.estimatedTime && (
                    <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className={cn(textSizeClasses[size], "text-gray-500")}>
                            ~{state.estimatedTime}s
                        </span>
                    </div>
                )}
            </div>
        );
    }

    return null;
}

interface SectionLoadingCardProps {
    sectionName: string;
    state: LoadingState;
    onRetry?: () => void;
    className?: string;
}

/**
 * بطاقة تحميل مخصصة لأقسام التقرير
 */
export function SectionLoadingCard({
    sectionName,
    state,
    onRetry,
    className
}: SectionLoadingCardProps) {
    return (
        <div className={cn(
            "p-4 border rounded-lg bg-card transition-all duration-200",
            state.isLoading && "border-blue-200 bg-blue-50/50",
            state.isSuccess && "border-green-200 bg-green-50/50",
            state.isError && "border-red-200 bg-red-50/50",
            className
        )}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <LoadingIndicator
                        state={state}
                        size="md"
                        showProgress={state.isLoading}
                        showMessage={false}
                    />
                    <div>
                        <h4 className="font-medium text-sm">{sectionName}</h4>
                        {state.message && (
                            <p className="text-xs text-muted-foreground mt-1">
                                {state.message}
                            </p>
                        )}
                    </div>
                </div>

                {state.isError && onRetry && (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onRetry}
                        className="text-xs"
                    >
                        Retry
                    </Button>
                )}
            </div>

            {state.isLoading && state.progress !== undefined && (
                <div className="mt-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Progress</span>
                        <span>{state.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${state.progress}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

interface GenerationStatusProps {
    totalSections: number;
    completedSections: number;
    failedSections: number;
    isGenerating: boolean;
    className?: string;
}

/**
 * مؤشر حالة التوليد العام
 */
export function GenerationStatus({
    totalSections,
    completedSections,
    failedSections,
    isGenerating,
    className
}: GenerationStatusProps) {
    const progress = totalSections > 0 ? (completedSections / totalSections) * 100 : 0;

    return (
        <div className={cn("p-4 bg-muted/50 rounded-lg", className)}>
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm">Generation Status</h3>
                <div className="flex gap-2">
                    <Badge variant="secondary" className="text-xs">
                        {completedSections} completed
                    </Badge>
                    {failedSections > 0 && (
                        <Badge variant="destructive" className="text-xs">
                            {failedSections} failed
                        </Badge>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Overall Progress</span>
                    <span>{Math.round(progress)}%</span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {isGenerating && (
                    <div className="flex items-center gap-2 text-xs text-blue-600">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Generating sections...</span>
                    </div>
                )}
            </div>
        </div>
    );
}
