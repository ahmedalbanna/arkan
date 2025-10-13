

'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { AIToolCard } from '@/components/writing-tools/AIToolCard';
import { useLocalization } from '@/context/LocalizationContext';
import {
  BookOpenText,
  Brain,
  BrainCircuit,
  CheckCircle,
  CopyCheck,
  FileEdit,
  FileQuestion,
  Fingerprint,
  GitGraph,
  Lightbulb, PencilLine,
  PencilRuler,
  PenSquare,
  Presentation,
  Quote,
  Repeat,
  Search,
  SpellCheck,
  UserCheck
} from 'lucide-react';

export default function WritingToolsPage() {
  const { t } = useLocalization();

  const tools = [
    { name: t('writingTools.cards.textStylist'), icon: PenSquare, href: '/writing-tools/text-stylist' },
    { name: t('writingTools.cards.documentWriter'), icon: FileEdit, href: '/writing-tools/document-writer' },
    { name: t('writingTools.cards.presentationOutline'), icon: Presentation, href: '/writing-tools/presentation-outline' },
    { name: t('writingTools.cards.plagiarismChecker'), icon: CopyCheck, href: '/writing-tools/plagiarism-checker' },
    { name: t('writingTools.cards.aiHumanizer'), icon: UserCheck, href: '/writing-tools/humanizer' },
    { name: t('writingTools.cards.aiDetector'), icon: Fingerprint, href: '/writing-tools/ai-detector' },
    { name: t('writingTools.cards.aiParaphraser'), icon: Repeat, href: '/writing-tools/paraphraser' },
    { name: t('writingTools.cards.aiSummarizer'), icon: BookOpenText, href: '/writing-tools/summarizer' },
    { name: t('writingTools.cards.grammarChecker'), icon: SpellCheck, href: '/writing-tools/grammar-checker' },
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
  ];

  return (
    <div className="relative min-h-screen">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 rounded-lg opacity-50 pointer-events-none"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-float pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl animate-float pointer-events-none" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-purple-500/10 rounded-full blur-lg animate-float pointer-events-none" style={{ animationDelay: '4s' }}></div>

      <div className="relative z-10 container mx-auto max-w-7xl px-4 py-12">
        <AnimatedContainer animation="fade-in-up" delay={200}>
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600 shadow-soft">
                <PenSquare className="w-10 h-10 text-white" />
              </div>
              {t('writingTools.pageTitle')}
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              {t('writingTools.pageSubtitle')}
            </p>
          </div>
        </AnimatedContainer>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map((tool, index) => (
            <AnimatedContainer key={tool.name} animation="fade-in-up" delay={300 + (index * 100)}>
              <AIToolCard {...tool} />
            </AnimatedContainer>
          ))}
        </div>
      </div>
    </div>
  );
}
