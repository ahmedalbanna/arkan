
'use client';

import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Download } from 'lucide-react';
import { useBuilderStore } from '@/hooks';

/**
 * A client component responsible for downloading the current project state.
 */
export function DownloadProjectButton() {
    // Select both the project and a boolean indicating if it has content.
    // This ensures the component re-renders when the project's content changes.
    const { project } = useBuilderStore((state) => ({
        project: state.project,
    }));

    // Use the new hasContent method from the Project model
    const hasContent = project?.hasContent() ?? false;

    const handleDownload = () => {
        if (!project) return;
        const projectData = JSON.stringify(project.toStateObject(), null, 2);
        const blob = new Blob([projectData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // Use a default name if project name is not set
        const fileName = project.name ? project.name.replace(/\s+/g, '_') : 'untitled_project';
        a.download = `${fileName}.arkan`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div
                        // The button is wrapped in a div to ensure the tooltip
                        // shows even when the button is disabled.
                    >
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleDownload}
                            disabled={!hasContent}
                            className="h-8 w-8 md:w-auto md:px-3"
                        >
                            <Download className="h-4 w-4" />
                            <span className="hidden md:inline ms-2">Download</span>
                        </Button>
                    </div>
                </TooltipTrigger>
                <TooltipContent className="md:hidden">
                    <p>Download Project</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
