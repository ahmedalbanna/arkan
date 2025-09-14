
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBuilderStore } from '@/hooks';
import { Project, type ProjectProperties } from '@/lib/models/project'; // Import Project model

export function useCreateProjectDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const { project, setProject, newSession } = useBuilderStore(); // Get project and setProject

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleStartBuilding = () => {
        let currentProject = project; // Get current project from store
        if (!currentProject) {
            // If no project exists, create a new one with a temporary ID
            currentProject = new Project({ id: `temp-${Date.now()}`, userId: 'anonymous', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as ProjectProperties);
        }
        currentProject.name = name;
        currentProject.projectIdea = description;
        setProject(currentProject); // Update the project in the store
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
