'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

import { useLocalization } from '@/context/LocalizationContext';
import { AIResearcherTool } from './AIResearcherTool';

interface Tool {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    component: React.ReactNode;
}

interface ToolCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
}

function ToolsNavigation() {
  const { t } = useLocalization();
  return (
    <nav className="grid gap-4 text-sm text-muted-foreground">
      <Link href="#" className="font-semibold text-primary">
        {t('writingTools.dashboard.allTools')}
      </Link>
      {/* Add other links as needed */}
    </nav>
  );
}

function ToolCard({ title, icon, description, onClick }: ToolCardProps) {
    return (
        <div 
            onClick={onClick}
            className="cursor-pointer rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow"
        >
            <div className="p-6">
                <div className="flex items-center gap-4">
                    {icon}
                    <h3 className="text-lg font-semibold">{title}</h3>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{description}</p>
            </div>
        </div>
    );
}


export function WritingToolsDashboard() {
    const { t } = useLocalization();
    const [selectedTool, setSelectedTool] = useState<string | null>('ai-researcher');

    const availableTools: Tool[] = [
        {
            id: 'ai-researcher',
            title: t('writingTools.aiResearcher.title'),
            description: t('writingTools.aiResearcher.description'),
            icon: <Sparkles className="h-6 w-6" />,
            component: <AIResearcherTool />,
        },
        // ... more tools will be added here
    ];

    function handleToolSelect(tool: Tool) {
        setSelectedTool(tool.id);
    }

    const selectedToolComponent = availableTools.find(tool => tool.id === selectedTool)?.component || null;

    return (
        <div className="grid h-screen w-full lg:grid-cols-[280px_1fr]">
            <aside className="hidden border-r bg-muted/40 lg:block">
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <div className="flex h-[60px] items-center border-b px-6">
                        <Link href="/" className="flex items-center gap-2 font-semibold">
                            <span>{t('writingTools.dashboard.title')}</span>
                        </Link>
                    </div>
                    <div className="flex-1 overflow-auto py-2">
                        <ToolsNavigation />
                    </div>
                </div>
            </aside>
            <main className="flex flex-col">
                <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-muted/40 px-6">
                    <div className="flex-1">
                        <h1 className="text-lg font-semibold md:text-2xl">{t('writingTools.dashboard.header')}</h1>
                    </div>
                </header>
                <div className="flex-1 overflow-auto p-4 md:p-6">
                    {selectedTool ? (
                        selectedToolComponent
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {availableTools.map((tool) => (
                                <ToolCard 
                                    key={tool.id}
                                    title={tool.title}
                                    icon={tool.icon}
                                    description={tool.description}
                                    onClick={() => handleToolSelect(tool)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
