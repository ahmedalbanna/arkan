/**
 * @fileOverview Advanced AI Prompt Architect Tool
 *
 * A sophisticated tool for generating system instructions and user prompts
 * for LLMs based on detailed project parameters and technical constraints.
 */

import type { Genkit } from 'genkit';
import {
  GeneratedPromptSchema,
  ProjectDataSchema,
  type GeneratedPrompt,
  type ProjectData,
} from '@/ai/schemas/project-documentation';
import { z } from 'zod';

// ==================== PROMPT GENERATION LOGIC ====================

/**
 * Generates sophisticated system instructions and user prompts
 * based on project data and requirements
 */
function generatePrompt(data: ProjectData): GeneratedPrompt {
  const systemParts: string[] = [];

  // 1. Advanced Identity Protocol (بروتوكول الهوية المتقدم)
  const behaviorsStr = data.behaviors.length > 0
    ? ` \n- ${data.behaviors.join('\n- ')}`
    : 'Professional Subject Matter Expert';

  systemParts.push(`[IDENTITY_PROTOCOL]
You are a ${data.seniorityLevel} in the field of ${data.specialization || 'Professional Consulting'}.
Operational Role: You are not just a chatbot; you are a high-level advisor with the following behaviors:${behaviorsStr}
Quality Mandate: Your work must reflect the depth expected from someone with 10+ years of experience in ${data.specialization || 'the field'}.`);

  // 2. Analytical Protocol (بروتوكول التفكير والتحليل)
  const analysisDepthMap = {
    'Surface': 'Provide quick, high-level summaries without deep technical jargon.',
    'Comprehensive': 'Deliver balanced insights covering both breadth and depth.',
    'Deep-Dive': 'Explore nuances, edge cases, and historical/theoretical foundations of every concept mentioned.',
    'Atomic/Extremely Detailed': 'Deconstruct every component to its smallest parts. No detail is too small to be analyzed.'
  };

  const reasoningMap = {
    'Standard': 'Provide direct analytical responses.',
    'Chain of Thought': 'Articulate your internal reasoning process step-by-step before arriving at the conclusion.',
    'Step-by-Step': 'Guide the user through the logic incrementally.',
    'First Principles': 'Strip away assumptions and rebuild the logic from fundamental truths.',
    'Socratic': 'Lead the user to the answer through insightful questioning.'
  };

  systemParts.push(`[COGNITIVE_FRAMEWORK]
Analysis Depth: ${data.analysisDepth} (${analysisDepthMap[data.analysisDepth]})
Reasoning Mode: ${data.reasoningFramework} (${reasoningMap[data.reasoningFramework]})
${data.logicalFallacyCheck ? 'Strict Mandate: Audit your response for logical fallacies (e.g., circular reasoning, straw man, false dilemma) before finalizing output.' : ''}`);

  // 3. Communication Protocol (أسلوب التواصل)
  const styleMap = {
    'Direct': 'Concise, action-oriented, and devoid of fluff.',
    'Narrative': 'Story-driven, engaging, and flows like a professional discourse.',
    'Technical': 'Heavy on precision, industry terminology, and data-driven insights.',
    'Persuasive': 'Focused on logic-driven persuasion, addressing counter-arguments, and building a solid case.'
  };

  systemParts.push(`[COMMUNICATION_STANDARDS]
- Primary Style: ${styleMap[data.communicationStyle]}
- Formality: ${data.formality}
- Tone: ${data.tone}
- Language: ${data.language}
- Audience Compatibility: Tailor all concepts for an "${data.audienceLevel}" level.`);

  // 4. Tool and Library Protocol (بروتوكول الأدوات والمكتبات)
  if (data.toolLibraryGuidance) {
    systemParts.push(`[TOOL_AND_LIBRARY_PROTOCOL]
When generating technical solutions or citations:
${data.toolLibraryGuidance}`);
  }

  // 5. Knowledge Management (معالجة المعرفة والتحقق)
  const knowledgeMap = {
    'Standard': 'Provide accurate information based on training data. Acknowledge uncertainty when appropriate.',
    'Strict (No Hallucination)': 'CRITICAL: Only state facts you are certain about. If unsure, explicitly say "I don\'t have confirmed information about this." Never make up data, statistics, or references.',
    'Creative Synthesis': 'Combine knowledge from multiple domains to generate innovative solutions. Clearly distinguish between established facts and creative hypotheses.'
  };

  systemParts.push(`[KNOWLEDGE_MANAGEMENT]
Mode: ${data.knowledgeHandling}
${knowledgeMap[data.knowledgeHandling]}`);

  if (data.outputVerification) {
    systemParts.push(`[QUALITY_ASSURANCE]
Perform a post-generation self-audit:
1. Did the output violate any "PROHIBITED" constraints?
2. Does the output meet the defined "SUCCESS METRICS"?
3. Is the complexity level at precisely ${data.complexity}%?
4. Are all facts verifiable and accurate?
5. Is the tone and style consistent throughout?`);
  }

  // 6. Operational Boundaries (القواعد الصارمة)
  if (data.mandatoryRules.length > 0 || data.constraints.length > 0) {
    let constraintsSection = '[OPERATIONAL_BOUNDARIES]\n';
    if (data.mandatoryRules.length > 0) {
      constraintsSection += `MUST ADHERE TO:\n${data.mandatoryRules.map(r => `✓ ${r}`).join('\n')}\n`;
    }
    if (data.constraints.length > 0) {
      constraintsSection += `STRICTLY AVOID:\n${data.constraints.map(c => `✗ ${c}`).join('\n')}`;
    }
    systemParts.push(constraintsSection);
  }

  // --- Build User Prompt (بناء برومبت المستخدم) ---
  const userParts: string[] = [];

  userParts.push(`## TASK OVERVIEW: ${data.projectName || 'New Document Generation'}`);
  userParts.push(`Generate a ${data.documentType || 'comprehensive output'} for: ${data.projectDescription || 'user requirements'}.`);

  if (data.projectUrl) {
    userParts.push(`Reference URL for context: ${data.projectUrl}`);
  }

  if (data.projectPath) {
    userParts.push(`Project Path: ${data.projectPath}`);
  }

  if (data.includedTopics) {
    userParts.push(`\n## MANDATORY TOPICS:`);
    userParts.push(data.includedTopics.split('\n').map(t => `- ${t.trim()}`).filter(t => t !== '-').join('\n'));
  }

  userParts.push(`\n## OUTPUT SPECIFICATIONS:`);
  data.outputFormats.forEach(format => {
    switch (format) {
      case 'heading':
        userParts.push(`- Use semantic Markdown headers (H1-H6).`);
        break;
      case 'paragraph':
        userParts.push(`- Professional ${data.communicationStyle} paragraphs.`);
        break;
      case 'list':
        userParts.push(`- Structured lists for key insights (bullet or numbered).`);
        break;
      case 'table':
        userParts.push(`- Data tables${data.tableCaption ? ` titled "${data.tableCaption}"` : ''} in markdown format.`);
        break;
      case 'code':
        userParts.push(`- ${data.programmingLanguage || 'Code'} examples following clean architecture principles.`);
        break;
      case 'diagram':
        userParts.push(`- Mermaid.js ${data.diagramType || 'diagram'} for visual representation.`);
        break;
      case 'math':
        userParts.push(`- Precise LaTeX formulas for mathematical expressions.`);
        break;
      case 'citation':
        userParts.push(`- Full ${data.citationStyle || 'academic'} citations with proper formatting.`);
        break;
    }
  });

  if (data.successCriteria) {
    userParts.push(`\n## SUCCESS CRITERIA:\nThe response is successful IF: ${data.successCriteria}`);
  }

  if (data.wordCount) {
    userParts.push(`\n## SCOPE:\nTarget length: approximately ${data.wordCount}`);
  }

  if (data.customGuidelines) {
    userParts.push(`\n## CUSTOM GUIDELINES:\n${data.customGuidelines}`);
  }

  const timestamp = new Date().toISOString();

  return {
    systemInstructions: systemParts.join('\n\n'),
    userPrompt: userParts.join('\n'),
    metadata: {
      generatedAt: timestamp,
      version: '2.0.0',
      estimatedTokens: Math.floor((systemParts.join('').length + userParts.join('').length) / 4),
    },
  };
}

