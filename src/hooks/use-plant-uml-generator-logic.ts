
'use client';

import { type DiagramType } from "@/ai/schemas";
import { useAuth } from "@/context/AuthContext";
import { useBuilderStore } from "@/hooks/useBuilderStore";
import { useGenerateDiagram, useUpdateDiagram } from "@/hooks";
import { getAuthenticatedToken } from "@/lib/authUtils";

import { useMutation } from "@tanstack/react-query";

// This hook encapsulates the logic for the Plant UML generator.
export function usePlantUmlGeneratorLogic(diagramType: DiagramType) {
    const { firebaseUser, refetchUser } = useAuth();
    const project = useBuilderStore(s => s.project);
    const updateProject = useBuilderStore(s => s.updateProject);
    
    // Mutations for diagram generation and updates
    const generationMutation = useGenerateDiagram();
    const updateMutation = useUpdateDiagram();

    // Extracts the specific diagram from the project based on the diagramType
    const diagram = project?.diagrams.getDiagram(diagramType);

    // Mutation to generate the PlantUML image URL from the code
    const getImageUrlMutation = useMutation({
        mutationFn: async (plantUmlCode: string) => {
            const token = await getAuthenticatedToken(firebaseUser);
            const output = await generatePlantUmlImageApi({ plantUmlCode, token });
            return output; // Corrected from `out` to `output`
        },
        onSuccess: (data) => {
            refetchUser(); // Update user credits
        },
    });

    // Handler to update the diagram's code
    const handleCodeUpdate = (newCode: string) => {
        updateProject(p => {
            p.diagrams.updateDiagram(diagramType, { plantUmlCode: newCode });
        });
    };

    // Handler to initiate a full diagram generation
    const handleGenerate = (generationType: 'full' | 'refine', userInput?: string) => {
        if (!project) return;
        generationMutation.mutate({ diagramType, generationType, userInput });
    };

    // Handler for text-based diagram updates (e.g., from user input)
    const handleUpdate = (updateInstruction: string) => {
        if (!project || !diagram?.plantUmlCode) return;
        updateMutation.mutate({ diagramType, updateInstruction, currentCode: diagram.plantUmlCode });
    };

    return {
        diagram,
        handleCodeUpdate,
        handleGenerate,
        handleUpdate,
        generationMutation,
        updateMutation,
        getImageUrlMutation,
    };
}
function generatePlantUmlImageApi(arg0: { plantUmlCode: string; token: string; }) {
    throw new Error("Function not implemented.");
}

