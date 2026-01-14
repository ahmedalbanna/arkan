#!/usr/bin/env tsx
/**
 * Generate Phase 1 Flow Configurations
 * 
 * Generates dynamic flow configurations for all Phase 1 flows
 * (Simple Text Generation - 15 flows total, 10 remaining after pilot)
 */

import * as fs from 'fs';
import * as path from 'path';

interface FlowTemplate {
  name: string;
  description: string;
  category: string;
  tags: string[];
  inputSchema: any;
  outputSchema: any;
  steps: any[];
}

const phase1Configs: FlowTemplate[] = [
  // Already done in pilot: generate-text, paraphrase-text, summarize-text, translate-text, generate-ideas
  
  {
    name: "humanize-text",
    description: "Makes AI-generated text sound more human-like and natural",
    category: "text-transformation",
    tags: ["humanize", "natural", "ai-detection", "writing"],
    inputSchema: {
      type: "object",
      properties: {
        text: { type: "string", description: "The text to humanize" }
      },
      required: ["text"]
    },
    outputSchema: {
      type: "object",
      properties: {
        humanizedText: { type: "string", description: "The humanized text" }
      },
      required: ["humanizedText"]
    },
    steps: [
      {
        id: "step_1",
        name: "Humanize Text",
        type: "generate",
        config: {
          model: "gemini-2.0-flash-exp",
          temperature: 0.95,
          maxTokens: 4096,
          systemPrompt: "You are a world-class editor and ghostwriter. Transform robotic, AI-generated text into prose that is indistinguishable from authentic, high-quality human writing.\n\nOutput ONLY the humanized text. Do NOT wrap it in JSON or any other format.\n\nFocus on:\n- Create natural rhythm with varied sentence lengths\n- Establish authentic voice\n- Diversify vocabulary and phrasing\n- Break predictable structures\n- Incorporate natural cadence with contractions\n- Preserve core meaning and formatting",
          userPromptTemplate: "**Original AI Text:**\n{{text}}",
          outputKey: "humanizedText"
        },
        outputMapping: {
          humanizedText: "{{humanizedText}}"
        }
      }
    ]
  },
  
  {
    name: "manipulate-text",
    description: "Performs various text manipulation operations",
    category: "text-transformation",
    tags: ["manipulate", "transform", "edit"],
    inputSchema: {
      type: "object",
      properties: {
        text: { type: "string", description: "The text to manipulate" },
        operation: { type: "string", description: "The manipulation operation" }
      },
      required: ["text", "operation"]
    },
    outputSchema: {
      type: "object",
      properties: {
        manipulatedText: { type: "string", description: "The manipulated text" }
      },
      required: ["manipulatedText"]
    },
    steps: [
      {
        id: "step_1",
        name: "Manipulate Text",
        type: "generate",
        config: {
          model: "gemini-2.0-flash-exp",
          temperature: 0.7,
          maxTokens: 2048,
          systemPrompt: "You are a text manipulation expert. Perform the requested operation on the text.\n\nOutput ONLY the manipulated text. Do NOT wrap it in JSON or any other format.",
          userPromptTemplate: "**Operation:** {{operation}}\n\n**Text:**\n{{text}}",
          outputKey: "manipulatedText"
        },
        outputMapping: {
          manipulatedText: "{{manipulatedText}}"
        }
      }
    ]
  },
  
  {
    name: "topic-explainer",
    description: "Breaks down complex topics into simple, easy-to-understand explanations",
    category: "education",
    tags: ["explain", "teach", "simplify", "education"],
    inputSchema: {
      type: "object",
      properties: {
        topic: { type: "string", description: "The topic to explain" }
      },
      required: ["topic"]
    },
    outputSchema: {
      type: "object",
      properties: {
        markdown: { type: "string", description: "The explanation in markdown format" }
      },
      required: ["markdown"]
    },
    steps: [
      {
        id: "step_1",
        name: "Explain Topic",
        type: "generate",
        config: {
          model: "gemini-2.0-flash-exp",
          temperature: 0.6,
          maxTokens: 4096,
          outputFormat: "json",
          systemPrompt: "You are an expert educator who excels at breaking down complex topics into simple explanations.\n\nGuidelines:\n- Use analogies and simple language\n- Avoid jargon or explain it clearly\n- Be comprehensive (3-4 paragraphs)\n- Structure logically with headings\n- Keep tone engaging\n- Format in Markdown\n\nOutput must be valid JSON with a 'markdown' field.",
          userPromptTemplate: "**Topic to Explain:**\n---\n{{topic}}\n---",
          outputKey: "result"
        }
      },
      {
        id: "step_2",
        name: "Extract Markdown",
        type: "format",
        config: {
          operation: "extract",
          field: "markdown",
          inputKey: "result",
          outputKey: "markdown"
        },
        outputMapping: {
          markdown: "{{markdown}}"
        }
      }
    ]
  },
  
  {
    name: "generate-toc",
    description: "Generates a table of contents from markdown headings",
    category: "document-generation",
    tags: ["toc", "table-of-contents", "navigation"],
    inputSchema: {
      type: "object",
      properties: {
        markdown: { type: "string", description: "Markdown content to generate TOC from" }
      },
      required: ["markdown"]
    },
    outputSchema: {
      type: "object",
      properties: {
        toc: { type: "string", description: "Generated table of contents" }
      },
      required: ["toc"]
    },
    steps: [
      {
        id: "step_1",
        name: "Generate TOC",
        type: "generate",
        config: {
          model: "gemini-2.0-flash-exp",
          temperature: 0.3,
          maxTokens: 2048,
          systemPrompt: "You are a document structuring expert. Generate a clean, well-formatted table of contents from the provided markdown.\n\nOutput ONLY the table of contents in markdown format. Do NOT wrap it in JSON.",
          userPromptTemplate: "**Markdown Content:**\n---\n{{markdown}}\n---",
          outputKey: "toc"
        },
        outputMapping: {
          toc: "{{toc}}"
        }
      }
    ]
  },
  
  {
    name: "generate-citation",
    description: "Generates proper academic citations in various formats",
    category: "academic",
    tags: ["citation", "reference", "academic", "bibliography"],
    inputSchema: {
      type: "object",
      properties: {
        source: { type: "string", description: "Source information" },
        format: { type: "string", description: "Citation format (APA, MLA, Chicago, etc.)" }
      },
      required: ["source", "format"]
    },
    outputSchema: {
      type: "object",
      properties: {
        citation: { type: "string", description: "Formatted citation" }
      },
      required: ["citation"]
    },
    steps: [
      {
        id: "step_1",
        name: "Generate Citation",
        type: "generate",
        config: {
          model: "gemini-2.0-flash-exp",
          temperature: 0.2,
          maxTokens: 1024,
          systemPrompt: "You are an academic citation expert. Generate a properly formatted citation in the requested format.\n\nOutput ONLY the citation text. Do NOT wrap it in JSON or any other format.",
          userPromptTemplate: "**Format:** {{format}}\n\n**Source Information:**\n{{source}}",
          outputKey: "citation"
        },
        outputMapping: {
          citation: "{{citation}}"
        }
      }
    ]
  },
  
  {
    name: "generate-ui-description",
    description: "Generates detailed UI component descriptions for developers",
    category: "development",
    tags: ["ui", "description", "frontend", "development"],
    inputSchema: {
      type: "object",
      properties: {
        componentName: { type: "string", description: "Name of the UI component" },
        requirements: { type: "string", description: "Component requirements" }
      },
      required: ["componentName", "requirements"]
    },
    outputSchema: {
      type: "object",
      properties: {
        description: { type: "string", description: "UI component description" }
      },
      required: ["description"]
    },
    steps: [
      {
        id: "step_1",
        name: "Generate UI Description",
        type: "generate",
        config: {
          model: "gemini-2.0-flash-exp",
          temperature: 0.7,
          maxTokens: 2048,
          systemPrompt: "You are a UI/UX expert. Generate a detailed description of a UI component for developers.\n\nOutput ONLY the description. Do NOT wrap it in JSON.",
          userPromptTemplate: "**Component Name:** {{componentName}}\n\n**Requirements:**\n{{requirements}}",
          outputKey: "description"
        },
        outputMapping: {
          description: "{{description}}"
        }
      }
    ]
  }
];

