# 🚀 Firestore Migration Guide

Complete guide for migrating flows, prompts, and tools to Firestore collections.

---

## 📋 Overview

This migration moves your existing flow, prompt, and tool configurations from code into Firestore collections, enabling:
- ✅ Dynamic configuration updates without code changes
- ✅ Version control and history tracking
- ✅ Admin UI for managing configurations
- ✅ Easy testing and validation
- ✅ Production-ready scalability

---

## 🎯 Migration Methods

### Method 1: Quick Migration (Predefined Configurations)
Use this for a quick setup with common configurations.

```bash
npm run migrate:firestore
```

This will create:
- **10 Flows**: Common AI flows (text generation, summarization, etc.)
- **4 Prompts**: Essential prompt templates
- **3 Tools**: Basic tools (search, citation, PDF processing)

### Method 2: Extract from Codebase (Recommended)
Use this to migrate your actual existing configurations.

```bash
# Step 1: Extract configurations from your codebase
npm run extract:configs

# Step 2: Review and edit extracted JSON files
# Check migration-output/ directory

# Step 3: Migrate to Firestore
npm run migrate:from-json

# Optional: Overwrite existing documents
npm run migrate:from-json -- --overwrite
```

---

## 📦 Method 1: Quick Migration

### What Gets Created

#### Flows (10)
1. `generate-text` - General text generation
2. `generate-report-section` - Report section with RAG
3. `generate-chapter-content` - Chapter content generation
4. `summarize-text` - Text summarization
5. `translate-text` - Language translation
6. `paraphrase-text` - Text paraphrasing
7. `grammar-checker` - Grammar checking
8. `plagiarism-checker` - Plagiarism detection
9. `academic-literature-review` - Literature review generation
10. `graduation-project-generator` - Complete project generation

#### Prompts (4)
1. `generate-text-prompt` - General text generation template
2. `summarize-prompt` - Summarization template
3. `translate-prompt` - Translation template
4. `academic-writing-prompt` - Academic writing template

#### Tools (3)
1. `web-search` - Web search tool
2. `citation-generator` - Citation formatting tool
3. `pdf-processor` - PDF text extraction tool

### Running Quick Migration

```bash
# Run the migration
npm run migrate:firestore

# Expected output:
# 🚀 STARTING FIRESTORE MIGRATION
# 📦 Loading flow configurations...
# ✅ Loaded 10 flow configurations
# 📦 Loading prompt templates...
# ✅ Loaded 4 prompt templates
# 📦 Loading tool configurations...
# ✅ Loaded 3 tool configurations
# 
# 🚀 Migrating flows to Firestore...
# ✅ Migrated flow: generate-text
# ...
# 🎉 Migration completed successfully!
```

---

## 🔍 Method 2: Extract from Codebase

### Step 1: Extract Configurations

This scans your codebase and extracts existing flows, prompts, and tools.

```bash
npm run extract:configs
```

**What it does:**
- Scans `src/ai/flows/` for flow definitions
- Scans `src/ai/prompts/` for prompt templates
- Scans `src/ai/tools/` for tool configurations
- Extracts metadata (name, description, category, etc.)
- Saves to `migration-output/` directory

**Output files:**
- `migration-output/flows.json` - All extracted flows
- `migration-output/prompts.json` - All extracted prompts
- `migration-output/tools.json` - All extracted tools
- `migration-output/summary.json` - Extraction summary

**Example output:**
```
🔍 EXTRACTING CONFIGURATIONS FROM CODEBASE

🔍 Scanning for flows in src/ai/flows...
✅ Found 23 flows

🔍 Scanning for prompts in src/ai/prompts...
✅ Found 5 prompts

🔍 Scanning for tools in src/ai/tools...
✅ Found 8 tools

💾 Saving extracted configurations...
✅ Saved flows to migration-output/flows.json
✅ Saved prompts to migration-output/prompts.json
✅ Saved tools to migration-output/tools.json

📊 EXTRACTION REPORT
   Flows: 23
   Prompts: 5
   Tools: 8
   Total: 36
```

### Step 2: Review and Edit

