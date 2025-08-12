
'use client';

import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { 
    paraphraseTextApi, 
    summarizeTextApi, 
    generateQuizApi, 
    humanizeTextApi, 
    grammarCheckApi, 
    generateCitationApi,
    rewriteTextApi,
    summarizeTextWithRatioApi,
    writeDocumentApi
} from '@/services/writing-tools-service';
import { detectAiContentApi } from '@/services/ai-detector-service';
import { factCheckApi } from '@/services/fact-checker-service';
import { plagiarismCheckApi } from '@/services/plagiarism-checker-service';
import { aiResearcherApi } from '@/services/ai-researcher-service';
import { topicExplainerApi } from '@/services/topic-explainer-service';
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
    AIResearcherVariables,
    AIResearcherOutput,
    TopicExplainerVariables,
    TopicExplainerOutput,
    RewriteTextVariables,
    RewriteTextOutput,
    SummarizeTextWithRatioVariables,
    SummarizeTextWithRatioOutput,
    WriteDocumentVariables,
    WriteDocumentOutput,
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

/**
 * Custom mutation hook for the AI Researcher tool.
 */
export function useAiResearcher() {
    const { firebaseUser } = useAuth();
    return useMutation<AIResearcherOutput, Error, AIResearcherVariables>({
        mutationFn: async (variables) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return aiResearcherApi({ ...variables, token });
        },
    });
}

/**
 * Custom mutation hook for the Topic Explainer tool.
 */
export function useTopicExplainer() {
    const { firebaseUser } = useAuth();
    return useMutation<TopicExplainerOutput, Error, TopicExplainerVariables>({
        mutationFn: async (variables) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return topicExplainerApi({ ...variables, token });
        },
    });
}

export function useRewriteText() {
    const { firebaseUser } = useAuth();
    return useMutation<RewriteTextOutput, Error, RewriteTextVariables>({
        mutationFn: async (variables) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return rewriteTextApi({ ...variables, token });
        }
    });
}

export function useSummarizeTextWithRatio() {
    const { firebaseUser } = useAuth();
    return useMutation<SummarizeTextWithRatioOutput, Error, SummarizeTextWithRatioVariables>({
        mutationFn: async (variables) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return summarizeTextWithRatioApi({ ...variables, token });
        }
    });
}

/**
 * Custom mutation hook for writing a full document from a topic.
 */
export function useWriteDocument() {
    const { firebaseUser } = useAuth();
    return useMutation<WriteDocumentOutput, Error, WriteDocumentVariables>({
        mutationFn: async (variables) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return writeDocumentApi({ ...variables, token });
        }
    });
}
