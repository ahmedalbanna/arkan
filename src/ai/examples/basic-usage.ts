/**
 * Basic Usage Examples
 * 
 * Simple examples demonstrating the most common use cases
 * for the model selection and management utilities.
 */

import {
  selectModel,
  executeWithQueue,
  generateRequestId,
  TaskComplexity,
  PerformancePriority,
  RequestPriority,
} from '@/ai';

// ============================================================================
// Example 1: Simple Model Selection
// ============================================================================

export async function example1_simpleSelection() {
  console.log('Example 1: Simple Model Selection\n');

  // Select model by task complexity
  const fastModel = selectModel({ taskComplexity: TaskComplexity.SIMPLE });
  console.log(`Simple task → ${fastModel}`);

  const moderateModel = selectModel({ taskComplexity: TaskComplexity.MODERATE });
  console.log(`Moderate task → ${moderateModel}`);

  const complexModel = selectModel({ taskComplexity: TaskComplexity.COMPLEX });
  console.log(`Complex task → ${complexModel}\n`);
}

// ============================================================================
// Example 2: Task-Specific Selection
// ============================================================================

export async function example2_taskSpecificSelection() {
  console.log('Example 2: Task-Specific Selection\n');

  // Grammar checking - needs analysis
  const grammarModel = selectModel({
    flowName: 'grammar-checker',
    requiresStructuredOutput: true,
  });
  console.log(`Grammar checking → ${grammarModel}`);

  // Academic paper - needs quality
  const academicModel = selectModel({
    isAcademic: true,
    hasRAGContext: true,
    requiresDeepReasoning: true,
  });
  console.log(`Academic paper → ${academicModel}`);

  // Simple text generation - needs speed
  const textGenModel = selectModel({
    performancePriority: PerformancePriority.SPEED,
  });
  console.log(`Text generation → ${textGenModel}\n`);
}

// ============================================================================
// Example 3: Queue-Managed Execution
// ============================================================================

export async function example3_queuedExecution() {
  console.log('Example 3: Queue-Managed Execution\n');

  const model = 'ollama/llama3:8b'; // High-memory model
  const requestId = generateRequestId();

  try {
    const result = await executeWithQueue(
      requestId,
      model,
      'graduation-project-generator',
      async () => {
        // Simulate AI operation
        console.log('Processing request...');
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return { text: 'Generated content' };
      },
      {
        priority: RequestPriority.HIGH,
        timeout: 30000,
      }
    );

    console.log('Result:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

// ============================================================================
// Example 4: Performance-Based Selection
// ============================================================================

export async function example4_performanceSelection() {
  console.log('Example 4: Performance-Based Selection\n');

  // User needs fast response (chat-like interaction)
  const speedModel = selectModel({
    performancePriority: PerformancePriority.SPEED,
  });
  console.log(`Speed priority → ${speedModel}`);

  // User needs balanced (default use case)
  const balancedModel = selectModel({
    performancePriority: PerformancePriority.BALANCED,
  });
  console.log(`Balanced priority → ${balancedModel}`);

  // User needs best quality (final output)
  const qualityModel = selectModel({
    performancePriority: PerformancePriority.QUALITY,
  });
  console.log(`Quality priority → ${qualityModel}\n`);
}

// ============================================================================
// Example 5: Input Size-Based Selection
// ============================================================================

export async function example5_sizeBasedSelection() {
  console.log('Example 5: Input Size-Based Selection\n');

  // Small input (few paragraphs)
  const smallModel = selectModel({ inputTokens: 500 });
  console.log(`500 tokens → ${smallModel}`);

  // Medium input (couple pages)
  const mediumModel = selectModel({ inputTokens: 2500 });
  console.log(`2500 tokens → ${mediumModel}`);

  // Large input (long document)
  const largeModel = selectModel({ inputTokens: 5000 });
  console.log(`5000 tokens → ${largeModel}\n`);
}

// ============================================================================
// Run All Examples
// ============================================================================

export async function runAllBasicExamples() {
  console.log('='.repeat(60));
  console.log('BASIC USAGE EXAMPLES');
  console.log('='.repeat(60));
  console.log('\n');

  await example1_simpleSelection();
  await example2_taskSpecificSelection();
  await example3_queuedExecution();
  await example4_performanceSelection();
  await example5_sizeBasedSelection();

  console.log('='.repeat(60));
  console.log('All examples completed!');
  console.log('='.repeat(60));
}

// Uncomment to run:
// runAllBasicExamples();
