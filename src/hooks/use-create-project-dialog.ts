'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBuilderStore } from '@/hooks/useBuilderStore';

export function useCreateProjectDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const newSession = useBuilderStore(state => state.newSession);
    const setProjectName = useBuilderStore(state => state.setProjectName);
    const setProjectIdea = useBuilderStore(state => state.setProjectIdea);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleStartBuilding = () => {
        setProjectName(name);
        setProjectIdea(description);
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