Open the JSON files in `migration-output/` and review/edit:

```json
// migration-output/flows.json
[
  {
    "name": "generate-text",
    "displayName": "Generate Text",
    "description": "Generate text content using AI",
    "category": "generation",
    "tags": ["text", "generation", "ai"],
    "inputSchema": {},
    "outputSchema": {}
  }
]
```

**What to check:**
- ✅ Display names are user-friendly
- ✅ Descriptions are clear and accurate
- ✅ Categories are correct
- ✅ Tags are relevant
- ✅ Add input/output schemas if available
- ✅ Add any missing metadata

### Step 3: Migrate to Firestore

Once you've reviewed and edited the JSON files:

```bash
# Migrate (skips existing documents)
npm run migrate:from-json

# Or overwrite existing documents
npm run migrate:from-json -- --overwrite
```

**What it does:**
- Reads JSON files from `migration-output/`
- Validates each configuration
- Adds default values for missing fields
- Creates Firestore documents
- Skips existing documents (unless --overwrite)

**Example output:**
```
🚀 STARTING FIRESTORE MIGRATION FROM JSON

📦 Loading JSON files from migration-output/...
✅ Loaded 23 flows
✅ Loaded 5 prompts
✅ Loaded 8 tools

🚀 Migrating flows to Firestore...
✅ Migrated flow: generate-text
⏭️  Flow summarize-text already exists, skipping...
✅ Migrated flow: translate-text
...

📊 MIGRATION SUMMARY
   Flows: 23 total, 20 success, 3 skipped, 0 failed
   Prompts: 5 total, 5 success, 0 skipped, 0 failed
   Tools: 8 total, 8 success, 0 skipped, 0 failed

🎉 Migration completed successfully!
```

---

## 🔄 Updating Existing Configurations

To update existing configurations in Firestore:

```bash
# Option 1: Edit JSON files and use --overwrite
npm run migrate:from-json -- --overwrite

# Option 2: Use Admin UI
# Visit /admin/flows, /admin/prompts, /admin/tools

# Option 3: Use API endpoints
curl -X PUT http://localhost:3000/api/admin/flows/[flowId] \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description": "Updated description"}'
```

---

## 📊 Verification

### Check Migration Status

```bash
# Use Firebase Console
# Go to Firestore Database
# Check collections: flows, prompts, tools

# Or use the admin UI
# Visit: /admin/flows
# Visit: /admin/prompts
# Visit: /admin/tools
```

### Test API Access

```bash
# Get admin token first
export ADMIN_TOKEN="your-admin-token"

# List flows
curl -X GET http://localhost:3000/api/admin/flows \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# List prompts
curl -X GET http://localhost:3000/api/admin/prompts \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# List tools
curl -X GET http://localhost:3000/api/admin/tools \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Expected Response

```json
{
  "success": true,
  "flows": [
    {
      "id": "generate-text",
      "name": "generate-text",
      "displayName": "Generate Text",
      "description": "Generate text content using AI",
      "status": "active",
      "category": "generation",
      "version": 1
    }
  ],
  "total": 10
}
```

---

## 🛠️ Troubleshooting

### Issue: No configurations extracted

**Problem**: `extract:configs` finds 0 items

**Solution**: 
- Check that `src/ai/flows/`, `src/ai/prompts/`, `src/ai/tools/` exist
- Ensure files are `.ts` files (not `.js`)
- Check file naming (should not be `index.ts`)

### Issue: Migration fails with permission error

**Problem**: `Permission denied` errors during migration

**Solution**:
- Ensure Firebase Admin SDK is initialized
- Check `FIREBASE_PRIVATE_KEY` environment variable
- Verify Firestore security rules allow admin write

### Issue: Existing documents not overwritten

**Problem**: `--overwrite` flag doesn't work

**Solution**:
```bash
# Use double dash before flag
npm run migrate:from-json -- --overwrite

