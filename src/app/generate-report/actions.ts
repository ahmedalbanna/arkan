'use server';

import { z } from 'zod';
import { ProjectProposalSchema, type ProjectProposal, DiagramTypeSchema, type DiagramType } from '@/ai/schemas';
import { deflateSync } from 'zlib';

import { generateIntroduction } from '@/ai/flows/generate-introduction';
import { generateLiteratureReview } from '@/ai/flows/generate-literature-review';
import { generateSystemAnalysis } from '@/ai/flows/generate-system-analysis';
import { generateDesignStrategy } from '@/ai/flows/generate-design-strategy';
import { generateSystemDesign } from '@/ai/flows/generate-system-design';
import { generateSystemProgramming } from '@/ai/flows/generate-system-programming';
import { generateSystemTesting } from '@/ai/flows/generate-system-testing';
import { generateConclusion } from '@/ai/flows/generate-conclusion';
import { generateUseCaseDiagram } from '@/ai/flows/generate-use-case-diagram';
import { generateClassDiagram } from '@/ai/flows/generate-class-diagram';
import { generateSequenceDiagram } from '@/ai/flows/generate-sequence-diagram';
import { generateActivityDiagram } from '@/ai/flows/generate-activity-diagram';
import { generateComponentDiagram } from '@/ai/flows/generate-component-diagram';
import { generateArchimateDiagram } from '@/ai/flows/generate-archimate-diagram';

export type SectionName = 
  | 'introduction'
  | 'literatureReview'
  | 'systemAnalysis'
  | 'designStrategy'
  | 'systemDesign'
  | 'systemProgramming'
  | 'systemTesting'
  | 'conclusion';

export interface ReportState {
  sections: {
    [key in SectionName]?: string;
  };
  diagrams?: {
    [key in DiagramType]?: {
      plantUmlCode: string;
      imageUrl: string;
    };
  };
  error?: string;
  lastGenerated?: SectionName | DiagramType;
}

const GenerateItemSchema = z.object({
  proposalJson: z.string().min(1, 'يرجى لصق محتوى مقترح المشروع.'),
  itemToGenerate: z.string().min(1, 'يجب تحديد عنصر للتوليد.'),
});

const sectionNames: SectionName[] = [
    'introduction', 'literatureReview', 'systemAnalysis', 'designStrategy',
    'systemDesign', 'systemProgramming', 'systemTesting', 'conclusion'
];

// Helper to encode PlantUML for URL
function encode64(data: Buffer): string {
    const B64_MAP = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';
    let r = '';
    for (let i = 0; i < data.length; i += 3) {
        const b1 = data[i];
        const b2 = i + 1 < data.length ? data[i+1] : 0;
        const b3 = i + 2 < data.length ? data[i+2] : 0;

        const c1 = b1 >> 2;
        const c2 = ((b1 & 3) << 4) | (b2 >> 4);
        const c3 = ((b2 & 15) << 2) | (b3 >> 6);
        const c4 = b3 & 63;

        r += B64_MAP.charAt(c1);
        r += B64_MAP.charAt(c2);
        if (i + 1 < data.length) {
            r += B64_MAP.charAt(c3);
        }
        if (i + 2 < data.length) {
            r += B64_MAP.charAt(c4);
        }
    }
    return r;
}

async function getPlantUmlImageUrl(plantUmlCode: string): Promise<string> {
    const compressed = deflateSync(Buffer.from(plantUmlCode, 'utf-8'));
    const encoded = encode64(compressed);
    return `https://www.plantuml.com/plantuml/png/~1${encoded}`;
}

