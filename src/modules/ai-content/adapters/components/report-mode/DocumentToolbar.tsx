'use client';

import React from 'react';
import { DocumentToolbarBase } from '@/modules/ai-content/adapters/components/builder/toolbar/DocumentToolbarBase';
import { Project } from '@/modules/projects/domain/entities/Project';

interface DocumentToolbarProps {
    project: Project | null;
    viewMode: 'edit' | 'preview';
    setViewMode: (mode: 'edit' | 'preview') => void;
    isOutlineVisible: boolean;
    setIsOutlineVisible: (visible: boolean) => void;
    isFullscreen: boolean;
    toggleFullscreen: () => void;
    suggestion: string;
    showCoverPage: boolean;
    setShowCoverPage: (visible: boolean) => void;
}

export const DocumentToolbar = (props: DocumentToolbarProps) => {
    return <DocumentToolbarBase {...props} />;
};
