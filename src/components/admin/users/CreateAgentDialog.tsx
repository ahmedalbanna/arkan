
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useLocalization } from '@/context/LocalizationContext';
import { useCreateAgentDialog } from '@/hooks';
import { Loader2, PlusCircle } from 'lucide-react';

export function CreateAgentDialog() {
    const { t } = useLocalization();
    const { isOpen, setIsOpen, form, onSubmit, mutation, categories } = useCreateAgentDialog();

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                 <Button size="sm" variant="gradient"><PlusCircle className="me-2 h-4 w-4" />{t('agentManager.newAgentButton')}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px] backdrop-blur-md bg-gradient-to-br from-background/90 to-primary/5 border border-primary/10 shadow-soft">
                <DialogHeader className="rounded-t-lg bg-gradient-to-r from-background/60 to-primary/5">
                    <DialogTitle className="font-headline">{t('agentManager.createDialog.title')}</DialogTitle>
                    <DialogDescription>
                        {t('agentManager.createDialog.description')}
                    </DialogDescription>
                </DialogHeader>
                <AnimatedContainer animation="fade-in-up">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField control={form.control} name="id" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('agentManager.createDialog.idLabel')}</FormLabel>
                                    <FormControl><Input {...field} placeholder={t('agentManager.createDialog.idPlaceholder')} disabled={mutation.isPending} className="hover:shadow-soft" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('agentManager.createDialog.nameLabel')}</FormLabel>
                                    <FormControl><Input {...field} placeholder={t('agentManager.createDialog.namePlaceholder')} disabled={mutation.isPending} className="hover:shadow-soft" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('agentManager.createDialog.descriptionLabel')}</FormLabel>
                                    <FormControl><Textarea {...field} rows={2} disabled={mutation.isPending} className="hover:shadow-soft" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <div className="grid grid-cols-2 gap-4">
                                 <FormField control={form.control} name="category" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('agentManager.createDialog.categoryLabel')}</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={mutation.isPending}>
                                            <FormControl><SelectTrigger className="hover:shadow-soft"><SelectValue placeholder={t('agentManager.createDialog.selectCategoryPlaceholder')} /></SelectTrigger></FormControl>
                                            <SelectContent className="backdrop-blur-md bg-gradient-to-r from-background/90 to-primary/5 border border-primary/10 shadow-soft">
                                                {categories?.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="pageUrl" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('agentManager.createDialog.pageUrlLabel')}</FormLabel>
                                        <FormControl><Input {...field} placeholder={t('agentManager.createDialog.pageUrlPlaceholder')} disabled={mutation.isPending} className="hover:shadow-soft" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                             <FormField control={form.control} name="prompt" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('agentManager.createDialog.promptLabel')}</FormLabel>
                                    <FormControl><Textarea {...field} value={field.value as string} rows={5} className="font-mono text-xs hover:shadow-soft" disabled={mutation.isPending} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <FormField control={form.control} name="icon" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('agentManager.createDialog.iconLabel')}</FormLabel>
                                    <FormControl><Input {...field} placeholder={t('agentManager.createDialog.iconPlaceholder')} disabled={mutation.isPending} className="hover:shadow-soft" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <DialogFooter>
                                <DialogClose asChild><Button type="button" variant="secondary" className="hover:shadow-soft">{t('editUser.cancelButton')}</Button></DialogClose>
                                <Button type="submit" disabled={mutation.isPending} variant="gradient" className="hover:shadow-glow">
                                    {mutation.isPending && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                                    {t('agentManager.createDialog.createButton')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </AnimatedContainer>
            </DialogContent>
        </Dialog>
    )
}
