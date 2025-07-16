
'use client';

import { useState, useReducer, useTransition, useEffect } from 'react';
import { z } from 'zod';
import { generateCode } from '@/ai/flows/generate-code';
import { deductCredit } from '@/services/credit-service';
import { useAuth } from '@/context/AuthContext';
import { useToast } from './use-toast';
import { useBuilderState, type CodeGenerationState } from '@/context/BuilderStateContext';


export interface LocalCodeState {
  error?: string;
  isGenerating?: boolean;
}

type Action =
  | { type: 'GENERATION_START' }
  | { type: 'GENERATION_SUCCESS' }
  | { type: 'GENERATION_FAILURE'; payload: string };

const initialState: LocalCodeState = {
  isGenerating: false,
};

function reducer(state: LocalCodeState, action: Action): LocalCodeState {
  switch (action.type) {
    case 'GENERATION_START':
      return { ...state, error: undefined, isGenerating: true };
    case 'GENERATION_SUCCESS':
      return { ...state, error: undefined, isGenerating: false };
    case 'GENERATION_FAILURE':
      return { ...state, error: action.payload, isGenerating: false };
    default:
      return state;
  }
}

const GenerateCodeSchema = z.object({
  prompt: z.string().min(10, { message: 'Prompt must be at least 10 characters long.' }),
});

export function useCodeBuilder() {
    const { state: builderState, dispatch: builderDispatch } = useBuilderState();
    const [state, dispatch] = useReducer(reducer, initialState);
    const [isGenerating, startTransition] = useTransition();
    const { user, fetchUser } = useAuth();
    const { toast } = useToast();

    const setPrompt = (prompt: string) => {
        const newState = { ...builderState.codeGenerator, prompt };
        builderDispatch({ type: 'SET_CODE_GENERATOR_STATE', payload: newState });
    }

    const handleGenerateCode = () => {
        const validatedFields = GenerateCodeSchema.safeParse({ prompt: builderState.codeGenerator.prompt });

        if (!validatedFields.success) {
            dispatch({ type: 'GENERATION_FAILURE', payload: validatedFields.error.flatten().fieldErrors.prompt?.[0] || 'Invalid prompt.' });
            return;
        }

        dispatch({ type: 'GENERATION_START' });
        builderDispatch({ type: 'GENERATION_START', payload: { item: 'code' } });

        startTransition(async () => {
            try {
                if (!user) throw new Error("User not authenticated.");
                await deductCredit(user.id, 1);
                
                const result = await generateCode({ prompt: validatedFields.data.prompt });
                
                const newCodeState = { ...result, prompt: validatedFields.data.prompt };
                
                dispatch({ type: 'GENERATION_SUCCESS' });
                builderDispatch({ type: 'SET_CODE_GENERATOR_STATE', payload: newCodeState });
                builderDispatch({ type: 'GENERATION_SUCCESS', payload: { lastGenerated: 'code' } });

                await fetchUser();
                toast({ title: 'Code Generated', description: 'HTML, CSS, and JS have been generated.' });
            } catch (e: any) {
                console.error(e);
                const errorMessage = e.message || 'An error occurred while generating the code. Please try again.';
                dispatch({ type: 'GENERATION_FAILURE', payload: errorMessage });
                builderDispatch({ type: 'GENERATION_ERROR', payload: { error: errorMessage, item: 'code' } });
            }
        });
    };

    return {
        state: { ...builderState, ...state, isGenerating: isGenerating || builderState.isAnythingGenerating },
        setPrompt,
        handleGenerateCode
    };
}
