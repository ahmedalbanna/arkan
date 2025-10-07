
'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useLocalization } from '@/context/LocalizationContext';
import { useAgentCategories, useCreateAgent, useCreateAgentCategory } from '@/hooks/use-agents';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const createAgentSchema = z.object({
    id: z.string().min(3, "ID must be at least 3 characters").regex(/^[a-z0-9-]+$/, "ID must be lowercase and contain only letters, numbers, and hyphens."),
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    category: z.string().min(1, "Category is required."),
    pageUrl: z.string().min(1, "Page URL is required").startsWith('/', "URL must start with /"),
    prompt: z.string().min(10, "Prompt must be at least 10 characters"),
    icon: z.string().min(1, "Icon is required"),
});

type CreateAgentFormValues = z.infer<typeof createAgentSchema>;

const createCategorySchema = z.object({
    id: z.string().min(3, "ID must be at least 3 characters").regex(/^[a-z0-9-]+$/, "ID must be lowercase, and can only contain letters, numbers, and hyphens."),
    name: z.string().min(1, "Name is required"),
});
type CreateCategoryFormValues = z.infer<typeof createCategorySchema>;


export function CreateCategoryDialog() {
    const { t } = useLocalization();
    const [isOpen, setIsOpen] = useState(false);
    const createCategoryMutation = useCreateAgentCategory();

    const form = useForm<CreateCategoryFormValues>({
        resolver: zodResolver(createCategorySchema),
        defaultValues: { id: '', name: '' },
    });

    const onSubmit = (data: CreateCategoryFormValues) => {
        createCategoryMutation.mutate(data, {
            onSuccess: () => {
                setIsOpen(false);
                form.reset();
            },
            onError: (error: any) => {
                if (error.errors) {
                    for (const key in error.errors) {
                        form.setError(key as any, { message: error.errors[key][0] });
                    }
                }
            }
        });
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline"><PlusCircle className="me-2 h-4 w-4" />New Category</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Category</DialogTitle>
                    <DialogDescription>
                        Create a new category to organize your AI agents.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="id" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category ID</FormLabel>
                                <FormControl><Input {...field} placeholder="e.g., custom-tools" disabled={createCategoryMutation.isPending} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category Name</FormLabel>
                                <FormControl><Input {...field} placeholder="e.g., Custom Tools" disabled={createCategoryMutation.isPending} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                            <Button type="submit" disabled={createCategoryMutation.isPending}>
                                {createCategoryMutation.isPending && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                                Create Category
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export function CreateAgentDialog() {
    const { t } = useLocalization();
    const [isOpen, setIsOpen] = useState(false);
    const createAgentMutation = useCreateAgent();
    const { data: categories } = useAgentCategories();

    const form = useForm<CreateAgentFormValues>({
        resolver: zodResolver(createAgentSchema),
        defaultValues: { id: '', name: '', description: '', category: 'content-generation', pageUrl: '/', prompt: '', icon: 'bot' },
    });

    const onSubmit = (data: CreateAgentFormValues) => {
        // Validate icon selection
        if (!data.icon || data.icon.trim() === '') {
            form.setError('icon', { message: 'Please select an icon for the agent' });
            return;
        }

        createAgentMutation.mutate(data, {
            onSuccess: () => {
                setIsOpen(false);
                form.reset();
            },
            onError: (error: any) => {
                if (error.errors) {
                    for (const key in error.errors) {
                        form.setError(key as keyof CreateAgentFormValues, { message: error.errors[key][0] });
                    }
                } else {
                    // Handle general errors
                    form.setError('root', { message: error.message || 'Failed to create agent' });
                }
            }
        });
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm"><PlusCircle className="me-2 h-4 w-4" />{t('agentManager.newAgentButton')}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>{t('agentManager.createDialog.title')}</DialogTitle>
                    <DialogDescription>
                        {t('agentManager.createDialog.description')}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="id" render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('agentManager.createDialog.idLabel')}</FormLabel>
                                <FormControl><Input {...field} placeholder={t('agentManager.createDialog.idPlaceholder')} disabled={createAgentMutation.isPending} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('agentManager.createDialog.nameLabel')}</FormLabel>
                                <FormControl><Input {...field} placeholder={t('agentManager.createDialog.namePlaceholder')} disabled={createAgentMutation.isPending} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('agentManager.createDialog.descriptionLabel')}</FormLabel>
                                <FormControl><Textarea {...field} rows={2} disabled={createAgentMutation.isPending} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="icon" render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('agentManager.createDialog.iconLabel')}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={createAgentMutation.isPending}>
                                    <FormControl><SelectTrigger><SelectValue placeholder={t('agentManager.createDialog.selectIconPlaceholder')} /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="bot">Bot</SelectItem>
                                        <SelectItem value="brain-circuit">Brain Circuit</SelectItem>
                                        <SelectItem value="file-text">File Text</SelectItem>
                                        <SelectItem value="code">Code</SelectItem>
                                        <SelectItem value="library">Library</SelectItem>
                                        <SelectItem value="test-tube-2">Test Tube</SelectItem>
                                        <SelectItem value="waypoints">Waypoints</SelectItem>
                                        <SelectItem value="flag">Flag</SelectItem>
                                        <SelectItem value="book-marked">Book Marked</SelectItem>
                                        <SelectItem value="presentation">Presentation</SelectItem>
                                        <SelectItem value="database-zap">Database Zap</SelectItem>
                                        <SelectItem value="history">History</SelectItem>
                                        <SelectItem value="file-heart">File Heart</SelectItem>
                                        <SelectItem value="hand">Hand</SelectItem>
                                        <SelectItem value="drafting-compass">Drafting Compass</SelectItem>
                                        <SelectItem value="files">Files</SelectItem>
                                        <SelectItem value="layout-grid">Layout Grid</SelectItem>
                                        <SelectItem value="scale">Scale</SelectItem>
                                        <SelectItem value="megaphone">Megaphone</SelectItem>
                                        <SelectItem value="pencil-ruler">Pencil Ruler</SelectItem>
                                        <SelectItem value="users">Users</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="category" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('agentManager.createDialog.categoryLabel')}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={createAgentMutation.isPending}>
                                        <FormControl><SelectTrigger><SelectValue placeholder={t('agentManager.createDialog.selectCategoryPlaceholder')} /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {categories?.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="pageUrl" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('agentManager.createDialog.pageUrlLabel')}</FormLabel>
                                    <FormControl><Input {...field} placeholder={t('agentManager.createDialog.pageUrlPlaceholder')} disabled={createAgentMutation.isPending} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        <FormField control={form.control} name="prompt" render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('agentManager.createDialog.promptLabel')}</FormLabel>
                                <FormControl><Textarea {...field} rows={5} className="font-mono text-xs" disabled={createAgentMutation.isPending} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="secondary">{t('editUser.cancelButton')}</Button></DialogClose>
                            <Button type="submit" disabled={createAgentMutation.isPending}>
                                {createAgentMutation.isPending && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                                {t('agentManager.createDialog.createButton')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
