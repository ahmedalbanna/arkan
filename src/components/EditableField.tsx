
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MoreVertical, Languages, Loader2, X, Check, Trash2, Copy } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { useLocalization } from '@/context/LocalizationContext';
import { useTranslate } from '@/hooks/use-translation';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { Card, CardContent } from './ui/card';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { markdownComponents } from '@/lib/markdown-components';
import { BlockNoteEditor, insertOrUpdateBlock } from "@blocknote/core";
import dynamic from 'next/dynamic';

const BlockEditor = dynamic(() => import("./BlockEditor"), { ssr: false });


interface EditableFieldProps {
  value: string;
  onUpdate: (newValue: string) => void;
  onDelete?: () => void;
  multiline?: boolean;
  className?: string;
  readOnly?: boolean;
}

export const EditableField: React.FC<EditableFieldProps> = ({
  value,
  onUpdate,
  onDelete,
  multiline = false,
  className = '',
  readOnly = false,
}) => {
  const { t, locale } = useLocalization();
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isAiPopoverOpen, setIsAiPopoverOpen] = useState(false);
  const { toast } = useToast();
  const { firebaseUser } = useAuth();
  const translateMutation = useTranslate();
  
  const [editor, setEditor] = useState<BlockNoteEditor | null>(null);

  useEffect(() => {
    // Initialize editor only on the client-side when editing starts
    if (isEditing && !editor) {
      setEditor(new BlockNoteEditor());
    }
  }, [isEditing, editor]);


  const isProcessingAi = translateMutation.isPending;

  useEffect(() => {
    if (!isEditing) {
      setCurrentValue(value);
    } else if (editor) {
        // Function to safely parse and update editor content
        const updateEditorContent = async () => {
            try {
                const blocks = value ? JSON.parse(value) : [];
                editor.removeBlocks(editor.topLevelBlocks);
                insertOrUpdateBlock(editor, blocks);
            } catch (e) {
                console.warn("Failed to parse initial JSON content for editor, falling back to text.");
                // Fallback for non-JSON or malformed JSON content
                editor.removeBlocks(editor.topLevelBlocks);
                editor.insertBlocks([{ type: 'paragraph', content: value }], editor.topLevelBlocks[0], "before");
            }
        };
        updateEditorContent();
    }
  }, [value, isEditing, editor]);

  const handleSave = () => {
    if (readOnly || !editor) return;
    const newContent = JSON.stringify(editor.topLevelBlocks, null, 2);
    if (newContent !== value) {
      onUpdate(newContent);
    }
    setIsEditing(false);
  };

  const handleTranslate = async () => {
    if (readOnly || !firebaseUser) return;
    translateMutation.mutate(
      { text: String(currentValue), targetLang: locale === 'en' ? 'ar' : 'en' },
      {
        onSuccess: (data) => {
          setAiSuggestion(data.translatedText);
          toast({ title: t('builder.editableSection.toasts.translateSuccess') });
        },
        onError: (error) => {
            const isCreditError = error.message.toLowerCase().includes('credit');
            toast({ 
                title: t('builder.editableSection.toasts.translateFailed'), 
                description: isCreditError ? t('builder.toasts.insufficientCredits') : error.message,
                variant: 'destructive' 
            });
        },
        onSettled: () => setIsAiPopoverOpen(false),
      }
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(String(value));
    toast({ title: t('builder.proposalViewer.toasts.copied') });
    setIsAiPopoverOpen(false);
  };

  const handleDelete = () => {
    if (onDelete) {
        onDelete();
        toast({ title: t('builder.proposalViewer.toasts.cleared') });
    }
    setIsAiPopoverOpen(false);
  };

  const handleAcceptSuggestion = () => {
    if (aiSuggestion !== null) {
      onUpdate(aiSuggestion);
    }
    setAiSuggestion(null);
  };

  const handleRejectSuggestion = () => {
    setAiSuggestion(null);
  };

  const renderContent = () => {
     if (aiSuggestion !== null && !readOnly) {
        return (
            <div className="p-2 -m-2 rounded-md border-2 border-dashed border-accent bg-accent/10 my-2">
                <p className="text-xs font-semibold text-accent-foreground mb-2">{t('builder.proposalViewer.aiSuggestion')}</p>
                <div className="p-2 rounded bg-background max-h-60 overflow-y-auto">
                    <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>{aiSuggestion}</ReactMarkdown>
                </div>
                <div className="flex justify-end gap-2 mt-2">
                    <Button variant="ghost" size="sm" onClick={handleRejectSuggestion}>
                        <X className="mr-2 h-4 w-4" />
                        {t('builder.proposalViewer.reject')}
                    </Button>
                    <Button variant="secondary" size="sm" onClick={handleAcceptSuggestion}>
                        <Check className="mr-2 h-4 w-4" />
                        {t('builder.proposalViewer.accept')}
                    </Button>
                </div>
            </div>
        );
    }
    if (isEditing && !readOnly) {
      return (
        <Card>
            <CardContent className="p-1">
                 {editor ? <BlockEditor editor={editor} editable={true} /> : <Loader2 className="h-6 w-6 animate-spin"/>}
            </CardContent>
            <div className="flex justify-end p-2">
                 <Button onClick={handleSave} size="sm">Save</Button>
            </div>
        </Card>
      );
    }
    return multiline ? (
      <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
        {value}
      </ReactMarkdown>
    ) : (
      <span>{value}</span>
    );
  };

  return (
    <div
      onDoubleClick={() => !readOnly && !isEditing && setIsEditing(true)}
      className={cn('group relative p-1 -m-1 rounded-md', className, !readOnly && 'hover:bg-muted/50 cursor-pointer')}
    >
      {renderContent()}
      {!readOnly && !isEditing &&(
        <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <Popover open={isAiPopoverOpen} onOpenChange={setIsAiPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-1">
              <Button variant="ghost" className="w-full justify-start" onClick={handleTranslate} disabled={isProcessingAi}>
                {isProcessingAi ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Languages className="mr-2 h-4 w-4" />}
                {t('builder.proposalViewer.aiActions.translate')}
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={handleCopy}>
                <Copy className="mr-2 h-4 w-4" /> {t('builder.proposalViewer.markdownTools.copy')}
              </Button>
              {onDelete && (
                <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive" onClick={handleDelete}>
                  <Trash2 className="mr-2 h-4 w-4" /> {t('builder.proposalViewer.destructive.delete')}
                </Button>
              )}
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
};
