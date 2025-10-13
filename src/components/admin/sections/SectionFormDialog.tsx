
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAgents, useCreateSection, useUpdateSection } from '@/hooks';
import { Section } from '@/lib/models/section';

const SectionSchema = z.object({
  id: z.string().min(3, 'ID must be at least 3 characters').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'ID must be lowercase and kebab-case.'),
  title: z.string().min(1, 'Title is required'),
  agentId: z.string().min(1, 'Agent is required'),
  type: z.enum(['report', 'diagram', 'presentation']),
});

type SectionFormData = z.infer<typeof SectionSchema>;

interface SectionFormDialogProps {
  sectionToEdit?: Section;
  children?: React.ReactNode;
}

export function SectionFormDialog({ sectionToEdit, children }: SectionFormDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { agents, isLoaded: agentsLoaded } = useAgents();
  const createMutation = useCreateSection();
  const updateMutation = useUpdateSection();

  const form = useForm<SectionFormData>({
    resolver: zodResolver(SectionSchema),
    defaultValues: sectionToEdit ? {
        id: sectionToEdit.id,
        title: sectionToEdit.title,
        agentId: sectionToEdit.agentId,
        type: sectionToEdit.type,
    } : {
      id: '',
      title: '',
      agentId: '',
      type: 'report',
    },
  });

  const onSubmit = (data: SectionFormData) => {
    if (sectionToEdit) {
      // When updating, we don't send the ID in the payload, only in the URL
      const { id, ...updateData } = data;
      updateMutation.mutate(
        { sectionId: sectionToEdit.id, data: updateData },
        { onSuccess: () => { form.reset(); setIsOpen(false); } }
      );
    } else {
      createMutation.mutate(data, { onSuccess: () => { form.reset(); setIsOpen(false); } });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children || <Button variant="gradient">Create Section</Button>}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] backdrop-blur-md bg-gradient-to-br from-background/90 to-primary/5 border border-primary/10 shadow-soft">
        <DialogHeader className="rounded-t-lg bg-gradient-to-r from-background/60 to-primary/5">
          <DialogTitle className="font-headline">{sectionToEdit ? 'Edit Section' : 'Create Section'}</DialogTitle>
          <DialogDescription>
            {sectionToEdit ? 'Make changes to your section here.' : 'Add a new section to the system.'}
          </DialogDescription>
        </DialogHeader>
        <AnimatedContainer animation="fade-in-up">
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="id" className="text-right">ID</Label>
              <Input id="id" {...form.register('id')} className="col-span-3 hover:shadow-soft" disabled={!!sectionToEdit} />
              {form.formState.errors.id && <p className="col-span-4 text-sm text-destructive text-right">{form.formState.errors.id.message}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Title</Label>
              <Input id="title" {...form.register('title')} className="col-span-3 hover:shadow-soft" />
              {form.formState.errors.title && <p className="col-span-4 text-sm text-destructive text-right">{form.formState.errors.title.message}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="agentId" className="text-right">Agent</Label>
              <Select onValueChange={(value) => form.setValue('agentId', value)} defaultValue={form.getValues('agentId')}>
                <SelectTrigger className="col-span-3 hover:shadow-soft">
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent className="backdrop-blur-md bg-gradient-to-r from-background/90 to-primary/5 border border-primary/10 shadow-soft">
                  {agentsLoaded && agents.map(agent => (
                    <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.agentId && <p className="col-span-4 text-sm text-destructive text-right">{form.formState.errors.agentId.message}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">Type</Label>
              <Select onValueChange={(value) => form.setValue('type', value as any)} defaultValue={form.getValues('type')}>
                <SelectTrigger className="col-span-3 hover:shadow-soft">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent className="backdrop-blur-md bg-gradient-to-r from-background/90 to-primary/5 border border-primary/10 shadow-soft">
                  <SelectItem value="report">Report</SelectItem>
                  <SelectItem value="diagram">Diagram</SelectItem>
                  <SelectItem value="presentation">Presentation</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.type && <p className="col-span-4 text-sm text-destructive text-right">{form.formState.errors.type.message}</p>}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} variant="gradient" className="hover:shadow-glow">
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : (sectionToEdit ? 'Save Changes' : 'Create')}
              </Button>
            </DialogFooter>
          </form>
        </AnimatedContainer>
      </DialogContent>
    </Dialog>
  );
}
