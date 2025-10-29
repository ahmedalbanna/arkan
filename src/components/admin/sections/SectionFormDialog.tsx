
'use client';

import { useState } from 'react';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useCreateSection, useUpdateSection } from '@/hooks';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAgents } from '@/hooks';
import { Section, type SectionProperties } from '@/lib/models/section';

const SectionSchema = z.object({
  id: z.string().min(3, 'ID must be at least 3 characters').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'ID must be lowercase and kebab-case.'),
  title: z.string().min(1, 'Title is required'),
  icon: z.string().min(1, 'Icon name (e.g., FileText) is required.'),
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
        icon: (sectionToEdit as any).icon || '', // Ensure icon is part of default values
        agentId: sectionToEdit.agentId,
        type: sectionToEdit.type,
    } : {
      id: '',
      title: '',
      icon: '',
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
      <DialogTrigger asChild>{children || <Button>Create Section</Button>}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{sectionToEdit ? 'Edit Section' : 'Create Section'}</DialogTitle>
          <DialogDescription>
            {sectionToEdit ? 'Make changes to your section here.' : 'Add a new section to the system.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="id" className="text-right">ID</Label>
            <Input id="id" {...form.register('id')} className="col-span-3" disabled={!!sectionToEdit} />
            {form.formState.errors.id && <p className="col-span-4 text-sm text-destructive text-right">{form.formState.errors.id.message}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">Title</Label>
            <Input id="title" {...form.register('title')} className="col-span-3" />
            {form.formState.errors.title && <p className="col-span-4 text-sm text-destructive text-right">{form.formState.errors.title.message}</p>}
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="icon" className="text-right">Icon</Label>
            <Input id="icon" {...form.register('icon')} placeholder="e.g., FileText" className="col-span-3" />
            {form.formState.errors.icon && <p className="col-span-4 text-sm text-destructive text-right">{form.formState.errors.icon.message}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="agentId" className="text-right">Agent</Label>
            <Select onValueChange={(value) => form.setValue('agentId', value)} defaultValue={form.getValues('agentId')}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select an agent" />
              </SelectTrigger>
              <SelectContent>
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
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="report">Report</SelectItem>
                <SelectItem value="diagram">Diagram</SelectItem>
                <SelectItem value="presentation">Presentation</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.type && <p className="col-span-4 text-sm text-destructive text-right">{form.formState.errors.type.message}</p>}
          </div>
          <DialogFooter>
             <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : (sectionToEdit ? 'Save Changes' : 'Create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
