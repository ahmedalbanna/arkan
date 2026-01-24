'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useImageToPdfLogic } from '@/hooks/writing-tools/use-image-to-pdf-logic';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { FileText, Loader2, UploadCloud } from 'lucide-react';
import { SortableImageItem } from './SortableImageItem';

export function ImageToPdfTool() {
  const {
    t,
    files,
    setFiles,
    isConverting,
    getRootProps,
    getInputProps,
    isDragActive,
    handleGeneratePdf,
    handleRemoveFile,
  } = useImageToPdfLogic();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (active.id !== over.id) {
      setFiles((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('writingTools.imageToPdf.cardTitle')}</CardTitle>
        <CardDescription>{t('writingTools.imageToPdf.cardDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}`}>
          <input {...getInputProps()} />
          <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-sm font-semibold">{t('writingTools.imageToPdf.dropzoneTitle')}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t('writingTools.imageToPdf.dropzoneSubtitle')}</p>
        </div>

        {files.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold">{t('writingTools.imageToPdf.uploadedImagesTitle', { count: files.length })}</h3>
            <ScrollArea className="h-72 w-full rounded-md border">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={files.map(f => f.id)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                    {files.map((file) => (
                      <SortableImageItem key={file.id} file={file} onRemove={handleRemoveFile} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </ScrollArea>
            <Button onClick={handleGeneratePdf} disabled={isConverting} className="w-full">
              {isConverting ? (
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="me-2 h-4 w-4" />
              )}
              {isConverting ? t('writingTools.imageToPdf.convertingButton') : t('writingTools.imageToPdf.generateButton')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
