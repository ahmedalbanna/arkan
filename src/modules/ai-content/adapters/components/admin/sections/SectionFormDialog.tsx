'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { useCreateSection, useUpdateSection } from '@/hooks';
import { Section } from '@/modules/ai-content/domain/entities/Section';
import { Loader2, Save, Plus, FileCode, Binary, ShieldAlert } from 'lucide-react';
import { cn } from '@/infrastructure/utils/cn';

/**
 * SectionFormDialog — High-fidelity manifest for individual document node definitions.
 * Orchestrates the creation and modification of global section metadata.
 * 
 * DEFENSIVE MEASURES:
 * 1. Atomic Mapping: Selectively filters form values to prevent domain contamination.
 * 2. Metadata Validation: Enforces strict schema constraints on IDs and types.
 * 3. Lifecycle Protection: Synchronizes form state with external entity shifts.
 * 4. Technical Aesthetic: Standardized dot grids and high-density labels.
 */

const SectionSchema = z.object({
  id: z.string().min(3, 'Vector identifier must be at least 3 characters'),
  title: z.string().min(1, 'Title parameter is required'),
  type: z.enum(['code', 'presentation', 'math', 'diagram', 'report']),
});

type SectionFormData = z.infer<typeof SectionSchema>;

interface SectionFormDialogProps {
  sectionToEdit?: Section;
  children?: React.ReactNode;
}

