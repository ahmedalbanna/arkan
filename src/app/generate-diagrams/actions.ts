'use server';

import { z } from 'zod';
import { ProjectProposalSchema, type ProjectProposal, DiagramTypeSchema, type DiagramType } from '@/ai/schemas';

import { generateUseCaseDiagram } from '@/ai/flows/generate-use-case-diagram';
import { generateClassDiagram } from '@/ai/flows/generate-class-diagram';
import { generateSequenceDiagram } from '@/ai/flows/generate-sequence-diagram';
import { generateActivityDiagram } from '@/ai/flows/generate-activity-diagram';
import { generateComponentDiagram } from '@/ai/flows/generate-component-diagram';
import { generateArchimateDiagram } from '@/ai/flows/generate-archimate-diagram';
import { deflateSync } from 'zlib';

export interface DiagramState {
  plantUmlCodes?: Partial<Record<DiagramType, string>>;
  currentPlantUmlCode?: string;
  imageUrl?: string;
  error?: string;
  lastGenerated?: DiagramType;
}

const GenerateDiagramSchema = z.object({
  proposalJson: z.string().min(1, 'يرجى لصق محتوى مقترح المشروع.'),
  diagramToGenerate: DiagramTypeSchema,
});

// Encodes raw DEFLATE-compressed data using a specific Base64-like alphabet for PlantUML.
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


export async function handleGenerateDiagram(
  prevState: DiagramState,
  formData: FormData
): Promise<DiagramState> {
  const formAction = formData.get('formAction');

  if (formAction === 'render') {
    const plantUmlCode = formData.get('plantUmlCode') as string;
    const diagramType = formData.get('diagramType') as DiagramType;

    if (!plantUmlCode) {
      return { ...prevState, error: 'لا يوجد كود لعرضه.' };
    }
    try {
      const imageUrl = await getPlantUmlImageUrl(plantUmlCode);
      const newPlantUmlCodes = { ...prevState.plantUmlCodes, [diagramType]: plantUmlCode };

      return { 
        plantUmlCodes: newPlantUmlCodes,
        currentPlantUmlCode: plantUmlCode, 
        imageUrl, 
        lastGenerated: diagramType, 
        error: undefined 
      };
    } catch (e) {
      console.error(e);
      const plantUmlCodes = { ...prevState.plantUmlCodes, [diagramType]: plantUmlCode };
      return { ...prevState, plantUmlCodes, currentPlantUmlCode: plantUmlCode, error: `حدث خطأ أثناء عرض المخطط. تأكد من صحة الكود.` };
    }
  }


  const validatedFields = GenerateDiagramSchema.safeParse({
    proposalJson: formData.get('proposalJson'),
    diagramToGenerate: formData.get('diagramToGenerate'),
  });

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    return {
      ...prevState,
      error: errors.proposalJson?.[0] || errors.diagramToGenerate?.[0],
    };
  }
  
  const { proposalJson, diagramToGenerate } = validatedFields.data;
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

  const otherDiagrams: Partial<Record<DiagramType, string>> = {};
  DiagramTypeSchema.options.forEach((type) => {
    if (type !== diagramToGenerate) {
        const code = formData.get(`plantUmlCode_${type}`) as string | null;
        if (code) {
            otherDiagrams[type] = code;
        }
    }
  });
  
  const prompt = formData.get(`prompt_${diagramToGenerate}`) as string | null;
  if (!prompt) {
    return { ...prevState, error: `لم يتم العثور على موجه للأمر لنوع المخطط '${diagramToGenerate}'.` };
  }

  const agentInput = {
      proposal: validatedProposal.data,
      otherDiagrams,
      prompt
  };

  try {
    let result;
    switch (diagramToGenerate) {
      case 'useCase':
        result = await generateUseCaseDiagram(agentInput);
        break;
      case 'class':
        result = await generateClassDiagram(agentInput);
        break;
      case 'sequence':
        result = await generateSequenceDiagram(agentInput);
        break;
      case 'activity':
        result = await generateActivityDiagram(agentInput);
        break;
      case 'component':
        result = await generateComponentDiagram(agentInput);
        break;
      case 'archimate':
        result = await generateArchimateDiagram(agentInput);
        break;
      default:
        return { ...prevState, error: 'نوع المخطط المطلوب غير معروف.' };
    }

    const imageUrl = await getPlantUmlImageUrl(result.plantUmlCode);
    const newPlantUmlCodes = { ...prevState.plantUmlCodes, [diagramToGenerate]: result.plantUmlCode };

    return { 
        plantUmlCodes: newPlantUmlCodes, 
        currentPlantUmlCode: result.plantUmlCode, 
        imageUrl, 
        lastGenerated: diagramToGenerate, 
        error: undefined 
    };

  } catch (e) {
    console.error(e);
    return { ...prevState, error: `حدث خطأ أثناء توليد مخطط '${diagramToGenerate}'. يرجى المحاولة مرة أخرى.` };
  }
}
