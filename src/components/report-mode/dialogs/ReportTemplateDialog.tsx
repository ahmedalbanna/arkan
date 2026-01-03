
'use client';

import { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useApplyReportTemplate, useReportTemplates } from '@/hooks/data/use-templates';
import { useBuilderStore, useToast } from '@/hooks';
import { AlertCircle, FileText, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { ScrollArea } from '../../ui/scroll-area';
import { Input } from '../../ui/input';
import { Search } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';
import type { ReportTemplateProperties } from '@/lib/types';

interface ReportTemplateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

function TemplateCard({ template, onSelect, isLoading }: { template: ReportTemplateProperties, onSelect: () => void, isLoading: boolean }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg">{template.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground min-h-[40px]">{template.description}</p>
        <Button onClick={onSelect} className="w-full mt-4" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Apply Template'}
        </Button>
      </CardContent>
    </Card>
  );
}

export function ReportTemplateDialog({ isOpen, onOpenChange }: ReportTemplateDialogProps) {
  const { t } = useLocalization();
  const { data: templates, isLoading, isError, error } = useReportTemplates();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const {
      handleSelectTemplate,
      isApplyingTemplate,
  } = useApplyReportTemplate(onOpenChange);


  const filteredTemplates = useMemo(() => {
    if (!templates) return [];
    return templates.filter(
      (template) =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [templates, searchQuery]);


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t('manageTemplates.reportTitle')}</DialogTitle>
          <DialogDescription>{t('manageTemplates.reportDescription')}</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex-grow overflow-hidden">
          <ScrollArea className="h-full">
            <div className="pr-4">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : isError ? (
                <div className="text-center py-10 px-4 border rounded-lg bg-card text-destructive">
                  <AlertCircle className="mx-auto h-12 w-12" />
                  <h3 className="mt-4 text-lg font-semibold">Failed to load templates</h3>
                  <p className="mt-2 text-sm">{error?.message}</p>
                </div>
              ) : filteredTemplates.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTemplates.map(template => (
                    <TemplateCard 
                        key={template.id} 
                        template={template} 
                        onSelect={() => {
                            setSelectedTemplateId(template.id);
                            handleSelectTemplate(template);
                        }} 
                        isLoading={isApplyingTemplate && selectedTemplateId === template.id}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 px-4 border-2 border-dashed rounded-lg bg-card">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No Templates Found</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    No report templates match your search.
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
