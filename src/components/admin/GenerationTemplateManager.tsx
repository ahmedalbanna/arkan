
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportTemplateManager } from "./templates/ReportTemplateManager";
import { useLocalization } from "@/context/LocalizationContext";

export default function GenerationTemplateManager() {
    const { t } = useLocalization();
    return (
        <Tabs defaultValue="report" className="w-full">
            <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="report">{t('manageTemplates.reportTemplates')}</TabsTrigger>
            </TabsList>
            <TabsContent value="report" className="mt-6">
                <ReportTemplateManager />
            </TabsContent>
        </Tabs>
    );
}

    