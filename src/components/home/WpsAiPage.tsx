
'use client';

import { Input } from '@/components/ui/input';
import {
  Search,
  Sparkles,
  Palette,
  Wand2,
  BookOpen,
  BookText,
  Languages,
  FilePlus,
  MessageSquare,
  CloudUpload,
  FileUp,
  PictureInPicture2,
  Scan,
  FileText
} from 'lucide-react';

const AiToolCard = ({ icon, title, description, tags, actionText, actionLink }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  tags?: string;
  actionText: string;
  actionLink?: string;
}) => (
  <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col justify-between hover:border-blue-500 cursor-pointer">
    <div>
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
          {icon}
        </div>
      </div>
      <h3 className="font-semibold text-base mt-3">{title}</h3>
      <p className="text-slate-500 text-sm mt-1">{description}</p>
    </div>
    <div className="flex justify-between items-center mt-4">
      {tags && <span className="text-xs text-slate-400">{tags}</span>}
      <a href={actionLink || "#"} className="text-sm text-blue-500 font-medium">
        {actionText}
      </a>
    </div>
  </div>
);

const ProductivityToolCard = ({ icon, title, description }: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
    <div className="bg-white p-4 rounded-lg border border-slate-200 flex items-center gap-4 hover:border-blue-500 cursor-pointer">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
            {icon}
        </div>
        <div>
            <h3 className="font-semibold text-base">{title}</h3>
            <p className="text-slate-500 text-sm">{description}</p>
        </div>
    </div>
);

const aiTools = [
  { icon: <Sparkles className="w-6 h-6" />, title: 'Docs Smart Create', description: 'Input a simple prompt and instantly start writing with your AI writing assistant', tags: 'Docs', actionText: 'Try Now >' },
  { icon: <Palette className="w-6 h-6" />, title: 'Slides Smart Create', description: 'Create PPTs effortlessly with AI by inputting description or uploading files', tags: 'Slides', actionText: 'Try Now >' },
  { icon: <Wand2 className="w-6 h-6" />, title: 'Docs Smart Edit', description: 'Enhance, refine, and rewrite your content with AI writing assistant', tags: 'Docs', actionText: 'Choose File >' },
  { icon: <BookOpen className="w-6 h-6" />, title: 'AI Spell Check', description: 'Go beyond spelling and grammar. Make your writing clear, engaging, and polished', tags: 'Docs', actionText: 'Choose File >' },
  { icon: <BookText className="w-6 h-6" />, title: 'AI Refinements', description: 'Unleash the power of AI to perfect your writing', tags: 'Docs', actionText: 'Choose File >' },
  { icon: <Languages className="w-6 h-6" />, title: 'Parallel Translate', description: 'AI-powered translation tool with side-by-side bilingual reading', tags: 'Docs, Slides, PDF', actionText: 'Choose File >' },
  { icon: <FilePlus className="w-6 h-6" />, title: 'Create Slides from Doc', description: 'Intelligently analyze and create a presentation from a document with AI', tags: 'Slides', actionText: 'Choose File >' },
  { icon: <FileText className="w-6 h-6" />, title: 'AI Summarizer', description: 'Quickly generate a content summary', tags: 'Docs, PDF', actionText: 'Choose File >' },
  { icon: <MessageSquare className="w-6 h-6" />, title: 'Chat PDF', description: 'Reliable PDF AI Assistant with Summarizing and Inquiring', tags: 'PDF', actionText: 'Choose File >' },
];

const productivityTools = [
    { icon: <CloudUpload className="w-6 h-6" />, title: 'Auto backup', description: 'Automatic document backup' },
    { icon: <FileUp className="w-6 h-6" />, title: 'PDF to Word', description: 'Convert PDF files to Word, Excel and PPT' },
    { icon: <PictureInPicture2 className="w-6 h-6" />, title: 'Picture to PDF', description: 'Convert multiple pictures to PDF' },
    { icon: <Scan className="w-6 h-6" />, title: 'WPS Photos Editor', description: 'Crop images, beautify, remove backgrounds, annotate, and more' },
];

export function WpsAiPage() {
    return (
        <main className="flex-1 p-8 overflow-y-auto bg-slate-50">
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input placeholder="Search files and tools" className="pl-10 w-full max-w-lg bg-white" />
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-4">AI Tools</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {aiTools.map(tool => <AiToolCard key={tool.title} {...tool} />)}
                </div>
            </div>

            <div className="mt-12">
                <h2 className="text-xl font-semibold mb-4">Productivity Tools</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {productivityTools.map(tool => <ProductivityToolCard key={tool.title} {...tool} />)}
                </div>
            </div>
        </main>
    );
}
