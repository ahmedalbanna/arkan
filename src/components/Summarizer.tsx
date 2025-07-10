
'use client';

import { useFormStatus } from 'react-dom';
import { useActionState } from 'react';
import { handleSummarize } from '@/app/summarize/actions';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Loader2, Sparkles } from 'lucide-react';
import { useAgents } from '@/hooks/use-agents';
import { Badge } from './ui/badge';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useLocalization } from '@/context/LocalizationContext';
import { markdownComponents } from '@/lib/markdown-components';

function SubmitButton({ disabled, loadingText, buttonText }: { disabled?: boolean, loadingText: string, buttonText: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled} className="font-headline">
      {pending ? (
        <>
          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        <>
          <Sparkles className="ml-2 h-4 w-4" />
          {buttonText}
        </>
      )}
    </Button>
  );
}

export default function Summarizer() {
  const { t } = useLocalization();
  const initialState: { summary?: string; technologies?: string[], error?: string } = {};
  const [state, formAction] = useActionState(handleSummarize, initialState);
  const { agents, isLoaded } = useAgents();

  const agent = agents.find(a => a.id === 'summarize-project');

  return (
    <Card>
      <form action={formAction}>
        <CardHeader>
          <CardTitle className="font-headline">{t('summarizer.formTitle')}</CardTitle>
          <CardDescription>
            {t('summarizer.formDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            name="projectDescription"
            placeholder={t('summarizer.formPlaceholder')}
            rows={10}
            required
          />
          {state?.error && (
            <p className="text-sm font-medium text-destructive mt-2">{state.error}</p>
          )}
        </CardContent>
        <CardFooter className="justify-start items-center gap-4">
          <SubmitButton
            disabled={!agent?.isEnabled}
            buttonText={t('summarizer.submitButton')}
            loadingText={t('summarizer.submitButtonLoading')}
          />
          {!isLoaded ? <Loader2 className="h-4 w-4 animate-spin" /> : !agent?.isEnabled && (
            <p className="text-sm text-destructive">{t('summarizer.errorDisabled')}</p>
          )}
        </CardFooter>
      </form>

      {state?.summary && (
        <CardContent className="pt-6 border-t space-y-4">
          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertTitle className="font-headline">{t('summarizer.generatedTitle')}</AlertTitle>
            <AlertDescription>
              <div className="prose dark:prose-invert max-w-none pt-2">
                <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>{state.summary}</ReactMarkdown>
              </div>
            </AlertDescription>
          </Alert>

          {state.technologies && state.technologies.length > 0 && (
            <div>
              <h4 className="font-headline text-lg mb-3">{t('summarizer.detectedTech')}</h4>
              <div className="flex flex-wrap gap-2">
                {state.technologies.map((tech) => (
                  <Badge key={tech} variant="secondary">{tech}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
