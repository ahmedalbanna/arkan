'use client';

import { useFormStatus } from 'react-dom';
import { useActionState } from 'react';
import { handleSummarize } from '@/app/summarize/actions';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Loader2, Sparkles } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="font-headline">
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
  const initialState = {};
  const [state, formAction] = useActionState(handleSummarize, initialState);

  return (
    <Card>
      <form action={formAction}>
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
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>

      {state?.summary && (
        <div className="p-6 pt-0">
            <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertTitle className="font-headline">الملخص المولد</AlertTitle>
                <AlertDescription className="whitespace-pre-wrap">
                    {state.summary}
                </AlertDescription>
            </Alert>
        </div>
      )}
    </Card>
  );
}
