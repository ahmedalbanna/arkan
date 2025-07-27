
'use client';

import { PromptTemplateLibrary } from '@/components/admin/PromptTemplateLibrary';
import { Library } from 'lucide-react';

export default function ManagePromptTemplatesPage() {
    return (
        <div className="container mx-auto max-w-7xl px-4 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
                <Library className="w-10 h-10" />
                Prompt Template Library
                </h1>
                <p className="text-lg text-muted-foreground mt-2">
                Browse and discover prompt templates to supercharge your AI agents.
                </p>
            </div>
            <div className="h-[calc(100vh-300px)]">
                <PromptTemplateLibrary />
            </div>
        </div>
    );
}
