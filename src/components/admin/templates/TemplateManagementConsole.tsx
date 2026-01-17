'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocalization } from '@/context/LocalizationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useDocxStyles, usePptxStyles, useReportTemplates } from '@/hooks';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const DocxTemplateManager = () => {
    const { templates, isLoading } = useDocxStyles();
    if(isLoading) return <Loader2 className="animate-spin" />;
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(templates).map(template => (
                <Card key={template.id}>
                    <CardHeader>
                        <CardTitle>{template.name}</CardTitle>
                        <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Image src={template.imageUrl || 'https://placehold.co/400x565.png'} alt={template.name} width={400} height={565} className="w-full h-auto rounded-md object-cover" data-ai-hint={template.dataAiHint} />
                    </CardContent>
                    <CardFooter><Button variant="outline" className="w-full">Edit</Button></CardFooter>
                </Card>
            ))}
        </div>
    );
};

const PptxTemplateManager = () => {
    const { templates, isLoading } = usePptxStyles();
    if(isLoading) return <Loader2 className="animate-spin" />;
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(templates).map(template => (
                <Card key={template.id}>
                    <CardHeader>
                        <CardTitle>{template.name}</CardTitle>
                        <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Image src={template.imageUrl || 'https://placehold.co/400x225.png'} alt={template.name} width={400} height={225} className="w-full h-auto rounded-md object-cover" data-ai-hint={template.dataAiHint}/>
                    </CardContent>
                    <CardFooter><Button variant="outline" className="w-full">Edit</Button></CardFooter>
                </Card>
            ))}
        </div>
    );
};

const ReportTemplateManager = () => {
    const { data: templates, isLoading } = useReportTemplates();
    if(isLoading) return <Loader2 className="animate-spin" />;
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates?.map(template => (
                <Card key={template.id}>
                    <CardHeader>
                        <CardTitle>{template.name}</CardTitle>
                        <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm font-medium">Sections:</p>
                        <ul className="list-disc pl-5 mt-2 text-sm text-muted-foreground">
                            {template.content?.flatMap(c => c.sections.map(s => s.title)).slice(0, 5).map((title, i) => <li key={i}>{title}</li>)}
                            {template.content && template.content.flatMap(c => c.sections).length > 5 && <li>...and more</li>}
                        </ul>
                    </CardContent>
                     <CardFooter><Button variant="outline" className="w-full">Edit</Button></CardFooter>
                </Card>
            ))}
        </div>
    );
};


export function TemplateManagementConsole() {
    const { t } = useLocalization();

    return (
        <Tabs defaultValue="docx" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="docx">{t('manageTemplates.docxTemplates')}</TabsTrigger>
              <TabsTrigger value="pptx">{t('manageTemplates.pptxTemplates')}</TabsTrigger>
              <TabsTrigger value="report">{t('manageTemplates.reportTemplates')}</TabsTrigger>
            </TabsList>
            <TabsContent value="docx" className="mt-6">
                <DocxTemplateManager />
            </TabsContent>
            <TabsContent value="pptx" className="mt-6">
                <PptxTemplateManager />
            </TabsContent>
            <TabsContent value="report" className="mt-6">
                <ReportTemplateManager />
            </TabsContent>
      </Tabs>
    );
}
