
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ProjectProposalSchema, DiagramTypeSchema, SectionNameSchema, type SectionName, DiagramType, ProjectPlanSchema } from '@/ai/schemas';
import { getAgent } from '@/lib/db/queries';
import { generateReportSection } from '@/ai/flows/generate-report-section';
import { evaluateAndSelectContext } from '@/ai/flows/evaluate-and-select-context';
import { deductCredit } from '@/services/credit-service';
import { getAdminAuth, adminDb } from '@/lib/firebase/admin';
import { logGeneration } from '@/services/generation-service';
import type { ReportGenerationTemplate } from '@/services/template-service';
import { getUserProfile } from '@/lib/db/queries';
import { sectionConfig } from '@/lib/report-config';

// Schema for generating a single section
const generateSectionSchema = z.object({
  proposal: ProjectProposalSchema.optional(),
  projectPlan: ProjectPlanSchema.optional().nullable(),
  sectionToGenerate: SectionNameSchema,
  otherSections: z.record(SectionNameSchema, z.string()).optional(),
  otherDiagrams: z.record(DiagramTypeSchema, z.string()).optional(),
  guidelines: z.array(z.string()).optional(), 
  instructionText: z.string().optional(),
  externalContext: z.array(z.object({
      fileName: z.string(),
      content: z.string(),
      type: z.enum(['context', 'example'])
  })).optional(),
});

// Schema for generating a full report based on a template
const generateFullReportSchema = z.object({
    proposal: ProjectProposalSchema.optional(),
    projectPlan: ProjectPlanSchema.optional().nullable(),
    templateId: z.string(),
    existingSections: z.record(SectionNameSchema, z.string()).optional(),
    existingDiagrams: z.record(DiagramTypeSchema, z.string()).optional(),
    externalContext: z.array(z.object({
        fileName: z.string(),
        content: z.string(),
        type: z.enum(['context', 'example'])
    })).optional(),
});


export async function POST(request: Request) {
  const adminAuth = getAdminAuth();
  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const token = authorization.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;
    
    const body = await request.json();

    // Check if it's a full report generation request
    const fullReportValidation = generateFullReportSchema.safeParse(body);
    if (fullReportValidation.success) {
        const { proposal, projectPlan, templateId, existingSections = {}, existingDiagrams = {}, externalContext } = fullReportValidation.data;

        // A proposal or external context is required to generate a report.
        if (!proposal && (!externalContext || externalContext.length === 0)) {
            return NextResponse.json({ message: "A proposal or external context is required to generate a report." }, { status: 400 });
        }

        const templateDoc = await adminDb.collection('templates').doc('report').collection('items').doc(templateId).get();
        if (!templateDoc.exists) {
             return NextResponse.json({ message: 'Invalid report template ID.' }, { status: 400 });
        }
        const template = templateDoc.data() as ReportGenerationTemplate;

        // Determine which sections are missing
        const sectionsToGenerate = template.agentIds
            .map(agentId => (Object.keys(sectionConfig) as SectionName[]).find(key => sectionConfig[key].agentId === agentId))
            .filter((sectionKey): sectionKey is SectionName => !!sectionKey && !existingSections[sectionKey]);
        
        if (sectionsToGenerate.length === 0) {
            return NextResponse.json({ sections: existingSections, message: "All report sections have already been generated." }, { status: 200 });
        }
        
        // Check user credits before proceeding
        const userProfile = await getUserProfile(userId);
        if (!userProfile || userProfile.credits < sectionsToGenerate.length) {
            return NextResponse.json({ message: `Insufficient credits. You need ${sectionsToGenerate.length} credits but have ${userProfile?.credits || 0}.` }, { status: 402 });
        }
        
        // Call the new evaluation agent to get the optimal configuration
        const evalInput = { proposal, projectPlan, existingSections, existingDiagrams, sectionsToGenerate, externalContext };
        const evalResult = await evaluateAndSelectContext(evalInput);
        
        // Deduct credits for all sections at once
        await deductCredit(userId, sectionsToGenerate.length);

        const generatedSections: { [key in SectionName]?: string } = { ...existingSections };
      
        // Sequentially generate each section, adding the result to the context for the next one
        for (const config of evalResult.configs) {
            const agentInfo = sectionConfig[config.section as SectionName];
            
            const instructionText = `- The writing style should be ${config.instructions.formality}.\n- Adopt a ${config.instructions.tone} tone.`;
            
            // For each section, provide the context that has been generated SO FAR.
            const currentContextSections = config.context.sections?.reduce((acc, key) => {
                if (generatedSections[key as SectionName]) {
                    acc[key as SectionName] = generatedSections[key as SectionName];
                }
                return acc;
            }, {} as Record<SectionName, string | undefined>);

             const currentContextDiagrams = config.context.diagrams?.reduce((acc, key) => {
                if (existingDiagrams[key as DiagramType]) {
                    acc[key as DiagramType] = existingDiagrams[key as DiagramType];
                }
                return acc;
            }, {} as Record<DiagramType, string | undefined>);


            const agentInput = {
                proposal,
                projectPlan,
                sectionToGenerate: config.section,
                otherSections: currentContextSections,
                otherDiagrams: currentContextDiagrams,
                guidelines: config.guidelines,
                instructionText,
                externalContext,
            };

            const result = await generateReportSection(agentInput);
            await logGeneration({ agentId: agentInfo.agentId, userId, input: agentInput, output: { [result.sectionName]: result.content } });
    
            // Add the newly generated section to our collected content
            generatedSections[result.sectionName as SectionName] = result.content;
        }

        return NextResponse.json({ sections: generatedSections }, { status: 200 });
    }

    // Check if it's a single section generation request
    const singleSectionValidation = generateSectionSchema.safeParse(body);
    if (singleSectionValidation.success) {
        await deductCredit(userId, 1);
        const agentInput = singleSectionValidation.data;

        // A proposal or external context is required to generate a section.
        if (!agentInput.proposal && (!agentInput.externalContext || agentInput.externalContext.length === 0)) {
            return NextResponse.json({ message: "A proposal or external context is required to generate a report section." }, { status: 400 });
        }

        const agentInfo = sectionConfig[agentInput.sectionToGenerate];

        if (!agentInfo) {
            return NextResponse.json({ message: 'Unknown section requested.' }, { status: 400 });
        }
        
        const result = await generateReportSection(agentInput);

        const transformedOutput = { [result.sectionName]: result.content };
        
        await logGeneration({ 
            agentId: agentInfo.agentId, 
            userId, 
            input: agentInput, 
            output: transformedOutput 
        });
  
        return NextResponse.json(transformedOutput, { status: 200 });
    }

    // If neither validation passes, return a validation error
    return NextResponse.json({ errors: fullReportValidation.error?.flatten().fieldErrors || singleSectionValidation.error?.flatten().fieldErrors, message: 'Invalid request body.' }, { status: 400 });

  } catch (error) {
    console.error(`Error generating report:`, error);
    if (error instanceof Error) {
        if (error.message.includes("Unauthorized") || error.message.includes("token")) {
            return NextResponse.json({ message: 'Authentication failed.' }, { status: 401 });
        }
         if (error.message.includes("credit")) {
            return NextResponse.json({ message: error.message }, { status: 402 }); // Payment Required
        }
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred while generating the report.' }, { status: 500 });
  }
}
