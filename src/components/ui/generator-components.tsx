'use client';

import { AnimatedContainer, StaggeredAnimation } from '@/components/ui/animation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedProgress } from '@/components/ui/enhanced-progress';
import { cn } from '@/lib/utils';
import {
    AlertCircle,
    CheckCircle,
    Clock,
    Loader2,
    LucideIcon,
    Pause,
    Play,
    RotateCcw,
    Sparkles,
    Target
} from 'lucide-react';
import React from 'react';

// Generator Header Component
interface GeneratorHeaderProps {
    title: string;
    description: string;
    icon: LucideIcon;
    status?: 'idle' | 'generating' | 'completed' | 'error';
    progress?: number;
    className?: string;
}

export const GeneratorHeader: React.FC<GeneratorHeaderProps> = ({
    title,
    description,
    icon: Icon,
    status = 'idle',
    progress,
    className
}) => {
    const statusConfig = {
        idle: { color: 'from-gray-500 to-gray-600', badge: 'Ready' },
        generating: { color: 'from-blue-500 to-blue-600', badge: 'Generating' },
        completed: { color: 'from-green-500 to-green-600', badge: 'Completed' },
        error: { color: 'from-red-500 to-red-600', badge: 'Error' }
    };

    const config = statusConfig[status];

    return (
        <CardHeader className={cn("pb-4", className)}>
            <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg bg-gradient-to-br", config.color)}>
                    <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <CardDescription className="text-sm">{description}</CardDescription>
                </div>
                <Badge
                    variant={status === 'completed' ? 'default' : status === 'error' ? 'destructive' : 'secondary'}
                    className="text-xs"
                >
                    {status === 'generating' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                    {config.badge}
                </Badge>
            </div>
            {status === 'generating' && progress !== undefined && (
                <div className="mt-3">
                    <EnhancedProgress
                        value={progress}
                        variant="gradient"
                        indicatorVariant="shimmer"
                        size="lg"
                    />
                </div>
            )}
        </CardHeader>
    );
};

// Generator Actions Component
interface GeneratorActionsProps {
    onGenerate?: () => void;
    onReset?: () => void;
    onPause?: () => void;
    onResume?: () => void;
    isGenerating?: boolean;
    isPaused?: boolean;
    canGenerate?: boolean;
    creditCost?: number;
    className?: string;
}

export const GeneratorActions: React.FC<GeneratorActionsProps> = ({
    onGenerate,
    onReset,
    onPause,
    onResume,
    isGenerating = false,
    isPaused = false,
    canGenerate = true,
    creditCost = 0,
    className
}) => {
    return (
        <div className={cn("space-y-3", className)}>
            <div className="flex gap-2">
                {!isGenerating && !isPaused && (
                    <Button
                        onClick={onGenerate}
                        disabled={!canGenerate}
                        className="flex-1 hover:shadow-glow transition-all duration-200"
                        variant="gradient"
                    >
                        <Sparkles className="me-2 h-4 w-4" />
                        Generate
                    </Button>
                )}

                {isGenerating && (
                    <Button
                        onClick={onPause}
                        className="flex-1 hover:shadow-soft transition-all duration-200"
                        variant="outline"
                    >
                        <Pause className="me-2 h-4 w-4" />
                        Pause
                    </Button>
                )}

                {isPaused && (
                    <Button
                        onClick={onResume}
                        className="flex-1 hover:shadow-glow transition-all duration-200"
                        variant="gradient"
                    >
                        <Play className="me-2 h-4 w-4" />
                        Resume
                    </Button>
                )}

                <Button
                    onClick={onReset}
                    disabled={isGenerating}
                    variant="ghost"
                    size="icon"
                    className="hover:shadow-soft transition-all duration-200"
                >
                    <RotateCcw className="h-4 w-4" />
                </Button>
            </div>

            {creditCost > 0 && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Credit Cost:</span>
                    </div>
                    <Badge variant="secondary">{creditCost} credits</Badge>
                </div>
            )}
        </div>
    );
};

// Generator Status Component
interface GeneratorStatusProps {
    status: 'idle' | 'generating' | 'completed' | 'error';
    message?: string;
    progress?: number;
    className?: string;
}

