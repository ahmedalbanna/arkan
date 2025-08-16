
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProposalTemplateManager } from './templates/ProposalTemplateManager';
import { ReportTemplateManager } from "./templates/ReportTemplateManager";
import { PresentationTemplateManager } from "./templates/PresentationTemplateManager";
import { useLocalization } from "@/context/LocalizationContext";

export default function GenerationTemplateManager() {
    const { t } = useLocalization();
    return (
        <Tabs defaultValue="proposal" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="proposal">{t('manageTemplates.proposalTemplates')}</TabsTrigger>
                <TabsTrigger value="report">{t('manageTemplates.reportTemplates')}</TabsTrigger>
                <TabsTrigger value="presentation">{t('manageTemplates.presentationTemplates')}</TabsTrigger>
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
