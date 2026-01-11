# Week 6 Migration - Quick Reference Guide

## 🚀 Quick Start

### Run Complete Week 6 Migration
```bash
npm run week6:all
```

### Individual Commands
```bash
# 1. Run migration only
npm run migrate:week6

# 2. Run tests only
npm run test:week6

# 3. Deploy to staging
npm run deploy:week6-staging
```

---

## 📊 Migration Overview

| Phase | Flows | Complexity | Days | Status |
|-------|-------|------------|------|--------|
| Phase 1 | 15 | Simple | 1-3 | ✅ Ready |
| Phase 2 | 10 | Analysis | 4-5 | ✅ Ready |
| **Total** | **25** | **Mixed** | **5** | **✅ Ready** |

---

## 📁 Key Files

### Migration Scripts
- `scripts/migration/week6-migration-batch.ts` - Main migration
- `scripts/migration/week6-test-migrations.ts` - Testing
- `scripts/migration/week6-deploy-staging.ts` - Deployment
- `scripts/migration/run-week6.sh` - Master script

### Documentation
- `WEEK_6_MIGRATION_COMPLETE.md` - Full documentation
- `DYNAMIC_FLOW_ROADMAP.md` - Overall roadmap
- `DYNAMIC_FLOW_TECHNICAL_SPECS.md` - Technical specs

### Output Reports
- `migration-output/week6-migration-report.json`
- `migration-output/week6-test-report.json`
- `migration-output/week6-deployment-report.json`

---

## 🔄 Phase 1 Flows (15 Simple Flows)

```
✓ generate-text              - Generate text from prompt
✓ paraphrase-text            - Paraphrase in different styles
✓ summarize-text             - Summarize in different lengths
✓ translate-text             - Translate between languages
✓ humanize-text              - Make AI text more human
✓ manipulate-text            - Various text manipulations
✓ text-stylist               - Apply writing styles
✓ topic-explainer            - Explain complex topics
✓ generate-citation          - Generate academic citations
✓ generate-ideas             - Generate creative ideas
✓ rewrite-to-markdown        - Convert to markdown
✓ text-to-speech             - Convert text to speech
✓ image-to-text              - Extract text from images
✓ generate-ui-description    - Generate UI descriptions
✓ generate-plantuml          - Generate PlantUML diagrams
```

---

## 🔍 Phase 2 Flows (10 Analysis Flows)

```
✓ grammar-checker                    - Check grammar errors
✓ bias-checker                       - Detect biases
✓ fact-checker                       - Verify facts
✓ plagiarism-checker                 - Detect plagiarism
✓ detect-ai-content                  - Detect AI-generated text
✓ sentence-structure-checker         - Analyze sentence structure
✓ academic-paper-quality-checker     - Evaluate academic quality
✓ ai-proofread-document              - Proofread documents
✓ fact-retrieval                     - Retrieve facts (RAG)
✓ question-answering                 - Answer questions (RAG)
```

---

## ⚡ Quick Commands

### Check Migration Status
```bash
# View all flows in database
npx tsx -e "
import { getFirestore } from 'firebase-admin/firestore';
const db = getFirestore();
db.collection('flows').get().then(snap => 
  console.log('Total flows:', snap.size)
);
"
```

### View Migration Report
```bash
cat migration-output/week6-migration-report.json | jq
```

### Check Test Results
```bash
cat migration-output/week6-test-report.json | jq '.summary'
```

### View Deployment Status
```bash
cat migration-output/week6-deployment-report.json | jq
```

---

## 🧪 Testing

### Run Specific Flow Test
```typescript
import { testFlow } from './scripts/migration/week6-test-migrations';

await testFlow({
  flowId: 'generate-text',
  name: 'Generate Text',
  input: { prompt: 'Test prompt' },
  expectedOutputFields: ['generatedText']
});
```

### Manual Testing in Staging
```bash
# Test dynamic flow executor
curl -X POST http://localhost:9002/api/flows/execute \
  -H "Content-Type: application/json" \
  -d '{
    "flowId": "generate-text",
    "input": {"prompt": "Write a short story"},
    "context": {}
  }'
```

---

## 🗄️ Database Structure

### Flows Collection
```
flows/{flowId}
  ├── flowId: string
  ├── name: string
  ├── description: string
  ├── category: 'simple' | 'analysis'
  ├── phase: number
  ├── steps: FlowStep[]
  ├── inputSchema: object
  ├── outputSchema: object
  ├── version: number
  ├── isActive: boolean
  ├── tags: string[]
  ├── createdAt: timestamp
  └── updatedAt: timestamp
```

### Prompts Collection
```
prompts/{promptId}
  ├── promptId: string
  ├── flowId: string
  ├── name: string
  ├── template: string
  ├── variables: string[]
  ├── model: string
  ├── version: number
  └── isActive: boolean
```

