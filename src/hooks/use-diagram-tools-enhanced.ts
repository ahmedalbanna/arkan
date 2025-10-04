/**
 * Hook محسن لأدوات المخططات يستخدم النظام الجديد من src/core
 */

'use client';

import { useLocalization } from '@/context/LocalizationContext';
import {
    createAdvancedDiagramToolHook,
    createDiagramToolHook
} from '@/core';
import { z } from 'zod';

// مخططات التحقق من البيانات
const plantUmlGeneratorSchema = z.object({
    description: z.string().min(10, 'Description must be at least 10 characters long.'),
    type: z.enum(['class', 'sequence', 'usecase', 'activity', 'component', 'deployment']).optional(),
    style: z.enum(['default', 'modern', 'minimal', 'colorful']).optional(),
    includeNotes: z.boolean().optional(),
});

const diagramGeneratorSchema = z.object({
    prompt: z.string().min(5, 'Prompt must be at least 5 characters long.'),
    type: z.enum(['flowchart', 'mindmap', 'orgchart', 'timeline', 'venn', 'network']).optional(),
    style: z.enum(['simple', 'detailed', 'colorful', 'minimal']).optional(),
    format: z.enum(['svg', 'png', 'pdf']).optional(),
});

const diagramViewerSchema = z.object({
    diagramId: z.string().min(1, 'Diagram ID is required.'),
    format: z.enum(['svg', 'png', 'pdf']).optional(),
    zoom: z.number().min(0.1).max(5).optional(),
});

