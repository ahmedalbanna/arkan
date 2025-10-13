
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { useBuilderStore, useSections } from '@/hooks';
import { CheckCircle, Download, FileText, Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface ReportExportDialogProps {
  isExporting: boolean;
  onExport: (sectionsToInclude: string[]) => void;
  disabled: boolean;
}

export function ReportExportDialog({ isExporting, onExport, disabled }: ReportExportDialogProps) {
  const { project } = useBuilderStore();
  const { data: allSections } = useSections();
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Determine available sections based on what's generated in the project
  const availableSections = allSections?.filter(s => s.type === 'report' && project?.sections?.[s.id as keyof typeof project.sections]) || [];

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
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} disabled={disabled} className="hover:bg-primary/5">
          <div className="flex flex-col w-full">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span>Export Report as DOCX</span>
            </div>
            <span className="text-xs text-muted-foreground">Requires generated report sections</span>
          </div>
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="backdrop-blur-md">
        <DialogHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5 -m-6 p-6 rounded-t-lg">
          <AnimatedContainer animation="fade-in-down" delay={200}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600">
                <Download className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="font-headline">Select Sections to Export</DialogTitle>
                <DialogDescription className="mt-1">
                  Choose which generated report sections you would like to include in the DOCX export.
                </DialogDescription>
              </div>
            </div>
            <Badge variant="secondary" className="mt-2 w-fit">
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Generated Content
            </Badge>
          </AnimatedContainer>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <AnimatedContainer animation="fade-in-up" delay={300}>
            <div className="flex items-center space-x-2 p-3 rounded-lg bg-gradient-to-r from-background/50 to-primary/5 border border-border/50">
              <Checkbox
                id="select-all"
                checked={selectedSections.length === availableSections.length}
                onCheckedChange={handleSelectAll}
                className="hover:scale-110 transition-transform"
              />
              <Label htmlFor="select-all" className="font-semibold flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                Select All
              </Label>
            </div>
          </AnimatedContainer>

          <AnimatedContainer animation="fade-in-up" delay={400}>
            <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg max-h-64 overflow-y-auto bg-gradient-to-r from-background/50 to-primary/5">
              {availableSections.map((section, index) => (
                <div
                  key={section.id}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary/5 transition-colors group"
                >
                  <Checkbox
                    id={`section-${section.id}`}
                    checked={selectedSections.includes(section.id)}
                    onCheckedChange={(checked) => handleSectionToggle(section.id, !!checked)}
                    className="hover:scale-110 transition-transform"
                  />
                  <Label
                    htmlFor={`section-${section.id}`}
                    className="text-sm group-hover:text-primary transition-colors cursor-pointer"
                  >
                    {section.title}
                  </Label>
                </div>
              ))}
            </div>
          </AnimatedContainer>
        </div>

        <DialogFooter className="bg-gradient-to-r from-background to-primary/5 -m-6 p-6 rounded-b-lg">
          <AnimatedContainer animation="fade-in-up" delay={500}>
            <div className="flex gap-3 w-full">
              <DialogClose asChild>
                <Button variant="ghost" className="flex-1">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                onClick={handleExportClick}
                disabled={isExporting || selectedSections.length === 0}
                variant="gradient"
                className="flex-1 hover:shadow-glow transition-all duration-200"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="me-2 h-4 w-4" />
                    Export Selected ({selectedSections.length})
                  </>
                )}
              </Button>
            </div>
          </AnimatedContainer>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