export async function handleGenerateReportItem(
  prevState: ReportState,
  formData: FormData
): Promise<ReportState> {

  const validatedFields = GenerateItemSchema.safeParse({
    proposalJson: formData.get('proposalJson'),
    itemToGenerate: formData.get('itemToGenerate'),
  });

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    return {
      ...prevState,
      error: errors.proposalJson?.[0] || errors.itemToGenerate?.[0],
    };
  }
  
  const { proposalJson, itemToGenerate } = validatedFields.data;
  let proposalData: ProjectProposal;

  try {
    proposalData = JSON.parse(proposalJson);
  } catch (e) {
    return { ...prevState, error: 'صيغة JSON غير صالحة. يرجى التحقق من المحتوى.' };
  }

  const validatedProposal = ProjectProposalSchema.safeParse(proposalData);

  if (!validatedProposal.success) {
    return {
      ...prevState,
      error: 'بيانات المقترح غير متوافقة مع الهيكل المطلوب.',
    };
  }
  
  let prompt = formData.get(`prompt_${itemToGenerate}`) as string | null;
  if (prompt === null) {
    return { ...prevState, error: `لم يتم العثور على موجه للأمر للقسم '${itemToGenerate}'.` };
  }
  
  const isSection = sectionNames.includes(itemToGenerate as SectionName);
  const isDiagram = DiagramTypeSchema.options.includes(itemToGenerate as DiagramType);

  if (!isSection && !isDiagram) {
    return { ...prevState, error: 'نوع العنصر المطلوب غير معروف.' };
  }
  
  // If it's a text section, check for and append control instructions
  if (isSection) {
      const formalityValue = formData.get(`formality_${itemToGenerate}`) as string | null;
      const tone = formData.get(`tone_${itemToGenerate}`) as string | null;
      const wordCount = formData.get(`wordCount_${itemToGenerate}`) as string | null;

      let instructions = [];
      if (formalityValue) {
          const formality = parseInt(formalityValue, 10);
          let formalityDesc = "balanced";
          if (formality < 33) formalityDesc = "informal and casual";
          else if (formality > 66) formalityDesc = "highly formal and professional";
          instructions.push(`- The writing style should be ${formalityDesc}.`);
      }
      if (tone && tone !== "none") {
          instructions.push(`- Adopt a ${tone} tone.`);
      }
      if (wordCount) {
          instructions.push(`- The response should be approximately ${wordCount} words long.`);
      }

      if (instructions.length > 0) {
          prompt += `\n\nAdditionally, please adhere to the following constraints for your response:\n${instructions.join('\n')}`;
      }
  }


  try {
    if (isSection) {
      const sectionToGenerate = itemToGenerate as SectionName;
      let result;
      
      switch (sectionToGenerate) {
        case 'introduction':
          result = await generateIntroduction({ proposal: validatedProposal.data, prompt });
          return { ...prevState, sections: {...prevState.sections, introduction: result.introduction }, lastGenerated: 'introduction', error: undefined };
        case 'literatureReview':
          result = await generateLiteratureReview({ proposal: validatedProposal.data, prompt });
          return { ...prevState, sections: {...prevState.sections, literatureReview: result.literatureReview }, lastGenerated: 'literatureReview', error: undefined };
        case 'systemAnalysis':
          result = await generateSystemAnalysis({ proposal: validatedProposal.data, prompt });
          return { ...prevState, sections: {...prevState.sections, systemAnalysis: result.systemAnalysis }, lastGenerated: 'systemAnalysis', error: undefined };
        case 'designStrategy':
          result = await generateDesignStrategy({ proposal: validatedProposal.data, prompt });
          return { ...prevState, sections: {...prevState.sections, designStrategy: result.designStrategy }, lastGenerated: 'designStrategy', error: undefined };
         case 'systemDesign':
          result = await generateSystemDesign({ proposal: validatedProposal.data, prompt });
          return { ...prevState, sections: {...prevState.sections, systemDesign: result.systemDesign }, lastGenerated: 'systemDesign', error: undefined };
         case 'systemProgramming':
          result = await generateSystemProgramming({ proposal: validatedProposal.data, prompt });
          return { ...prevState, sections: {...prevState.sections, systemProgramming: result.systemProgramming }, lastGenerated: 'systemProgramming', error: undefined };
         case 'systemTesting':
          result = await generateSystemTesting({ proposal: validatedProposal.data, prompt });
          return { ...prevState, sections: {...prevState.sections, systemTesting: result.systemTesting }, lastGenerated: 'systemTesting', error: undefined };
        case 'conclusion':
          result = await generateConclusion({ proposal: validatedProposal.data, prompt });
          return { ...prevState, sections: {...prevState.sections, conclusion: result.conclusion }, lastGenerated: 'conclusion', error: undefined };
      }
    }

    if (isDiagram) {
        const diagramToGenerate = itemToGenerate as DiagramType;
        const agentInput = { proposal: validatedProposal.data, otherDiagrams: {}, prompt };
        let result;

        switch (diagramToGenerate) {
            case 'useCase': result = await generateUseCaseDiagram(agentInput); break;
            case 'class': result = await generateClassDiagram(agentInput); break;
            case 'sequence': result = await generateSequenceDiagram(agentInput); break;
            case 'activity': result = await generateActivityDiagram(agentInput); break;
            case 'component': result = await generateComponentDiagram(agentInput); break;
            case 'archimate': result = await generateArchimateDiagram(agentInput); break;
            default: return { ...prevState, error: 'نوع المخطط المطلوب غير معروف.' };
        }

        const imageUrl = await getPlantUmlImageUrl(result.plantUmlCode);
        const newDiagrams = { 
            ...prevState.diagrams, 
            [diagramToGenerate]: { plantUmlCode: result.plantUmlCode, imageUrl } 
        };

        return { 
            ...prevState,
            diagrams: newDiagrams, 
            lastGenerated: diagramToGenerate, 
            error: undefined 
        };
    }
    
    return { ...prevState, error: 'حدث خطأ غير متوقع.' };

  } catch (e) {
    console.error(e);
    return { ...prevState, error: `حدث خطأ أثناء توليد '${itemToGenerate}'. يرجى المحاولة مرة أخرى.` };
  }
}
