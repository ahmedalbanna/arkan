# Data Migration Guide - Firebase to PostgreSQL

This guide walks through migrating data from Firebase to PostgreSQL.

## Overview

The migration process consists of three phases:
1. **Export** - Export data from Firebase
2. **Import** - Import data into PostgreSQL
3. **Validate** - Verify data integrity

## Prerequisites

- [x] Phase 0 completed (Infrastructure setup)
- [x] Phase 1 completed (Database enhancement)
- [x] Phase 2 completed (Authentication)
- [ ] Firebase Admin credentials configured
- [ ] PostgreSQL database running
- [ ] Backup of production Firebase data

## Quick Start

### Option 1: Full Automated Migration

Run the complete migration process:

```bash
npm run migrate:full
```

This will:
1. Export all Firebase data
2. Import to PostgreSQL
3. Validate data integrity
4. Generate comprehensive reports

### Option 2: Step-by-Step Migration

For more control, run each step individually:

```bash
# Step 1: Export from Firebase
npm run migrate:export-users
npm run migrate:export-firestore

# Step 2: Import to PostgreSQL
npm run migrate:import-users
npm run migrate:import-transactions
npm run migrate:import-projects

# Step 3: Validate
npm run migrate:validate
```

## Detailed Migration Steps

### Step 1: Export Firebase Data

#### 1.1 Export Users

```bash
npm run migrate:export-users
```

**What it does**:
- Exports all users from Firebase Auth
- Fetches corresponding Firestore user data
- Saves to `migration-exports/firebase-users.json`
- Generates summary report

**Output**:
```
migration-exports/
├── firebase-users.json
└── export-summary.json
```

#### 1.2 Export Firestore Collections

```bash
npm run migrate:export-firestore
```

**What it does**:
- Exports all Firestore collections:
  - projects
  - transactions
  - creditLedger
  - notifications
  - templates (report, docx, pptx)
  - agents
  - settings
  - features

**Output**:
```
migration-exports/firestore/
├── projects.json
├── transactions.json
├── creditLedger.json
├── notifications.json
└── _export-summary.json
```

### Step 2: Import to PostgreSQL

#### 2.1 Import Users

```bash
npm run migrate:import-users
```

**What it does**:
- Creates users in PostgreSQL
- Migrates OAuth accounts
- Preserves user credits
- Maintains user roles
- Skips disabled users

**Important**:
- Users will need to reset passwords (OAuth users can sign in)
- Email verification status preserved
- Credits and roles maintained

#### 2.2 Import Transactions (CRITICAL)

```bash
npm run migrate:import-transactions
```

**What it does**:
- Migrates all financial transactions
- Preserves payment references
- Maintains transaction status
- Validates amounts and credits

**⚠️ CRITICAL NOTES**:
- This involves real financial data
- Script includes extensive validation
- Amount and credit totals must match exactly
- Any mismatch is flagged as critical error

#### 2.3 Import Projects

```bash
npm run migrate:import-projects
```

**What it does**:
- Migrates user projects
- Preserves project content
- Maintains project metadata
- Links to correct users

### Step 3: Validation

```bash
npm run migrate:validate
```

**What it does**:
- Validates user count and credits
- Validates transaction amounts (CRITICAL)
- Validates project count
- Checks data integrity
- Detects orphaned records
- Verifies credit ledger consistency

**Validation Criteria**:

| Check | Threshold | Severity |
|-------|-----------|----------|
| User count | 95% match | Medium |
| User credits | 100 credit variance | Medium |
| Transaction count | 95% match | High |
| Transaction amount | $1 variance | **CRITICAL** |
| Transaction credits | Exact match | **CRITICAL** |
| Project count | 95% match | Low |
| Orphaned records | 0 | High |

**Output**:
```
migration-exports/
├── validation-report.json
├── user-migration-report.json
├── transaction-migration-report.json
└── project-migration-report.json
```

## Understanding Reports

### Export Summary

```json
{
  "totalUsers": 150,
  "withEmail": 148,
  "emailVerified": 120,
  "roles": {
    "user": 145,
    "admin": 5
  },
  "exportedAt": "2026-02-17T..."
}
```

### Migration Report

```json
{
  "totalUsers": 150,
  "migrated": 148,
  "skipped": 2,
  "errors": 0,
  "validation": {
    "postgresqlUsers": 148,
    "totalCredits": 15420
  }
}
```

