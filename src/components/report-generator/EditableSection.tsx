'use client';

import { useState, useEffect } from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { type Token, marked } from 'marked';
import { EditableMarkdownBlock } from './EditableMarkdownBlock';
import type { SectionName } from '@/ai/schemas';

interface EditableSectionProps {
    sectionKey: SectionName;
    title: string;
    icon: React.ElementType;
    content: string;
    onUpdate: (key: SectionName, value: string) => void;
}

export const EditableSection = ({ sectionKey, title, icon: Icon, content, onUpdate }: EditableSectionProps) => {
    const [blocks, setBlocks] = useState<Token[]>([]);

    useEffect(() => {
        setBlocks(marked.lexer(content));
    }, [content]);

    const handleUpdateBlock = (index: number, newRaw: string) => {
        const newBlocks = [...blocks];
        const updatedToken = marked.lexer(newRaw)[0] || { type: 'space', raw: '' };
        newBlocks[index] = updatedToken;
        
        const fullMarkdown = newBlocks.map(b => b.raw).join('');
        onUpdate(sectionKey, fullMarkdown);
    };

    return (
        <AccordionItem value={title} key={sectionKey} className="bg-background rounded-lg border">
            <AccordionTrigger className="font-headline text-xl p-4 hover:no-underline">
                <div className="flex items-center">
                    <Icon className="mr-2 h-5 w-5 text-primary" /> {title}
                </div>
            </AccordionTrigger>
            <AccordionContent className="max-w-none p-4 text-muted-foreground border-t group relative cursor-pointer">
                <div className="space-y-2">
                    {blocks.map((block, index) => {
                        if (block.type === 'space' && !block.raw.trim()) return null;
                        return <EditableMarkdownBlock key={index} block={block} onUpdate={(newRaw) => handleUpdateBlock(index, newRaw)} />
                    })}
                </div>
            </AccordionContent>
        </AccordionItem>
    );
};
