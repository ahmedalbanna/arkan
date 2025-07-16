
'use client';

import { useState, useReducer, useTransition, useEffect } from 'react';
import { z } from 'zod';
import { generateCode } from '@/ai/flows/generate-code';
import { deductCredit } from '@/services/credit-service';
import { useAuth } from '@/context/AuthContext';
import { useToast } from './use-toast';

const CODE_KEY = 'arkan-code-generator';

export interface CodeGenerationState {
  prompt: string;
  html: string;
  css: string;
  javascript: string;
  error?: string;
  isGenerating?: boolean;
}

type Action =
  | { type: 'GENERATION_START' }
  | { type: 'GENERATION_SUCCESS'; payload: Omit<CodeGenerationState, 'error' | 'isGenerating'> }
  | { type: 'GENERATION_FAILURE'; payload: string }
  | { type: 'SET_STATE'; payload: CodeGenerationState };

const initialState: CodeGenerationState = {
  isGenerating: false,
  prompt: '',
  html: '',
  css: '',
  javascript: '',
};

function reducer(state: CodeGenerationState, action: Action): CodeGenerationState {
  switch (action.type) {
    case 'GENERATION_START':
      return { ...state, error: undefined, isGenerating: true };
    case 'GENERATION_SUCCESS':
      return { ...action.payload, error: undefined, isGenerating: false };
    case 'GENERATION_FAILURE':
      return { ...state, error: action.payload, isGenerating: false };
    case 'SET_STATE':
        return { ...state, ...action.payload };
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

    // Load from local storage on initial mount
    useEffect(() => {
        try {
            const storedCode = localStorage.getItem(CODE_KEY);
            if (storedCode) {
                const parsed = JSON.parse(storedCode);
                dispatch({ type: 'SET_STATE', payload: parsed });
                setPrompt(parsed.prompt || '');
            }
        } catch (error) {
            console.error('Failed to load code state from localStorage', error);
        }
    }, []);

    // Save to local storage whenever code is successfully generated
    useEffect(() => {
        if (state.html || state.css || state.javascript) {
            try {
                localStorage.setItem(CODE_KEY, JSON.stringify(state));
            } catch (error) {
                console.error('Failed to save code state to localStorage', error);
            }
        }
    }, [state]);


    const handleGenerateCode = () => {
        const validatedFields = GenerateCodeSchema.safeParse({ prompt });

        if (!validatedFields.success) {
            dispatch({ type: 'GENERATION_FAILURE', payload: validatedFields.error.flatten().fieldErrors.prompt?.[0] || 'Invalid prompt.' });
            return;
        }

        dispatch({ type: 'GENERATION_START' });
        startTransition(async () => {
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
        state: { ...state, isGenerating: isGenerating || state.isGenerating },
        prompt,
        setPrompt,
        handleGenerateCode
    };
}
