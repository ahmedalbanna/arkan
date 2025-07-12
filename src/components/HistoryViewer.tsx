'use client';

import { useHistory } from '@/hooks/use-history';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { History, Loader2, Trash2, FileText, Download, Copy, Check, Share2 } from 'lucide-react';
import type { HistoryEntry, ProposalHistoryData, ReportHistoryData, DiagramHistoryData } from '@/lib/types';
import { saveAs } from 'file-saver';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { format } from 'date-fns';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { type TemplateKey, templates } from '@/lib/docx-styles';
import { exportProposalAsDocx, exportReportAsDocx } from '@/lib/docx-exporter';
import { useRouter } from 'next/navigation';
import { markdownComponents } from '@/lib/markdown-components';
import DiagramViewer from './DiagramViewer';


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
            await exportProposalAsDocx(proposal, templateKey);
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
                    <h3 className="flex items-center gap-2 font-headline text-lg mb-2">Objective</h3>
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
            await exportReportAsDocx(sections, {}, proposalTitle, templateKey);
        }
    };

    return (
        <Card className="mt-4">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="font-headline text-xl text-primary">{entry.title}</CardTitle>
                    <Button variant="outline" size="icon" onClick={handleExportDOCX}><FileText className="h-4 w-4" /></Button>
                </div>
                <CardDescription>From proposal: "{proposalTitle}"</CardDescription>
            </CardHeader>
            <CardContent className="max-w-none">
                <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </CardContent>
        </Card>
    );
}

function DiagramHistoryItem({ entry }: { entry: DiagramHistoryData & { title: string } }) {
    const { diagramType, plantUmlCode, imageUrl, proposalTitle } = entry;

    return (
        <Card className="mt-4">
            <CardHeader>
                <CardTitle className="font-headline text-xl text-primary">{entry.title}</CardTitle>
                <CardDescription>From proposal: "{proposalTitle}"</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <DiagramViewer
                    title={entry.title}
                    imageUrl={imageUrl}
                    plantUmlCode={plantUmlCode}
                    isReadOnly={true}
                />
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
            content = <p>Unknown history type.</p>;
    }

    return (
        <div className="mb-4 border-b">
            <Accordion type="single" collapsible>
                <AccordionItem value={entry.id}>
                    <AccordionTrigger className="p-4 font-headline hover:no-underline">
                        <div className="flex flex-col text-left items-start gap-1 w-full">
                            <span className="text-lg">{entry.title}</span>
                            <span className="text-xs text-muted-foreground font-normal">
                                {format(new Date(entry.createdAt), "d MMMM yyyy, h:mm a")}
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
                <h3 className="mt-4 text-lg font-medium">No History Yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    Start generating a proposal, report, or diagram and it will show up here.
                </p>
            </div>
        );
    }

    return (
        <div>
            <div className="text-right mb-4">
                <Button variant="destructive" size="sm" onClick={clearHistory}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear History
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
