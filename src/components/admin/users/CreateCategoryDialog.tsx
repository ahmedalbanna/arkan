'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useCreateCategoryDialog } from '@/hooks';
import { Loader2, PlusCircle } from 'lucide-react';

export function CreateCategoryDialog() {
    const { isOpen, setIsOpen, form, onSubmit, mutation } = useCreateCategoryDialog();

    return (
         <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                 <Button size="sm" variant="outline" className="hover:shadow-soft"><PlusCircle className="me-2 h-4 w-4" />New Category</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] backdrop-blur-md bg-gradient-to-br from-background/90 to-primary/5 border border-primary/10 shadow-soft">
                <DialogHeader className="rounded-t-lg bg-gradient-to-r from-background/60 to-primary/5">
                    <DialogTitle className="font-headline">Create New Category</DialogTitle>
                    <DialogDescription>
                        Create a new category to organize your AI agents.
                    </DialogDescription>
                </DialogHeader>
                 <AnimatedContainer animation="fade-in-up">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField control={form.control} name="id" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category ID</FormLabel>
                                    <FormControl><Input {...field} placeholder="e.g., custom-tools" disabled={mutation.isPending} className="hover:shadow-soft" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category Name</FormLabel>
                                    <FormControl><Input {...field} placeholder="e.g., Custom Tools" disabled={mutation.isPending} className="hover:shadow-soft" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <DialogFooter>
                                <DialogClose asChild><Button type="button" variant="secondary" className="hover:shadow-soft">Cancel</Button></DialogClose>
                                <Button type="submit" disabled={mutation.isPending} variant="gradient" className="hover:shadow-glow">
                                    {mutation.isPending && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                                    Create Category
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                 </AnimatedContainer>
            </DialogContent>
        </Dialog>
    )
}
