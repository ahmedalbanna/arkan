
'use client';

import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { 
    paraphraseTextApi, 
    summarizeTextApi, 
    generateQuizApi, 
    humanizeTextApi,
    detectAiContentApi,
    grammarCheckApi,
    generateCitationApi, // Import new service
    factCheckApi,
 plagiarismCheckApi,
} from '@/services/writing-tools-service';
import type { 
    ParaphraseTextOutput, ParaphraseTextVariables, 
    SummarizeTextOutput, SummarizeTextVariables,
    GenerateQuizOutput, GenerateQuizVariables,
    HumanizeTextVariables,
    DetectAIVariables,
    GrammarCheckVariables,
    GenerateCitationVariables,
    FactCheckVariables,
    PlagiarismCheckVariables,
    GrammarCheckOutput,
    HumanizeTextOutput,
    DetectAIOutput,
    GenerateCitationOutput,
    FactCheckOutput,
    PlagiarismCheckOutput,
} from '@/services/writing-tools-service';

/**
 * Custom mutation hook for paraphrasing text using an AI flow.
 */
export function useParaphraseText() {
  const { firebaseUser } = useAuth();

  return useMutation<ParaphraseTextOutput, Error, ParaphraseTextVariables>({
    mutationFn: async (variables) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return paraphraseTextApi({ ...variables, token });
    },
  });
}

/**
 * Custom mutation hook for summarizing text using an AI flow.
 */
export function useSummarizeText() {
  const { firebaseUser } = useAuth();

  return useMutation<SummarizeTextOutput, Error, SummarizeTextVariables>({
    mutationFn: async (variables) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return summarizeTextApi({ ...variables, token });
    },
  });
}


/**
 * Custom mutation hook for generating a quiz from text.
 */
export function useGenerateQuiz() {
  const { firebaseUser } = useAuth();

 return useMutation<GenerateQuizOutput, Error, GenerateQuizVariables>({
    mutationFn: async (variables) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return generateQuizApi({ ...variables, token });
    },
  });
}

/**
 * Custom mutation hook for humanizing text using an AI flow.
 */
export function useHumanizeText() {
    const { firebaseUser } = useAuth();

 return useMutation<HumanizeTextOutput, Error, HumanizeTextVariables>({
        mutationFn: async (variables) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return humanizeTextApi({ ...variables, token });
        },
    });
}

/**
 * Custom mutation hook for detecting AI content in text.
 */
export function useDetectAiContent() {
    const { firebaseUser } = useAuth();

 return useMutation<DetectAIOutput, Error, DetectAIVariables>({
        mutationFn: async (variables) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return detectAiContentApi({ ...variables, token });
        },
    });
}


/**
 * Custom mutation hook for checking grammar in text.
 */
export function useGrammarCheck() {
    const { firebaseUser } = useAuth();

    return useMutation<GrammarCheckOutput, Error, GrammarCheckVariables>({
        mutationFn: async (variables) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return grammarCheckApi({ ...variables, token });
        },
    });
}

/**
 * Custom mutation hook for generating a citation.
 */
export function useGenerateCitation() {
    const { firebaseUser } = useAuth();
    return useMutation<GenerateCitationOutput, Error, GenerateCitationVariables>({
        mutationFn: async (variables) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return generateCitationApi({ ...variables, token });
        },
    });
}

/**
 * Custom mutation hook for fact-checking text.
 */
export function useFactCheck() {
    const { firebaseUser } = useAuth();

 return useMutation<FactCheckOutput, Error, FactCheckVariables>({
        mutationFn: async (variables) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return factCheckApi({ ...variables, token });
        },
    });
}


/**
 * Custom mutation hook for checking for plagiarism in text.
 */
export function usePlagiarismCheck() {
    const { firebaseUser } = useAuth();

 return useMutation<PlagiarismCheckOutput, Error, PlagiarismCheckVariables>({
        mutationFn: async (variables) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return plagiarismCheckApi({ ...variables, token });
        },
    });
}
