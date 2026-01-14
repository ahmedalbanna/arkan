# Flow Migration Scripts

A comprehensive suite of tools for migrating static Genkit flows to dynamic configuration-driven flows.

## 📚 Table of Contents

- [Overview](#overview)
- [Scripts](#scripts)
- [Usage Guide](#usage-guide)
- [Migration Workflow](#migration-workflow)
- [Reports & Output](#reports--output)

## Overview

These scripts automate the migration process from static flows to dynamic flows, including analysis, extraction, generation, testing, benchmarking, and rollback capabilities.

## Scripts

### 1. `analyze-flows.ts`

Analyzes all existing flows and generates a comprehensive migration report.

```bash
npm run analyze-flows
# or
tsx scripts/migration/analyze-flows.ts
```

**Outputs:**
- Flow complexity breakdown (simple/medium/complex)
- Category distribution
- Migration time estimates
- Dependency analysis
- `migration-analysis-report.json`

### 2. `extract-prompts.ts`

Extracts prompts from flow source code and saves them as reusable prompt configurations.

```bash
# Extract from all flows
npm run extract-prompts

# Extract from specific flow
tsx scripts/migration/extract-prompts.ts generate-text
```

**Features:**
- Automatic prompt detection
- Variable extraction
- Firestore persistence
- Categorization

### 3. `create-flow-configs.ts`

Generates dynamic flow configurations from static flow source code.

```bash
# Generate all configs (save to DB)
npm run create-flow-configs

# Dry run (no DB save)
tsx scripts/migration/create-flow-configs.ts --dry-run

# Generate specific flow
tsx scripts/migration/create-flow-configs.ts generate-text
```

**Outputs:**
- Flow configuration JSON files in `migration-configs/`
- Firestore documents (if not dry-run)
- Summary report

### 4. `migrate-flows.ts`

Orchestrates the complete migration process: analyze → generate → validate → save.

```bash
# Migrate all flows (all phases)
npm run migrate-flows

# Migrate specific phase
tsx scripts/migration/migrate-flows.ts --phase=1

# Migrate specific flows
tsx scripts/migration/migrate-flows.ts --flows=generate-text,paraphrase-text
```

**Migration Phases:**
1. **Simple Text Generation** (15 flows)
2. **Analysis Tools** (8 flows)
3. **Complex Document Generation** (14 flows)
4. **Academic & Research** (9 flows)
5. **Special & RAG-Enhanced** (8 flows)

**Outputs:**
- Per-phase reports in `migration-reports/`
- Backups in `migration-backups/`
- Final summary report

### 5. `compare-outputs.ts`

Compares outputs from static vs dynamic flows to validate migration accuracy.

```bash
# Compare specific flow (3 runs per test)
npm run compare-outputs generate-text

# More runs for better accuracy
tsx scripts/migration/compare-outputs.ts generate-text --runs=10
```

**Metrics:**
- Output similarity percentage
- Identical output detection
- Difference analysis
- Recommendation (PASS/REVIEW/FAIL)

**Outputs:**
- Comparison reports in `migration-reports/comparisons/`

### 6. `benchmark-flow.ts`

Measures performance characteristics of static vs dynamic flows.

```bash
# Benchmark with 100 iterations
npm run benchmark-flow generate-text

# More iterations for accuracy
tsx scripts/migration/benchmark-flow.ts generate-text --iterations=500
```

**Metrics:**
- Execution time (mean, median, P95, P99)
- Memory usage
- Throughput (requests/sec)
- Standard deviation
- Performance comparison

**Outputs:**
- Benchmark reports in `migration-reports/benchmarks/`

### 7. `rollback-migration.ts`

Safely rollback migrations with backup preservation.

```bash
# List all migrated flows
tsx scripts/migration/rollback-migration.ts --list

# Soft rollback (disable, keep config)
tsx scripts/migration/rollback-migration.ts generate-text

# Hard rollback (delete config)
tsx scripts/migration/rollback-migration.ts generate-text --hard

# Rollback all flows
tsx scripts/migration/rollback-migration.ts --hard

# Restore from backup
tsx scripts/migration/rollback-migration.ts --restore=migration-backups/generate-text_1234567890.json
```

**Rollback Types:**
- **Soft**: Disables flow but keeps configuration for analysis
- **Hard**: Completely removes configuration (with backup)

**Outputs:**
- Rollback reports in `migration-reports/rollbacks/`
- Backups in `migration-backups/rollbacks/` or `migration-backups/hard-rollbacks/`

## Usage Guide

### Initial Analysis

Before starting migration, run analysis to understand the scope:

```bash
npm run analyze-flows
```

Review `migration-analysis-report.json` to understand:
- Total flows and complexity breakdown
- Estimated migration time
- Dependencies and warnings

### Phase-by-Phase Migration

Follow the recommended migration order:

```bash
# Phase 1: Simple flows
tsx scripts/migration/migrate-flows.ts --phase=1

# Validate Phase 1
tsx scripts/migration/compare-outputs.ts generate-text --runs=5
tsx scripts/migration/benchmark-flow.ts generate-text --iterations=100

# Phase 2: Analysis flows
tsx scripts/migration/migrate-flows.ts --phase=2

# Continue for phases 3, 4, 5...
```

### Testing Individual Flows

After migrating a flow, thoroughly test it:

```bash
FLOW_NAME="generate-text"

# 1. Compare outputs
tsx scripts/migration/compare-outputs.ts $FLOW_NAME --runs=10

# 2. Benchmark performance
tsx scripts/migration/benchmark-flow.ts $FLOW_NAME --iterations=200

# 3. If issues found, rollback
tsx scripts/migration/rollback-migration.ts $FLOW_NAME
```

### Full Migration Workflow

Complete end-to-end migration:

```bash
# 1. Analysis
npm run analyze-flows

# 2. Extract prompts (optional, for reusability)
npm run extract-prompts

# 3. Generate configs (dry-run first)
tsx scripts/migration/create-flow-configs.ts --dry-run

# 4. Review generated configs in migration-configs/
# 5. Generate and save to DB
npm run create-flow-configs

# 6. Run full migration
npm run migrate-flows

# 7. Review reports in migration-reports/
```

## Migration Workflow

### Recommended Process

1. **Pre-Migration**
   - Run analysis
   - Review complexity breakdown
   - Plan phases based on complexity
   - Ensure database backups

2. **Migration Execution**
   - Start with simple flows (Phase 1)
   - Migrate phase by phase
   - Test each phase before proceeding
   - Monitor performance metrics

3. **Validation**
   - Compare outputs for critical flows
   - Benchmark performance
   - Manual testing of complex flows
   - User acceptance testing

4. **Rollback Planning**
   - Keep all backups
   - Document any issues
   - Have rollback procedures ready
   - Test rollback process

### Quality Gates

Before proceeding to next phase:

- ✅ All migrations successful
- ✅ Output comparison > 90% similarity
- ✅ Performance overhead < 20%
- ✅ Manual testing passed
- ✅ No critical errors in logs

## Reports & Output

### Directory Structure

```
project-root/
├── migration-configs/          # Generated flow configs (JSON)
│   ├── generate-text.json
│   ├── paraphrase-text.json
│   └── summary.json
│
├── migration-backups/          # Flow config backups
│   ├── generate-text_1234567890.json
│   ├── rollbacks/              # Soft rollback backups
│   └── hard-rollbacks/         # Hard rollback backups
│
└── migration-reports/          # All reports
    ├── migration-analysis-report.json
    ├── phase-1-report.json
    ├── phase-2-report.json
    ├── final-summary.json
    ├── comparisons/
    │   └── generate-text-comparison.json
    ├── benchmarks/
    │   └── generate-text-benchmark.json
    └── rollbacks/
        └── rollback-1234567890.json
```

### Report Types

**Analysis Report** (`migration-analysis-report.json`)
```json
{
  "totalFlows": 54,
  "flowsByComplexity": {
    "simple": [...],
    "medium": [...],
    "complex": [...]
  },
  "migrationEstimate": {
    "total": 216
  }
}
```

**Phase Report** (`phase-X-report.json`)
```json
{
  "phase": 1,
  "totalFlows": 15,
  "successful": 15,
  "failed": 0,
  "results": [...]
}
```

**Comparison Report** (`*-comparison.json`)
```json
{
  "flowName": "generate-text",
  "totalTests": 9,
  "identicalOutputs": 8,
  "averageSimilarity": 0.96,
  "recommendation": "PASS"
}
```

**Benchmark Report** (`*-benchmark.json`)
```json
{
  "flowName": "generate-text",
  "staticResult": {
    "statistics": {
      "mean": 245.3,
      "p95": 312.1
    }
  },
  "comparison": {
    "speedDifference": 8.5,
    "recommendation": "ACCEPTABLE"
  }
}
```

## Troubleshooting

### Common Issues

**Issue**: Flow config generation fails
```bash
# Check if flow file exists
ls -la src/ai/flows/flow-name.ts

# Try dry-run first
tsx scripts/migration/create-flow-configs.ts flow-name --dry-run
```

**Issue**: Low output similarity
```bash
# Run more comparison tests
tsx scripts/migration/compare-outputs.ts flow-name --runs=20

# Check for randomness in outputs
# Review flow implementation for non-deterministic behavior
```

**Issue**: Poor performance
```bash
# Run detailed benchmark
tsx scripts/migration/benchmark-flow.ts flow-name --iterations=500

# Check memory leaks
node --expose-gc scripts/migration/benchmark-flow.ts flow-name
```

**Issue**: Migration fails mid-process
```bash
# Check last successful flow in reports
cat migration-reports/phase-X-report.json

# Resume from specific flows
tsx scripts/migration/migrate-flows.ts --flows=remaining-flow-1,remaining-flow-2
```

## Best Practices

1. **Always run analysis first** to understand scope
2. **Use dry-run mode** before saving to database
3. **Test incrementally** - don't migrate all at once
4. **Keep backups** - never delete backup files
5. **Monitor performance** throughout migration
6. **Document issues** found during migration
7. **Have rollback plan** ready before starting
8. **Validate critical flows** manually after migration

## Support

For issues or questions:
- Check `migration-reports/` for detailed logs
- Review backup files in `migration-backups/`
- Consult main documentation: `dynamic-flows.md`
- Check implementation guide: `DYNAMIC_FLOW_IMPLEMENTATION_PLAN.md`

## Version History

- **v1.0.0** - Initial migration tools (Week 5)
  - Analysis, extraction, generation
  - Comparison and benchmarking
  - Rollback capabilities
