'use client';

import { AIToolCard } from '@/modules/ai/adapters/components/writing-tools/AIToolCard';
import { useLocalization } from '@/context/LocalizationContext';
import { PenSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function WritingToolsPage() {
  const { t } = useLocalization();

  const tools = [
    { name: t('writingTools.cards.textStylist'), icon: 'PenSquare', href: '/writing-tools/text-stylist' },
    { name: t('writingTools.cards.documentWriter'), icon: 'FileEdit', href: '/writing-tools/document-writer' },
    { name: t('writingTools.cards.translator'), icon: 'Languages', href: '/writing-tools/translator' },
    { name: t('writingTools.cards.plagiarismChecker'), icon: 'CopyCheck', href: '/writing-tools/plagiarism-checker' },
    { name: t('writingTools.cards.aiHumanizer'), icon: 'UserCheck', href: '/writing-tools/humanizer' },
    { name: t('writingTools.cards.aiDetector'), icon: 'Fingerprint', href: '/writing-tools/ai-detector' },
    { name: t('writingTools.cards.aiParaphraser'), icon: 'Repeat', href: '/writing-tools/paraphraser' },
    { name: t('writingTools.cards.aiSummarizer'), icon: 'BookOpenText', href: '/writing-tools/summarizer' },
    { name: t('writingTools.cards.grammarChecker'), icon: 'SpellCheck', href: '/writing-tools/grammar-checker' },
    { name: t('writingTools.cards.biasChecker'), icon: 'Scale', href: '/writing-tools/bias-checker' },
    { name: "Sentence Structure Checker", icon: 'Workflow', href: '/writing-tools/sentence-structure-checker' },
    { name: t('writingTools.cards.aiQuizGenerator'), icon: 'FileQuestion', href: '/writing-tools/quiz-generator' },
    { name: t('writingTools.cards.factChecker'), icon: 'CheckCircle', href: '/writing-tools/fact-checker' },
    { name: t('writingTools.cards.citationGenerator'), icon: 'Quote', href: '/writing-tools/citation-generator' },
    { name: t('writingTools.cards.aiResearcher'), icon: 'Search', href: '/writing-tools/ai-researcher' },
    { name: t('writingTools.cards.topicExplainer'), icon: 'Lightbulb', href: '/writing-tools/topic-explainer' },
    { name: t('writingTools.cards.ideaGenerator'), icon: 'Brain', href: '/writing-tools/idea-generator' },
    { name: 'PlantUML Diagram Generator', icon: 'GitGraph', href: '/writing-tools/generate-plantuml' },
    { name: 'Session Plan Generator', icon: 'BrainCircuit', href: '/writing-tools/session-plan' },
    { name: 'Lecture Generator', icon: 'BrainCircuit', href: '/writing-tools/lecture-generator' },
    { name: 'Markdown to Word', icon: 'PencilRuler', href: '/writing-tools/markdown-to-word' },
    { name: 'Markdown to PPTX', icon: 'PencilRuler', href: '/writing-tools/pptx-convert' },
    { name: 'Invisible Text Detector', icon: 'EyeOff', href: '/writing-tools/invisible-text-detector' },
    { name: t('writingTools.assignmentsSolver.cardTitle'), icon: 'BookCheck', href: '/writing-tools/assignments-solver' },
    { name: t('writingTools.projectBlueprint.cardTitle'), icon: 'Building2', href: '/writing-tools/project-blueprint' },
    { name: t('writingTools.uiDescription.cardTitle'), icon: 'LayoutTemplate', href: '/writing-tools/generate-ui-description' },
    { name: t('writingTools.imageToPdf.cardTitle'), icon: 'Images', href: '/writing-tools/image-to-pdf' },
    { name: 'Image to SVG', icon: 'ImageUp', href: '/writing-tools/image-to-svg' },
    { name: 'AI Image Generator', icon: 'Image', href: '/writing-tools/ai-image-generator' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      {/* Immersive Background */}
      <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
              background: 'radial-gradient(circle at 50% -20%, hsl(var(--primary) / 0.08), transparent 50%)'
          }}
      />
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="container relative z-10 mx-auto max-w-[1600px] px-6 py-20 md:py-32">
        <div className="flex flex-col items-center text-center mb-24 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-bold border-primary/20 text-primary bg-background">The Arsenal</Badge>
              <div className="h-3 w-px bg-primary/20" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80">30+ Specialist Tools</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-headline font-bold tracking-tighter text-foreground leading-[0.9] flex items-center gap-6">
            <PenSquare className="w-12 h-12 md:w-16 md:h-16 text-primary animate-pulse" />
            {t('writingTools.pageTitle')}
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl italic font-serif leading-relaxed opacity-80">
            {t('writingTools.pageSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          {tools.map((tool) => (
            <AIToolCard key={tool.name} {...tool} />
          ))}
        </div>
      </div>
    </div>
  );
}
