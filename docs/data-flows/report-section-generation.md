# Data Flow: Generating a Single Report Section

This document outlines the step-by-step data flow for generating a single section of a report, such as the "Introduction" or "System Design".

### 1. User Initiates Generation

The process begins in the `SectionAccordionItem` component (`src/components/report-generator/SectionAccordionItem.tsx`). When a user clicks the "Generate" button for a specific section, it triggers the `onGenerate` function, passing the unique `sectionKey`.

```typescriptreact
// src/components/report-generator/SectionAccordionItem.tsx

<Button
    type="button"
    onClick={() => onGenerate(sectionKey)} // <-- This starts the flow
    disabled={isAnythingGenerating || !hasSelectedContext || !hasCredits}
    className="font-headline w-full"
>
    {isGenerating ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
    {`${t('builder.reportGenerator.generateButton')} ${t(title)}`}
</Button>
```

### 2. Data Aggregation in `GenerationTools`

The `onGenerate` prop is the `onGenerateSection` function defined in the `GenerationTools` component (`src/components/report-generator/ReportGenerationTools.tsx`). This function acts as a central hub, collecting all necessary data for the AI.

It gathers:

*   **Core Project Data**: It pulls the `proposal` from `useBuilderStore` and the `projectPlan` from `useProjectPlanStore`.
*   **Context Selection**: It checks `contextSelection` from `useReportStore` to determine which specific pieces of context the user has selected. This includes:
    *   The main project proposal and plan.
    *   Other already-generated report sections.
    *   Generated diagrams.
    *   External files (like PDFs or text files).
*   **Agent Configuration**: It retrieves the specific AI agent configuration (e.g., `introduction-agent`) using the `useAgents` hook.
*   **Guidelines & Controls**: It compiles the final instructions for the AI by combining the agent's base prompt, default guidelines, user-added custom guidelines, and control settings (formality, tone, word count).

### 3. Assembling the API Payload

All the gathered data is assembled into a single `body` object that conforms to the `GenerateSectionInputSchema`. This object is a comprehensive package containing everything the backend AI service needs.

```typescript
// src/components/report-generator/ReportGenerationTools.tsx

const onGenerateSection = async (section: SectionNameType) => {
    // ... (data gathering logic) ...

    const body = {
        proposal: /* ... */,
        projectPlan: /* ... */,
        sectionToGenerate: section,
        otherSections: { /* ... */ },
        otherDiagrams: { /* ... */ },
        guidelines: [ /* ... */ ],
        instructionText: "...",
        exampleFiles: [ /* ... */ ],
        contextFiles: [ /* ... */ ],
    };

    setActiveMutationKey(section);
    reportGenerationMutation.mutate({ body });
};
```

### 4. Making the API Call

The `reportGenerationMutation.mutate({ body })` call triggers the `useGenerateReportSection` hook (`src/hooks/use-report-generation.ts`).

*   This hook uses TanStack Query's `useMutation`.
*   Its `mutationFn` gets an authentication token and calls `generateReportSectionApi`.
*   The `generateReportSectionApi` function (`src/services/report-service.ts`) makes the final `POST` request to the `/api/generate/report` backend endpoint.

### 5. Backend AI Processing

The backend API endpoint `/api/generate/report` receives the payload and performs the following (inferred) steps:

1.  Constructs a single, large prompt for the generative AI model. This prompt includes the agent's base instructions, all selected context, and the user's specific guidelines.
2.  Sends the comprehensive prompt to the AI model.
3.  Receives the generated content for the requested section.
4.  Formats the AI's response into the `GenerateSectionOutputSchema` format (`{ sectionName, content }`) and returns it to the client.

### 6. Updating the UI

Back on the client, the `onSuccess` callback of the `useGenerateReportSection` mutation is executed:

*   It receives the generated section name and content from the API.
*   It calls `setSection(sectionKey, content)` from `useReportStore`, updating the central state.
*   It calls `refetchUser()` to update the user's credit count.
*   The `ReportResults` component, subscribed to `useReportStore`, automatically re-renders to display the newly generated content.

This entire flow ensures that each section is generated with the precise context and instructions needed, providing a tailored and relevant output.

