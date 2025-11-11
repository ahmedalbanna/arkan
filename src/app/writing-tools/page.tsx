

'use client';

import { AIToolCard } from '@/components/writing-tools/AIToolCard';
import { useLocalization } from '@/context/LocalizationContext';
import {
  BookOpenText,
  Brain,
  BrainCircuit,
  CheckCircle,
  CopyCheck,
  EyeOff,
  FileEdit,
  FileQuestion,
  Fingerprint,
  GitGraph,
  Languages,
  Lightbulb, PencilLine,
  PencilRuler,
  PenSquare,
  Quote,
  Repeat,
  Scale,
  Search,
  SpellCheck,
  UserCheck,
  Workflow
} from 'lucide-react';

export default function WritingToolsPage() {
  const { t } = useLocalization();

  const tools = [
    { name: t('writingTools.cards.textStylist'), icon: PenSquare, href: '/writing-tools/text-stylist' },
    { name: t('writingTools.cards.documentWriter'), icon: FileEdit, href: '/writing-tools/document-writer' },
    { name: t('writingTools.cards.translator'), icon: Languages, href: '/writing-tools/translator' },
    { name: t('writingTools.cards.plagiarismChecker'), icon: CopyCheck, href: '/writing-tools/plagiarism-checker' },
    { name: t('writingTools.cards.aiHumanizer'), icon: UserCheck, href: '/writing-tools/humanizer' },
    { name: t('writingTools.cards.aiDetector'), icon: Fingerprint, href: '/writing-tools/ai-detector' },
    { name: t('writingTools.cards.aiParaphraser'), icon: Repeat, href: '/writing-tools/paraphraser' },
    { name: t('writingTools.cards.aiSummarizer'), icon: BookOpenText, href: '/writing-tools/summarizer' },
    { name: t('writingTools.cards.grammarChecker'), icon: SpellCheck, href: '/writing-tools/grammar-checker' },
    { name: t('writingTools.cards.biasChecker'), icon: Scale, href: '/writing-tools/bias-checker' },
    { name: "Sentence Structure Checker", icon: Workflow, href: '/writing-tools/sentence-structure-checker' },
    { name: t('writingTools.cards.aiQuizGenerator'), icon: FileQuestion, href: '/writing-tools/quiz-generator' },
    { name: t('writingTools.cards.factChecker'), icon: CheckCircle, href: '/writing-tools/fact-checker' },
    { name: t('writingTools.cards.citationGenerator'), icon: Quote, href: '/writing-tools/citation-generator' },
    { name: t('writingTools.cards.aiResearcher'), icon: Search, href: '/writing-tools/ai-researcher' },
    { name: t('writingTools.cards.topicExplainer'), icon: Lightbulb, href: '/writing-tools/topic-explainer' },
    { name: t('writingTools.cards.textToHandwriting'), icon: PencilLine, href: '/handwriting' },
    { name: t('writingTools.cards.ideaGenerator'), icon: Brain, href: '/writing-tools/idea-generator' },
    { name: 'PlantUML Diagram Generator', icon: GitGraph, href: '/writing-tools/generate-plantuml' },
    { name: 'Session Plan Generator', icon: BrainCircuit, href: '/writing-tools/session-plan' },
    { name: 'Lecture Generator', icon: BrainCircuit, href: '/writing-tools/lecture-generator' },
    { name: 'Markdown Editor', icon: PencilRuler, href: '/writing-tools/markdown-editor' },
    { name: 'Markdown to Word', icon: PencilRuler, href: '/writing-tools/markdown-to-word' },
    { name: 'Markdown to PPTX', icon: PencilRuler, href: '/writing-tools/pptx-convert' },
    { name: 'Invisible Text Detector', icon: EyeOff, href: '/writing-tools/invisible-text-detector' }
  ];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <PenSquare className="w-10 h-10" />
          {t('writingTools.pageTitle')}
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          {t('writingTools.pageSubtitle')}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tools.map((tool) => (
          <AIToolCard key={tool.name} {...tool} />
        ))}
      </div>
    </div>
  );
}