---

## 🔧 Troubleshooting

### Issue: Migration Script Fails

**Solution**:
```bash
# Check Firebase connection
npm run test:firebase-connection

# Verify service account
ls -la docudec-firebase-adminsdk-2maa7-d07a19d3fc.json

# Check Firestore rules
cat firestore.rules
```

### Issue: Test Failures

**Solution**:
```bash
# Run individual flow test
npm run test:week6 -- --flow=generate-text

# Check flow file exists
ls -la src/ai/flows/generate-text.ts

# Verify schemas
grep -r "GenerateTextInputSchema" src/ai/schemas/
```

### Issue: Deployment Fails

**Solution**:
```bash
# Check staging environment
npm run check:staging

# View deployment logs
tail -f logs/deployment.log

# Rollback if needed
npm run rollback:staging
```

---

## 📈 Success Metrics

### Migration Success
- ✅ 25/25 flows migrated (100%)
- ✅ All prompts extracted
- ✅ Configurations saved to database

### Test Success
- ✅ 95%+ tests passing
- ✅ Performance overhead < 20%
- ✅ Output validation passed

### Deployment Success
- ✅ All flows deployed to staging
- ✅ Health checks passed
- ✅ No critical errors

---

## 🔄 Rollback Procedure

### Emergency Rollback
```bash
# Quick rollback to previous state
npm run rollback:staging

# Or manually
npx tsx scripts/migration/rollback.ts --snapshot=<snapshot-id>
```

### Restore Specific Flow
```typescript
import { getFirestore } from 'firebase-admin/firestore';
const db = getFirestore();

// Restore from snapshot
const snapshot = await db.collection('deployment-snapshots')
  .doc('<snapshot-id>').get();
  
const flowData = snapshot.data().flows['generate-text'];
await db.collection('flows').doc('generate-text').set(flowData);
```

---

## 📋 Checklist

### Pre-Migration
- [ ] Firebase initialized
- [ ] Service account configured
- [ ] Migration scripts ready
- [ ] Backup created

### During Migration
- [ ] Run migration script
- [ ] Monitor progress
- [ ] Check for errors
- [ ] Verify database

### Post-Migration
- [ ] Run test suite
- [ ] Review test results
- [ ] Deploy to staging
- [ ] Run health checks
- [ ] Manual testing

### Validation
- [ ] Test 5 flows manually
- [ ] Check performance
- [ ] Verify outputs
- [ ] Monitor logs

---

## 🎯 Next Steps (Week 7)

### Complex Flows (15 flows)
```
- write-document
- generate-report-section
- generate-chapter-content
- improve-report-markdown
- rewrite-document-to-markdown
- summarize-document
- professional-document-writer
- technical-spec-writer
- project-report-generator
- presentation-content-creator
- generate-toc
- generate-quiz
- generate-session-plan
- generate-diagrams
- solve-assignments
```

### Preparation
- [ ] Review Week 6 results
- [ ] Update migration scripts for complex flows
- [ ] Prepare additional test cases
- [ ] Schedule team review

---

## 💡 Tips & Best Practices

### Migration
1. **Run in batches** - Migrate 5 flows at a time for easier debugging
2. **Check logs** - Monitor Firestore operations in real-time
3. **Backup first** - Always create snapshot before deployment
4. **Test thoroughly** - Test each flow after migration

### Testing
1. **Use realistic data** - Test with production-like inputs
2. **Check edge cases** - Empty inputs, long texts, special characters
3. **Compare outputs** - Verify dynamic matches original
4. **Monitor performance** - Track execution times

### Deployment
1. **Staging first** - Never deploy directly to production
2. **Health checks** - Verify all flows after deployment
3. **Gradual rollout** - Enable flows progressively
4. **Monitor closely** - Watch for errors in first 24 hours

---

## 📞 Support

### Questions?
- Review: `WEEK_6_MIGRATION_COMPLETE.md`
- Technical: `DYNAMIC_FLOW_TECHNICAL_SPECS.md`
- Roadmap: `DYNAMIC_FLOW_ROADMAP.md`

### Issues?
1. Check logs: `migration-output/`
2. Review errors in reports
3. Run diagnostic scripts
4. Rollback if critical

---

## 🎉 Success Indicators

✅ **Migration Complete**
- All 25 flows in database
- Prompts extracted
- Reports generated

✅ **Tests Passing**
- 95%+ success rate
- Performance acceptable
- Outputs validated

✅ **Staging Deployed**
- All flows active
- Health checks passed
- Ready for production

---

**Last Updated**: January 11, 2025  
**Status**: ✅ Ready for Execution  
**Next Milestone**: Week 7 - Complex Flows
