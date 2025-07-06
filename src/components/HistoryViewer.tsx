'use client';

import { useHistory } from '@/hooks/use-history';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { History, Loader2, Trash2, FileText, Download, Copy, Check, Share2 } from 'lucide-react';
import type { HistoryEntry, ProposalHistoryData, ReportHistoryData, DiagramHistoryData } from '@/lib/types';
import { saveAs } from 'file-saver';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { type TemplateKey, templates } from '@/lib/docx-styles';
import { exportProposalAsDocx, exportReportAsDocx } from '@/lib/docx-exporter';
import { useRouter } from 'next/navigation';

const markdownComponents = {
  h1: ({node, ...props}) => <h1 className="mt-6 mb-4 text-3xl font-bold text-primary font-headline" {...props} />,
  h2: ({node, ...props}) => <h2 className="mt-5 mb-3 text-2xl font-bold text-primary font-headline" {...props} />,
  h3: ({node, ...props}) => <h3 className="mt-4 mb-2 text-xl font-semibold font-headline" {...props} />,
  p: ({node, ...props}) => <p className="mb-4 leading-relaxed" {...props} />,
  a: ({node, ...props}) => <a className="text-accent underline hover:text-accent/80" {...props} />,
  ul: ({node, ...props}) => <ul className="mb-4 ml-6 list-disc space-y-2" {...props} />,
  ol: ({node, ...props}) => <ol className="mb-4 ml-6 list-decimal space-y-2" {...props} />,
  li: ({node, ...props}) => <li className="pl-2" {...props} />,
  blockquote: ({node, ...props}) => <blockquote className="my-4 border-l-4 border-primary/20 pl-4 italic text-muted-foreground" {...props} />,
  code: ({node, inline, className, children, ...props}) => {
    return !inline ? (
      <pre className="my-4 overflow-x-auto rounded-md bg-muted p-4"><code className="font-mono text-sm" {...props}>{children}</code></pre>
    ) : (
      <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm text-muted-foreground" {...props}>{children}</code>
    )
  }
};


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
            await exportReportAsDocx(sections, {}, proposalTitle, template.styles);
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
                <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
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
                <CardDescription>From proposal: "{proposalTitle}"</CardDescription>
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
                    <Button onClick={handleDownload}><Download className="ml-2 h-4 w-4" /> Download Image</Button>
                    <Button variant="outline" onClick={handleCopy}>
                        {isCopied ? <Check className="ml-2 h-4 w-4 text-green-500" /> : <Copy className="ml-2 h-4 w-4" />}
                        Copy Code
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
