
'use client';

import { useState } from 'react';
import {
  Search,
  LayoutGrid,
  File as FileIcon,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { WLogo, PLogo, SLogo, PDFLogo } from './NavItem';
import { MyTemplatesPage } from './MyTemplatesPage';
import { TemplateCard } from './TemplateCard';
import { PdfPage } from './PdfPage';
import { DocumentTab } from './DocumentTabs';

const templates = {
  all: {
    top: [
      { title: 'Docs', imgSrc: 'https://placehold.co/128x160.png', dataAiHint: 'document blank', type: 'word' as const },
      { title: 'Slides', imgSrc: 'https://placehold.co/128x160.png', dataAiHint: 'presentation slides', type: 'powerpoint' as const },
      { title: 'Sheets', imgSrc: 'https://placehold.co/128x160.png', dataAiHint: 'spreadsheet table', type: 'excel' as const },
      { title: 'PDF', imgSrc: 'https://placehold.co/128x160.png', dataAiHint: 'pdf document', type: 'pdf' as const },
      { title: 'Docs Smart Create', imgSrc: 'https://placehold.co/128x160.png', dataAiHint: 'ai document', type: 'word' as const },
      { title: 'Slides Smart Create', imgSrc: 'https://placehold.co/128x160.png', dataAiHint: 'ai slides', type: 'powerpoint' as const },
    ],
    recommended: [
      { title: 'Resume Master', imgSrc: 'https://placehold.co/240x320.png', tag: 'NEW' as const, dataAiHint: 'professional resume', type: 'word' as const, category: 'Resume' },
      { title: 'Energetic Resume', imgSrc: 'https://placehold.co/240x320.png', tag: 'HOT' as const, dataAiHint: 'creative resume', type: 'word' as const, category: 'Resume' },
      { title: 'Cartoon syllabus', imgSrc: 'https://placehold.co/240x320.png', dataAiHint: 'syllabus education', type: 'word' as const, category: 'Education' },
      { title: 'Artistic resume', imgSrc: 'https://placehold.co/240x320.png', dataAiHint: 'artistic resume', type: 'word' as const, category: 'Resume' },
      { title: 'Business Pitch Deck', imgSrc: 'https://placehold.co/240x320.png', dataAiHint: 'business presentation', type: 'powerpoint' as const, category: 'Business' },
      { title: 'Monthly Budget', imgSrc: 'https://placehold.co/240x320.png', dataAiHint: 'finance spreadsheet', type: 'excel' as const, category: 'Finance' },
    ]
  },
  docs: {
    top: [
      { title: 'Blank Document', icon: <FileIcon className="w-12 h-12 text-blue-500" />, type: 'word' as const },
      { title: 'Smart Create', imgSrc: 'https://placehold.co/128x160.png', dataAiHint: 'ai document', type: 'word' as const },
    ],
    recommended: [
      { title: 'Resume Master', imgSrc: 'https://placehold.co/240x320.png', tag: 'NEW' as const, dataAiHint: 'professional resume', category: 'Resume', type: 'word' as const },
      { title: 'Energetic Resume', imgSrc: 'https://placehold.co/240x320.png', tag: 'HOT' as const, dataAiHint: 'creative resume', category: 'Resume', type: 'word' as const },
      { title: 'Cartoon syllabus', imgSrc: 'https://placehold.co/240x320.png', dataAiHint: 'syllabus education', category: 'Education', type: 'word' as const },
      { title: 'Artistic resume', imgSrc: 'https://placehold.co/240x320.png', dataAiHint: 'artistic resume', category: 'Resume', type: 'word' as const },
      { title: 'Class Notes', imgSrc: 'https://placehold.co/240x320.png', dataAiHint: 'notes education', category: 'Education', type: 'word' as const },
      { title: 'Formal Letter', imgSrc: 'https://placehold.co/240x320.png', dataAiHint: 'formal letter', category: 'Letter', type: 'word' as const },
      { title: 'Business Letter', imgSrc: 'https://placehold.co/240x320.png', dataAiHint: 'business letter', category: 'Letter', type: 'word' as const },
    ]
  },
  slides: {
    top: [
       { title: 'Blank Presentation', icon: <FileIcon className="w-12 h-12 text-orange-500" />, type: 'powerpoint' as const },
       { title: 'Smart Create', imgSrc: 'https://placehold.co/128x160.png', dataAiHint: 'ai slides', type: 'powerpoint' as const },
    ],
    recommended: [
      { title: 'Business Pitch Deck', imgSrc: 'https://placehold.co/240x320.png', tag: 'NEW' as const, dataAiHint: 'business presentation', category: 'Business', type: 'powerpoint' as const },
      { title: 'Photo Album', imgSrc: 'https://placehold.co/240x320.png', dataAiHint: 'photo album', category: 'Album', type: 'powerpoint' as const },
      { title: 'Science Fair Project', imgSrc: 'https://placehold.co/240x320.png', dataAiHint: 'science project', category: 'Education', type: 'powerpoint' as const },
      { title: 'Company Profile', imgSrc: 'https://placehold.co/240x320.png', dataAiHint: 'company profile', category: 'Business', type: 'powerpoint' as const },
      { title: 'Minimalist Presentation', imgSrc: 'https://placehold.co/240x320.png', dataAiHint: 'minimalist presentation', category: 'Business', type: 'powerpoint' as const },
      { title: 'Yearbook Slides', imgSrc: 'https://placehold.co/240x320.png', dataAiHint: 'yearbook album', category: 'Album', type: 'powerpoint' as const },
      { title: 'Lecture Slides', imgSrc: 'https://placehold.co/240x320.png', dataAiHint: 'lecture education', category: 'Education', type: 'powerpoint' as const },
    ]
  },
  sheets: {
    top: [
       { title: 'Blank Workbook', icon: <FileIcon className="w-12 h-12 text-green-500" />, type: 'excel' as const },
    ],
    recommended: [
      { title: 'Monthly Budget', imgSrc: 'https://placehold.co/240x320.png', tag: 'HOT' as const, dataAiHint: 'finance spreadsheet', type: 'excel' as const, category: 'Finance' },
      { title: 'Project Tracker', imgSrc: 'https://placehold.co/240x320.png', dataAiHint: 'project management', type: 'excel' as const, category: 'Finance' },
      { title: 'Invoice Template', imgSrc: 'https://placehold.co/240x320.png', dataAiHint: 'invoice form', type: 'excel' as const, category: 'Finance' },
      { title: 'Gantt Chart', imgSrc: 'https://placehold.co/240x320.png', dataAiHint: 'gantt chart', type: 'excel' as const, category: 'Finance' },
    ]
  },
  pdf: {
    top: [],
    recommended: []
  },
};

export function CreateNewPage({ addTab }: { addTab: (type: DocumentTab['type'], title?: string, projectId?: string) => void }) {
    const [activeCategory, setActiveCategory] = useState('All');
    const [activeSubCategory, setActiveSubCategory] = useState('Recommended');
    const [activeView, setActiveView] = useState('templates'); // 'templates' or 'my-templates'

    const categories = [
        { id: 'All', label: 'All', icon: <LayoutGrid className="w-5 h-5" /> },
        { id: 'Docs', label: 'Docs', icon: <WLogo /> },
        { id: 'Slides', label: 'Slides', icon: <PLogo /> },
        { id: 'Sheets', label: 'Sheets', icon: <SLogo /> },
        { id: 'PDF', label: 'PDF', icon: <PDFLogo /> },
    ];
    
    const categoryKey = activeCategory.toLowerCase() as keyof typeof templates;
    const currentTemplates = templates[categoryKey];
    
    const subCategories: Record<string, string[]> = {
      'All': ['Recommended', 'Docs', 'Slides', 'Sheets'],
      'Docs': ['Recommended', 'Resume', 'Education', 'Letter'],
      'Slides': ['Recommended', 'Business', 'Education', 'Album'],
      'Sheets': ['Recommended', 'Finance'],
      'PDF': [],
    }

    const getFilteredTemplates = () => {
        if (activeCategory === 'All') {
            switch (activeSubCategory) {
                case 'Docs':
                    return templates.docs.recommended;
                case 'Slides':
                    return templates.slides.recommended;
                case 'Sheets':
                    return templates.sheets.recommended;
                default:
                    return []; // 'Recommended' in 'All' shows grouped lists
            }
        }
    
        const templatesForCategory = currentTemplates.recommended;
        if (activeSubCategory === 'Recommended') {
            return templatesForCategory;
        }
        return templatesForCategory.filter(t => 'category' in t && t.category === activeSubCategory);
    };

    const filteredTemplates = getFilteredTemplates();

    const renderTemplateBrowser = () => {
      if (activeCategory === 'All' && activeSubCategory === 'Recommended') {
        return (
          <>
              <div className="flex items-center gap-2 mb-4">
                  <WLogo />
                  <h3 className="font-semibold text-slate-800">Docs Templates</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    {templates.docs.recommended.map(t => (
                      <TemplateCard key={t.title} {...t} size="large" onClick={() => addTab(t.type, t.title)} />
                    ))}
              </div>
              <div className="flex items-center gap-2 mb-4">
                  <PLogo />
                  <h3 className="font-semibold text-slate-800">Slides Templates</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    {templates.slides.recommended.map(t => (
                      <TemplateCard key={t.title} {...t} size="large" onClick={() => addTab(t.type, t.title)} />
                    ))}
              </div>
               <div className="flex items-center gap-2 mb-4">
                  <SLogo />
                  <h3 className="font-semibold text-slate-800">Sheets Templates</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {templates.sheets.recommended.map(t => (
                      <TemplateCard key={t.title} {...t} size="large" onClick={() => addTab(t.type, t.title)} />
                    ))}
              </div>
          </>
        )
      }

      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {filteredTemplates.map(t => (
                <TemplateCard key={t.title} {...t} size="large" onClick={() => addTab(t.type, t.title)} />
              ))}
        </div>
      )
    }

    const renderContent = () => {
        if (activeView === 'my-templates') {
            return <MyTemplatesPage />;
        }
        
        if (activeCategory === 'PDF') {
            return <PdfPage />;
        }

        return (
            <>
                <div className="bg-white p-6 rounded-lg">
                    <div className="flex gap-4 justify-start">
                        {currentTemplates.top.map(t => <TemplateCard key={t.title} {...t} onClick={() => addTab(t.type, t.title)} />)}
                    </div>
                </div>

                {currentTemplates.recommended.length > 0 && (
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex gap-6 border-b border-slate-200">
                               {subCategories[activeCategory].map(subCat => (
                                   <button 
                                      key={subCat}
                                      onClick={() => setActiveSubCategory(subCat)}
                                      className={`py-2 ${activeSubCategory === subCat ? 'border-b-2 border-blue-500 text-blue-500 font-semibold' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                      {subCat}
                                   </button>
                               ))}
                            </div>
                            <a href="#" className="text-sm text-blue-500 font-medium flex items-center gap-1">
                                See More Templates <ChevronDown className="w-4 h-4" />
                            </a>
                        </div>
                        {renderTemplateBrowser()}
                    </div>
                )}
            </>
        )
    }


    return (
        <div className="flex flex-1 bg-slate-50">
            <aside className="w-56 bg-white p-4 flex flex-col justify-between border-r border-slate-200">
                <div>
                    <h2 className="text-lg font-semibold mb-4 px-3">Create New</h2>
                    <nav className="space-y-1">
                        {categories.map(cat => (
                            <button key={cat.id}
                                onClick={() => {
                                  setActiveCategory(cat.id);
                                  setActiveSubCategory('Recommended');
                                  setActiveView('templates');
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md ${activeView === 'templates' && activeCategory === cat.id ? 'bg-blue-100 text-blue-700' : 'text-slate-700 hover:bg-slate-100'}`}>
                                {cat.icon}
                                <span>{cat.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
                <button
                    onClick={() => setActiveView('my-templates')}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md ${activeView === 'my-templates' ? 'bg-blue-100 text-blue-700' : 'text-slate-700 hover:bg-slate-100'}`}>
                    <FileIcon className="w-5 h-5" />
                    <span>My Templates</span>
                </button>
            </aside>
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input placeholder="Search for templates" className="pl-10 w-full max-w-lg bg-white" />
                </div>

                {renderContent()}
            </main>
        </div>
    );
}
