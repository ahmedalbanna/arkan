import { useMemo, useState } from 'react';
import { Editor } from '@tiptap/react';
import { useWritingTool } from '@/hooks';
import { useToast } from '@/hooks/util/use-toast';
import { useLocalization } from '@/context/LocalizationContext';

interface AiActionsProps {
  editor: Editor;
  onTextUpdate: (newText: string, from: number, to: number) => void;
  onWholeUpdate: (newText: string) => void;
}

export function useAiActions({ editor, onTextUpdate, onWholeUpdate }: AiActionsProps) {
  const { t } = useLocalization();
  const [activeAiAction, setActiveAiAction] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSuccess = (resultText: string) => {
    const { from, to } = editor.state.selection;
    if (from !== to) { // There was a selection
      onTextUpdate(resultText, from, to);
    } else { // Replace whole content
      onWholeUpdate(resultText);
    }
    toast({ title: t('builder.Section.aiActionComplete') });
  };

  const handleError = (error: Error) => {
    toast({
      title: t('builder.Section.aiActionFailed'),
      description: error.message,
      variant: 'destructive'
    });
  };

  const aiActionMutation = useWritingTool('/api/writing-tools/manipulate-text', {
    onSuccess: (data: any) => handleSuccess(data.rewrittenText),
    onError: handleError,
    onSettled: () => setActiveAiAction(null),
  });

  const translateMutation = useWritingTool('/api/writing-tools/translate-text', {
    onSuccess: (data: any) => handleSuccess(data.text),
    onError: handleError,
    onSettled: () => setActiveAiAction(null),
  });

  const isProcessing = aiActionMutation.isPending || translateMutation.isPending;

  const detectLanguage = (text: string): 'Arabic' | 'English' => {
    // Basic detection: if the text contains Arabic characters, assume 'ar'
    return /[؀-ۿ]/.test(text) ? 'Arabic' : 'English';
  };

  const handleAiAction = (action: string, payload: any = {}) => {
    setActiveAiAction(action);
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to);
    const textToProcess = selectedText.trim() || editor.getText();

    if (!textToProcess) {
      toast({ title: t('builder.Section.noTextError'), variant: 'destructive' });
      setActiveAiAction(null);
      return;
    }

    if (action === 'translate') {
      const sourceLang = detectLanguage(textToProcess);
      const targetLang = sourceLang === 'Arabic' ? 'English' : 'Arabic';
      translateMutation.mutate({ text: textToProcess, targetLang });
      return;
    }

    const commandMap: Record<string, string> = {
      summarize: `Summarize this text concisely: "${textToProcess}"`,
      expand: `Expand on this topic, adding more detail and explanation: "${textToProcess}"`,
      grammar: `Correct any spelling and grammar mistakes in this text: "${textToProcess}"`,
      humanize: `Rewrite this text to sound more natural and human-like: "${textToProcess}"`,
      rewrite: `Rewrite this text in a ${payload.style || 'default'} style: "${textToProcess}"`
    };

    const command = commandMap[action];

    if (command) {
      aiActionMutation.mutate({ textToManipulate: textToProcess, command });
    } else {
      setActiveAiAction(null);
    }
  };

  const rewriteStyles = useMemo(() => [
    { label: t('writingTools.textStylist.styles.formal'), style: 'Formal' },
    { label: t('writingTools.textStylist.styles.friendly'), style: 'Friendly' },
    { label: t('writingTools.textStylist.styles.simple'), style: 'Simple' },
    { label: t('writingTools.textStylist.styles.creative'), style: 'Creative' },
    { label: t('writingTools.textStylist.styles.professional'), style: 'Professional' },
    { label: t('writingTools.textStylist.styles.academic'), style: 'Academic' },
  ], [t]);

  return {
    activeAiAction,
    isProcessing,
    handleAiAction,
    rewriteStyles,
  };
}
