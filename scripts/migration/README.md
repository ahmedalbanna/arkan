# Dynamic Flow Migration Tools

Comprehensive toolkit for migrating hardcoded flows to the Dynamic Flow System.

---

## 📋 Overview

This migration toolkit provides automated tools to analyze, extract, generate, and validate flow configurations. It streamlines the migration process from hardcoded flows to declarative, database-driven flows.

---

## 🛠️ Available Tools

### 1. Flow Analyzer (`analyze-flows.ts`)
**Purpose**: Analyzes existing hardcoded flows to determine complexity and migration strategy.

**Features**:
- Analyzes flow complexity (simple, medium, complex)
- Estimates number of steps needed
- Identifies dependencies (RAG, tools, conditionals, loops)
- Determines migration phase (1, 2, or 3)
- Generates migration recommendations
- Calculates effort estimates

**Usage**:
```bash
npx ts-node scripts/migration/analyze-flows.ts
```

**Output**:
- `migration-analysis-report.json` - Detailed analysis of all flows

**Example Output**:
```
🟢 generate-text
   Complexity: SIMPLE
   Estimated Steps: 2
   Migration Phase: 1
   Priority: HIGH
   Effort: 1-2 hours
   Recommendations:
     ✅ Good candidate for early migration
     📝 Extract prompts into prompt templates
```

---

### 2. Prompt Extractor (`extract-prompts.ts`)
**Purpose**: Extracts prompt templates from hardcoded flows with variable definitions.

**Features**:
- Finds template literals with variables
- Extracts variable names automatically
- Infers variable types
- Converts to Mustache syntax (`{{variable}}`)
- Generates PromptConfiguration objects
- Categorizes prompts automatically

**Usage**:
```bash
npx ts-node scripts/migration/extract-prompts.ts
```

**Output**:
- `extracted-prompts.json` - All prompt configurations

**Example Extraction**:
```typescript
// Original code:
const prompt = `Write a summary of ${topic} in ${style} style`;

// Extracted configuration:
{
  name: "summarize-text-prompt-1",
  templateContent: "Write a summary of {{topic}} in {{style}} style",
  variables: [
    { name: "topic", type: "string", required: true },
    { name: "style", type: "string", required: true }
  ]
}
```

---

### 3. Config Generator (`generate-config.ts`)
**Purpose**: Generates FlowConfiguration objects from analyzed flows and extracted prompts.

**Features**:
- Creates complete flow configurations
- Generates steps based on analysis
- Links prompts to GENERATE steps
- Adds RAG, tool, and format steps
- Defines input/output schemas
- Sets appropriate metadata

**Usage**:
```bash
npx ts-node scripts/migration/generate-config.ts
```

**Output**:
- `generated-flow-configs.json` - Flow configurations
- `generated-flow-configs.ts` - TypeScript exports

**Example Configuration**:
```json
{
  "name": "summarize-text",
  "displayName": "Summarize Text",
  "category": "summarization",
  "steps": [
    {
      "id": "summarize-text-step-1",
      "type": "GENERATE",
      "name": "Generate Summary",
      "config": {
        "type": "GENERATE",
        "promptName": "summarize-text-prompt-1",
        "model": "gemini-2.0-flash-exp",
        "temperature": 0.7
      }
    }
  ]
}
```

---

### 4. Batch Migrator (`migrate-flows.ts`)
**Purpose**: Orchestrates the complete migration process end-to-end.

**Features**:
- Runs analysis, extraction, and generation
- Uploads to Firestore
- Validates migrations
- Supports phases and dry-run mode
- Generates comprehensive reports
- Handles errors gracefully

**Usage**:
```bash
# Full migration
npx ts-node scripts/migration/migrate-flows.ts

# Phase 1 only (simple flows)
npx ts-node scripts/migration/migrate-flows.ts --phase=1

# Dry run (no upload)
npx ts-node scripts/migration/migrate-flows.ts --dry-run

# Skip analysis (use cached)
npx ts-node scripts/migration/migrate-flows.ts --skip-analysis

# Skip upload
npx ts-node scripts/migration/migrate-flows.ts --skip-upload
```

**Output**:
- `migration-output/` directory with all reports
- Console summary with statistics

**Migration Process**:
1. ✅ Analyze flows
2. ✅ Extract prompts  
3. ✅ Generate configurations
4. ✅ Upload to Firestore
5. ✅ Validate migration

---

### 5. Output Comparator (`compare-outputs.ts`)
**Purpose**: Compares outputs between original and migrated flows.

**Features**:
- Calculates similarity scores
- Identifies specific differences
- Line-by-line comparison
- Generates HTML reports
- Categorizes as passed/warning/failed
- Provides recommendations

**Usage**:
```typescript
import OutputComparator from './compare-outputs';

const comparator = new OutputComparator();

const result = await comparator.compareOutputs(
  'flow-name',
  'test-case-1',
  originalOutput,
  migratedOutput
);

console.log(`Similarity: ${result.similarity * 100}%`);
```

