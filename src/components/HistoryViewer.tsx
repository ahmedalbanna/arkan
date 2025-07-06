'use client';

import { useHistory } from '@/hooks/use-history';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { History, Loader2, Trash2, FileDown, FileText, Download, Copy, Check, Share2, Sparkles, Pin, Milestone, BarChart, ShieldAlert, Users, Briefcase, BadgeEuro, Calendar } from 'lucide-react';
import type { HistoryEntry, ProposalHistoryData, ReportHistoryData, DiagramHistoryData } from '@/lib/types';
import { saveAs } from 'file-saver';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { marked } from 'marked';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { Textarea } from './ui/textarea';
import { type TemplateKey, templates } from '@/lib/docx-styles';
import { exportProposalAsDocx, exportReportAsDocx } from '@/lib/docx-exporter';
import { useRouter } from 'next/navigation';

function ProposalHistoryItem({ entry }: { entry: ProposalHistoryData & { title: string } }) {
    const { proposal } = entry;
    const [isCopied, setIsCopied] = useState(false);
    const router = useRouter();

    const handleCopyJson = () => {
        const jsonString = JSON.stringify(proposal, null, 2);
        navigator.clipboard.writeText(jsonString).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    const handleExportDOCX = async () => {
        const templateKey = (localStorage.getItem('arkan-docx-template') as TemplateKey) || 'modern';
        const template = templates[templateKey];
        if (template) {
            await exportProposalAsDocx(proposal, template.styles);
        }
    };

    return (
      <Card className="mt-4">
        <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <Badge variant="secondary" className="w-fit mb-2">{proposal.category}</Badge>
                    <CardTitle className="font-headline text-2xl text-primary">{proposal.title}</CardTitle>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={handleCopyJson}><Copy className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon" onClick={handleExportDOCX}><FileText className="h-4 w-4" /></Button>
                </div>
            </div>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
                <h3 className="flex items-center gap-2 font-headline text-lg mb-2"><Pin className="h-5 w-5 text-primary" /> الهدف</h3>
                <p className="text-muted-foreground">{proposal.objective}</p>
            </div>
        </CardContent>
      </Card>
    );
}


function ReportHistoryItem({ entry }: { entry: ReportHistoryData & { title: string } }) {
    const { section, content, proposalTitle } = entry;
    
    const handleExportDOCX = async () => {
        const templateKey = (localStorage.getItem('arkan-docx-template') as TemplateKey) || 'modern';
        const template = templates[templateKey];
        if (template) {
            const sections = { [section]: content };
            await exportReportAsDocx(sections, proposalTitle, template.styles);
        }
    };

    return (
        <Card className="mt-4">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="font-headline text-xl text-primary">{entry.title}</CardTitle>
                    <Button variant="outline" size="icon" onClick={handleExportDOCX}><FileText className="h-4 w-4" /></Button>
                </div>
                <CardDescription>عن مقترح: "{proposalTitle}"</CardDescription>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
                <ReactMarkdown>{content}</ReactMarkdown>
            </CardContent>
        </Card>
    );
}

function DiagramHistoryItem({ entry }: { entry: DiagramHistoryData & { title: string } }) {
    const { diagramType, plantUmlCode, imageUrl, proposalTitle } = entry;
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(plantUmlCode).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };
    
    const handleDownload = () => {
        saveAs(imageUrl, `${diagramType}_diagram.png`);
    };

    return (
        <Card className="mt-4">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="font-headline text-xl text-primary">{entry.title}</CardTitle>
                </div>
                <CardDescription>عن مقترح: "{proposalTitle}"</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Image 
                    src={imageUrl} 
                    alt={`Rendered ${diagramType} diagram`}
                    width={800}
                    height={600}
                    className="w-full h-auto object-contain rounded-md border bg-white p-2"
                />
                <Textarea
                    readOnly
                    value={plantUmlCode}
                    rows={10}
                    className="bg-muted p-4 rounded-md text-sm text-left font-mono"
                    dir="ltr"
                />
                 <div className="flex gap-2">
                    <Button onClick={handleDownload}><Download className="ml-2 h-4 w-4" /> تحميل الصورة</Button>
                    <Button variant="outline" onClick={handleCopy}>
                        {isCopied ? <Check className="ml-2 h-4 w-4 text-green-500" /> : <Copy className="ml-2 h-4 w-4" />}
                        نسخ الكود
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}


function HistoryItem({ entry }: { entry: HistoryEntry }) {
    let content;
    switch (entry.type) {
        case 'proposal':
            content = <ProposalHistoryItem entry={entry} />;
            break;
        case 'report':
            content = <ReportHistoryItem entry={entry} />;
            break;
        case 'diagram':
            content = <DiagramHistoryItem entry={entry} />;
            break;
        default:
            content = <p>نوع سجل غير معروف.</p>;
    }

    return (
        <div className="mb-4 border-b">
            <Accordion type="single" collapsible>
                <AccordionItem value={entry.id}>
                    <AccordionTrigger className="p-4 font-headline hover:no-underline">
                        <div className="flex flex-col text-right items-start gap-1 w-full">
                            <span className="text-lg">{entry.title}</span>
                            <span className="text-xs text-muted-foreground font-normal">
                                {format(new Date(entry.createdAt), "d MMMM yyyy, h:mm a", { locale: ar })}
                            </span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 pt-0">
                        {content}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}


export default function HistoryViewer() {
    const { history, isLoaded, clearHistory } = useHistory();

    if (!isLoaded) {
        return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (history.length === 0) {
        return (
            <div className="text-center py-16 px-6 border-dashed border-2 rounded-lg">
                <History className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">لا توجد سجلات بعد</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    ابدأ بتوليد مقترح أو تقرير أو مخطط وسيظهر هنا.
                </p>
            </div>
        );
    }

    return (
        <div>
            <div className="text-right mb-4">
                <Button variant="destructive" size="sm" onClick={clearHistory}>
                    <Trash2 className="ml-2 h-4 w-4" />
                    مسح السجل
                </Button>
            </div>
            <Card>
                <CardContent className="p-0">
                    {history.map(entry => <HistoryItem key={entry.id} entry={entry} />)}
                </CardContent>
            </Card>
        </div>
    )
}
