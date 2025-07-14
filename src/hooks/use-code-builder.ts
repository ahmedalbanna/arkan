
'use client';

import { useState, useReducer, useTransition } from 'react';
import { z } from 'zod';
import { generateCode } from '@/ai/flows/generate-code';
import { deductCredit } from '@/services/credit-service';
import { useAuth } from '@/context/AuthContext';
import { useToast } from './use-toast';

export interface CodeGenerationState {
  prompt?: string;
  html?: string;
  css?: string;
  javascript?: string;
  error?: string;
}

type Action =
  | { type: 'GENERATION_START' }
  | { type: 'GENERATION_SUCCESS'; payload: Omit<CodeGenerationState, 'error'> }
  | { type: 'GENERATION_FAILURE'; payload: string };

const initialState: CodeGenerationState = {};

function reducer(state: CodeGenerationState, action: Action): CodeGenerationState {
  switch (action.type) {
    case 'GENERATION_START':
      return { ...state, error: undefined };
    case 'GENERATION_SUCCESS':
      return { ...action.payload, error: undefined };
    case 'GENERATION_FAILURE':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

const GenerateCodeSchema = z.object({
  prompt: z.string().min(10, { message: 'Prompt must be at least 10 characters long.' }),
});

export function useCodeBuilder() {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [isGenerating, startTransition] = useTransition();
    const [prompt, setPrompt] = useState('');
    const { user, fetchUser } = useAuth();
    const { toast } = useToast();

    const handleGenerateCode = () => {
        const validatedFields = GenerateCodeSchema.safeParse({ prompt });

        if (!validatedFields.success) {
            dispatch({ type: 'GENERATION_FAILURE', payload: validatedFields.error.flatten().fieldErrors.prompt?.[0] || 'Invalid prompt.' });
            return;
        }

        startTransition(async () => {
            dispatch({ type: 'GENERATION_START' });
            try {
                if (!user) throw new Error("User not authenticated.");
                await deductCredit(user.id, 1);
                
                const result = await generateCode({ prompt: validatedFields.data.prompt });
                
                dispatch({ type: 'GENERATION_SUCCESS', payload: { ...result, prompt: validatedFields.data.prompt } });
                await fetchUser();
                toast({ title: 'Code Generated', description: 'HTML, CSS, and JS have been generated.' });
            } catch (e: any) {
                console.error(e);
                const errorMessage = e.message || 'An error occurred while generating the code. Please try again.';
                dispatch({ type: 'GENERATION_FAILURE', payload: errorMessage });
            }
        });
    };

    return {
        state,
        isGenerating,
        prompt,
        setPrompt,
        handleGenerateCode
    };
}