export const GeneratorStatus: React.FC<GeneratorStatusProps> = ({
    status,
    message,
    progress,
    className
}) => {
    const statusConfig = {
        idle: {
            icon: Target,
            color: 'text-muted-foreground',
            bgColor: 'bg-muted/50',
            message: message || 'Ready to generate'
        },
        generating: {
            icon: Loader2,
            color: 'text-primary',
            bgColor: 'bg-primary/10',
            message: message || 'Generating content...'
        },
        completed: {
            icon: CheckCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-500/10',
            message: message || 'Generation completed'
        },
        error: {
            icon: AlertCircle,
            color: 'text-red-600',
            bgColor: 'bg-red-500/10',
            message: message || 'Generation failed'
        }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <div className={cn("p-4 rounded-lg", config.bgColor, className)}>
            <div className="flex items-center gap-3">
                <Icon className={cn("h-5 w-5", config.color, status === 'generating' && 'animate-spin')} />
                <div className="flex-1">
                    <p className={cn("text-sm font-medium", config.color)}>
                        {config.message}
                    </p>
                    {status === 'generating' && progress !== undefined && (
                        <EnhancedProgress
                            value={progress}
                            variant="gradient"
                            indicatorVariant="shimmer"
                            size="sm"
                            className="mt-2"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

// Generator Input Section Component
interface GeneratorInputSectionProps {
    title: string;
    description?: string;
    icon: LucideIcon;
    children: React.ReactNode;
    className?: string;
}

export const GeneratorInputSection: React.FC<GeneratorInputSectionProps> = ({
    title,
    description,
    icon: Icon,
    children,
    className
}) => {
    return (
        <AnimatedContainer animation="fade-in-up" delay={200}>
            <Card variant="glass" className={cn("backdrop-blur-md", className)}>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                            <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">{title}</CardTitle>
                            {description && (
                                <CardDescription className="text-sm">{description}</CardDescription>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {children}
                </CardContent>
            </Card>
        </AnimatedContainer>
    );
};

// Generator Output Section Component
interface GeneratorOutputSectionProps {
    title: string;
    description?: string;
    icon: LucideIcon;
    children: React.ReactNode;
    status?: 'idle' | 'generating' | 'completed' | 'error';
    className?: string;
}

export const GeneratorOutputSection: React.FC<GeneratorOutputSectionProps> = ({
    title,
    description,
    icon: Icon,
    children,
    status = 'idle',
    className
}) => {
    const statusConfig = {
        idle: { color: 'from-gray-500 to-gray-600' },
        generating: { color: 'from-blue-500 to-blue-600' },
        completed: { color: 'from-green-500 to-green-600' },
        error: { color: 'from-red-500 to-red-600' }
    };

    const config = statusConfig[status];

    return (
        <AnimatedContainer animation="fade-in-up" delay={400}>
            <Card variant="glass" className={cn("h-full backdrop-blur-md", className)}>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg bg-gradient-to-br", config.color)}>
                            <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <CardTitle className="text-lg">{title}</CardTitle>
                            {description && (
                                <CardDescription className="text-sm">{description}</CardDescription>
                            )}
                        </div>
                        {status === 'completed' && (
                            <Badge variant="secondary">
                                <Sparkles className="h-3 w-3 mr-1" />
                                Generated
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="h-full">
                    {children}
                </CardContent>
            </Card>
        </AnimatedContainer>
    );
};

// Generator Loading State Component
interface GeneratorLoadingStateProps {
    title: string;
    message: string;
    progress?: number;
    className?: string;
}

export const GeneratorLoadingState: React.FC<GeneratorLoadingStateProps> = ({
    title,
    message,
    progress,
    className
}) => {
    return (
        <AnimatedContainer animation="fade-in-up" delay={0}>
            <Card variant="glass" className={cn("flex items-center justify-center h-full min-h-[400px] backdrop-blur-md", className)}>
                <div className="text-center p-8">
                    <div className="p-4 rounded-full bg-gradient-to-br from-primary to-primary-600 mb-4">
                        <Loader2 className="w-8 h-8 animate-spin text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{title}</h3>
                    <p className="text-muted-foreground mb-4">{message}</p>
                    {progress !== undefined && (
                        <EnhancedProgress
                            value={progress}
                            variant="gradient"
                            indicatorVariant="shimmer"
                            size="lg"
                            className="w-64 mx-auto"
                        />
                    )}
                </div>
            </Card>
        </AnimatedContainer>
    );
};

// Generator Empty State Component
interface GeneratorEmptyStateProps {
    title: string;
    description: string;
    icon: LucideIcon;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

export const GeneratorEmptyState: React.FC<GeneratorEmptyStateProps> = ({
    title,
    description,
    icon: Icon,
    actionLabel,
    onAction,
    className
}) => {
    return (
        <AnimatedContainer animation="fade-in-up" delay={0}>
            <Card variant="glass" className={cn("flex items-center justify-center h-full min-h-[400px] backdrop-blur-md", className)}>
                <div className="text-center p-8">
                    <div className="p-4 rounded-full bg-gradient-to-br from-muted to-muted-foreground mb-4">
                        <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{title}</h3>
                    <p className="text-muted-foreground mb-4">{description}</p>
                    {actionLabel && onAction && (
                        <Button
                            onClick={onAction}
                            variant="gradient"
                            className="hover:shadow-glow transition-all duration-200"
                        >
                            <Sparkles className="me-2 h-4 w-4" />
                            {actionLabel}
                        </Button>
                    )}
                </div>
            </Card>
        </AnimatedContainer>
    );
};

// Generator Stats Component
interface GeneratorStatsProps {
    stats: Array<{
        label: string;
        value: string | number;
        icon: LucideIcon;
        color?: string;
    }>;
    className?: string;
}

export const GeneratorStats: React.FC<GeneratorStatsProps> = ({
    stats,
    className
}) => {
    return (
        <StaggeredAnimation
            staggerDelay={100}
            animation="fade-in-up"
            className={cn("grid grid-cols-2 sm:grid-cols-3 gap-4", className)}
        >
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <Card key={index} variant="glass" className="p-4 backdrop-blur-md group hover:shadow-glow hover:-translate-y-1 transition-all duration-300">
                        <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-lg bg-gradient-to-br", stat.color || "from-primary to-primary-600")}>
                                <Icon className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                <p className="text-lg font-bold text-primary">{stat.value}</p>
                            </div>
                        </div>
                    </Card>
                );
            })}
        </StaggeredAnimation>
    );
};
