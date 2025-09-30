
'use server';

import { generateReportSection } from '@/ai/flows/generate-report-section';
import { GenerateSectionInputSchema } from '@/ai/schemas';
import { createApiResponseEnhanced, handleApiErrorEnhanced, withEnhancedAuth } from '@/lib/core/api';
import { adminDb } from '@/lib/firebase/server-init'; // Assuming you have a server-side Firebase Admin SDK init
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service'; // Assuming this is server-side

export const POST = withEnhancedAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = GenerateSectionInputSchema.safeParse(body);

    if (!validation.success) {
      return handleApiErrorEnhanced(validation.error);
    }

    const creditCost = 1;
    await deductCredit(user.id, creditCost);

    const agentInput = validation.data;

    // Fetch section info dynamically from Firestore
    const sectionDocRef = adminDb.collection('sections').doc(agentInput.sectionToGenerate);
    const sectionDoc = await sectionDocRef.get();

    if (!sectionDoc.exists) {
      return handleApiErrorEnhanced({ message: 'Section not found in database.' }, 404);
    }

    const agentInfo = sectionDoc.data() as { agentId: string; title: string }; // Assuming these fields exist
    // const agentInfo = reportSections[agentInput.sectionToGenerate]; // Old static reference

    if (!agentInfo) {
      return handleApiErrorEnhanced({ message: 'Unknown section requested.' }, 400);
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

    return createApiResponseEnhanced(transformedOutput, 200);

  } catch (error) {
    return handleApiErrorEnhanced(error);
  }
});
