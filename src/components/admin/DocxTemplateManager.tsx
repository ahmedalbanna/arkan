
'use client';

import { useDocxStyles, useCreateDocxTemplate, useDeleteDocxTemplate } from '@/hooks/use-docx-styles';
import { useRefreshTemplateImage } from '@/hooks/use-templates';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Save, PlusCircle, Trash2, RefreshCw } from 'lucide-react';
import type { DocxTemplate, TemplateKey } from '@/lib/types';
import { Accordion } from '../ui/accordion';
import { useLocalization } from '@/context/LocalizationContext';
import { Skeleton } from '../ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { StyleEditor } from '../design/StyleEditor';


const createDocxTemplateSchema = z.object({
  id: z.string().min(3, "ID must be at least 3 characters").regex(/^[a-z0-9-]+$/, "ID can only contain lowercase letters, numbers, and hyphens."),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
});
type CreateDocxTemplateValues = z.infer<typeof createDocxTemplateSchema>;


function CreateTemplateDialog() {
    const { t } = useLocalization();
    const [isOpen, setIsOpen] = useState(false);
    const createMutation = useCreateDocxTemplate();

    const form = useForm<CreateDocxTemplateValues>({
        resolver: zodResolver(createDocxTemplateSchema),
        defaultValues: { id: '', name: '', description: '' },
    });

    const handleSave = (data: CreateDocxTemplateValues) => {
        createMutation.mutate(data, {
            onSuccess: () => {
                setIsOpen(false);
                form.reset();
            },
            onError: (error: any) => {
                 if (error.errors) {
                    for (const key in error.errors) {
                        form.setError(key as keyof CreateDocxTemplateValues, { message: error.errors[key][0] });
                    }
                }
            }
        });
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm"><PlusCircle className="me-2 h-4 w-4" />{t('manageTemplates.createButton')}</Button>
            </DialogTrigger>
            <DialogContent>
                 <DialogHeader>
                    <DialogTitle>{t('manageTemplates.docxDialog.title')}</DialogTitle>
                    <DialogDescription>{t('manageTemplates.docxDialog.description')}</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                     <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                        <FormField control={form.control} name="id" render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('manageTemplates.createDialog.idLabel')}</FormLabel>
                                <FormControl><Input {...field} placeholder="e.g., my-company-style" disabled={createMutation.isPending} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('manageTemplates.createDialog.nameLabel')}</FormLabel>
                                <FormControl><Input {...field} placeholder="e.g., My Company Style" disabled={createMutation.isPending} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('manageTemplates.createDialog.descriptionLabel')}</FormLabel>
                                <FormControl><Textarea {...field} rows={2} disabled={createMutation.isPending} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="secondary">{t('manageTemplates.cancelButton')}</Button></DialogClose>
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                                {t('manageTemplates.createButton')}
                            </Button>
                        </DialogFooter>
                     </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

function DocxTemplateSkeleton() {
    return (
        <Card className="flex flex-col">
            <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                <Skeleton className="w-full aspect-[400/565] rounded-md" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </CardContent>
            <CardFooter>
                <Skeleton className="h-10 w-32" />
            </CardFooter>
        </Card>
    );
}

function TemplatePreview({ styles }: { styles: any }) {
    const docStyles = styles?.default?.document?.run || {};
    const h1Styles = styles?.default?.heading1?.run || {};
    const h2Styles = styles?.default?.heading2?.run || {};

    const inlineDocStyles = {
        fontFamily: typeof docStyles.font === 'string' ? docStyles.font : docStyles.font?.name || 'Calibri',
        fontSize: `${Number(docStyles.size || 22) / 2}pt`,
        color: `#${docStyles.color || '333333'}`,
    };

    const inlineH1Styles: React.CSSProperties = {
        fontFamily: typeof h1Styles.font === 'string' ? h1Styles.font : h1Styles.font?.name || 'Calibri Light',
        fontSize: `${Number(h1Styles.size || 32) / 2}pt`,
        color: `#${h1Styles.color || '2E74B5'}`,
        fontWeight: h1Styles.bold ? 'bold' : 'normal',
    };

    const inlineH2Styles: React.CSSProperties = {
        fontFamily: typeof h2Styles.font === 'string' ? h2Styles.font : h2Styles.font?.name || 'Calibri Light',
        fontSize: `${Number(h2Styles.size || 26) / 2}pt`,
        color: `#${h2Styles.color || '2E74B5'}`,
        fontWeight: h2Styles.bold ? 'bold' : 'normal',
    };

    return (
        <div className="w-full aspect-[400/565] rounded-md border bg-white p-6 overflow-hidden">
            <div style={inlineDocStyles}>
                <h1 style={inlineH1Styles} className="mb-4 pb-2 border-b">Sample Document Title</h1>
                <p className="mb-4">
                    This is a sample paragraph to demonstrate the default body text style for this template. You can adjust the font family, size, and color to match your branding.
                </p>
                <h2 style={inlineH2Styles} className="mb-2">A Secondary Heading</h2>
                <ul className="list-disc pl-5 space-y-1">
                    <li>This is a list item.</li>
                    <li>Another list item for styling.</li>
                    <li>And a final one to complete the list.</li>
                </ul>
            </div>
        </div>
    );
}