**Similarity Thresholds**:
- **≥95%**: Passed ✅
- **85-95%**: Warning ⚠️
- **<85%**: Failed ❌

---

### 6. Performance Benchmark (`benchmark-flow.ts`)
**Purpose**: Measures and compares performance between flows.

**Features**:
- Execution time metrics (min, max, avg, p95, p99)
- Memory usage tracking
- Throughput calculation
- Speedup comparison
- HTML reports with charts
- Configurable iterations and concurrency

**Usage**:
```typescript
import PerformanceBenchmark from './benchmark-flow';

const benchmark = new PerformanceBenchmark({
  iterations: 10,
  warmupRuns: 3,
  timeoutMs: 30000
});

const result = await benchmark.compareBenchmarks(
  'flow-name',
  'test-case-1',
  originalExecutor,
  migratedExecutor,
  inputData
);

console.log(`Speedup: ${result.comparison.speedup}x`);
```

**Metrics Tracked**:
- Execution time (all percentiles)
- Memory usage (heap, external)
- Throughput (requests/second)
- Error and timeout rates

---

### 7. Migration Validator (`validate-migration.ts`)
**Purpose**: Validates migrated configurations for correctness.

**Features**:
- Required field validation
- Schema validation
- Step configuration checks
- Naming convention enforcement
- Best practice recommendations
- Scoring system (0-100)

**Usage**:
```typescript
import MigrationValidator from './validate-migration';

const validator = new MigrationValidator();

const result = validator.validateFlow(flowConfig);
validator.printResults(flowConfig.name, result);

console.log(`Score: ${result.score}/100`);
console.log(`Valid: ${result.valid}`);
```

**Validation Categories**:
- ❌ **Errors**: Critical issues that prevent migration
- ⚠️ **Warnings**: Issues that should be addressed
- ℹ️ **Info**: Best practice suggestions

---

## 🚀 Quick Start Guide

### Step 1: Analyze Flows
```bash
cd scripts/migration
npx ts-node analyze-flows.ts
```

Review the `migration-analysis-report.json` to understand:
- Which flows are simple vs complex
- Migration phases (1, 2, 3)
- Estimated effort

### Step 2: Run Migration (Phase 1)
```bash
# Start with simple flows (Phase 1)
npx ts-node migrate-flows.ts --phase=1 --dry-run

# Review output in migration-output/

# If satisfied, run actual migration
npx ts-node migrate-flows.ts --phase=1
```

### Step 3: Test Migrated Flows
```typescript
// Create test file: test-migration.ts
import { compareOutputs } from './compare-outputs';
import { benchmarkFlow } from './benchmark-flow';

// Test one flow
const testCases = [
  { name: 'Basic test', input: { text: 'Hello' } }
];

// Compare outputs
const comparisonResults = await runComparison(
  'flow-name',
  originalExecutor,
  migratedExecutor,
  testCases
);

// Benchmark performance
const benchmarkResults = await runBenchmarks([...]);
```

### Step 4: Validate and Deploy
```bash
# Validate all migrations
npx ts-node validate-migration.ts

# If validation passes, deploy to production
```

---

## 📊 Migration Phases

### Phase 1: Simple Flows (Week 6)
**Characteristics**:
- Pure text generation
- No RAG or tools
- No conditionals or loops
- 1-3 steps

**Flows** (~15):
- generate-text
- paraphrase-text
- summarize-text
- translate-text
- humanize-text
- improve-text
- etc.

**Timeline**: 3 days

---

### Phase 2: Analysis & RAG Flows (Week 6-7)
**Characteristics**:
- Uses RAG retrieval
- Analysis operations
- 3-5 steps

**Flows** (~10):
- grammar-checker
- bias-checker
- fact-checker
- plagiarism-checker
- academic-analysis
- etc.

**Timeline**: 5 days

---

### Phase 3: Complex Flows (Week 7-8)
**Characteristics**:
- Conditional logic
- Loops/iteration
- Multiple tools
- 5+ steps

**Flows** (~15):
- graduation-project-generator
- report-generator
- research-assistant
- document-builder
- etc.

**Timeline**: 10 days

---

## 🎯 Best Practices

### 1. Always Start with Analysis
```bash
# Analyze before migrating
npx ts-node analyze-flows.ts

# Review recommendations
cat migration-analysis-report.json
```

### 2. Use Dry Run First
```bash
# Test without uploading
npx ts-node migrate-flows.ts --phase=1 --dry-run

# Review generated configs
cat migration-output/flow-configs-report.json

# Then run actual migration
npx ts-node migrate-flows.ts --phase=1
```

### 3. Validate Everything
```bash
# Validate after generation
npx ts-node validate-migration.ts

# Fix all errors before uploading
# Warnings should be addressed
```

### 4. Compare Outputs Carefully
- Test with multiple input scenarios
- Check edge cases
- Verify error handling
- Compare with original outputs

### 5. Benchmark Performance
- Measure before and after
- Test with realistic data
- Check memory usage
- Monitor for regressions

---

## 📁 Output Structure

