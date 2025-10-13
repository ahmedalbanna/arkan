
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useDeleteSection } from '@/hooks';
import { Section } from '@/lib/models/section';
import { SectionFormDialog } from './SectionFormDialog';

interface SectionActionsProps {
  section: Section;
}

export function SectionActions({ section }: SectionActionsProps) {
  const deleteSectionMutation = useDeleteSection();

  const handleDelete = () => {
    deleteSectionMutation.mutate(section.id);
  };

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 hover:shadow-soft">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="backdrop-blur-md bg-gradient-to-r from-background/90 to-primary/5 border border-primary/10 shadow-soft">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <SectionFormDialog sectionToEdit={section}>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10 hover:shadow-soft">
              Edit
            </DropdownMenuItem>
          </SectionFormDialog>
          <DropdownMenuSeparator />
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="text-destructive hover:bg-destructive/10" onSelect={(e) => e.preventDefault()}>
              Delete
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <AnimatedContainer animation="fade-in-up">
        <AlertDialogContent className="backdrop-blur-md bg-gradient-to-br from-background/90 to-primary/5 border border-primary/10 shadow-soft">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the section
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:shadow-soft">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AnimatedContainer>
    </AlertDialog>
  );
}
