/**
 * Advanced Usage Examples
 * 
 * Advanced examples demonstrating monitoring, health checks,
 * fallback mechanisms, and production-ready patterns.
 */

import {
  selectModelWithMetadata,
  performanceMonitor,
  queueManager,
  healthMonitor,
  trackRequest,
  executeWithFallback,
  generateRequestId,
  estimateTokenCount,
  chunkText,
  getOptimalChunkSize,
  validateModelConfig,
  isModelHealthy,
  getAvailableModel,
  OLLAMA_MODELS,
  TaskComplexity,
} from '@/ai';

// ============================================================================
// Example 1: Smart Selection with Metadata
// ============================================================================

export async function example1_smartSelection() {
  console.log('Example 1: Smart Selection with Metadata\n');

  const result = selectModelWithMetadata({
    isAcademic: true,
    hasRAGContext: false,
    inputTokens: 3000,
  });

  console.log('Selected Model:', result.model);
  console.log('Reason:', result.reason);
  console.log('Fallback Model:', result.fallbackModel);
  console.log('Warnings:', result.warnings);
  console.log('Characteristics:', result.characteristics);
  console.log('\n');
}

// ============================================================================
// Example 2: Performance Monitoring
// ============================================================================

export async function example2_performanceMonitoring() {
  console.log('Example 2: Performance Monitoring\n');

  const requestId = generateRequestId();
  const model = OLLAMA_MODELS.PHI3_MINI;

  // Track a request
  const result = await trackRequest(
    requestId,
    model,
    'grammar-checker',
    async () => {
      // Simulate operation
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { correctedText: 'Sample output', corrections: [] };
    },
    () => ({ input: 150, output: 200 })
  );

  // Get statistics
  const stats = performanceMonitor.getModelStatistics(model);
  console.log('Model Statistics:');
  console.log(`  Total Requests: ${stats.totalRequests}`);
  console.log(`  Success Rate: ${((stats.successfulRequests / stats.totalRequests) * 100).toFixed(1)}%`);
  console.log(`  Avg Duration: ${stats.averageDuration.toFixed(0)}ms`);
  console.log(`  Error Rate: ${(stats.errorRate * 100).toFixed(1)}%`);
  console.log('\n');

  return result;
}

// ============================================================================
// Example 3: Queue Management
// ============================================================================

export async function example3_queueManagement() {
  console.log('Example 3: Queue Management\n');

  // Get queue statistics
  const stats = queueManager.getAllStats();
  console.log('Queue Status:');
  stats.forEach((stat) => {
    const modelName = stat.model.split('/')[1];
    console.log(`  ${modelName}:`);
    console.log(`    Queued: ${stat.queuedRequests}`);
    console.log(`    Active: ${stat.activeRequests}/${stat.maxConcurrent}`);
    console.log(`    Total Processed: ${stat.totalProcessed}`);
  });
  console.log('\n');

  // Check availability
  const isAvailable = queueManager.isAvailable(OLLAMA_MODELS.LLAMA3_8B);
  console.log(`Llama 3 8B available: ${isAvailable ? '✅' : '❌'}\n`);
}

// ============================================================================
// Example 4: Health Checking
// ============================================================================

export async function example4_healthChecking() {
  console.log('Example 4: Health Checking\n');

  // Check specific model
  const healthy = await isModelHealthy(OLLAMA_MODELS.GEMMA_2B);
  console.log(`Gemma 2B healthy: ${healthy ? '✅' : '❌'}`);

  // Check all models
  const results = await healthMonitor.checkAllModels();
  console.log('\nAll Models Health:');
  results.forEach((result) => {
    const modelName = result.model.split('/')[1];
    const statusEmoji = result.available ? '✅' : '❌';
    console.log(`  ${statusEmoji} ${modelName}: ${result.status} (${result.responseTime || 'N/A'}ms)`);
  });
  console.log('\n');
}

// ============================================================================
// Example 5: Automatic Fallback
// ============================================================================

export async function example5_automaticFallback() {
  console.log('Example 5: Automatic Fallback\n');

  // Get available model with fallback
  const preferredModel = OLLAMA_MODELS.LLAMA3_8B;
  const model = await getAvailableModel(preferredModel);
  console.log(`Preferred: ${preferredModel}`);
  console.log(`Selected: ${model}`);
  console.log(`Fallback used: ${model !== preferredModel ? '✅' : '❌'}\n`);

  // Execute with automatic fallback
  try {
    const result = await executeWithFallback(
      OLLAMA_MODELS.PHI3_MINI,
      async (selectedModel) => {
        console.log(`Attempting with model: ${selectedModel}`);
        // Simulate operation
        return { success: true, model: selectedModel };
      },
      2 // Max 2 retries
    );
    console.log('Result:', result);
  } catch (error) {
    console.error('All attempts failed:', error);
  }
  console.log('\n');
}

// ============================================================================
// Example 6: Text Chunking for Large Documents
// ============================================================================

export async function example6_textChunking() {
  console.log('Example 6: Text Chunking for Large Documents\n');

  const longText = 'Lorem ipsum dolor sit amet. '.repeat(200); // Long document
  const model = OLLAMA_MODELS.PHI3_MINI;

  // Check token count
  const tokenCount = estimateTokenCount(longText);
  console.log(`Total tokens: ${tokenCount}`);

  // Get optimal chunk size
  const chunkSize = getOptimalChunkSize(model);
  console.log(`Optimal chunk size for ${model}: ${chunkSize} tokens`);

  // Chunk the text
  if (tokenCount > chunkSize) {
    const chunks = chunkText(longText, chunkSize, 100); // 100 token overlap
    console.log(`Split into ${chunks.length} chunks`);
    console.log(`First chunk tokens: ${estimateTokenCount(chunks[0])}`);
    console.log(`Last chunk tokens: ${estimateTokenCount(chunks[chunks.length - 1])}`);
  }
  console.log('\n');
}