export default function DocxTemplateManager() {
  const { templates, updateStyle, saveChanges, isSaving, isLoaded, activeTemplateKey, setActiveTemplateKey } = useDocxStyles();
  const deleteMutation = useDeleteDocxTemplate();
  const refreshImageMutation = useRefreshTemplateImage('docx');
  const { t } = useLocalization();
  const [changeQueue, setChangeQueue] = useState<{ key: TemplateKey, path: string, value: any } | null>(null);

  // When a change is queued, set the active template key.
  // This will trigger a re-render.
  useEffect(() => {
    if (changeQueue) {
      setActiveTemplateKey(changeQueue.key as any);
    }
  }, [changeQueue, setActiveTemplateKey]);

  // After the re-render, if the active key matches the queued change, apply the update.
  useEffect(() => {
    if (changeQueue && activeTemplateKey === changeQueue.key) {
      updateStyle(changeQueue.path, changeQueue.value);
      setChangeQueue(null); // Clear the queue
    }
  }, [activeTemplateKey, changeQueue, updateStyle]);

  const handleStyleChange = (templateKey: TemplateKey, path: string, value: string | number | boolean) => {
    setChangeQueue({ key: templateKey, path, value });
  };

  const handleSave = (key: TemplateKey) => {
    saveChanges(key);
  };

  const handleDelete = (key: TemplateKey) => {
    deleteMutation.mutate(key);
  }

  const handleRefreshImage = (templateId: string, prompt: string) => {
    refreshImageMutation.mutate({ templateId, prompt });
  };


  if (!isLoaded) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DocxTemplateSkeleton />
        <DocxTemplateSkeleton />
        <DocxTemplateSkeleton />
      </div>
    );
  }

  return (
    <>
    <div className="flex justify-end mb-4">
        <CreateTemplateDialog />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {(Object.keys(templates || {}) as TemplateKey[]).map((key) => {
        const template = templates?.[key];
        if (!template) return null;
        const isDefaultTemplate = ['modern', 'classic', 'academic'].includes(key);

        return (
          <Card key={key} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="font-headline">{t(template.name)}</CardTitle>
                    <CardDescription>{t(template.description)}</CardDescription>
                  </div>
                  {!isDefaultTemplate && (
                      <AlertDialog>
                          <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                {deleteMutation.isPending && deleteMutation.variables === key ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4" />}
                              </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t('manageTemplates.deleteDialog.title')}</AlertDialogTitle>
                                <AlertDialogDescription>{t('manageTemplates.deleteDialog.description').replace('{templateName}', t(template.name))}</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t('manageTemplates.cancelButton')}</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(key)}>{t('manageTemplates.deleteDialog.deleteButton')}</AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                  )}
              </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
               <div className="relative group">
                    <TemplatePreview styles={template.styles} />
                     <Button
                        size="icon"
                        variant="secondary"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRefreshImage(template.id, template.dataAiHint || '')}
                        disabled={refreshImageMutation.isPending && refreshImageMutation.variables?.templateId === template.id}
                      >
                         {refreshImageMutation.isPending && refreshImageMutation.variables?.templateId === template.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                    </Button>
                </div>
              <Accordion type="multiple" className="w-full" defaultValue={['general', 'heading1']}>
                  <StyleEditor heading="General Document Styles" styleKey="document" templateKey={key} onChange={handleStyleChange} styles={template.styles} />
                  <StyleEditor heading="Heading 1" styleKey="heading1" templateKey={key} onChange={handleStyleChange} styles={template.styles} />
                  <StyleEditor heading="Heading 2" styleKey="heading2" templateKey={key} onChange={handleStyleChange} styles={template.styles} />
                  <StyleEditor heading="Heading 3" styleKey="heading3" templateKey={key} onChange={handleStyleChange} styles={template.styles} />
              </Accordion>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSave(key)} disabled={isSaving} className="font-headline">
                {isSaving ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Save className="me-2 h-4 w-4" />}
                {t('manageTemplates.saveButton')}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
    </>
  );
}
