/**
 * Dynamic Flow System - Example Usage
 * 
 * This file demonstrates how to use the dynamic flow system
 */

import { createEnhancedExecutor } from './executor';
import type { FlowConfiguration } from '../../lib/models/flow-config';
import { z } from 'zod';

// ============================================================================
// Example 1: Simple Content Generation Flow
// ============================================================================

export async function exampleSimpleFlow() {
  console.log('🚀 Example 1: Simple Content Generation Flow\n');

  const flowConfig: FlowConfiguration = {
    id: 'example_simple',
    name: 'simple-content-generation',
    description: 'Generate content about a topic',
    version: '1.0.0',
    tags: ['example', 'content-generation'],
    status: 'active' as any,
    
    // Define input schema
    inputSchema: z.object({
      topic: z.string(),
      tone: z.string().optional()
    }),
    
    // Define output schema
    outputSchema: z.object({
      content: z.string()
    }),
    
    // Define flow steps
    steps: [
      {
        id: 'step_1',
        name: 'Generate Content',
        type: 'prompt',
        config: {
          prompt: `You are a professional content writer.

Topic: {{input.topic}}
Tone: {{input.tone}}

Write a comprehensive article about this topic.`,
          model: 'gemini-2.0-flash-exp',
          temperature: 0.7,
          maxTokens: 1000
        },
        contextMapping: {
          output: {
            '': 'content'
          }
        }
      }
    ],
    
    // Map context variables to output
    outputMapping: {
      content: 'content'
    },
    
    config: {},
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Create executor
  const executor = createEnhancedExecutor();
  
  // Execute flow
  const result = await executor.execute(flowConfig, {
    topic: 'Artificial Intelligence',
    tone: 'professional'
  });

  console.log('✅ Flow executed successfully!');
  console.log('📊 Metrics:', result.metrics);
  console.log('⏱️  Duration:', result.duration, 'ms');
  console.log('📄 Output:', result.output?.content?.substring(0, 200) + '...\n');
}

// ============================================================================
// Example 2: Multi-Step Flow with Context Passing
// ============================================================================

export async function exampleMultiStepFlow() {
  console.log('🚀 Example 2: Multi-Step Flow with Context Passing\n');

  const flowConfig: FlowConfiguration = {
    id: 'example_multistep',
    name: 'research-and-write',
    description: 'Research a topic and write about it',
    version: '1.0.0',
    tags: ['example', 'multi-step'],
    status: 'active' as any,
    
    inputSchema: z.object({
      query: z.string()
    }),
    
    outputSchema: z.object({
      research: z.string(),
      article: z.string()
    }),
    
    steps: [
      {
        id: 'step_1',
        name: 'Research Topic',
        type: 'prompt',
        config: {
          prompt: `Research the following query and provide key findings:

Query: {{input.query}}

Provide 3-5 key points with brief explanations.`,
          model: 'gemini-2.0-flash-exp',
          temperature: 0.3
        },
        contextMapping: {
          output: {
            '': 'researchFindings'
          }
        }
      },
      {
        id: 'step_2',
        name: 'Write Article',
        type: 'prompt',
        config: {
          prompt: `Based on the following research, write a comprehensive article:

Research Findings:
{{researchFindings}}

Create an engaging article that covers all the key points.`,
          model: 'gemini-2.0-flash-exp',
          temperature: 0.7
        },
        contextMapping: {
          output: {
            '': 'finalArticle'
          }
        }
      }
    ],
    
    outputMapping: {
      research: 'researchFindings',
      article: 'finalArticle'
    },
    
    config: {},
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const executor = createEnhancedExecutor();
  const result = await executor.execute(flowConfig, {
    query: 'What are the benefits of AI in healthcare?'
  });

  console.log('✅ Multi-step flow executed!');
  console.log('📊 Metrics:', result.metrics);
  console.log('🔍 Research:', result.output?.research?.substring(0, 150) + '...');
  console.log('📝 Article:', result.output?.article?.substring(0, 150) + '...\n');
}

// ============================================================================
// Example 3: Conditional Flow with Branching
// ============================================================================

export async function exampleConditionalFlow() {
  console.log('🚀 Example 3: Conditional Flow with Branching\n');

  const flowConfig: FlowConfiguration = {
    id: 'example_conditional',
    name: 'user-specific-response',
    description: 'Generate response based on user type',
    version: '1.0.0',
    tags: ['example', 'conditional'],
    status: 'active' as any,
    
    inputSchema: z.object({
      userType: z.enum(['free', 'premium', 'enterprise']),
      question: z.string()
    }),
    
    outputSchema: z.object({
      response: z.string()
    }),
    
    steps: [
      {
        id: 'step_free',
        name: 'Free User Response',
        type: 'prompt',
        config: {
          prompt: `Provide a basic response to: {{input.question}}

Keep it concise (max 100 words).`,
          model: 'gemini-2.0-flash-exp'
        },
        condition: {
          expression: 'input.userType === "free"'
        },
        contextMapping: {
          output: { '': 'response' }
        }
      },
      {
        id: 'step_premium',
        name: 'Premium User Response',
        type: 'prompt',
        config: {
          prompt: `Provide a detailed response to: {{input.question}}

Include examples and best practices (max 300 words).`,
          model: 'gemini-2.0-flash-exp'
        },
        condition: {
          expression: 'input.userType === "premium"'
        },
        contextMapping: {
          output: { '': 'response' }
        }
      },
      {
        id: 'step_enterprise',
        name: 'Enterprise User Response',
        type: 'prompt',
        config: {
          prompt: `Provide a comprehensive response to: {{input.question}}

Include detailed analysis, examples, code samples, and references.`,
          model: 'gemini-2.0-flash-exp'
        },
        condition: {
          expression: 'input.userType === "enterprise"'
        },
        contextMapping: {
          output: { '': 'response' }
        }
      }
    ],
    
    outputMapping: {
      response: 'response'
    },
    
    config: {},
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const executor = createEnhancedExecutor();
  
  // Test with different user types
  for (const userType of ['free', 'premium', 'enterprise'] as const) {
    const result = await executor.execute(flowConfig, {
      userType,
      question: 'How do I implement authentication?'
    });

    console.log(`✅ ${userType} user response generated`);
    console.log(`📊 Executed steps: ${result.metrics.successfulSteps}`);
    console.log(`⏭️  Skipped steps: ${result.metrics.skippedSteps}\n`);
  }
}

// ============================================================================
// Example 4: Error Handling with Retry
// ============================================================================

export async function exampleErrorHandling() {
  console.log('🚀 Example 4: Error Handling with Retry\n');

  const flowConfig: FlowConfiguration = {
    id: 'example_retry',
    name: 'resilient-generation',
    description: 'Generate with retry logic',
    version: '1.0.0',
    tags: ['example', 'error-handling'],
    status: 'active' as any,
    
    inputSchema: z.object({
      prompt: z.string()
    }),
    
    outputSchema: z.object({
      result: z.string()
    }),
    
    steps: [
      {
        id: 'step_1',
        name: 'Generate with Retry',
        type: 'prompt',
        config: {
          prompt: '{{input.prompt}}',
          model: 'gemini-2.0-flash-exp'
        },
        errorHandling: {
          retries: 3,
          continueOnError: false
        },
        contextMapping: {
          output: { '': 'result' }
        }
      }
    ],
    
    outputMapping: {
      result: 'result'
    },
    
    config: {},
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const executor = createEnhancedExecutor();
  const result = await executor.execute(flowConfig, {
    prompt: 'Explain quantum computing in simple terms'
  });

  console.log('✅ Flow with retry executed');
  console.log('📊 Metrics:', result.metrics);
}

// ============================================================================
// Run Examples
// ============================================================================

export async function runAllExamples() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('    Dynamic Flow System - Usage Examples');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    await exampleSimpleFlow();
    await exampleMultiStepFlow();
    await exampleConditionalFlow();
    await exampleErrorHandling();

    console.log('═══════════════════════════════════════════════════════');
    console.log('✨ All examples completed successfully!');
    console.log('═══════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('❌ Error running examples:', error);
  }
}

// Run if executed directly
if (require.main === module) {
  runAllExamples();
}
