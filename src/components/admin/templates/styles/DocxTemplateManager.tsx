
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Save, PlusCircle, Trash2, RefreshCw } from 'lucide-react';
import type { DocxTemplate, DocxTemplateKey } from '@/lib/types';
import { Accordion } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import componentStyles from './DocxTemplateManager.module.css';
import { StyleEditor } from '@/components/design/StyleEditor';
import { useDocxTemplateManager, useCreateDocxTemplate } from '@/hooks';

const createDocxTemplateSchema = z.object({
  id: z.string().min(3, "ID must be at least 3 characters").regex(/^[a-z0-9-]+$/, "ID can only contain lowercase letters, numbers, and hyphens."),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
});
type CreateDocxTemplateValues = z.infer<typeof createDocxTemplateSchema>;

function CreateTemplateDialog() {
    const { t } = useDocxTemplateManager();
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
    const templateStyles = styles?.default || {};
    const docStyles = templateStyles.document?.run || {};
    const h1Styles = templateStyles.heading1?.run || {};
    const h2Styles = templateStyles.heading2?.run || {};

    const cssVariables = {
        '--doc-font-family': typeof docStyles.font === 'string' ? docStyles.font : docStyles.font?.name || 'Calibri',
        '--doc-font-size': `${Number(docStyles.size || 22) / 2}pt`,
        '--doc-color': `#${docStyles.color || '333333'}`,
        '--h1-font-family': typeof h1Styles.font === 'string' ? h1Styles.font : h1Styles.font?.name || 'Calibri Light',
        '--h1-font-size': `${Number(h1Styles.size || 32) / 2}pt`,
        '--h1-color': `#${h1Styles.color || '2E74B5'}`,
        '--h1-font-weight': h1Styles.bold ? 'bold' : 'normal',
        '--h2-font-family': typeof h2Styles.font === 'string' ? h2Styles.font : h2Styles.font?.name || 'Calibri Light',
        '--h2-font-size': `${Number(h2Styles.size || 26) / 2}pt`,
        '--h2-color': `#${h2Styles.color || '2E74B5'}`,
        '--h2-font-weight': h2Styles.bold ? 'bold' : 'normal',
    } as React.CSSProperties;

    return (
        <div className="w-full aspect-[400/565] rounded-md border bg-white p-6 overflow-hidden" style={cssVariables}>
            <div className={componentStyles.previewBody}>
                <h1 className={`${componentStyles.previewH1} mb-4 pb-2 border-b`}>Sample Document Title</h1>
                <p className="mb-4">
                    This is a sample paragraph to demonstrate the default body text style for this template. You can adjust the font family, size, and color to match your branding.
                </p>
                <h2 className={`${componentStyles.previewH2} mb-2`}>A Secondary Heading</h2>
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
  const {
    t,
    templates,
    isLoaded,
    isSaving,
    deleteMutation,
    refreshImageMutation,
    handleStyleChange,
    handleSave,
    handleDelete,
    handleRefreshImage,
  } = useDocxTemplateManager();

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
      {(Object.keys(templates || {}) as DocxTemplateKey[]).map((key) => {
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
                  <StyleEditor heading="General Document Styles" styleKey="document" DocxTemplateKey={key} styles={template.styles} onChange={handleStyleChange} />
                  <StyleEditor heading="Heading 1" styleKey="heading1" DocxTemplateKey={key} styles={template.styles} onChange={handleStyleChange} />
                  <StyleEditor heading="Heading 2" styleKey="heading2" DocxTemplateKey={key} styles={template.styles} onChange={handleStyleChange} />
                  <StyleEditor heading="Heading 3" styleKey="heading3" DocxTemplateKey={key} styles={template.styles} onChange={handleStyleChange} />
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
