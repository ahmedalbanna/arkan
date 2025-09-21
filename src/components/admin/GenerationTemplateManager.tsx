
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportTemplateManager } from "./templates/ReportTemplateManager";
import { PresentationTemplateManager } from "./templates/PresentationTemplateManager";
import { useLocalization } from "@/context/LocalizationContext";

export default function GenerationTemplateManager() {
    const { t } = useLocalization();
    return (
        <Tabs defaultValue="report" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="report">{t('manageTemplates.reportTemplates')}</TabsTrigger>
                <TabsTrigger value="presentation">{t('manageTemplates.presentationTemplates')}</TabsTrigger>
            </TabsList>
            <TabsContent value="report" className="mt-6">
                <ReportTemplateManager />
            </TabsContent>
            <TabsContent value="presentation" className="mt-6">
                <PresentationTemplateManager />
            </TabsContent>
        </Tabs>
    );
}
