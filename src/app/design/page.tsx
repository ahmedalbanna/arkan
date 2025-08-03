
'use client';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { DesignStudio } from "@/components/design/DesignStudio";
import { DocxPreview } from "@/components/design/DocxPreview";

export default function DesignPage() {
    return (
        <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-65px)] w-full">
            <ResizablePanel defaultSize={25} minSize={20} maxSize={30}>
                <DesignStudio />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={75}>
                <DocxPreview />
            </ResizablePanel>
        </ResizablePanelGroup>
    );
}
