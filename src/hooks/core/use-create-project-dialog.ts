
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBuilderStore } from './useBuilderStore';
import { useLocalization } from '@/context/LocalizationContext';

export function useCreateProjectDialog() {
    const { t } = useLocalization();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const { loadProject, project } = useBuilderStore();

    const handleCreateNewProject = () => {
        // This function now just opens the dialog
        setIsOpen(true);
    };

    const handleStartBuilding = () => {
        if (!name && !description) return;
        const newProjectData = {
            id: '',
            userId: '', // Will be set by the save logic
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            name: name || t('projects.untitled'),
            projectIdea: description,
        };
        loadProject(newProjectData);
        router.push('/builder');
        setIsOpen(false);
        setName('');
        setDescription('');
    };

    return {
        isOpen,
        setIsOpen,
        name,
        setName,
        description,
        setDescription,
        handleStartBuilding,
        handleCreateNewProject
    };
}
