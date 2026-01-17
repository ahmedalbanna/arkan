/**
 * API Route: Generate Step
 * توليد خطوة من خطوات المحتوى الإبداعي
 */

import { NextRequest, NextResponse } from 'next/server';
import { _GenerationStep, StepConfig } from '@/lib/models/creative-content-config';

export async function POST(req: NextRequest) {
  try {
    const { projectId, stepId, config, previousSteps } = await req.json();

    // TODO: Validate user authentication
    // TODO: Get user from session

    // Build context from previous steps
    const context = previousSteps?.map((s: any) => ({
      title: s.id,
      content: s.result?.content || '',
    })) || [];

    // Build prompt based on step type and config
    const prompt = buildPromptForStep(config, context);

    // TODO: Use Dynamic Flow or direct AI generation
    // For now, mock response
    const generatedContent = await generateContent(prompt, config);

    const result = {
      content: generatedContent,
      metadata: {
        stepId,
        projectId,
        config,
      },
      tokensUsed: 1000, // Mock value
      modelUsed: 'gemini-2.0-flash-exp',
      generatedAt: new Date().toISOString(),
      version: 1,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating step:', error);
    return NextResponse.json(
      { error: 'Failed to generate step' },
      { status: 500 }
    );
  }
}

function buildPromptForStep(config: StepConfig, context: any[]): string {
  let prompt = '';

  // Add context from previous steps
  if (context.length > 0) {
    prompt += 'السياق من الخطوات السابقة:\n\n';
    context.forEach((ctx) => {
      prompt += `${ctx.title}:\n${ctx.content}\n\n`;
    });
    prompt += '---\n\n';
  }

  // Add style instructions
  if (config.tone) {
    prompt += `النبرة: ${config.tone}\n`;
  }
  if (config.style) {
    prompt += `الأسلوب: ${config.style}\n`;
  }
  if (config.perspective) {
    prompt += `منظور السرد: ${config.perspective}\n`;
  }
  if (config.length) {
    prompt += `الطول المستهدف: ${config.length.target} ${config.length.unit}\n`;
  }

  // Add custom instructions
  if (config.customInstructions) {
    prompt += `\nتعليمات إضافية:\n${config.customInstructions}\n`;
  }

  return prompt;
}

async function generateContent(prompt: string, config: StepConfig): Promise<string> {
  // TODO: Implement actual AI generation
  // This is a mock implementation
  
  return `تم توليد المحتوى بنجاح!\n\nالنبرة: ${config.tone || 'افتراضي'}\nالأسلوب: ${config.style || 'افتراضي'}\n\nهذا محتوى تجريبي. سيتم استبداله بمحتوى حقيقي من AI.`;
}
