
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
import { useState } from 'react';
import { useCreateProject } from '@/hooks';

interface CreateProjectDialogProps {
  onSuccess?: () => void;
}

export function CreateProjectDialog({ onSuccess }: CreateProjectDialogProps) {
    const { t } = useLocalization();
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    
    const createProjectMutation = useCreateProject({
        onSuccess: () => {
            setIsOpen(false);
            setName('');
            setDescription('');
            if (onSuccess) onSuccess();
        }
    });

    const handleCreateProject = () => {
        if (!name && !description) return;
        
        const newProjectData = {
            name: name || t('projects.untitled'),
            projectDescription: description,
            // other fields will be set by the server
        };
        createProjectMutation.mutate(newProjectData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
                        <Input id="project-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('projects.projectNamePlaceholder')} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="project-description">{t('projects.projectDescriptionLabel')}</Label>
                        <Textarea id="project-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('projects.projectDescriptionPlaceholder')} />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="ghost">{t('projects.cancelButton')}</Button>
                    </DialogClose>
                    <Button onClick={handleCreateProject} disabled={(!name && !description) || createProjectMutation.isPending}>
                        {createProjectMutation.isPending ? 'Creating...' : t('projects.createButton')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
