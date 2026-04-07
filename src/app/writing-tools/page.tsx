'use client';

import { AIToolCard } from '@/modules/ai/adapters/components/writing-tools/AIToolCard';
import { useLocalization } from '@/context/LocalizationContext';
import { 
    AlignLeft, 
    SpellCheck, 
    Repeat, 
    UserCheck, 
    Languages, 
    FileText, 
    Scale, 
    Fingerprint, 
    CheckCircle, 
    CopyCheck, 
    LineChart, 
    FileQuestion, 
    Quote, 
    List, 
    Presentation, 
    BookOpen, 
    Lightbulb, 
    Search, 
    Brain, 
    Layout, 
    Calendar, 
    Map, 
    Workflow, 
    Image, 
    FileCode, 
    EyeOff, 
    Type 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

export default function WritingToolsPage() {
    const { t } = useLocalization();
    const router = useRouter();

    const tools = [
        { 
            id: 'summarizer', 
            title: t('writingTools.cards.aiSummarizer'), 
            description: 'Condense complex documents into precise, logical summaries.', 
            icon: AlignLeft, 
            vector: 'V1.0', 
            tag: 'Logical' 
        },
        { 
            id: 'grammar-checker', 
            title: t('writingTools.cards.grammarChecker'), 
            description: 'Eliminate linguistic friction with neural syntax correction.', 
            icon: SpellCheck, 
            vector: 'V2.4', 
            tag: 'Academic' 
        },
        { 
            id: 'paraphraser', 
            title: t('writingTools.cards.aiParaphraser'), 
            description: 'Reformulate prose while maintaining semantic integrity.', 
            icon: Repeat, 
            vector: 'V1.8', 
            tag: 'Creative' 
        },
        { 
            id: 'humanizer', 
            title: t('writingTools.cards.aiHumanizer'), 
            description: 'Inject natural variance into AI-generated synthetic text.', 
            icon: UserCheck, 
            vector: 'V1.5', 
            tag: 'Creative' 
        },
        { 
            id: 'translator', 
            title: t('writingTools.cards.translator'), 
            description: 'High-fidelity cross-lingual transfer across 50+ languages.', 
            icon: Languages, 
            vector: 'V2.0', 
            tag: 'Logical' 
        },
        { 
            id: 'document-writer', 
            title: t('writingTools.cards.documentWriter'), 
            description: 'Synthesize full-length technical reports and manuscripts.', 
            icon: FileText, 
            vector: 'V3.1', 
            tag: 'Research' 
        },
        { 
            id: 'bias-checker', 
            title: t('writingTools.cards.biasChecker'), 
            description: 'Audit content for cognitive bias and logical fallacies.', 
            icon: Scale, 
            vector: 'V1.2', 
            tag: 'Analysis' 
        },
        { 
            id: 'ai-detector', 
            title: t('writingTools.cards.aiDetector'), 
            description: 'Fingerprint text for synthetic or robotic patterns.', 
            icon: Fingerprint, 
            vector: 'V2.1', 
            tag: 'Analysis' 
        },
        { 
            id: 'fact-checker', 
            title: t('writingTools.cards.factChecker'), 
            description: 'Cross-reference claims against authoritative knowledge bases.', 
            icon: CheckCircle, 
            vector: 'V1.9', 
            tag: 'Research' 
        },
        { 
            id: 'plagiarism-checker', 
            title: t('writingTools.cards.plagiarismChecker'), 
            description: 'Scan global repositories for semantic overlap and copying.', 
            icon: CopyCheck, 
            vector: 'V2.2', 
            tag: 'Analysis' 
        },
        { 
            id: 'sentence-structure-checker', 
            title: t('writingTools.cards.sentenceStructureCheck'), 
            description: 'Analyze and optimize sentence flow and complexity.', 
            icon: LineChart, 
            vector: 'V1.1', 
            tag: 'Academic' 
        },
        { 
            id: 'quiz-generator', 
            title: t('writingTools.cards.aiQuizGenerator'), 
            description: 'Extract assessments and quizzes from source materials.', 
            icon: FileQuestion, 
            vector: 'V2.5', 
            tag: 'Academic' 
        },
        { 
            id: 'citation-generator', 
            title: t('writingTools.cards.citationGenerator'), 
            description: 'Automate APA, MLA, and Chicago format referencing.', 
            icon: Quote, 
            vector: 'V1.0', 
            tag: 'Academic' 
        },
        { 
            id: 'generate-toc', 
            title: t('writingTools.cards.generateTOC'), 
            description: 'Construct logical hierarchical structures for documents.', 
            icon: List, 
            vector: 'V1.0', 
            tag: 'Logical' 
        },
        { 
            id: 'lecture-generator', 
            title: t('writingTools.cards.lectureGenerator'), 
            description: 'Convert topics into structured educational modules.', 
            icon: Presentation, 
            vector: 'V1.4', 
            tag: 'Academic' 
        },
        { 
            id: 'assignments-solver', 
            title: t('writingTools.cards.assignmentsSolver'), 
            description: 'Deconstruct complex academic problems and solve them.', 
            icon: BookOpen, 
            vector: 'V1.6', 
            tag: 'Academic' 
        },
        { 
            id: 'topic-explainer', 
            title: t('writingTools.cards.topicExplainer'), 
            description: 'Simplify dense concepts into intuitive mental models.', 
            icon: Lightbulb, 
            vector: 'V1.2', 
            tag: 'Academic' 
        },
        { 
            id: 'ai-researcher', 
            title: t('writingTools.cards.aiResearcher'), 
            description: 'Deep-dive search for scholarly data and insights.', 
            icon: Search, 
            vector: 'V2.8', 
            tag: 'Research' 
        },
        { 
            id: 'idea-generator', 
            title: t('writingTools.cards.ideaGenerator'), 
            description: 'Brainstorm creative angles and thematic foundations.', 
            icon: Brain, 
            vector: 'V1.3', 
            tag: 'Creative' 
        },
        { 
            id: 'generate-ui-description', 
            title: t('writingTools.cards.generateUIDescription'), 
            description: 'Synthesize technical specifications for UI components.', 
            icon: Layout, 
            vector: 'V1.1', 
            tag: 'Media' 
        },
        { 
            id: 'session-plan', 
            title: t('writingTools.cards.sessionPlan'), 
            description: 'Architect detailed instructional timelines and goals.', 
            icon: Calendar, 
            vector: 'V1.2', 
            tag: 'Academic' 
        },
        { 
            id: 'project-blueprint', 
            title: t('writingTools.cards.projectBlueprint'), 
            description: 'Draft comprehensive technical project roadmaps.', 
            icon: Map, 
            vector: 'V1.5', 
            tag: 'Logical' 
        },
        { 
            id: 'generate-plantuml', 
            title: t('writingTools.cards.generatePlantUML'), 
            description: 'Convert natural language to UML diagram syntax.', 
            icon: Workflow, 
            vector: 'V1.7', 
            tag: 'Media' 
        },
        { 
            id: 'ai-image-generator', 
            title: t('writingTools.cards.aiImageGenerator'), 
            description: 'Render visual concepts from textual descriptions.', 
            icon: Image, 
            vector: 'V4.0', 
            tag: 'Media' 
        },
        { 
            id: 'image-to-pdf', 
            title: t('writingTools.cards.imageToPdf'), 
            description: 'Encapsulate visual assets into professional PDF containers.', 
            icon: FileText, 
            vector: 'V1.0', 
            tag: 'Media' 
        },
        { 
            id: 'image-to-svg', 
            title: t('writingTools.cards.imageToSvg'), 
            description: 'Vectorize raster images for infinite scalability.', 
            icon: FileCode, 
            vector: 'V1.0', 
            tag: 'Media' 
        },
        { 
            id: 'markdown-to-word', 
            title: t('writingTools.cards.markdownToWord'), 
            description: 'Export technical markdown to standard office formats.', 
            icon: FileText, 
            vector: 'V1.2', 
            tag: 'Media' 
        },
        { 
            id: 'pptx-convert', 
            title: t('writingTools.cards.pptxConvert'), 
            description: 'Generate high-fidelity presentation decks from text.', 
            icon: Presentation, 
            vector: 'V1.5', 
            tag: 'Media' 
        },
        { 
            id: 'invisible-text-detector', 
            title: t('writingTools.cards.invisibleTextDetector'), 
            description: 'Expose hidden characters and zero-width metadata.', 
            icon: EyeOff, 
            vector: 'V1.0', 
            tag: 'Analysis' 
        },
        { 
            id: 'text-stylist', 
            title: t('writingTools.cards.textStylist'), 
            description: 'Elevate text formality and thematic tone.', 
            icon: Type, 
            vector: 'V1.2', 
            tag: 'Creative' 
        }
    ];

    return (
        <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
            {/* 28px Dot-grid Atmosphere */}
            <div 
                className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] pointer-events-none z-0" 
                style={{ 
                    backgroundImage: 'radial-gradient(circle at center, hsl(var(--primary)) 1px, transparent 1px)',
                    backgroundSize: '28px 28px' 
                }} 
            />

            <div className="container relative z-10 mx-auto max-w-[1600px] px-6 py-20 md:py-32">
                <div className="flex flex-col items-center text-center mb-24 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-black border-primary/20 text-primary bg-background shadow-inner">The Arsenal</Badge>
                        <div className="h-3 w-px bg-primary/20" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/80">Neural Node Matrix</span>
                    </div>

                    <h1 className="text-5xl md:text-[90px] font-headline font-black tracking-tighter text-foreground leading-[0.82] uppercase">
                        {t('writingTools.pageTitle')}
                    </h1>

                    <p className="text-xl text-muted-foreground max-w-2xl italic font-serif leading-relaxed opacity-80 font-medium">
                        {t('writingTools.pageSubtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                    {tools.map((tool) => (
                        <AIToolCard 
                            key={tool.id} 
                            id={tool.id}
                            title={tool.title}
                            description={tool.description}
                            icon={tool.icon}
                            vector={tool.vector}
                            tag={tool.tag}
                            onClick={() => router.push(`/writing-tools/${tool.id}`)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
