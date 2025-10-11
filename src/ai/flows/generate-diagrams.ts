
'use server';

/**
 * @fileOverview AI agent for generating various PlantUML diagrams and their explanations.
 */

import { diagramSpecificInstructions, generateDiagramPrompt } from '@/ai/prompts/generate-diagrams';
import { type GenerateDiagramInput, type GenerateDiagramOutput } from '@/ai/schemas';
import { getAgent } from '@/lib/db/queries';
import type { AgentPrompt } from '@/lib/types';


export async function generateDiagram(input: GenerateDiagramInput): Promise<GenerateDiagramOutput> {
  const agentId = `generate-${input.diagramToGenerate}-diagram`;
  const agent = await getAgent(agentId);
  if (!agent) {
    throw new Error(`Agent configuration for diagram type '${input.diagramToGenerate}' not found.`);
  }

  const agentPrompt = agent.prompt as AgentPrompt;

  // Combine base prompt with diagram-specific instructions into the system prompt
  const systemPrompt = `${agentPrompt.base}
${diagramSpecificInstructions[input.diagramToGenerate]}

--- AVAILABLE CONTEXT FROM PROJECT ---
You have access to the following documents. Review them and use the most relevant information to generate the diagram code that fulfills the user's request. Your output MUST be a JSON object containing two keys: 'plantUmlCode' and 'explanation'.`;

  const stringifiedProposal = input.proposal ? JSON.stringify(input.proposal, null, 2) : '';
  const stringifiedPlan = input.projectPlan ? JSON.stringify(input.projectPlan, null, 2) : '';

  // Separate media from text files for the prompt
  const textContext = input.externalContext?.filter(f => !f.content.startsWith('data:')) || [];
  const mediaContext = input.externalContext?.filter(f => f.content.startsWith('data:')) || [];

  const { output } = await generateDiagramPrompt({ ...input, textContext, mediaContext }, { model: agent.model || 'googleai/gemini-2.0-flash' });

  if (!output) {
    throw new Error("Diagram generation failed to produce an output.");
  }

  // Clean the output to ensure it starts correctly
  if (output.plantUmlCode && !output.plantUmlCode.trim().startsWith('@startuml')) {
    output.plantUmlCode = '@startuml\n' + output.plantUmlCode;
  }
  if (output.plantUmlCode && !output.plantUmlCode.trim().endsWith('@enduml')) {
    output.plantUmlCode = output.plantUmlCode + '\n@enduml';
  }

  return output;
}
