
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBuilderStore } from '@/hooks';
import { Project, type ProjectProperties } from '@/lib/models/project'; // Import Project model

export function useCreateProjectDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const { updateProject, newSession } = useBuilderStore();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleStartBuilding = () => {
        // Use the updater function to safely modify the project state
        updateProject(p => {
            p.name = name;
            p.projectIdea = description;
        });
        router.push('/generate');
        setIsOpen(false);
    }

    const handleCreateNewProject = () => {
        newSession();
        setName('');
        setDescription('');
        setIsOpen(true);
    };

    return {
        isOpen,
        setIsOpen,
        name,
        setName,
        description,
        setDescription,
        handleStartBuilding,
        handleCreateNewProject,
    };
}
