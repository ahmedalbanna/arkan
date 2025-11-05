
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
import { useBuilderStore } from '@/hooks';
import { useRouter } from 'next/navigation';

export function CreateProjectDialog() {
    const { t } = useLocalization();
    const router = useRouter();
    const {
        isCreateProjectOpen,
        setIsCreateProjectOpen,
        newProjectName,
        setNewProjectName,
        newProjectDescription,
        setNewProjectDescription,
        handleStartBuilding,
    } = useBuilderStore();

    const handleAction = () => {
        handleStartBuilding(t, router);
    }

    return (
        <Dialog open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen}>
            <DialogTrigger asChild>
                 <Button className="animate-fade-in-up"  style={{ animationDelay: '0.3s' }}>
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
                        <Input id="project-name" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} placeholder={t('projects.projectNamePlaceholder')} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="project-description">{t('projects.projectDescriptionLabel')}</Label>
                        <Textarea id="project-description" value={newProjectDescription} onChange={(e) => setNewProjectDescription(e.target.value)} placeholder={t('projects.projectDescriptionPlaceholder')} />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="ghost">{t('projects.cancelButton')}</Button>
                    </DialogClose>
                    <Button onClick={handleAction} disabled={!newProjectName && !newProjectDescription}>
                        {t('projects.startBuildingButton')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
