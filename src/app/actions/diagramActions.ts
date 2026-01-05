
'use server';

import { z } from 'zod';
import { requireUser } from './_utils/auth';
import { generatePlantUML } from '@/ai/flows/generate-plantuml';
import { imageToText } from '@/ai/flows/image-to-text';
import { deductCredit } from './userActions';
import { logGeneration } from './analyticsActions';

const GenerateDiagramSchema = z.object({ description: z.string().min(1), diagramType: z.enum(['useCase','class','sequence','activity','component','archimate','er', 'dfd']) });

export async function generateDiagramAction(data: z.infer<typeof GenerateDiagramSchema>) {
  const user = await requireUser();
  const input = GenerateDiagramSchema.parse(data);
  const result = await generatePlantUML(input as any);
  await deductCredit(user.id, 1);
  await logGeneration({ agentId: 'generate-plantuml', userId: user.id, input, output: result, creditCost: 1 });
  return result as any; // includes plantUmlCode and explanation
}

const UpdateDiagramSchema = z.object({ plantUmlCode: z.string().min(1) });
export async function updateDiagramAction(data: z.infer<typeof UpdateDiagramSchema>) {
  const user = await requireUser();
  const input = UpdateDiagramSchema.parse(data);
  // For update, we just echo back with a rendered URL client-side, but we still log the attempt
  await deductCredit(user.id, 1);
  await logGeneration({ agentId: 'update-plantuml', userId: user.id, input, output: { ok: true }, creditCost: 1 });
  return input; // client renders URL using plantuml server
}

const ExplainDiagramSchema = z.object({ imageDataUri: z.string().min(1), prompt: z.string().default('Explain this diagram.') });
export async function explainDiagramAction(data: z.infer<typeof ExplainDiagramSchema>) {
  const user = await requireUser();
  const input = ExplainDiagramSchema.parse(data);
  const result = await imageToText({ imageDataUri: input.imageDataUri, flow: 'image-to-text' });
  await deductCredit(user.id, 1);
  await logGeneration({ agentId: 'explain-diagram', userId: user.id, input, output: result, creditCost: 1 });
  return result;
}