export function useDiagramToolsEnhanced() {
    const { t } = useLocalization();

    // PlantUML Generator Hook
    const usePlantUmlGenerator = createDiagramToolHook({
        toolName: 'plant-uml-generator',
        apiEndpoint: 'plant-uml-generator',
        schema: plantUmlGeneratorSchema,
        defaultValues: {
            description: '',
            type: 'class',
            style: 'default',
            includeNotes: true,
        },
        successMessage: t('writingTools.plantUmlGenerator.successToast') || 'PlantUML diagram generated successfully!',
        errorMessage: t('writingTools.plantUmlGenerator.errorToast') || 'Failed to generate PlantUML diagram',
        enableFileUpload: true,
        acceptedFileTypes: ['text/plain', 'text/markdown'],
        customFeatures: {
            formatOutput: (data: any) => {
                if (data.diagram) {
                    return {
                        description: data.description,
                        diagram: data.diagram,
                        type: data.type,
                        style: data.style,
                        includeNotes: data.includeNotes,
                        metadata: {
                            complexity: data.complexity || 'medium',
                            elementCount: data.elementCount || 0,
                            generatedAt: new Date().toISOString(),
                        }
                    };
                }
                return data;
            },
            validateInput: (data: any) => {
                return data.description?.length >= 10;
            },
            getDiagramTypes: () => [
                'class', 'sequence', 'usecase', 'activity', 'component', 'deployment'
            ],
            getStyleOptions: () => [
                'default', 'modern', 'minimal', 'colorful'
            ],
            getComplexityLevel: (data: any) => {
                const elementCount = data.elementCount || 0;
                if (elementCount < 5) return 'simple';
                if (elementCount < 15) return 'medium';
                return 'complex';
            },
        }
    });

    // Diagram Generator Hook
    const useDiagramGenerator = createAdvancedDiagramToolHook({
        toolName: 'diagram-generator',
        apiEndpoint: 'diagram-generator',
        schema: diagramGeneratorSchema,
        defaultValues: {
            prompt: '',
            type: 'flowchart',
            style: 'simple',
            format: 'svg',
        },
        successMessage: t('writingTools.diagramGenerator.successToast') || 'Diagram generated successfully!',
        errorMessage: t('writingTools.diagramGenerator.errorToast') || 'Failed to generate diagram',
        enableFileUpload: false,
        customFeatures: {
            formatOutput: (data: any) => {
                if (data.diagram) {
                    return {
                        prompt: data.prompt,
                        diagram: data.diagram,
                        type: data.type,
                        style: data.style,
                        format: data.format,
                        metadata: {
                            width: data.width || 800,
                            height: data.height || 600,
                            elementCount: data.elementCount || 0,
                            generatedAt: new Date().toISOString(),
                        }
                    };
                }
                return data;
            },
            validateInput: (data: any) => {
                return data.prompt?.length >= 5;
            },
            getDiagramTypes: () => [
                'flowchart', 'mindmap', 'orgchart', 'timeline', 'venn', 'network'
            ],
            getStyleOptions: () => [
                'simple', 'detailed', 'colorful', 'minimal'
            ],
            getSupportedFormats: () => [
                'svg', 'png', 'pdf'
            ],
        }
    });

    // Diagram Viewer Hook
    const useDiagramViewer = createDiagramToolHook({
        toolName: 'diagram-viewer',
        apiEndpoint: 'diagram-viewer',
        schema: diagramViewerSchema,
        defaultValues: {
            diagramId: '',
            format: 'svg',
            zoom: 1,
        },
        successMessage: t('writingTools.diagramViewer.successToast') || 'Diagram loaded successfully!',
        errorMessage: t('writingTools.diagramViewer.errorToast') || 'Failed to load diagram',
        enableFileUpload: false,
        customFeatures: {
            formatOutput: (data: any) => {
                if (data.diagram) {
                    return {
                        diagramId: data.diagramId,
                        diagram: data.diagram,
                        format: data.format,
                        zoom: data.zoom,
                        metadata: {
                            width: data.width || 800,
                            height: data.height || 600,
                            lastViewed: new Date().toISOString(),
                        }
                    };
                }
                return data;
            },
            validateInput: (data: any) => {
                return data.diagramId?.length >= 1;
            },
            getSupportedFormats: () => [
                'svg', 'png', 'pdf'
            ],
            getZoomLevels: () => [
                0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4, 5
            ],
        }
    });

    // Diagram Generation Tools Hook (Legacy compatibility)
    const useDiagramGenerationTools = createAdvancedDiagramToolHook({
        toolName: 'diagram-generation-tools',
        apiEndpoint: 'diagram-generation-tools',
        schema: z.object({
            type: z.enum(['flowchart', 'mindmap', 'orgchart', 'timeline']).optional(),
            data: z.any().optional(),
            options: z.any().optional(),
        }),
        defaultValues: {
            type: 'flowchart',
            data: {},
            options: {},
        },
        successMessage: t('writingTools.diagramGenerationTools.successToast') || 'Diagram tools loaded successfully!',
        errorMessage: t('writingTools.diagramGenerationTools.errorToast') || 'Failed to load diagram tools',
        enableFileUpload: false,
        customFeatures: {
            formatOutput: (data: any) => {
                return {
                    type: data.type,
                    data: data.data,
                    options: data.options,
                    tools: data.tools || [],
                    metadata: {
                        availableTypes: data.availableTypes || [],
                        lastUpdated: new Date().toISOString(),
                    }
                };
            },
            validateInput: (data: any) => {
                return true; // Always valid for tools
            },
            getAvailableTypes: () => [
                'flowchart', 'mindmap', 'orgchart', 'timeline'
            ],
        }
    });

    return {
        // Diagram Generation Tools
        usePlantUmlGenerator,
        useDiagramGenerator,
        useDiagramViewer,
        useDiagramGenerationTools,

        // Helper Functions
        getDiagramTypes: () => [
            'class', 'sequence', 'usecase', 'activity', 'component', 'deployment',
            'flowchart', 'mindmap', 'orgchart', 'timeline', 'venn', 'network'
        ],

        getStyleOptions: () => [
            'default', 'modern', 'minimal', 'colorful',
            'simple', 'detailed'
        ],

        getSupportedFormats: () => [
            'svg', 'png', 'pdf'
        ],

        getSupportedFileTypes: () => [
            'text/plain',
            'text/markdown'
        ],
    };
}
