
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { FileText, Loader2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useBuilderStore } from '@/hooks';

interface ReportExportDialogProps {
  isExporting: boolean;
  onExport: (sectionsToInclude: string[]) => void;
  disabled: boolean;
}

export function ReportExportDialog({ isExporting, onExport, disabled }: ReportExportDialogProps) {
  const { project } = useBuilderStore();
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const availableSections = useMemo(() => {
    if (!project?.sections) return [];
    return project.sections
      .filter(section => section.content && section.content.trim())
      .map(section => ({
        id: section.id,
        title: section.title,
      }));
  }, [project?.sections]);


  const handleSelectAll = (checked: boolean) => {
    setSelectedSections(checked ? availableSections.map(s => s.id) : []);
  };

  const handleSectionToggle = (sectionId: string, checked: boolean) => {
    setSelectedSections(prev =>
      checked ? [...prev, sectionId] : prev.filter(id => id !== sectionId)
    );
  };

  const handleExportClick = () => {
    onExport(selectedSections);
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} disabled={disabled}>
           <FileText className="me-2 h-4 w-4" />
           <span>Export Report as DOCX</span>
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Sections to Export</DialogTitle>
          <DialogDescription>
            Choose which generated report sections you would like to include in the DOCX export.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all"
              checked={availableSections.length > 0 && selectedSections.length === availableSections.length}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="select-all" className="font-semibold">Select All</Label>
          </div>
          <div className="grid grid-cols-2 gap-2 p-2 border rounded-md max-h-64 overflow-y-auto">
            {availableSections.map(section => (
              <div key={section.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`section-${section.id}`}
                  checked={selectedSections.includes(section.id)}
                  onCheckedChange={(checked) => handleSectionToggle(section.id, !!checked)}
                />
                <Label htmlFor={`section-${section.id}`}>{section.title}</Label>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button onClick={handleExportClick} disabled={isExporting || selectedSections.length === 0}>
            {isExporting ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <FileText className="me-2 h-4 w-4" />}
            Export Selected
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
