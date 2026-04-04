'use client';

import React from 'react';
import { DocumentToolbarBase } from './DocumentToolbarBase';
import { Project } from '@/modules/projects/domain/entities/Project';

interface DocumentToolbarProps {
    project: Project | null;
    viewMode: 'edit' | 'preview';
    setViewMode: (mode: 'edit' | 'preview') => void;
    isFullscreen: boolean;
    onToggleFullscreen: () => void;
    suggestion: string;
    className?: string;
}

export const DocumentToolbar = (props: DocumentToolbarProps) => {
    return <DocumentToolbarBase {...props} />;
};
