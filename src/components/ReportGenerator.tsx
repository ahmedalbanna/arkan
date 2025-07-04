'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { handleGenerateSection, type ReportState, type SectionName } from '@/app/generate-report/actions';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Loader2, Sparkles, BookText, Library, TestTube2, Waypoints, Code, Flag, BookMarked, FileDown, FileText } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

// New imports
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, HeadingLevel, AlignmentType } from 'docx';


const sectionConfig: { [key in SectionName]: { title: string; icon: React.ElementType } } = {
    introduction: { title: "المقدمة", icon: BookMarked },
    literatureReview: { title: "مراجعة الأدبيات", icon: Library },
    systemAnalysis: { title: "تحليل النظام", icon: Waypoints },
    designStrategy: { title: "استراتيجية التصميم", icon: BookText },
    systemDesign: { title: "تصميم النظام", icon: Code },
    systemProgramming: { title: "برمجة النظام", icon: Code },
    systemTesting: { title: "اختبار النظام", icon: TestTube2 },
    conclusion: { title: "الخاتمة", icon: Flag },
};


function GenerateButton({ section }: { section: SectionName }) {
    const { pending } = useFormStatus();
    const [lastClicked, setLastClicked] = useState<SectionName | null>(null);

    return (
        <Button
            type="submit"
            name="sectionToGenerate"
            value={section}
            onClick={() => setLastClicked(section)}
            disabled={pending}
            variant="secondary"
            className="w-full justify-start"
        >
            {pending && lastClicked === section ? (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            ) : (
                <Sparkles className="ml-2 h-4 w-4" />
            )}
            توليد قسم: {sectionConfig[section].title}
        </Button>
    );
}

function ReportSection({ title, content, icon: Icon }: { title: string; content?: string; icon: React.ElementType }) {
    if (!content) return null;

    return (
        <AccordionItem value={title}>
            <AccordionTrigger className="font-headline text-xl">
                <Icon className="ml-2 h-5 w-5 text-primary" /> {title}
            </AccordionTrigger>
            <AccordionContent className="prose dark:prose-invert max-w-none whitespace-pre-wrap p-4 text-muted-foreground">
                {content}
            </AccordionContent>
        </AccordionItem>
    );
}

export default function ReportGenerator() {
    const initialState: ReportState = { sections: {} };
    const [state, formAction] = useActionState(handleGenerateSection, initialState);
    
    const hasContent = Object.values(state.sections).some(s => !!s);
    const orderedSections = Object.keys(sectionConfig) as SectionName[];

    const handleExportPDF = () => {
        if (typeof window === "undefined") return;

        const sectionsToExport = orderedSections
            .map(key => {
                const content = state.sections[key];
                return content ? { title: sectionConfig[key].title, content } : null;
            })
            .filter((s): s is { title: string; content: string } => s !== null);

        if (sectionsToExport.length === 0) return;

        const reportHtml = `
            <html>
                <head>
                    <title>Project Report</title>
                    <style>
                        body { 
                            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; 
                            line-height: 1.6; 
                            direction: rtl; 
                            text-align: right;
                            margin: 2rem;
                        }
                        h1 { font-size: 2em; text-align: center; margin-bottom: 1.5em; color: #111; }
                        h2 { font-size: 1.5em; margin-top: 2em; margin-bottom: 1em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; color: #222; }
                        div { white-space: pre-wrap; color: #444; }
                        @media print {
                            body { margin: 1in; }
                        }
                    </style>
                </head>
                <body>
                    <h1>تقرير المشروع</h1>
                    ${sectionsToExport.map(({ title, content }) => `
                        <section>
                            <h2>${title}</h2>
                            <div>${content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
                        </section>
                    `).join('')}
                </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.open();
            printWindow.document.write(reportHtml);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
        }
    };

    const handleExportDOCX = () => {
        const sectionsToExport = orderedSections
            .map(key => {
                const content = state.sections[key];
                return content ? { title: sectionConfig[key].title, content } : null;
            })
            .filter((s): s is { title: string; content: string } => s !== null);

        if (sectionsToExport.length === 0) return;

        const doc = new Document({
            sections: [{
                properties: {
                    titlePage: false,
                },
                children: [
                    new Paragraph({
                        text: "تقرير المشروع",
                        heading: HeadingLevel.TITLE,
                        alignment: AlignmentType.CENTER,
                    }),
                    ...sectionsToExport.flatMap(({ title, content }) => [
                        new Paragraph({
                            text: title,
                            heading: HeadingLevel.HEADING_1,
                            spacing: { before: 400, after: 200 },
                        }),
                        ...content.split('\n').filter(line => line.trim() !== '').map(line => new Paragraph({ text: line }))
                    ])
                ],
            }],
        });

        Packer.toBlob(doc).then(blob => {
            saveAs(blob, "project-report.docx");
        });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
                <form action={formAction}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">مقترح المشروع (JSON)</CardTitle>
                            <CardDescription>
                                الصق هنا محتوى مقترح المشروع الكامل بصيغة JSON.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                name="proposalJson"
                                placeholder='{ "title": "...", "objective": "...", ... }'
                                rows={15}
                                required
                            />
                            {state?.error && (
                                <p className="text-sm font-medium text-destructive mt-2">{state.error}</p>
                            )}
                        </CardContent>
                        <CardFooter className="flex flex-col gap-2 items-start">
                           {orderedSections.map(key => (
                               <GenerateButton key={key} section={key} />
                           ))}
                        </CardFooter>
                    </Card>
                </form>
            </div>
            <div className="md:col-span-2">
                 <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="font-headline">تصدير التقرير</CardTitle>
                        <CardDescription>
                            تصدير الأقسام التي تم إنشاؤها إلى ملف PDF أو DOCX.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row gap-4">
                        <Button onClick={handleExportPDF} disabled={!hasContent} className="w-full sm:w-auto font-headline">
                            <FileDown className="ml-2 h-4 w-4" />
                            تصدير كملف PDF
                        </Button>
                        <Button onClick={handleExportDOCX} disabled={!hasContent} className="w-full sm:w-auto font-headline">
                            <FileText className="ml-2 h-4 w-4" />
                            تصدير كملف DOCX
                        </Button>
                    </CardContent>
                </Card>

                 {state?.lastGenerated && !state.error && (
                    <Alert className="mb-6">
                        <Sparkles className="h-4 w-4" />
                        <AlertTitle className="font-headline">تم التوليد بنجاح!</AlertTitle>
                        <AlertDescription>
                            تم توليد قسم "{sectionConfig[state.lastGenerated].title}". يمكنك عرضه أدناه.
                        </AlertDescription>
                    </Alert>
                )}
                 <Accordion type="single" collapsible className="w-full space-y-4" defaultValue={state.lastGenerated ? sectionConfig[state.lastGenerated].title : undefined}>
                    {orderedSections.map((key) => {
                        const { title, icon } = sectionConfig[key];
                        return (
                            <ReportSection
                                key={key}
                                title={title}
                                icon={icon}
                                content={state.sections[key as SectionName]}
                            />
                        )
                    })}
                </Accordion>
            </div>
        </div>
    );
}
