'use client';

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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useDeleteDocxTemplate, useDeletePptxTemplate, useDeleteReportTemplate } from "@/hooks";
import { Loader2 } from "lucide-react";

interface DeleteTemplateDialogProps {
  templateId: string;
  templateName: string;
  templateType: 'docx' | 'pptx' | 'report';
  children: React.ReactNode;
}

export function DeleteTemplateDialog({
  templateId,
  templateName,
  templateType,
  children,
}: DeleteTemplateDialogProps) {
  const deleteDocxMutation = useDeleteDocxTemplate();
  const deletePptxMutation = useDeletePptxTemplate();
  const deleteReportMutation = useDeleteReportTemplate();

  const mutation =
    templateType === 'docx' ? deleteDocxMutation :
    templateType === 'pptx' ? deletePptxMutation :
    deleteReportMutation;

  const handleDelete = () => {
    mutation.mutate(templateId);
  };
  
  const isDefaultTemplate = ['modern', 'classic', 'academic', 'dark', 'professional'].includes(templateId);


  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            {isDefaultTemplate
              ? `Default templates like "${templateName}" cannot be deleted.`
              : `This action cannot be undone. This will permanently delete the template "${templateName}".`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {!isDefaultTemplate && (
              <AlertDialogAction
                  onClick={handleDelete}
                  disabled={mutation.isPending}
                  className="bg-destructive hover:bg-destructive/90"
              >
                  {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Delete
              </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