```
migration-output/
├── analysis-report.json          # Flow analysis results
├── prompts-report.json           # Extracted prompts
├── flow-configs-report.json      # Generated flow configs
├── prompt-configs-report.json    # Generated prompt configs
├── validation-report.json        # Validation results
├── comparison-report.json        # Output comparisons
├── comparison-report.html        # HTML comparison report
├── benchmark-report.json         # Performance benchmarks
└── benchmark-report.html         # HTML benchmark report
```

---

## 🔧 Configuration

### Firebase Setup
Create `firebase-config.json`:
```json
{
  "apiKey": "your-api-key",
  "authDomain": "your-domain",
  "projectId": "your-project-id",
  "storageBucket": "your-bucket",
  "messagingSenderId": "your-sender-id",
  "appId": "your-app-id"
}
```

### Benchmark Configuration
```typescript
const config = {
  iterations: 10,      // Number of test runs
  warmupRuns: 3,       // Warmup iterations
  concurrency: 1,      // Parallel requests
  timeoutMs: 30000     // Timeout per request
};
```

### Comparison Thresholds
```typescript
const thresholds = {
  similarity: 0.85,    // 85% to pass
  warning: 0.95        // <95% triggers warning
};
```

---

## 🐛 Troubleshooting

### Issue: Analysis finds no flows
**Solution**: Check `flowsDir` path in analyzer
```typescript
const analyzer = new FlowAnalyzer('./src/ai/flows');
```

### Issue: Prompt extraction fails
**Solution**: Ensure flows use template literals or check regex patterns

### Issue: Upload fails
**Solution**: Verify Firebase config and permissions
```bash
# Test Firebase connection
firebase projects:list
```

### Issue: Validation errors
**Solution**: Review error messages and fix configurations
```typescript
validator.printResults(flowName, result);
// Fix errors, then re-validate
```

### Issue: Performance degradation
**Solution**: Review benchmark report and optimize
- Check for extra API calls
- Verify caching is working
- Optimize prompt templates
- Reduce unnecessary steps

---

## 📈 Progress Tracking

### Migration Checklist

**Phase 1: Simple Flows**
- [ ] Analyze flows
- [ ] Extract prompts
- [ ] Generate configs
- [ ] Validate configs
- [ ] Test 5 flows
- [ ] Compare outputs
- [ ] Benchmark performance
- [ ] Deploy to staging
- [ ] Production deployment

**Phase 2: Analysis Flows**
- [ ] Migrate 10 analysis flows
- [ ] Test with real data
- [ ] Validate accuracy
- [ ] Deploy to staging
- [ ] Production deployment

**Phase 3: Complex Flows**
- [ ] Migrate complex flows
- [ ] Extensive testing
- [ ] Performance optimization
- [ ] Final validation
- [ ] Production deployment

---

## 📚 Additional Resources

### Documentation
- [Dynamic Flow Roadmap](../../DYNAMIC_FLOW_ROADMAP.md)
- [Flow Configuration Models](../../src/lib/models/flow-config.ts)
- [Prompt Configuration Models](../../src/lib/models/prompt-config.ts)
- [Migration Guide](../../MIGRATION_GUIDE.md)

### Services
- [Flow Config Service](../../src/services/flow-config-service.ts)
- [Prompt Management Service](../../src/services/prompt-management-service.ts)
- [Dynamic Flow Executor](../../src/ai/flows/dynamic-flow-executor.ts)

---

## 🎓 Examples

### Example 1: Simple Migration
```bash
# 1. Analyze
npx ts-node analyze-flows.ts

# 2. Extract prompts
npx ts-node extract-prompts.ts

# 3. Generate configs
npx ts-node generate-config.ts

# 4. Validate
npx ts-node validate-migration.ts

# 5. Upload (dry run first)
npx ts-node migrate-flows.ts --dry-run
npx ts-node migrate-flows.ts
```

### Example 2: Programmatic Usage
```typescript
import FlowAnalyzer from './analyze-flows';
import PromptExtractor from './extract-prompts';
import ConfigGenerator from './generate-config';
import BatchMigrator from './migrate-flows';

// Analyze
const analyzer = new FlowAnalyzer();
const analysis = await analyzer.analyzeAllFlows();

// Extract
const extractor = new PromptExtractor();
const prompts = await extractor.extractFromMultipleFiles(files);

// Generate
const generator = new ConfigGenerator();
const configs = generator.generateMultipleConfigs(
  analysis.flows,
  prompts
);

// Migrate
const migrator = new BatchMigrator();
const result = await migrator.migrate({ phase: 1 });
```

---

## ✅ Success Criteria

A successful migration should have:
- ✅ **Output similarity**: >95%
- ✅ **Performance**: No more than 10% slower
- ✅ **Validation score**: >90/100
- ✅ **Error rate**: <1%
- ✅ **All tests passing**: 100%

---

## 🆘 Support

For issues or questions:
1. Check troubleshooting section above
2. Review generated reports in `migration-output/`
3. Validate configurations
4. Check console output for errors

---

**Last Updated**: January 11, 2026  
**Version**: 1.0.0  
**Status**: Ready for Week 5 Migration