export function SectionFormDialog({ sectionToEdit, children }: SectionFormDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const createMutation = useCreateSection();
  const updateMutation = useUpdateSection();

  const form = useForm<SectionFormData>({
    resolver: zodResolver(SectionSchema),
    defaultValues: {
      id: '',
      title: '',
      type: 'report',
    },
  });

  // 1. LIFECYCLE SYNC — Handle edit mode hydration
  useEffect(() => {
    if (sectionToEdit && isOpen) {
      form.reset({
        id: sectionToEdit.id,
        title: sectionToEdit.title,
        type: sectionToEdit.type,
      });
    } else if (!sectionToEdit && isOpen) {
      form.reset({ id: '', title: '', type: 'report' });
    }
  }, [sectionToEdit, isOpen, form]);

  // 2. SUBMISSION VECTOR — Guarded persistence
  const onSubmit = async (data: SectionFormData) => {
    try {
        if (sectionToEdit) {
          // Atomic Mapping: Only send updatable fields
          const updateData = {
            title: data.title.trim(),
            type: data.type,
          };
          
          updateMutation.mutate(
            { id: sectionToEdit.id, data: updateData },
            { 
                onSuccess: () => { 
                    form.reset(); 
                    setIsOpen(false); 
                } 
            }
          );
        } else {
          createMutation.mutate(
            { ...data, title: data.title.trim() }, 
            { 
                onSuccess: () => { 
                    form.reset(); 
                    setIsOpen(false); 
                } 
            }
          );
        }
    } catch (error) {
        console.error('[SectionForm] Persistence failure:', error);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !isPending && setIsOpen(v)}>
      <DialogTrigger asChild>
        {children || (
            <Button className="font-black h-10 gap-2 shadow-lg shadow-primary/20 rounded-xl uppercase tracking-widest text-[10px]">
                <Plus className="h-4 w-4" />
                Initialize Node
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-xl p-0 overflow-hidden flex flex-col gap-0 border-primary/10 shadow-2xl rounded-[32px] bg-background/80 backdrop-blur-3xl">
        <header className="px-8 py-6 border-b border-primary/10 bg-primary/[0.02] flex items-center gap-4 shrink-0 relative overflow-hidden">
            {/* 28px Dot-grid Background */}
            <div 
                className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] pointer-events-none" 
                style={{ 
                    backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, hsl(var(--primary)) 1px, transparent 0)', 
                    backgroundSize: '28px 28px' 
                }} 
            />
            
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner group/logo relative z-10">
                <FileCode className="h-5 w-5 text-primary group-hover/logo:rotate-12 transition-transform duration-500" />
            </div>
            <div className="relative z-10">
                <DialogTitle className="text-[16px] font-black uppercase tracking-tight">
                    {sectionToEdit ? 'Update Node Vector' : 'Initialize Document Node'}
                </DialogTitle>
                <DialogDescription className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-bold mt-0.5">
                    Structural Metadata Manifest
                </DialogDescription>
            </div>
        </header>

        <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 md:p-10 space-y-8 relative">
            {/* Depth architectural line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/5 to-transparent" />

            <div className="grid gap-8 pl-4">
                <div className="space-y-2.5">
                    <Label htmlFor="id" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Vector Identifier</Label>
                    <div className="relative group">
                        <Input 
                            id="id" 
                            {...form.register('id')} 
                            disabled={!!sectionToEdit || isPending} 
                            placeholder="NODE_UUID_SPEC..."
                            className="h-11 bg-muted/5 border-primary/10 focus-visible:ring-primary/20 rounded-xl shadow-inner font-bold uppercase tracking-widest transition-all"
                        />
                        <Binary className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/30 pointer-events-none" />
                    </div>
                    {form.formState.errors.id && <p className="text-[9px] font-bold italic text-destructive/80 ml-1 uppercase">{form.formState.errors.id.message}</p>}
                </div>

                <div className="space-y-2.5">
                    <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Structural Title</Label>
                    <Input 
                        id="title" 
                        {...form.register('title')} 
                        disabled={isPending}
                        placeholder="Define node name..."
                        className="h-11 text-[11px] font-bold bg-muted/5 border-primary/10 focus-visible:ring-primary/20 rounded-xl shadow-inner transition-all"
                    />
                    {form.formState.errors.title && <p className="text-[9px] font-bold italic text-destructive/80 ml-1 uppercase">{form.formState.errors.title.message}</p>}
                </div>

                <div className="space-y-2.5">
                    <Label htmlFor="type" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Spectral Category</Label>
                    <Select 
                        onValueChange={(value) => form.setValue('type', value as any)} 
                        defaultValue={form.getValues('type')}
                        disabled={isPending}
                    >
                        <SelectTrigger className="h-11 text-[11px] font-bold bg-muted/5 border-primary/10 focus:ring-primary/20 rounded-xl uppercase tracking-widest">
                            <SelectValue placeholder="SELECT_TYPE" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-primary/10 shadow-2xl backdrop-blur-3xl">
                            <SelectItem value="report" className="text-[10px] font-black uppercase py-2.5">Standard Report</SelectItem>
                            <SelectItem value="diagram" className="text-[10px] font-black uppercase py-2.5">Visual Matrix</SelectItem>
                            <SelectItem value="presentation" className="text-[10px] font-black uppercase py-2.5">Slide Vector</SelectItem>
                            <SelectItem value="code" className="text-[10px] font-black uppercase py-2.5">Logical Script</SelectItem>
                            <SelectItem value="math" className="text-[10px] font-black uppercase py-2.5">Formula Node</SelectItem>
                        </SelectContent>
                    </Select>
                    {form.formState.errors.type && <p className="text-[9px] font-bold italic text-destructive/80 ml-1 uppercase">{form.formState.errors.type.message}</p>}
                </div>
            </div>

            <DialogFooter className="pt-6 border-t border-primary/5 flex items-center justify-between">
                <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setIsOpen(false)}
                    disabled={isPending}
                    className="text-[10px] font-black uppercase tracking-[0.2em] h-11 px-8 rounded-xl hover:bg-red-500/5 hover:text-red-600 transition-all"
                >
                    Abort Node
                </Button>
                <Button 
                    type="submit" 
                    disabled={isPending}
                    className="h-11 px-10 font-black uppercase tracking-[0.3em] shadow-2xl shadow-primary/20 bg-primary hover:opacity-90 gap-3 rounded-xl transition-all hover:scale-105 active:scale-95 ring-1 ring-inset ring-white/20 text-[10px]"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Synchronizing...</span>
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4" />
                            <span>{sectionToEdit ? 'Commit Changes' : 'Initialize Node'}</span>
                        </>
                    )}
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
