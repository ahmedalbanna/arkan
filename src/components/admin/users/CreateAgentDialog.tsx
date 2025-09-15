
'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, PlusCircle } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';
import { useCreateAgentDialog } from '@/hooks';

export function CreateAgentDialog() {
    const { t } = useLocalization();
    const { isOpen, setIsOpen, form, onSubmit, mutation, categories } = useCreateAgentDialog();

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
                                <FormControl><Input {...field} placeholder={t('agentManager.createDialog.idPlaceholder')} disabled={mutation.isPending} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                         <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('agentManager.createDialog.nameLabel')}</FormLabel>
                                <FormControl><Input {...field} placeholder={t('agentManager.createDialog.namePlaceholder')} disabled={mutation.isPending} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('agentManager.createDialog.descriptionLabel')}</FormLabel>
                                <FormControl><Textarea {...field} rows={2} disabled={mutation.isPending} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <div className="grid grid-cols-2 gap-4">
                             <FormField control={form.control} name="category" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('agentManager.createDialog.categoryLabel')}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={mutation.isPending}>
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
                                    <FormControl><Input {...field} placeholder={t('agentManager.createDialog.pageUrlPlaceholder')} disabled={mutation.isPending} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                         <FormField control={form.control} name="prompt" render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('agentManager.createDialog.promptLabel')}</FormLabel>
                                <FormControl><Textarea {...field} value={field.value as string} rows={5} className="font-mono text-xs" disabled={mutation.isPending} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                         <FormField control={form.control} name="icon" render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('agentManager.createDialog.iconLabel')}</FormLabel>
                                <FormControl><Input {...field} placeholder={t('agentManager.createDialog.iconPlaceholder')} disabled={mutation.isPending} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="secondary">{t('editUser.cancelButton')}</Button></DialogClose>
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                                {t('agentManager.createDialog.createButton')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
