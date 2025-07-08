
'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { handleCreateProject, type CreateProjectState } from '@/app/projects/new/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, UploadCloud } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto font-headline">
      {pending ? (
        <>
          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          جاري الإنشاء...
        </>
      ) : (
        <>
          <UploadCloud className="ml-2 h-4 w-4" />
          نشر المشروع
        </>
      )}
    </Button>
  );
}

export default function NewProjectForm({ categories }: { categories: string[] }) {
  const initialState: CreateProjectState = {};
  const [state, formAction] = useActionState(handleCreateProject, initialState);

  return (
    <form action={formAction}>
      <Card>
        <CardHeader>
            <CardTitle className="font-headline text-2xl">تفاصيل المشروع</CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid gap-6">
          <div className="space-y-2">
            <Label htmlFor="title">عنوان المشروع</Label>
            <Input id="title" name="title" placeholder="مثال: تطبيق لإدارة المهام" required />
            {state.errors?.title && <p className="text-sm text-destructive">{state.errors.title[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">وصف المشروع</Label>
            <Textarea id="description" name="description" placeholder="صف مشروعك بالتفصيل..." rows={5} required />
            {state.errors?.description && <p className="text-sm text-destructive">{state.errors.description[0]}</p>}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category">التصنيف</Label>
              <Select name="category" required>
                <SelectTrigger id="category">
                  <SelectValue placeholder="اختر تصنيفًا" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state.errors?.category && <p className="text-sm text-destructive">{state.errors.category[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">الوسوم</Label>
              <Input id="tags" name="tags" placeholder="مثال: react, nextjs, tailwind" required />
              <p className="text-xs text-muted-foreground">افصل بين الوسوم بفاصلة (,).</p>
              {state.errors?.tags && <p className="text-sm text-destructive">{state.errors.tags[0]}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="liveLink">رابط مباشر (اختياري)</Label>
            <Input id="liveLink" name="liveLink" placeholder="https://example.com" type="url" />
            {state.errors?.liveLink && <p className="text-sm text-destructive">{state.errors.liveLink[0]}</p>}
          </div>

          <div className="space-y-2 p-4 border-l-4 border-accent bg-accent/10 rounded-r-lg">
            <Label className="font-semibold text-accent-foreground">صورة المشروع</Label>
            <p className="text-sm text-accent-foreground/80">
              سيتم إضافة صورة غلاف افتراضية لمشروعك. يمكنك تغييرها لاحقًا من صفحة تعديل المشروع.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-4 p-6 border-t">
            {state.errors?._form && (
                <p className="text-sm font-medium text-destructive">{state.errors._form}</p>
            )}
            <SubmitButton />
        </CardFooter>
      </Card>
    </form>
  );
}
