'use server';

/**
 * @fileOverview An AI agent for generating PlantUML code from a text description.
 * This file acts as a diagram generation "engine" by defining specific prompts
 * for each supported PlantUML diagram type.
 */

import { ai } from '@/ai/genkit';
import { DiagramType, GeneratePlantUMLInputSchema, GeneratePlantUMLOutputSchema, type GeneratePlantUMLInput, type GeneratePlantUMLOutput } from '@/ai/schemas';

// Configuration map for each diagram type's prompts.
const diagramPromptConfig: Record<DiagramType, { system: string; prompt: string }> = {
  useCase: {
    system: `You are an expert systems analyst specializing in PlantUML. Your task is to generate a valid PlantUML use case diagram.
- Identify actors from the user's description.
- Identify use cases and group related ones within a system boundary rectangle.
- Connect actors to use cases to show interactions.
- The code must start with '@startuml' and end with '@enduml'.
- Do not include any explanations, comments, or markdown formatting in your output. Return only the raw PlantUML code.`,
    prompt: `Description:\n---\n{{{text}}}\n---`,
  },
  class: {
    system: `You are an expert software architect. Your task is to generate a valid PlantUML class diagram.
- Identify key classes, their attributes, and methods from the description.
- Establish relationships (inheritance, association, aggregation) with correct cardinality.
- Use visibility markers (+, -, #).
- The code must start with '@startuml' and end with '@enduml'.
- Do not include any explanations, comments, or markdown formatting in your output. Return only the raw PlantUML code.`,
    prompt: `Description:\n---\n{{{text}}}\n---`,
  },
  sequence: {
    system: `You are an expert systems designer. Your task is to generate a valid PlantUML sequence diagram.
- Illustrate the step-by-step interactions between objects or participants for a primary workflow.
- Show the message order and use activation/deactivation boxes to represent object lifecycles.
- Include at least one 'alt/else' block for conditional logic if described.
- The code must start with '@startuml' and end with '@enduml'.
- Do not include any explanations, comments, or markdown formatting in your output. Return only the raw PlantUML code.`,
    prompt: `Description:\n---\n{{{text}}}\n---`,
  },
  activity: {
    system: `You are a business process modeler. Your task is to generate a valid PlantUML activity diagram.
- Define start and end points.
- Map out the sequence of activities.
- Include at least one decision point with conditional paths if described.
- Use partitions for different actors or departments if mentioned.
- The code must start with '@startuml' and end with '@enduml'.
- Do not include any explanations, comments, or markdown formatting in your output. Return only the raw PlantUML code.`,
    prompt: `Description:\n---\n{{{text}}}\n---`,
  },
  component: {
    system: `You are a software architect. Your task is to generate a valid PlantUML component diagram.
- Identify the main software components from the description.
- Show dependencies between components using arrows.
- Define at least one provided interface using the "()" notation.
- Group related components in a package if applicable.
- The code must start with '@startuml' and end with '@enduml'.
- Do not include any explanations, comments, or markdown formatting in your output. Return only the raw PlantUML code.`,
    prompt: `Description:\n---\n{{{text}}}\n---`,
  },
  archimate: {
    system: `You are an enterprise architect. Your task is to generate a valid ArchiMate diagram using PlantUML.
- Focus on Business and Application layers.
- Identify actors, roles, business functions, and application components.
- Use proper ArchiMate relationship types (e.g., realization, serving).
- The code must start with '@startuml' and end with '@enduml'.
- Do not include any explanations, comments, or markdown formatting in your output. Return only the raw PlantUML code.`,
    prompt: `Description:\n---\n{{{text}}}\n---`,
  },
  er: {
    system: `You are a database designer. Your task is to generate a valid PlantUML Entity-Relationship (ER) diagram.
- Identify entities and their attributes.
- Mark Primary Keys (PK) and Foreign Keys (FK).
- Establish relationships between entities with standard ERD cardinality notation (e.g., "||--o{", "}o--||").
- The code must start with '@startuml' and end with '@enduml'.
- Do not include any explanations, comments, or markdown formatting in your output. Return only the raw PlantUML code.`,
    prompt: `Description:\n---\n{{{text}}}\n---`,
  },
  dfd: {
    system: `You are a systems analyst creating Data Flow Diagrams (DFDs) with PlantUML. Your task is to generate valid PlantUML code based on the user's description.
- **IMPORTANT**: You MUST include the following skin parameters at the beginning of the diagram to style the elements correctly:
  \`\`\`plantuml
  skinparam collections {
    BorderColor black
    BorderThickness 2
    BackgroundColor white
    ArrowColor Black
  }
  \`\`\`
- Use \`collections\` for external entities (data origins/destinations).
- Use \`rectangle\` for processes.
- Use \`database\` for data stores.
- Connect elements with arrows to show data flow, and label the arrows with the data being transferred.
- The code must start with '@startuml' and end with '@enduml'.
- Do not include any explanations, comments, or markdown formatting in your output. Return only the raw PlantUML code.`,
    prompt: `Description:\n---\n{{{text}}}\n---`,
  },
};

const generatePlantUMLFlow = ai.defineFlow({
  name: 'generatePlantUMLFlow',
  inputSchema: GeneratePlantUMLInputSchema,
  outputSchema: GeneratePlantUMLOutputSchema
}, async (input) => {
  const { text, diagramType } = input;

  // Select the appropriate prompt configuration based on the diagram type
  const config = diagramPromptConfig[diagramType];

  if (!config) {
    throw new Error(`Unsupported diagram type: ${diagramType}`);
  }

  // Define and run the prompt dynamically
  const diagramPrompt = ai.definePrompt({
    name: `generate${diagramType.charAt(0).toUpperCase() + diagramType.slice(1)}Prompt`,
    system: config.system,
    prompt: config.prompt,
    input: { schema: GeneratePlantUMLInputSchema },
    output: { schema: GeneratePlantUMLOutputSchema },
    model: 'googleai/gemini-2.5-flash-lite',
    config: {
      temperature: 0.2, // Lower temperature for precise code generation
    },
  });

  const { output } = await diagramPrompt(input);
  if (!output) {
    throw new Error("PlantUML code generation failed.");
  }

  // The AI should return only code, but we'll include an explanation for context in the final output object.
  // We can generate a simple explanation here.
  output.explanation = `This is a PlantUML representation of the ${diagramType} diagram you described.`;

  return output;
});

export async function generatePlantUML(input: GeneratePlantUMLInput): Promise<GeneratePlantUMLOutput> {
  const validation = GeneratePlantUMLInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for generatePlantUML: ${validation.error.message}`);
  }
  return generatePlantUMLFlow(validation.data);
}
