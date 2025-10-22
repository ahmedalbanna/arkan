'use client';

import type { EvaluateReportInput, EvaluateReportOutput } from "@/ai/schemas";
import { useAuth } from "@/context/AuthContext";
import { getAuthenticatedToken } from "@/lib/authUtils";
import { handleErrorUtility } from "@/lib/errorUtils";
import { evaluateReportApi } from "@/services";
import { useMutation } from "@tanstack/react-query";
import { toast } from "./use-toast";
import { useBuilderStore } from "./useBuilderStore";

/**
 * Custom mutation hook to evaluate a project report.
 * @returns The result of the useMutation hook, including the `mutate` function.
 */
export function useEvaluateReport() {
    const { firebaseUser, refetchUser } = useAuth();
    const updateProject = useBuilderStore(s => s.updateProject);

    return useMutation<EvaluateReportOutput, Error, { input: EvaluateReportInput, projectId: string }>({
        mutationFn: async ({ input }) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return evaluateReportApi({ body: input, token });
        },
        onSuccess: (data, variables) => {
            // Update the project with the evaluation data.
            // Note: `evaluation` property is temporarily added. 
            // This should be formally added to the Project model if it's a permanent feature.
            updateProject(project => {
                (project as any).evaluation = data;
            });

            refetchUser(); // To update credits
            toast({ title: "Evaluation Complete" });
        },
        onError: (error: Error) => {
            handleErrorUtility(error, "Report Evaluation Failed");
        },
    });
}
