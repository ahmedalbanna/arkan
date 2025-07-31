
'use client';

import { UploadManager } from '../UploadManager';
import { Card, CardContent } from '../ui/card';
import type { ExternalContext } from '@/hooks/useReportStore';

interface AcademicUploadersProps {
    title: string;
    onContentAdded: (fileName: string, content: string, type?: 'context' | 'example') => void;
    onContentRemoved: (index: number) => void;
    isProcessing: boolean;
    isContext?: boolean;
    uploadedContent: { fileName: string; content: string; type?: 'context' | 'example' }[];
}

// This component is now a wrapper around the main UploadManager to ensure UI consistency.
export const AcademicUploaders = ({ title, onContentAdded, onContentRemoved, isProcessing, isContext = false, uploadedContent }: AcademicUploadersProps) => {
    
    // NOTE: The props are passed for potential future customizations specific to the academic solver,
    // but for now, we rely on the centralized UploadManager for the UI and logic.
    // The state management is handled by the `useAcademicSolverStore`, which interacts
    // with `useReportStore` under the hood for context management.
    
    return (
        <Card>
            <CardContent className="p-4 space-y-2">
                 <h3 className="font-semibold text-sm">{title}</h3>
                 <UploadManager />
            </CardContent>
        </Card>
    )
}
