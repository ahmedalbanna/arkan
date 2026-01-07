
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GrammarChecker } from '../writing-tools/grammar-checker';
import { ReadabilityChecker } from '../writing-tools/readability-checker';
import { ToneAnalyzer } from '../writing-tools/tone-analyzer';
import { WordChoiceImprover } from '../writing-tools/word-choice-improver';
import { Check, Edit, Eye, User, FileText, Bot, FileSpreadsheet, Presentation, GitGraph, BookCheck, Workflow, DraftingCompass, Network, Quote, Link2, SearchCheck, ShieldCheck } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';
import { DocumentStructureAnalyzer } from '../writing-tools/document-structure-analyzer';
import { LogicalFlowChecker } from '../writing-tools/logical-flow-checker';
import { ArgumentStructureAnalyzer } from '../writing-tools/argument-structure-analyzer';
import { CitationValidator } from '../writing-tools/citation-validator';
import { ReferenceChecker } from '../writing-tools/reference-checker';
import { CitationMatcher } from '../writing-tools/citation-matcher';
import { DocumentQualityAnalyzer } from '../writing-tools/document-quality-analyzer';

export function WritingToolsDashboard() {
    const { t } = useLocalization();
    const tabs = [
        { id: 'grammar', title: 'Grammar & Style', icon: <Check size={16} />, component: <GrammarChecker /> },
        { id: 'tone', title: 'Tone Analysis', icon: <User size={16} />, component: <ToneAnalyzer /> },
        { id: 'readability', title: 'Readability', icon: <Eye size={16} />, component: <ReadabilityChecker /> },
        { id: 'word-choice', title: 'Word Choice', icon: <Edit size={16} />, component: <WordChoiceImprover /> },
        { id: 'structure', title: 'Structure', icon: <DraftingCompass size={16} />, component: <DocumentStructureAnalyzer /> },
        { id: 'logical-flow', title: 'Logical Flow', icon: <Workflow size={16} />, component: <LogicalFlowChecker /> },
        { id: 'argument-structure', title: 'Argument Structure', icon: <Network size={16} />, component: <ArgumentStructureAnalyzer /> },
        { id: 'citation-validation', title: 'Citation Validator', icon: <Quote size={16} />, component: <CitationValidator /> },
        { id: 'reference-checker', title: 'Reference Checker', icon: <Link2 size={16} />, component: <ReferenceChecker /> },
        { id: 'citation-matcher', title: 'Citation Matcher', icon: <SearchCheck size={16} />, component: <CitationMatcher /> },
        { id: 'quality-analyzer', title: 'Quality Analyzer', icon: <ShieldCheck size={16} />, component: <DocumentQualityAnalyzer /> },
    ];
    
    return (
        <Card className="border-0 shadow-none">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl md:text-4xl font-bold font-headline flex items-center justify-center gap-3">
                    <Bot className="h-8 w-8 text-primary"/>
                    Professional Writing Studio
                </CardTitle>
                <CardDescription className="text-lg">
                    Your suite of AI-powered tools to analyze and improve any document.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="grammar" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-11 h-auto">
                        {tabs.map(tab => (
                            <TabsTrigger key={tab.id} value={tab.id} className="flex-col h-auto py-2">
                                <div className="mb-1">{tab.icon}</div>
                                <div className="text-xs whitespace-nowrap overflow-hidden text-ellipsis">{tab.title}</div>
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {tabs.map(tab => (
                        <TabsContent key={tab.id} value={tab.id} className="mt-6">
                            {tab.component}
                        </TabsContent>
                    ))}
                </Tabs>
            </CardContent>
        </Card>
    );
}
