'use client';

import { UploadManager } from '../UploadManager';
import { Card, CardContent } from '../ui/card';

interface AcademicUploadersProps {
    title: string;
    isProcessing: boolean;
    isContext?: boolean;
}

// This component is now a wrapper around the main UploadManager to ensure UI consistency.
export const AcademicUploaders = ({ title, isProcessing, isContext = false }: AcademicUploadersProps) => {
    
    // NOTE: The props are passed for potential future customizations specific to the academic solver,
    // but for now, we rely on the centralized UploadManager for the UI and logic.
    // The state management is handled by the `useAcademicSolverStore`, which interacts
    // with `useReportStore` under the hood for context management.
    
    return (
        <Card>
            <CardContent className="p-4 space-y-2">
                 <h3 className="font-semibold text-sm">{title}</h3>
                 <p className="text-xs text-muted-foreground">You can upload PDFs, DOCX files, images, or paste text.</p>
                 <UploadManager />
            </CardContent>
        </Card>
    )
}