// ==================== GENKIT TOOL DEFINITION ====================

/**
 * Factory function to create prompt architect tools
 * @param ai - The Genkit AI instance
 * @returns Object containing all prompt architect tools
 */
export function createPromptArchitectTools(ai: Genkit) {
  const advancedPromptArchitectTool = ai.defineTool(
  {
    name: 'advancedPromptArchitect',
    description: `Advanced AI Prompt Architect - Generates sophisticated system instructions and user prompts for LLMs.

    This meta-tool creates highly customized prompts based on:
    - Project requirements and context
    - Target audience and expertise level
    - Desired tone, style, and formality
    - Output format specifications
    - Reasoning frameworks and cognitive approaches
    - Quality assurance requirements

    Use this when you need to:
    - Generate custom prompts for specific documentation tasks
    - Create specialized AI instructions for technical writing
    - Define complex behavioral parameters for AI agents
    - Ensure consistent quality and style across generated content

    The tool follows a sophisticated protocol-based approach with:
    - Identity Protocol (who the AI should be)
    - Cognitive Framework (how to think and reason)
    - Communication Standards (how to express ideas)
    - Tool/Library Guidance (technical constraints)
    - Knowledge Management (fact-checking approach)
    - Quality Assurance (verification steps)
    - Operational Boundaries (rules and constraints)`,
    inputSchema: ProjectDataSchema,
    outputSchema: GeneratedPromptSchema,
  },
  async (input) => {
    // Use the generatePrompt function to create the prompt
    return generatePrompt(input);
  }
);

  // Return all tools
  return {
    advancedPromptArchitect: advancedPromptArchitectTool,
  };
}

// Export for use in flows
export { generatePrompt };
export let advancedPromptArchitectTool: ReturnType<typeof createPromptArchitectTools>['advancedPromptArchitect'];
export let promptArchitectTools: ReturnType<typeof createPromptArchitectTools>;
