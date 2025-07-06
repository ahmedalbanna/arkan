'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { handleGenerateIntroduction } from '@/app/generate-introduction/actions';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Loader2, Sparkles, BookMarked } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="font-headline">
      {pending ? (
        <>
          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          جاري التوليد...
        </>
      ) : (
        <>
         <Sparkles className="ml-2 h-4 w-4" />
          توليد المقدمة
        </>
      )}
    </Button>
  );
}

export default function IntroductionGenerator() {
  const initialState = {};
  const [state, formAction] = useActionState(handleGenerateIntroduction, initialState);

  return (
    <>
      <Card>
        <form action={formAction}>
          <CardHeader>
            <CardTitle className="font-headline">مقترح المشروع (JSON)</CardTitle>
            <CardDescription>
                الصق هنا محتوى مقترح المشروع الكامل بصيغة JSON. يمكنك نسخ هذا المحتوى من صفحة "توليد مقترح" بعد إنشائه.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              name="proposalJson"
              placeholder='{ "title": "...", "objective": "...", ... }'
              rows={15}
              required
            />
            {state?.error && (
               <p className="text-sm font-medium text-destructive mt-2">{state.error}</p>
            )}
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>

      {state?.introduction && (
        <div className="mt-8">
            <Alert>
                <BookMarked className="h-4 w-4" />
                <AlertTitle className="font-headline">مقدمة المشروع المولدة</AlertTitle>
                <AlertDescription>
                  <div className="prose dark:prose-invert max-w-none pt-2">
                    <ReactMarkdown>{state.introduction}</ReactMarkdown>
                  </div>
                </AlertDescription>
            </Alert>
        </div>
      )}
    </>
  );
}
