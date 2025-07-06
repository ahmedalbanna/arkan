'use client';

import { useTransition, useRef } from 'react';
import { handleCommentAction } from '@/app/projects/[id]/actions';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function NewCommentForm({ projectId }: { projectId: string }) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await handleCommentAction(null, formData);
      if (result?.error) {
         toast({
          title: "خطأ",
          description: result.error,
          variant: "destructive",
        });
      } else {
        formRef.current?.reset();
      }
    });
  };

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-col gap-2 pt-4 border-t">
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="intent" value="create" />
      <Textarea name="comment" placeholder="أضف تعليقاً..." required disabled={isPending} />
      <Button type="submit" className="self-end font-headline" disabled={isPending}>
        {isPending ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : 'إرسال'}
      </Button>
    </form>
  );
}
