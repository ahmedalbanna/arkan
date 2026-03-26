
'use client';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { PenSquare } from "lucide-react";
import { SummarizerTool } from "./SummarizerTool";
import { ParaphraserTool } from "./ParaphraserTool";
import { HumanizerTool } from "./HumanizerTool";
import { AIDetectorTool } from "./AIDetectorTool";
import { GrammarCheckerTool } from "./GrammarCheckerTool";
import { FactCheckerTool } from "./FactCheckerTool";
import { PlagiarismCheckerTool } from "./PlagiarismCheckerTool";
import { CitationGeneratorTool } from "./CitationGeneratorTool";
import { TopicExplainerTool } from "./TopicExplainerTool";
import { IdeaGeneratorTool } from "./IdeaGeneratorTool";
import { BiasCheckerTool } from "./BiasCheckerTool";
import { SentenceStructureCheckerTool } from "./SentenceStructureCheckerTool";
import { AssignmentsSolverTool } from "./AssignmentsSolverTool";
import { ProjectBlueprintTool } from "./ProjectBlueprintTool";
import { GenerateUIDescriptionTool } from "./GenerateUIDescriptionTool";

const tools = [
    { id: 'summarizer', title: 'Summarizer', component: <SummarizerTool /> },
    { id: 'paraphraser', title: 'Paraphraser', component: <ParaphraserTool /> },
    { id: 'humanizer', title: 'AI Humanizer', component: <HumanizerTool /> },
    { id: 'ai-detector', title: 'AI Detector', component: <AIDetectorTool /> },
    { id: 'grammar-checker', title: 'Grammar Checker', component: <GrammarCheckerTool /> },
    { id: 'fact-checker', title: 'Fact Checker', component: <FactCheckerTool /> },
    { id: 'plagiarism-checker', title: 'Plagiarism Checker', component: <PlagiarismCheckerTool /> },
    { id: 'citation-generator', title: 'Citation Generator', component: <CitationGeneratorTool /> },
    { id: 'topic-explainer', title: 'Topic Explainer', component: <TopicExplainerTool /> },
    { id: 'idea-generator', title: 'Idea Generator', component: <IdeaGeneratorTool /> },
    { id: 'bias-checker', title: 'Bias Checker', component: <BiasCheckerTool /> },
    { id: 'sentence-structure-checker', title: 'Sentence Structure Checker', component: <SentenceStructureCheckerTool /> },
    { id: 'assignments-solver', title: 'Assignments Solver', component: <AssignmentsSolverTool /> },
    { id: 'project-blueprint', title: 'Project Blueprint', component: <ProjectBlueprintTool /> },
    { id: 'ui-description', title: 'UI Description Generator', component: <GenerateUIDescriptionTool /> },
];

export default function WritingToolsPanel() {
    return (
        <Accordion type="single" collapsible className="w-full space-y-2">
            {tools.map((tool) => (
                <AccordionItem value={tool.id} key={tool.id}>
                    <AccordionTrigger>
                        <div className="flex items-center gap-2">
                            <PenSquare className="h-4 w-4" />
                            {tool.title}
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-1">
                        {tool.component}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}
