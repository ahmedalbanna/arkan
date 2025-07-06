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

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled} className="font-headline">
      {pending ? (
        <>
          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          جاري التلخيص...
        </>
      ) : (
        <>
         <Sparkles className="ml-2 h-4 w-4" />
          توليد الملخص
        </>
      )}
    </Button>
  );
}

export default function Summarizer() {
  const initialState: { summary?: string; technologies?: string[], error?: string } = {};
  const [state, formAction] = useActionState(handleSummarize, initialState);
  const { agents, isLoaded } = useAgents();

  const agent = agents.find(a => a.id === 'summarize-project');

  return (
    <Card>
      <form action={formAction}>
        {agent && <input type="hidden" name="prompt" value={agent.prompt} />}
        <CardHeader>
          <CardTitle className="font-headline">وصف المشروع</CardTitle>
          <CardDescription>
            الصق وصف مشروعك هنا. كلما كان الوصف أكثر تفصيلاً، كان الملخص أفضل.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            name="projectDescription"
            placeholder="مثال: قمت ببناء تطبيق لإدارة المهام باستخدام FlutterFlow وFirebase. يتميز التطبيق بواجهة مستخدم بسيطة..."
            rows={10}
            required
          />
          {state?.error && (
             <p className="text-sm font-medium text-destructive mt-2">{state.error}</p>
          )}
        </CardContent>
        <CardFooter className="justify-start items-center gap-4">
          <SubmitButton disabled={!agent?.isEnabled} />
           {!isLoaded ? <Loader2 className="h-4 w-4 animate-spin" /> : !agent?.isEnabled && (
              <p className="text-sm text-destructive">تم تعطيل هذا الوكيل.</p>
           )}
        </CardFooter>
      </form>

      {state?.summary && (
        <CardContent className="pt-6 border-t space-y-4">
            <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertTitle className="font-headline">الملخص المولد</AlertTitle>
                <AlertDescription>
                  <div className="prose dark:prose-invert max-w-none pt-2">
                    <ReactMarkdown>{state.summary}</ReactMarkdown>
                  </div>
                </AlertDescription>
            </Alert>
            
            {state.technologies && state.technologies.length > 0 && (
                <div>
                    <h4 className="font-headline text-lg mb-3">التقنيات المكتشفة</h4>
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
