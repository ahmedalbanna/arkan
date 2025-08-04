
'use client';

import { useDocxStyles, useCreateDocxTemplate, useDeleteDocxTemplate } from '@/hooks/use-docx-styles';
import { useRefreshTemplateImage } from '@/hooks/use-templates';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Save, PlusCircle, Trash2, RefreshCw } from 'lucide-react';
import type { DocxTemplate, TemplateKey } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useLocalization } from '@/context/LocalizationContext';
import { Skeleton } from '../ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Textarea } from '../ui/textarea';

const FONT_FACES = ['Calibri', 'Times New Roman', 'Arial', 'Garamond', 'Helvetica', 'Verdana'];

const createDocxTemplateSchema = z.object({
  id: z.string().min(3, "ID must be at least 3 characters").regex(/^[a-z0-9-]+$/, "ID can only contain lowercase letters, numbers, and hyphens."),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
});
type CreateDocxTemplateValues = z.infer<typeof createDocxTemplateSchema>;


function CreateTemplateDialog() {
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
                <Button size="sm"><PlusCircle className="mr-2 h-4 w-4" />Create New</Button>
            </DialogTrigger>
            <DialogContent>
                 <DialogHeader>
                    <DialogTitle>Create New DOCX Template</DialogTitle>
                    <DialogDescription>Define a new style template for DOCX exports. It will be initialized with the "Modern" style as a base.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                     <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                        <FormField control={form.control} name="id" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Template ID</FormLabel>
                                <FormControl><Input {...field} placeholder="e.g., my-company-style" disabled={createMutation.isPending} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Template Name</FormLabel>
                                <FormControl><Input {...field} placeholder="e.g., My Company Style" disabled={createMutation.isPending} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl><Textarea {...field} rows={2} disabled={createMutation.isPending} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Template
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
        fontFamily: docStyles.font?.name || 'Calibri',
        fontSize: `${docStyles.size / 2 || 11}pt`,
        color: `#${docStyles.color || '333333'}`,
    };

    const inlineH1Styles = {
        fontFamily: h1Styles.font?.name || 'Calibri Light',
        fontSize: `${h1Styles.size / 2 || 16}pt`,
        color: `#${h1Styles.color || '2E74B5'}`,
        fontWeight: h1Styles.bold ? 'bold' : 'normal',
    };
    
    const inlineH2Styles = {
        fontFamily: h2Styles.font?.name || 'Calibri Light',
        fontSize: `${h2Styles.size / 2 || 13}pt`,
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
  const { templates, updateStyle, saveChanges, isSaving, isLoaded } = useDocxStyles();
  const deleteMutation = useDeleteDocxTemplate();
  const refreshImageMutation = useRefreshTemplateImage('docx');
  const { t } = useLocalization();

  const handleStyleChange = (templateKey: TemplateKey, path: string, value: string | number | boolean) => {
    updateStyle(templateKey, path, value);
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
        const styles = template.styles.default;
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
                                <AlertDialogTitle>Are you sure you want to delete this template?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. The template "{t(template.name)}" will be permanently deleted.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(key)}>Delete</AlertDialogAction>
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
              <Accordion type="multiple" className="w-full">
                <AccordionItem value="general">
                  <AccordionTrigger>{t('manageTemplates.generalStyles')}</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t('manageTemplates.fontFamily')}</Label>
                        <Select
                          value={(styles?.document?.run?.font as any)?.name || ''}
                          onValueChange={(value) => handleStyleChange(key, 'document.run.font.name', value)}
                        >
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                {FONT_FACES.map(font => <SelectItem key={font} value={font}>{font}</SelectItem>)}
                            </SelectContent>
                        </Select>

                      </div>
                      <div className="space-y-2">
                        <Label>{t('manageTemplates.fontSize')}</Label>
                        <Input
                          type="number"
                          value={Number(styles?.document?.run?.size || 0) / 2}
                          onChange={(e) => handleStyleChange(key, 'document.run.size', Number(e.target.value) * 2)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('manageTemplates.fontColor')}</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={`#${styles?.document?.run?.color || '000000'}`}
                          onChange={(e) => handleStyleChange(key, 'document.run.color', e.target.value.substring(1))}
                          className="w-10 h-10 p-1"
                        />
                        <Input
                          type="text"
                          value={styles?.document?.run?.color || ''}
                          onChange={(e) => handleStyleChange(key, 'document.run.color', e.target.value)}
                          placeholder="e.g., 333333"
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="headings">
                  <AccordionTrigger>{t('manageTemplates.headingStyles')}</AccordionTrigger>
                  <AccordionContent className="space-y-6">
                    {[1, 2, 3].map(level => (
                      <div key={level} className="space-y-3 p-2 border-l-2">
                        <h4 className="font-semibold">{t('manageTemplates.headingLevel').replace('{level}', level.toString())}</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>{t('manageTemplates.fontSize')}</Label>
                            <Input
                              type="number"
                              value={Number((styles as any)?.[`heading${level}`]?.run?.size || 0) / 2}
                              onChange={(e) => handleStyleChange(key, `heading${level}.run.size`, Number(e.target.value) * 2)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>{t('manageTemplates.bold')}</Label>
                            <input
                              type="checkbox"
                              className="w-5 h-5 block"
                              checked={!!(styles as any)?.[`heading${level}`]?.run?.bold}
                              onChange={(e) => handleStyleChange(key, `heading${level}.run.bold`, e.target.checked)}
                            />

                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>{t('manageTemplates.fontColor')}</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="color"
                              value={`#${(styles as any)?.[`heading${level}`]?.run?.color || '000000'}`}
                              onChange={(e) => handleStyleChange(key, `heading${level}.run.color`, e.target.value.substring(1))}
                              className="w-10 h-10 p-1"
                            />

                            <Input
                              type="text"
                              value={(styles as any)?.[`heading${level}`]?.run?.color || ''}
                              onChange={(e) => handleStyleChange(key, `heading${level}.run.color`, e.target.value)}
                              placeholder="e.g., 2E74B5"
                            />

                          </div>
                        </div>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSave(key)} disabled={isSaving} className="font-headline">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
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