// ============================================================================
// Example 7: Configuration Validation
// ============================================================================

export async function example7_configValidation() {
  console.log('Example 7: Configuration Validation\n');

  const model = OLLAMA_MODELS.GEMMA_2B;
  const inputText = 'This is a test. '.repeat(100);

  // Validate configuration
  const validation = validateModelConfig(
    model,
    inputText,
    512, // max output tokens
    0.7  // temperature
  );

  console.log(`Validation Status: ${validation.valid ? '✅ Valid' : '❌ Invalid'}`);

  if (validation.errors.length > 0) {
    console.log('Errors:');
    validation.errors.forEach((error) => console.log(`  - ${error}`));
  }

  if (validation.warnings.length > 0) {
    console.log('Warnings:');
    validation.warnings.forEach((warning) => console.log(`  - ${warning}`));
  }
  console.log('\n');
}

// ============================================================================
// Example 8: Complete Production Flow
// ============================================================================

export async function example8_productionFlow(text: string, flowName: string) {
  console.log('Example 8: Complete Production Flow\n');

  // Step 1: Estimate token count
  const tokenCount = estimateTokenCount(text);
  console.log(`Input tokens: ${tokenCount}`);

  // Step 2: Select appropriate model
  const selection = selectModelWithMetadata({
    flowName,
    taskComplexity: TaskComplexity.MODERATE,
    inputTokens: tokenCount,
    requiresStructuredOutput: true,
  });

  console.log(`Selected model: ${selection.model}`);
  console.log(`Reason: ${selection.reason}`);

  // Step 3: Validate configuration
  const validation = validateModelConfig(selection.model, text, 1024, 0.5);
  if (!validation.valid) {
    throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
  }

  // Step 4: Check model health
  const healthy = await isModelHealthy(selection.model);
  if (!healthy) {
    console.log('⚠️ Primary model unhealthy, using fallback');
    selection.model = await getAvailableModel(selection.model);
  }

  // Step 5: Handle large inputs
  const optimalSize = getOptimalChunkSize(selection.model);
  let processedChunks = [text];

  if (tokenCount > optimalSize) {
    console.log(`⚠️ Input too large, chunking into smaller pieces`);
    processedChunks = chunkText(text, optimalSize, 100);
    console.log(`Created ${processedChunks.length} chunks`);
  }

  // Step 6: Process with queue and tracking
  const requestId = generateRequestId();
  
  const result = await trackRequest(
    requestId,
    selection.model,
    flowName,
    async () => {
      // Simulate processing
      console.log('Processing...');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { success: true, chunks: processedChunks.length };
    },
    () => ({ input: tokenCount, output: 500 })
  );

  // Step 7: Get performance metrics
  const stats = performanceMonitor.getModelStatistics(selection.model);
  console.log(`\nPerformance: ${stats.averageDuration.toFixed(0)}ms average`);

  return result;
}

// ============================================================================
// Example 9: Monitoring Dashboard
// ============================================================================

export async function example9_monitoringDashboard() {
  console.log('Example 9: Monitoring Dashboard\n');

  // Generate comprehensive reports
  const performanceReport = performanceMonitor.generateReport();
  const queueReport = queueManager.generateReport();
  const healthReport = await healthMonitor.generateHealthReport();

  console.log(healthReport);
  console.log(performanceReport);
  console.log(queueReport);
}

// ============================================================================
// Example 10: Batch Processing with Optimal Model Selection
// ============================================================================

export async function example10_batchProcessing(documents: string[]) {
  console.log('Example 10: Batch Processing\n');

  const results = [];

  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i];
    const tokens = estimateTokenCount(doc);

    // Select model based on document size
    let model;
    if (tokens < 1000) {
      model = OLLAMA_MODELS.GEMMA_2B; // Fast for small docs
    } else if (tokens < 3000) {
      model = OLLAMA_MODELS.PHI3_MINI; // Balanced for medium docs
    } else {
      model = OLLAMA_MODELS.LLAMA3_8B; // Quality for large docs
    }

    console.log(`Document ${i + 1}: ${tokens} tokens → ${model.split('/')[1]}`);

    const requestId = generateRequestId();
    const result = await trackRequest(
      requestId,
      model,
      'batch-processing',
      async () => {
        // Simulate processing
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { processed: true };
      }
    );

    results.push(result);
  }

  console.log(`\nProcessed ${results.length} documents`);
  return results;
}

// ============================================================================
// Run All Advanced Examples
// ============================================================================

export async function runAllAdvancedExamples() {
  console.log('='.repeat(60));
  console.log('ADVANCED USAGE EXAMPLES');
  console.log('='.repeat(60));
  console.log('\n');

  await example1_smartSelection();
  await example2_performanceMonitoring();
  await example3_queueManagement();
  await example4_healthChecking();
  await example5_automaticFallback();
  await example6_textChunking();
  await example7_configValidation();
  
  // Example 8 with sample data
  await example8_productionFlow('Sample document text for processing.', 'test-flow');
  
  await example9_monitoringDashboard();
  
  // Example 10 with sample documents
  await example10_batchProcessing([
    'Short document',
    'Medium length document with more content. '.repeat(50),
    'Very long document with extensive content. '.repeat(200),
  ]);

  console.log('\n');
  console.log('='.repeat(60));
  console.log('All advanced examples completed!');
  console.log('='.repeat(60));
}

// Uncomment to run:
// runAllAdvancedExamples();
