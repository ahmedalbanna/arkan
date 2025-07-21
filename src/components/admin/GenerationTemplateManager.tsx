
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProposalTemplateManager } from './ProposalTemplateManager';
import { ReportTemplateManager } from "./ReportTemplateManager";

export default function GenerationTemplateManager() {
    return (
        <Tabs defaultValue="proposal" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="proposal">Proposal Templates</TabsTrigger>
                <TabsTrigger value="report">Report Templates</TabsTrigger>
                {/* Presentation templates can be added here in the future */}
            </TabsList>
            <TabsContent value="proposal" className="mt-6">
                <ProposalTemplateManager />
            </TabsContent>
            <TabsContent value="report" className="mt-6">
                <ReportTemplateManager />
            </TabsContent>
        </Tabs>
    );
}
