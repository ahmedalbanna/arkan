// @ts-nocheck
'use client';

import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Section } from '@/lib/models/section';
import { SectionStatus } from '@/types';
import { AlertCircle, Calendar, CheckCircle2, Clock, Edit3, FileText, Loader2, Zap } from 'lucide-react';

interface SectionMetadataDisplayProps {
  section: Section;
  compact?: boolean;
}

/**
 * Display section metadata including generation status, word count, and timestamps
 */
export function SectionMetadataDisplay({ section, compact = false }: SectionMetadataDisplayProps) {
  const status = section.getStatus();
  const wordCount = section.getWordCount();
  const readTime = section.getReadTime();
  const aiModel = section.getAiModel();
  const generatedAt = section.getGeneratedAt();
  const attempts = section.getGenerationAttempts();

  // Status badge configuration
  const statusConfig = {
    [SectionStatus.DRAFT]: {
      icon: FileText,
      label: 'Draft',
      variant: 'secondary' as const,
      color: 'text-gray-500',
    },
    [SectionStatus.GENERATING]: {
      icon: Loader2,
      label: 'Generating...',
      variant: 'default' as const,
      color: 'text-blue-500',
      animate: true,
    },
    [SectionStatus.GENERATED]: {
      icon: CheckCircle2,
      label: 'Generated',
      variant: 'default' as const,
      color: 'text-green-500',
    },
    [SectionStatus.FAILED]: {
      icon: AlertCircle,
      label: 'Failed',
      variant: 'destructive' as const,
      color: 'text-red-500',
    },
    [SectionStatus.EDITED]: {
      icon: Edit3,
      label: 'Edited',
      variant: 'secondary' as const,
      color: 'text-purple-500',
    },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant={config.variant} className="flex items-center gap-1">
                <StatusIcon className={`h-3 w-3 ${config.color} ${config.animate ? 'animate-spin' : ''}`} />
                {config.label}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1 text-xs">
                {aiModel && <p>Model: {aiModel}</p>}
                {generatedAt && <p>Generated: {new Date(generatedAt).toLocaleString()}</p>}
                {attempts > 0 && <p>Attempts: {attempts}</p>}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {wordCount > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {wordCount}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{wordCount} words</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {readTime > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {readTime}min
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{readTime} minute read</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border p-4">
      {/* Status */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Status</span>
        <Badge variant={config.variant} className="flex items-center gap-1.5">
          <StatusIcon className={`h-3.5 w-3.5 ${config.color} ${config.animate ? 'animate-spin' : ''}`} />
          {config.label}
        </Badge>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        {wordCount > 0 && (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Words</p>
              <p className="font-medium">{wordCount.toLocaleString()}</p>
            </div>
          </div>
        )}

        {readTime > 0 && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Read Time</p>
              <p className="font-medium">{readTime} min</p>
            </div>
          </div>
        )}

        {aiModel && (
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">AI Model</p>
              <p className="font-medium text-xs">{aiModel.split('/')[1] || aiModel}</p>
            </div>
          </div>
        )}

        {generatedAt && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Generated</p>
              <p className="font-medium text-xs">
                {new Date(generatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Generation attempts (if failed or multiple attempts) */}
      {attempts > 1 && (
        <div className="border-t pt-2 text-xs text-muted-foreground">
          <p>Generation attempts: {attempts}</p>
        </div>
      )}
    </div>
  );
}