async function generatePhase1Configs(): Promise<void> {
  console.log('🔧 Generating Phase 1 Flow Configurations\n');

  const phase1Dir = path.join(process.cwd(), 'migration-configs/phase1');
  if (!fs.existsSync(phase1Dir)) {
    fs.mkdirSync(phase1Dir, { recursive: true });
  }

  console.log(`📋 Generating ${phase1Configs.length} configurations\n`);

  let successCount = 0;
  let failedCount = 0;

  for (const template of phase1Configs) {
    console.log(`\n📄 Generating: ${template.name}`);

    try {
      const config = {
        ...template,
        version: 1,
        isActive: true,
        metadata: {
          migrationDate: new Date().toISOString(),
          sourceFile: `src/ai/flows/${template.name}.ts`,
          migrationType: "phase1",
          originalComplexity: "simple"
        }
      };

      const outputPath = path.join(phase1Dir, `${template.name}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(config, null, 2));

      console.log(`  ✅ Created: ${outputPath}`);
      console.log(`  📊 Steps: ${config.steps.length}`);
      successCount++;

    } catch (error) {
      console.error(`  ❌ Failed:`, error);
      failedCount++;
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('📊 GENERATION SUMMARY');
  console.log('='.repeat(80));
  console.log(`\nTotal: ${phase1Configs.length}`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failedCount}`);
  console.log('\n' + '='.repeat(80) + '\n');
}

// Main execution
async function main() {
  try {
    await generatePhase1Configs();
    console.log('✅ Phase 1 configurations generated!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Generation failed:', error);
    process.exit(1);
  }
}

main();
