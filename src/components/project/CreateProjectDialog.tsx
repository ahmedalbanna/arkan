
'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PlusCircle } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';
import { UploadManager } from '@/components/file/UploadManager';
import { useCreateProjectDialog } from '@/hooks';

export function CreateProjectDialog() {
    const { t } = useLocalization();
    const {
        isOpen,
        setIsOpen,
        name,
        setName,
        description,
        setDescription,
        handleStartBuilding,
        handleCreateNewProject,
    } = useCreateProjectDialog();

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                 <Button onClick={handleCreateNewProject} className="animate-fade-in-up"  style={{ animationDelay: '0.3s' }}>
                    <PlusCircle className="me-2 h-4 w-4" />
                    {t('projects.createButton')}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{t('projects.createDialogTitle')}</DialogTitle>
                    <DialogDescription>
                        {t('projects.createDialogDescription')}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="project-name">{t('projects.projectNameLabel')}</Label>
                        <Input id="project-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('projects.projectNamePlaceholder')} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="project-description">{t('projects.projectIdeaLabel')}</Label>
                        <Textarea id="project-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('projects.projectIdeaPlaceholder')} />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="ghost">{t('projects.cancelButton')}</Button>
                    </DialogClose>
                    <Button onClick={handleStartBuilding} disabled={!name && !description}>
                        {t('projects.startBuildingButton')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
