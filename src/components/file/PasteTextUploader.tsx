
'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks';
import { useBuilderStore } from '@/hooks';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';

export function PasteTextUploader() {
    const { t } = useLocalization();
    const { toast } = useToast();
    // Get the updateProject function from the store
    const { updateProject } = useBuilderStore();
    const [text, setText] = useState('');
    const [fileName, setFileName] = useState('');

    const handleAddContext = () => {
        if (!text.trim() || !fileName.trim()) {
            toast({
                title: t('builder.files.toasts.missingInfoToastTitle'),
                description: t('builder.files.toasts.missingInfoToastDesc'),
                variant: "destructive"
            });
            return;
        }

        const fullFileName = `${fileName.trim()}.md`;

        // Use the new contextManager to add the file
        updateProject(p => {
            p.contextManager.add(fullFileName, text, 'context');
        });

        toast({
            title: t('builder.files.toasts.contextAddedToastTitle'),
            description: t('builder.files.toasts.contextAddedToastDesc').replace('{fileName}', fullFileName),
        });
        
        setText('');
        setFileName('');
    };

    return (
        <Card>
            <CardContent className="p-6 space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="context-name">{t('builder.files.pasteText.titleLabel')}</Label>
                    <Input
                        id="context-name"
                        placeholder={t('builder.files.pasteText.titlePlaceholder')}
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="context-text">{t('builder.files.pasteText.contentLabel')}</Label>
                    <Textarea
                        id="context-text"
                        placeholder={t('builder.files.pasteText.contentPlaceholder')}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={10}
                    />
                </div>
                <Button onClick={handleAddContext} disabled={!text.trim() || !fileName.trim()}>
                    <PlusCircle className="me-2 h-4 w-4" />
                    {t('builder.files.pasteText.addButton')}
                </Button>
            </CardContent>
        </Card>
    );
}
