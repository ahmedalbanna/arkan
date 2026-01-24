// @ts-nocheck

'use client';

import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/services';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useBuilderStore } from '../core/useBuilderStore';

interface Message {
    role: 'user' | 'model';
    content: string;
}

export function useProjectChat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const { firebaseUser } = useAuth();
    const { project } = useBuilderStore();

    const mutation = useMutation({
        mutationFn: async (userMessage: string) => {
            if (!firebaseUser || !project) throw new Error('User or project not available');
            const token = await firebaseUser.getIdToken();
            const projectContext = project.fullMarkdownContent;

            return apiService<{ response: string }>({
                endpoint: '/api/chat/project-consultant',
                method: 'POST',
                token,
                data: {
                    projectContext,
                    userMessage,
                    history: messages,
                },
            });
        },
        onSuccess: (data) => {
            setMessages(prev => [...prev, { role: 'model', content: data.response }]);
        },
        onError: (error: Error) => {
            setMessages(prev => [...prev, { role: 'model', content: `Sorry, an error occurred: ${error.message}` }]);
        },
    });

    const sendMessage = (message: string) => {
        if (!message.trim() || mutation.isPending) return;

        const newUserMessage: Message = { role: 'user', content: message };
        setMessages(prev => [...prev, newUserMessage]);
        mutation.mutate(message);
    };

    return {
        messages,
        sendMessage,
        isLoading: mutation.isPending,
    };
}
