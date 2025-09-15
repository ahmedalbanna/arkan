
'use client';

import { useCreatePptxTemplate } from '@/hooks';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Save, PlusCircle, Trash2, RefreshCw } from 'lucide-react';
import type { PptxTemplateKey } from '@/lib/pptx-styles';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocalization } from '@/context/LocalizationContext';
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
import type { PptxStyleOptions } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { usePresentationTemplateManager } from '@/hooks';


const FONT_FACES = ['Calibri', 'Times New Roman', 'Arial', 'Garamond', 'Helvetica', 'Verdana'];

const createPptxTemplateSchema = z.object({
    id: z.string().min(3, "ID must be at least 3 characters").regex(/^[a-z0-9-]+$/, "ID can only contain lowercase letters, numbers, and hyphens."),
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
});
type CreatePptxTemplateValues = z.infer<typeof createPptxTemplateSchema>;


function CreateTemplateDialog() {
    const { t } = useLocalization();
    const [isOpen, setIsOpen] = useState(false);
    const createMutation = useCreatePptxTemplate();

    const form = useForm<CreatePptxTemplateValues>({
        resolver: zodResolver(createPptxTemplateSchema),
        defaultValues: { id: '', name: '', description: '' },
    });

    const handleSave = (data: CreatePptxTemplateValues) => {
        createMutation.mutate(data, {
            onSuccess: () => {
                setIsOpen(false);
                form.reset();
            },
            onError: (error: any) => {
                if (error.errors) {
                    for (const key in error.errors) {
                        form.setError(key as keyof CreatePptxTemplateValues, { message: error.errors[key][0] });
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
                    <DialogTitle>{t('manageTemplates.pptxDialog.title')}</DialogTitle>
                    <DialogDescription>{t('manageTemplates.pptxDialog.description')}</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                        <FormField control={form.control} name="id" render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('manageTemplates.createDialog.idLabel')}</FormLabel>
                                <FormControl><Input {...field} placeholder={t('manageTemplates.pptxDialog.idPlaceholder')} disabled={createMutation.isPending} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('manageTemplates.createDialog.nameLabel')}</FormLabel>
                                <FormControl><Input {...field} placeholder={t('manageTemplates.pptxDialog.namePlaceholder')} disabled={createMutation.isPending} /></FormControl>
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
                                {createMutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Save className="me-2 h-4 w-4" />}
                                {t('manageTemplates.createButton')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

function PptxTemplateSkeleton() {
    return (
        <Card className="flex flex-col">
            <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                <Skeleton className="w-full aspect-video rounded-md" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </CardContent>
            <CardFooter>
                <Skeleton className="h-10 w-32" />
            </CardFooter>
        </Card>
    );
}

function PptxTemplatePreview({ styles }: { styles: PptxStyleOptions }) {
    const slideStyles = {
        backgroundColor: `#${styles.background.color}`,
        fontFamily: styles.body.fontFace || 'Arial',
        color: `#${styles.body.color || '000000'}`,
        fontSize: `${(styles.body.fontSize || 18) * 0.75}pt`, // Scale down for preview
    };

    const titleStyles: React.CSSProperties = {
        fontFamily: styles.title.fontFace || 'Arial',
        fontSize: `${(styles.title.fontSize || 32) * 0.75}pt`, // Scale down
        color: `#${styles.title.color || '000000'}`,
        fontWeight: styles.title.bold ? 'bold' : 'normal',
        textAlign: styles.title.align || 'left',
    };

    return (
        <div className="w-full aspect-video rounded-md border bg-white p-4 overflow-hidden flex flex-col" style={slideStyles}>
            <h1 style={titleStyles} className="mb-2 line-clamp-2">Sample Presentation Title</h1>
            <ul className="list-disc pl-5 space-y-1" style={{ color: `#${styles.body.color}` }}>
                <li>This is a sample bullet point.</li>
                <li>Another point to show styling.</li>
                <li>A third item for good measure.</li>
            </ul>
        </div>
    );
}


export function PresentationTemplateManager() {
    const { t } = useLocalization();
    const {
        templates,
        isLoaded,
        isSaving,
        deleteMutation,
        refreshImageMutation,
        uploadTemplateFile,
        handleStyleChange,
        handleSave,
        handleDelete,
        handleRefreshImage,
        handleFileChange,
    } = usePresentationTemplateManager();


    if (!isLoaded) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <PptxTemplateSkeleton />
                <PptxTemplateSkeleton />
                <PptxTemplateSkeleton />
            </div>
        );
    }

    return (
        <>
            <div className="flex justify-end mb-4">
                <CreateTemplateDialog />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(Object.keys(templates) as PptxTemplateKey[]).map((key) => {
                    const template = templates[key];
                    if (!template || !template.styles) {
                        return <PptxTemplateSkeleton key={key} />;
                    }
                    const styles = template.styles;
                    const isDefaultTemplate = ['modern', 'dark', 'professional'].includes(key);

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
                                                    {deleteMutation.isPending && deleteMutation.variables === key ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
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
                                    <PptxTemplatePreview styles={styles} />
                                    <Button
                                        size="icon"
                                        variant="secondary"
                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handleRefreshImage(template.id, template.dataAiHint)}
                                        disabled={refreshImageMutation.isPending && refreshImageMutation.variables?.templateId === template.id}
                                    >
                                        {refreshImageMutation.isPending && refreshImageMutation.variables?.templateId === template.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <RefreshCw className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`template-file-upload-${template.id}`}>Template File (.pptx)</Label>
                                    <div className="flex items-center gap-2">
                                        <Input id={`template-file-upload-${template.id}`} type="file" accept=".pptx" onChange={(e) => handleFileChange(e, template.id)} className="text-xs" />
                                        {uploadTemplateFile.isPending && uploadTemplateFile.variables?.templateId === template.id && <Loader2 className="h-4 w-4 animate-spin" />}
                                    </div>
                                    {template.templateUrl && <a href={template.templateUrl} target="_blank" rel="noreferrer noopener" className="text-xs text-blue-500 hover:underline">Current Template</a>}
                                </div>
                                <Accordion type="multiple" className="w-full" defaultValue={['general']}>
                                    <AccordionItem value="general">
                                        <AccordionTrigger>{t('pptxTemplates.generalStyles')}</AccordionTrigger>
                                        <AccordionContent className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>{t('pptxTemplates.backgroundColor')}</Label>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="color"
                                                        value={`#${styles.background.color}`}
                                                        onChange={(e) => handleStyleChange(key, 'background.color', e.target.value.substring(1))}
                                                        className="w-10 h-10 p-1"
                                                    />
                                                    <Input
                                                        type="text"
                                                        value={styles.background.color}
                                                        onChange={(e) => handleStyleChange(key, 'background.color', e.target.value)}
                                                        placeholder="e.g., FFFFFF"
                                                    />
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                    <AccordionItem value="title">
                                        <AccordionTrigger>{t('pptxTemplates.titleText')}</AccordionTrigger>
                                        <AccordionContent className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>{t('pptxTemplates.fontFamily')}</Label>
                                                <Select
                                                    value={styles.title.fontFace}
                                                    onValueChange={(value) => handleStyleChange(key, 'title.fontFace', value)}
                                                >
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        {FONT_FACES.map(font => <SelectItem key={font} value={font}>{font}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>{t('pptxTemplates.fontSize')}</Label>
                                                <Input
                                                    type="number"
                                                    value={styles.title.fontSize}
                                                    onChange={(e) => handleStyleChange(key, 'title.fontSize', Number(e.target.value))}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>{t('pptxTemplates.fontColor')}</Label>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="color"
                                                        value={`#${styles.title.color}`}
                                                        onChange={(e) => handleStyleChange(key, 'title.color', e.target.value.substring(1))}
                                                        className="w-10 h-10 p-1"
                                                    />
                                                    <Input
                                                        type="text"
                                                        value={styles.title.color}
                                                        onChange={(e) => handleStyleChange(key, 'title.color', e.target.value)}
                                                        placeholder="e.g., 363636"
                                                    />
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                    <AccordionItem value="body">
                                        <AccordionTrigger>{t('pptxTemplates.bodyText')}</AccordionTrigger>
                                        <AccordionContent className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>{t('pptxTemplates.fontFamily')}</Label>
                                                <Select
                                                    value={styles.body.fontFace}
                                                    onValueChange={(value) => handleStyleChange(key, 'body.fontFace', value)}
                                                >
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        {FONT_FACES.map(font => <SelectItem key={font} value={font}>{font}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>{t('pptxTemplates.fontSize')}</Label>
                                                <Input
                                                    type="number"
                                                    value={styles.body.fontSize}
                                                    onChange={(e) => handleStyleChange(key, 'body.fontSize', Number(e.target.value))}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>{t('pptxTemplates.fontColor')}</Label>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="color"
                                                        value={`#${styles.body.color}`}
                                                        onChange={(e) => handleStyleChange(key, 'body.color', e.target.value.substring(1))}
                                                        className="w-10 h-10 p-1"
                                                    />
                                                    <Input
                                                        type="text"
                                                        value={styles.body.color}
                                                        onChange={(e) => handleStyleChange(key, 'body.color', e.target.value)}
                                                        placeholder="e.g., 4f4f4f"
                                                    />
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={() => handleSave(key)} disabled={isSaving} className="font-headline">
                                    {isSaving ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Save className="me-2 h-4 w-4" />}
                                    {t('pptxTemplates.saveButton')}
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
        </>
    );
}
