
'use server';

import { z } from 'zod';
import { GenerateSectionInputSchema } from '@/ai/schemas';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service'; // Assuming this is server-side
import { adminDb } from '@/lib/firebase/server-init'; // Assuming you have a server-side Firebase Admin SDK init
import type { SectionName } from '@/ai/schemas';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';
import { generateReportSection } from '@/ai/flows/generate-report-section';


export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = GenerateSectionInputSchema.safeParse(body);

    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const creditCost = 1;
    await deductCredit(user.id, creditCost);

    const agentInput = validation.data;

    // Fetch section info dynamically from Firestore
    const sectionDocRef = adminDb.collection('sections').doc(agentInput.sectionToGenerate);
    const sectionDoc = await sectionDocRef.get();

    if (!sectionDoc.exists) {
        return handleApiError({ message: 'Section not found in database.' }, 404);
    }

    const agentInfo = sectionDoc.data() as { agentId: string; title: string }; // Assuming these fields exist
    // const agentInfo = reportSections[agentInput.sectionToGenerate]; // Old static reference

    if (!agentInfo) {
        return handleApiError({ message: 'Unknown section requested.' }, 400);
    }

    const result = await generateReportSection(agentInput);

    const transformedOutput = { [result.sectionName]: result.content };

    await logGeneration({
        agentId: agentInfo.agentId,
        userId: user.id,
        input: agentInput,
        output: transformedOutput,
        creditCost: creditCost,
    });

    return createApiResponse(transformedOutput, 200);

  } catch (error) {
    return handleApiError(error);
  }
});
