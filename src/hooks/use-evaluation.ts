'use client';

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { userKeys } from "@/lib/query-keys";
import { handleErrorUtility } from "@/lib/errorUtils";
import { getAuthenticatedToken } from "@/lib/authUtils";
import { toast } from "./use-toast";
import type { EvaluateReportInput, EvaluateReportOutput } from "@/ai/schemas";
import { evaluateReportApi } from "@/services";
import { useBuilderStore } from "./useBuilderStore";


/**
 * Custom mutation hook to evaluate a project report.
 * @returns The result of the useMutation hook, including the `mutate` function.
 */
export function useEvaluateReport() {
    const { firebaseUser, refetchUser } = useAuth();
    const { project, setProject } = useBuilderStore(); 

    return useMutation<EvaluateReportOutput, Error, EvaluateReportInput>({
        mutationFn: async (variables) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return evaluateReportApi({ body: variables, token });
        },
        onSuccess: (data) => {
            if (!project) return;
            project.evaluation = data;
            setProject(project); 

            refetchUser(); // To update credits
            toast({ title: "Evaluation Complete" });
        },
        onError: (error: Error) => {
            handleErrorUtility(error, "Report Evaluation Failed");
        },
    });
}
