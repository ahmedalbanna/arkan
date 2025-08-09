
'use client';

import {
  CopyCheck, UserCheck, Fingerprint, Repeat, BookOpenText,
  SpellCheck, FileQuestion, CheckCircle, Quote, BrainCircuit, PenSquare, Search, Lightbulb, PencilLine
} from 'lucide-react';
import { AIToolCard } from '@/components/writing-tools/AIToolCard';

const tools = [
  { name: 'Plagiarism Checker', icon: CopyCheck, href: '/writing-tools/plagiarism-checker' },
  { name: 'AI Humanizer', icon: UserCheck, href: '/writing-tools/humanizer' },
  { name: 'AI Detector', icon: Fingerprint, href: '/writing-tools/ai-detector' },
  { name: 'AI Paraphraser', icon: Repeat, href: '/writing-tools/paraphraser' },
  { name: 'AI Summarizer', icon: BookOpenText, href: '/writing-tools/summarizer' },
  { name: 'Grammar Checker', icon: SpellCheck, href: '/writing-tools/grammar-checker' },
  { name: 'AI Quiz Generator', icon: FileQuestion, href: '/writing-tools/quiz-generator' },
  { name: 'Fact Checker', icon: CheckCircle, href: '/writing-tools/fact-checker' },
  { name: 'Citation Generator', icon: Quote, href: '/writing-tools/citation-generator' },
  { name: 'AI Researcher', icon: Search, href: '/writing-tools/ai-researcher' },
  { name: 'Topic Explainer', icon: Lightbulb, href: '/writing-tools/topic-explainer' },
  { name: 'Text to Handwriting', icon: PencilLine, href: '/handwriting' },
];

export default function WritingToolsPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <PenSquare className="w-10 h-10" />
          AI Writing Tools
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          A suite of powerful AI tools to enhance your writing and research.
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
