'use client';

import { useState, useTransition } from 'react';
import { handleCommentAction } from '@/app/projects/[id]/actions';
import type { ProjectDetail } from '@/lib/db/queries';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, Trash2, X, Check, Loader2 } from 'lucide-react';
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

type Comment = NonNullable<ProjectDetail>['comments'][number];
const hardcodedUserId = 'user-1'; // In a real app, this would come from session

export default function CommentItem({ comment, projectId }: { comment: Comment, projectId: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const commentUser = comment.user;
  const isOwner = commentUser?.id === hardcodedUserId;

  const handleEditSubmit = (formData: FormData) => {
    startTransition(async () => {
      await handleCommentAction(null, formData);
      setIsEditing(false);
    });
  }
  
  const handleDeleteSubmit = (formData: FormData) => {
    startTransition(async () => {
      await handleCommentAction(null, formData);
    });
  }

  if (isEditing) {
    return (
      <form action={handleEditSubmit} className="flex gap-3">
        <input type="hidden" name="projectId" value={projectId} />
        <input type="hidden" name="commentId" value={comment.id} />
        <input type="hidden" name="intent" value="edit" />
        <Avatar className="h-10 w-10">
          <AvatarImage src={commentUser?.avatarUrl ?? ''} alt={commentUser?.name} />
          <AvatarFallback>{commentUser?.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-grow space-y-2">
          <Textarea name="comment" defaultValue={comment.content} required rows={2} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)} disabled={isPending}>
              <X className="h-4 w-4" />
              إلغاء
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              حفظ
            </Button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <div className="flex gap-3 group">
      <Avatar className="h-10 w-10">
        <AvatarImage src={commentUser?.avatarUrl ?? ''} alt={commentUser?.name} />
        <AvatarFallback>{commentUser?.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-grow">
        <div className="flex items-center justify-between">
          <span className="font-semibold">{commentUser?.name}</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{format(new Date(comment.createdAt), 'dd/MM/yy')}</span>
            {isOwner && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsEditing(true)}>
                  <Pencil className="h-3 w-3" />
                  <span className="sr-only">Edit comment</span>
                </Button>
                 <AlertDialog>
                  <AlertDialogTrigger asChild>
                     <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-3 w-3" />
                        <span className="sr-only">Delete comment</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                      <AlertDialogDescription>
                        هذا الإجراء لا يمكن التراجع عنه. سيؤدي هذا إلى حذف تعليقك نهائيًا.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>إلغاء</AlertDialogCancel>
                      <form action={handleDeleteSubmit}>
                          <input type="hidden" name="projectId" value={projectId} />
                          <input type="hidden" name="commentId" value={comment.id} />
                          <input type="hidden" name="intent" value="delete" />
                          <AlertDialogAction type="submit" className="bg-destructive hover:bg-destructive/90 text-destructive-foreground" disabled={isPending}>
                            {isPending ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : 'حذف'}
                          </AlertDialogAction>
                      </form>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{comment.content}</p>
      </div>
    </div>
  );
}
