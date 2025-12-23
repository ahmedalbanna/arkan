
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
    const { project } = useBuilderStore((state) => ({
        project: state.project,
    }));

    const hasContent = project?.hasContent() ?? false;

    function handleDownload() {
        if (!project) return;
        project.downloadAsFile();
    }

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
