
'use client';

import { useActionState, useState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { handleUpdateProject, handleDeleteProject, type UpdateProjectState } from '@/app/projects/[id]/edit/actions';
import type { ProjectDetail } from '@/lib/db/queries';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Trash2, Save, X } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from '../hooks/use-toast';
import { useRouter } from 'next/navigation';


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto font-headline">
      {pending ? (
        <>
          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          جاري الحفظ...
        </>
      ) : (
        <>
          <Save className="ml-2 h-4 w-4" />
          حفظ التغييرات
        </>
      )}
    </Button>
  );
}

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="destructive" disabled={pending}>
      {pending ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : 'نعم، قم بالحذف'}
    </Button>
  )
}

export default function EditProjectForm({ categories, project }: { categories: string[], project: NonNullable<ProjectDetail> }) {
  const router = useRouter();
  const { toast } = useToast();
  const updateInitialState: UpdateProjectState = { errors: {} };
  const [updateState, updateFormAction] = useActionState(handleUpdateProject, updateInitialState);

  const deleteInitialState: { error?: string; success?: boolean } = { error: undefined, success: undefined };
  const [deleteState, deleteFormAction] = useActionState(handleDeleteProject, deleteInitialState);

  const [mediaItems, setMediaItems] = useState(
    project.media.map((m, i) => ({ id: i, url: m.url, alt: m.alt, aiHint: m.aiHint || '' }))
  );

  useEffect(() => {
    if (deleteState?.error) {
      toast({ title: 'خطأ', description: deleteState.error, variant: 'destructive' });
    }
    if (deleteState?.success) {
      toast({ title: 'نجاح', description: 'تم حذف المشروع بنجاح.' });
      router.push('/projects');
    }
  }, [deleteState, router, toast]);

  const addMediaItem = () => {
    setMediaItems([...mediaItems, { id: Date.now(), url: '', alt: '', aiHint: '' }]);
  };

  const removeMediaItem = (id: number) => {
    setMediaItems(mediaItems.filter(item => item.id !== id));
  };

  const handleMediaChange = (id: number, field: 'url' | 'alt' | 'aiHint', value: string) => {
    setMediaItems(mediaItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  }

  return (
    <>
      <form action={updateFormAction}>
        <input type="hidden" name="projectId" value={project.id} />
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">تفاصيل المشروع</CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">عنوان المشروع</Label>
              <Input id="title" name="title" defaultValue={project.title} required />
              {updateState.errors?.title && <p className="text-sm text-destructive">{updateState.errors.title[0]}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">وصف المشروع</Label>
              <Textarea id="description" name="description" defaultValue={project.description} rows={5} required />
              {updateState.errors?.description && <p className="text-sm text-destructive">{updateState.errors.description[0]}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category">التصنيف</Label>
                <Select name="category" defaultValue={project.category} required>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="اختر تصنيفًا" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {updateState.errors?.category && <p className="text-sm text-destructive">{updateState.errors.category[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">الوسوم</Label>
                <Input id="tags" name="tags" defaultValue={project.projectTags.map(pt => pt.tag.name).join(', ')} required />
                <p className="text-xs text-muted-foreground">افصل بين الوسوم بفاصلة (,).</p>
                {updateState.errors?.tags && <p className="text-sm text-destructive">{updateState.errors.tags[0]}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="liveLink">رابط مباشر (اختياري)</Label>
              <Input id="liveLink" name="liveLink" defaultValue={project.liveLink || ''} type="url" />
              {updateState.errors?.liveLink && <p className="text-sm text-destructive">{updateState.errors.liveLink[0]}</p>}
            </div>

            <div className="space-y-4">
              <Label className="text-lg font-semibold">وسائط المشروع</Label>
              {mediaItems.map((item) => (
                <div key={item.id} className="p-4 border rounded-lg grid gap-4 relative bg-muted/20">
                  {mediaItems.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 left-2 h-7 w-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => removeMediaItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove media item</span>
                    </Button>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor={`mediaUrl-${item.id}`}>رابط الصورة</Label>
                    <Input id={`mediaUrl-${item.id}`} name="mediaUrl" value={item.url} onChange={(e) => handleMediaChange(item.id, 'url', e.target.value)} type="url" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`mediaAlt-${item.id}`}>نص بديل</Label>
                    <Input id={`mediaAlt-${item.id}`} name="mediaAlt" value={item.alt} onChange={(e) => handleMediaChange(item.id, 'alt', e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`mediaAiHint-${item.id}`}>تلميح للذكاء الاصطناعي (اختياري)</Label>
                    <Input id={`mediaAiHint-${item.id}`} name="mediaAiHint" value={item.aiHint} onChange={(e) => handleMediaChange(item.id, 'aiHint', e.target.value)} />
                  </div>
                </div>
              ))}
              {updateState.errors?.mediaUrls && <p className="text-sm text-destructive">{updateState.errors.mediaUrls[0]}</p>}
              <Button type="button" variant="outline" onClick={addMediaItem}>
                <Plus className="ml-2 h-4 w-4" />
                إضافة وسائط أخرى
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-4 p-6 border-t">
            {updateState.errors?._form && (
              <p className="text-sm font-medium text-destructive">{updateState.errors._form}</p>
            )}
            <SubmitButton />
          </CardFooter>
        </Card>
      </form>

      <div className="mt-8 pt-6 border-t border-destructive/20">
        <h3 className="text-lg font-semibold text-destructive">منطقة الخطر</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          حذف المشروع إجراء دائم ولا يمكن التراجع عنه.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" type="button">
              <Trash2 className="ml-2 h-4 w-4" />
              حذف المشروع
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>هل أنت متأكد تمامًا؟</AlertDialogTitle>
              <AlertDialogDescription>
                هذا الإجراء لا يمكن التراجع عنه. سيؤدي هذا إلى حذف مشروعك نهائيًا وجميع البيانات المرتبطة به.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <form action={deleteFormAction}>
                <input type="hidden" name="projectId" value={project.id} />
                <DeleteButton />
              </form>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