### Validation Report

```json
{
  "allPassed": true,
  "criticalFailed": false,
  "results": [
    {
      "category": "Users",
      "passed": true,
      "details": {...}
    },
    {
      "category": "Transactions",
      "passed": true,
      "details": {...}
    }
  ]
}
```

## Troubleshooting

### Export Failures

**Error**: `Firebase Admin not initialized`

**Solution**:
```bash
# Set Firebase credentials
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"

# Or use gcloud
gcloud auth application-default login
```

### Import Failures

**Error**: `User not found for transaction/project`

**Cause**: Transaction/project references non-existent user

**Solution**:
1. Check if user was skipped (disabled or no email)
2. Either skip the record or fix user data first

**Error**: `Duplicate key violation`

**Cause**: Record already exists in PostgreSQL

**Solution**:
- Script automatically skips existing records
- Safe to re-run migration scripts

### Validation Failures

**Critical**: `Transaction amount mismatch`

**Action**:
1. **STOP** - Do not proceed to production
2. Review transaction-migration-report.json
3. Check for:
   - Missing transactions
   - Incorrect amounts
   - Status mismatches
4. Re-run migration if needed
5. Contact support if issue persists

## Best Practices

### 1. Dry Run First

Test migration on development environment:

```bash
# Use development Firebase project
export FIREBASE_PROJECT_ID="arkan-dev"

# Run migration
npm run migrate:full

# Review reports
cat migration-exports/validation-report.json
```

### 2. Backup Everything

Before production migration:

```bash
# Backup Firebase
gcloud firestore export gs://your-bucket/backup

# Backup PostgreSQL (if has existing data)
pg_dump arkan_dev > backup.sql
```

### 3. Run During Low Traffic

- Schedule migration during off-peak hours
- Notify users of maintenance window
- Have rollback plan ready

### 4. Monitor Progress

```bash
# Watch migration in real-time
npm run migrate:full 2>&1 | tee migration.log

# Check PostgreSQL
docker exec -it arkan-postgres psql -U arkan_user -d arkan_dev -c "
  SELECT 'users' as table, COUNT(*) as count FROM users
  UNION ALL
  SELECT 'transactions', COUNT(*) FROM transactions
  UNION ALL
  SELECT 'projects', COUNT(*) FROM projects;
"
```

## Production Migration Checklist

- [ ] Tested migration on staging/development
- [ ] All validation checks passed
- [ ] No critical failures
- [ ] Financial data verified (transactions)
- [ ] Backup of Firebase data created
- [ ] Backup of PostgreSQL database created
- [ ] Maintenance window scheduled
- [ ] Users notified
- [ ] Rollback plan prepared
- [ ] Support team on standby

## Rollback Plan

If migration fails:

1. **Stop immediately** if validation fails
2. **Do not delete** Firebase data
3. **Restore PostgreSQL** from backup if needed:
   ```bash
   psql arkan_dev < backup.sql
   ```
4. **Switch back** to Firebase in application
5. **Investigate** issues in reports
6. **Fix problems** and retry

## Post-Migration

After successful migration:

1. **Run final validation**:
   ```bash
   npm run migrate:validate
   ```

2. **Verify user login**:
   - Test with admin account
   - Test with regular user
   - Test OAuth login

3. **Check financial data**:
   ```sql
   -- Verify transaction totals
   SELECT 
     status,
     COUNT(*) as count,
     SUM(amount) as total_amount,
     SUM(credits) as total_credits
   FROM transactions
   GROUP BY status;
   ```

4. **Monitor for issues**:
   - Check error logs
   - Monitor user complaints
   - Verify credit balances

5. **Keep Firebase running** for 2 weeks:
   - Parallel system for validation
   - Rollback capability
   - Data comparison

## Support

### Log Files

All migration outputs are saved in `migration-exports/`:
- Export summaries
- Migration reports
- Validation reports
- Error logs

### Common Issues

See `migration-exports/` directory for:
- `*-errors.json` - Detailed error information
- `validation-report.json` - Validation failures
- `full-migration-report.json` - Complete migration log

### Getting Help

If you encounter issues:
1. Review error logs in `migration-exports/`
2. Check validation report
3. Review this guide
4. Contact support with log files

---

**Ready to migrate? Start with `npm run migrate:full`** 🚀