# Not this:
npm run migrate:from-json --overwrite
```

### Issue: Missing fields in Firestore

**Problem**: Some fields are undefined

**Solution**:
- Edit JSON files in `migration-output/`
- Add missing fields before migration
- Or update via Admin UI after migration

---

## 📝 JSON File Structure

### Flow Configuration

```json
{
  "name": "flow-name",
  "displayName": "Display Name",
  "description": "Flow description",
  "category": "generation",
  "tags": ["tag1", "tag2"],
  "steps": [],
  "inputSchema": {
    "type": "object",
    "properties": {
      "input": { "type": "string" }
    }
  },
  "outputSchema": {
    "type": "object",
    "properties": {
      "output": { "type": "string" }
    }
  },
  "settings": {
    "timeout": 300000,
    "retryPolicy": {
      "maxRetries": 3,
      "backoffMs": 1000
    }
  }
}
```

### Prompt Configuration

```json
{
  "name": "prompt-name",
  "displayName": "Display Name",
  "description": "Prompt description",
  "category": "generation",
  "tags": ["tag1", "tag2"],
  "template": "Template with {{variable}} placeholders",
  "variables": [
    {
      "name": "variable",
      "type": "string",
      "required": true,
      "description": "Variable description"
    }
  ],
  "model": "gemini-2.0-flash-exp",
  "settings": {
    "temperature": 0.7,
    "maxTokens": 2048
  }
}
```

### Tool Configuration

```json
{
  "name": "tool-name",
  "displayName": "Display Name",
  "description": "Tool description",
  "category": "utility",
  "type": "builtin",
  "handler": "tool-handler",
  "inputSchema": {
    "type": "object",
    "properties": {
      "input": { "type": "string" }
    }
  },
  "outputSchema": {
    "type": "object",
    "properties": {
      "output": { "type": "string" }
    }
  },
  "timeout": 30000
}
```

---

## 🎯 Best Practices

### 1. Test Before Production
- Run migration in development/staging first
- Verify all configurations work correctly
- Test API endpoints with admin token

### 2. Backup Existing Data
```bash
# Export current Firestore data
firebase firestore:export backup/$(date +%Y%m%d)
```

### 3. Version Control
- Keep JSON files in version control
- Document any manual changes
- Use meaningful commit messages

### 4. Gradual Migration
- Migrate flows first, test
- Then prompts, test
- Finally tools, test

### 5. Monitor After Migration
- Check Firebase console for document counts
- Test admin UI functionality
- Verify API responses

---

## 🚀 Next Steps After Migration

1. **Test Admin UI**
   ```
   Visit: /admin/flows
   Visit: /admin/prompts
   Visit: /admin/tools
   ```

2. **Update Code References**
   - Change hardcoded flows to use Firestore
   - Update service calls to use admin services
   - Remove deprecated code

3. **Add Custom Configurations**
   - Create new flows via Admin UI
   - Add project-specific prompts
   - Register custom tools

4. **Setup Monitoring**
   - Track configuration changes
   - Monitor usage metrics
   - Set up alerts for errors

---

## 📚 Related Documentation

- `FIRESTORE_ADMIN_FIX_SUMMARY.md` - Admin access setup
- `ADMIN_FIRESTORE_FIX_COMPLETE.md` - Complete fix summary
- `FINAL_COMPLETION_SUMMARY.md` - Overall implementation
- `firestore.rules` - Security rules

---

## 💡 Tips

- **Use descriptive names**: Make them searchable
- **Add comprehensive tags**: Helps filtering
- **Write clear descriptions**: For future reference
- **Keep schemas updated**: Document expected inputs/outputs
- **Version your flows**: Track changes over time

---

## ✅ Success Checklist

- [ ] Extracted configurations from codebase
- [ ] Reviewed and edited JSON files
- [ ] Ran migration successfully
- [ ] Verified documents in Firestore
- [ ] Tested API endpoints
- [ ] Tested Admin UI
- [ ] Updated code to use Firestore
- [ ] Removed deprecated code
- [ ] Documented custom configurations
- [ ] Backed up data

---

## 🆘 Need Help?

If you encounter issues:
1. Check Firestore console for errors
2. Review migration output logs
3. Check `errors.txt` for build errors
4. Test with sample data first
5. Verify admin authentication works

---

**Ready to migrate? Start with:**
```bash
npm run extract:configs
```
