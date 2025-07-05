import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ProjectProposalSchema } from '@/ai/schemas';
import { generateIntroduction } from '@/ai/flows/generate-introduction';
import { generateLiteratureReview } from '@/ai/flows/generate-literature-review';
import { generateSystemAnalysis } from '@/ai/flows/generate-system-analysis';
import { generateDesignStrategy } from '@/ai/flows/generate-design-strategy';
import { generateSystemDesign } from '@/ai/flows/generate-system-design';
import { generateSystemProgramming } from '@/ai/flows/generate-system-programming';
import { generateSystemTesting } from '@/ai/flows/generate-system-testing';
import { generateConclusion } from '@/ai/flows/generate-conclusion';

const generateReportSchema = z.object({
  proposal: ProjectProposalSchema,
  sectionToGenerate: z.enum([
    'introduction',
    'literatureReview',
    'systemAnalysis',
    'designStrategy',
    'systemDesign',
    'systemProgramming',
    'systemTesting',
    'conclusion',
  ]),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = generateReportSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { proposal, sectionToGenerate } = validation.data;

    let result;
    switch (sectionToGenerate) {
      case 'introduction':
        result = await generateIntroduction(proposal);
        break;
      case 'literatureReview':
        result = await generateLiteratureReview(proposal);
        break;
      case 'systemAnalysis':
        result = await generateSystemAnalysis(proposal);
        break;
      case 'designStrategy':
        result = await generateDesignStrategy(proposal);
        break;
      case 'systemDesign':
        result = await generateSystemDesign(proposal);
        break;
      case 'systemProgramming':
        result = await generateSystemProgramming(proposal);
        break;
      case 'systemTesting':
        result = await generateSystemTesting(proposal);
        break;
      case 'conclusion':
        result = await generateConclusion(proposal);
        break;
      default:
        return NextResponse.json({ message: 'Unknown section requested.' }, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error(`Error generating report section:`, error);
    return NextResponse.json({ message: 'An unexpected error occurred while generating the report section.' }, { status: 500 });
  }
}
