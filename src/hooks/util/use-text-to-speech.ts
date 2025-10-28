
'use client';

import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { toast } from './use-toast';
import { textToSpeechApi, type TTSInput, type TTSOutput } from '@/services/text-to-speech-service';

export function useTextToSpeech() {
    const { firebaseUser, refetchUser } = useAuth();
    return useMutation<TTSOutput, Error, TTSInput>({
        mutationFn: async (data) => {
            if (!firebaseUser) {
                throw new Error("Authentication required.");
            }
            const token = await firebaseUser.getIdToken();
            return textToSpeechApi({ data, token });
        },
        onSuccess: () => {
            refetchUser(); // To update credits
            toast({ title: 'Speech generated successfully!' });
        },
        onError: (error) => {
            toast({ title: 'Error generating speech', description: error.message, variant: 'destructive' });
        }
    });
}
