
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProposalTemplateManager } from './ProposalTemplateManager';
import { ReportTemplateManager } from "./ReportTemplateManager";
import { PresentationTemplateManager } from "./PresentationTemplateManager";

export default function GenerationTemplateManager() {
    return (
        <Tabs defaultValue="proposal" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="proposal">Proposal Templates</TabsTrigger>
                <TabsTrigger value="report">Report Templates</TabsTrigger>
                <TabsTrigger value="presentation">Presentation Templates</TabsTrigger>
            </TabsList>
            <TabsContent value="proposal" className="mt-6">
                <ProposalTemplateManager />
            </TabsContent>
            <TabsContent value="report" className="mt-6">
                <ReportTemplateManager />
            </TabsContent>
            <TabsContent value="presentation" className="mt-6">
                <PresentationTemplateManager />
            </TabsContent>
        </Tabs>
    );
}
