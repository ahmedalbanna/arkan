# CI/CD Configuration Guide - Arkan v0.1.0

**Date:** January 24, 2026  
**Status:** Production Ready  
**Version:** 1.0

---

## Table of Contents

1. [Overview](#overview)
2. [GitHub Actions Setup](#github-actions-setup)
3. [Required Secrets](#required-secrets)
4. [Workflow Configuration](#workflow-configuration)
5. [Deployment Pipeline](#deployment-pipeline)
6. [Monitoring & Alerts](#monitoring--alerts)
7. [Troubleshooting](#troubleshooting)

---

## Overview

This guide explains the automated CI/CD pipeline for Arkan v0.1.0 using GitHub Actions.

### Pipeline Stages

```
Push to Main
    ↓
Quality Checks (Tests, Lint, Type Check)
    ↓
Build Application
    ↓
Security Checks
    ↓
Verify Deployment Readiness
    ↓
Deploy to Staging
    ↓
Deploy to Production (if staging passes)
    ↓
Monitor Deployment
```

### Key Features

- ✅ Automated testing on every push
- ✅ Code quality checks (ESLint, TypeScript)
- ✅ Security scanning
- ✅ Automated staging deployment
- ✅ Conditional production deployment
- ✅ Post-deployment monitoring
- ✅ Slack notifications
- ✅ Automatic release creation

---

## GitHub Actions Setup

### Step 1: Enable GitHub Actions

1. Go to your GitHub repository
2. Click **Settings** → **Actions** → **General**
3. Enable GitHub Actions
4. Set action permissions:
   - ✅ Allow all actions and reusable workflows

### Step 2: Configure Secrets

Add the following secrets to your repository:

**Settings → Secrets and variables → Actions → New repository secret**

#### Required Secrets

```
FIREBASE_TOKEN                          - Firebase CLI token
FIREBASE_PROJECT_ID                     - Production Firebase project ID
FIREBASE_PROJECT_ID_STAGING             - Staging Firebase project ID

NEXT_PUBLIC_FIREBASE_API_KEY            - Firebase API key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN        - Firebase auth domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID         - Firebase project ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET     - Firebase storage bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID - Firebase messaging sender ID
NEXT_PUBLIC_FIREBASE_APP_ID             - Firebase app ID

SLACK_WEBHOOK                           - Slack webhook URL (optional)
GITHUB_TOKEN                            - GitHub token (auto-generated)
```

### Step 3: Get Firebase Token

```bash
# Login to Firebase CLI
firebase login:ci

# This will generate a token to use in GitHub Actions
# Copy this token and add it as FIREBASE_TOKEN secret
```

### Step 4: Verify Workflow File

Workflow file location: `.github/workflows/deploy.yml`

Check that it exists and is properly formatted:

```bash
git ls-files .github/workflows/
# Should show: deploy.yml
```

---

## Required Secrets

### Firebase Secrets

#### FIREBASE_TOKEN
```bash
# Generate token
firebase login:ci

# This creates a CI token with limited permissions
# Good practice: Regenerate periodically
```

**Security:** Keep this token private. It grants Firebase deployment access.

#### FIREBASE_PROJECT_ID (Production)
```
Example: arkan-production-12345
```

**Security:** This is public information but should not be shared.

#### FIREBASE_PROJECT_ID_STAGING
```
Example: arkan-staging-12345
```

**Security:** Separate staging project reduces deployment risk.

### Firebase Configuration Secrets

These are your public Firebase configuration values:

```javascript
// From Firebase Console → Project Settings → Web Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyD...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=arkan.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=arkan-12345
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=arkan-12345.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### Slack Webhook (Optional)

For deployment notifications:

```bash
# 1. Create Slack app: https://api.slack.com/apps
# 2. Enable Incoming Webhooks
# 3. Create new webhook for your channel
# 4. Copy webhook URL to SLACK_WEBHOOK secret

# Example:
# https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
```

---

## Workflow Configuration

### Trigger Conditions

The workflow triggers automatically:

```yaml
on:
  push:
    branches:
      - main
    paths-ignore:
      - '**.md'        # Skip on documentation changes
      - 'docs/**'      # Skip on docs folder changes
  workflow_dispatch:   # Manual trigger
```

### Manual Deployment

To manually trigger deployment:

1. Go to **Actions** tab
2. Select **Deploy to Production** workflow
3. Click **Run workflow**
4. Select environment (staging/production)
5. Click **Run workflow**

---

## Deployment Pipeline

### Stage 1: Quality Checks

**Duration:** ~5 minutes

```
✓ TypeScript compilation
✓ ESLint validation
✓ Run all tests (351 tests)
✓ Generate coverage report
✓ Upload to Codecov
```

**Failure:** Pipeline stops, team notified

### Stage 2: Build

**Duration:** ~3 minutes

```
✓ Install dependencies
✓ Build Next.js application
✓ Verify build output
✓ Upload artifact
```

**Failure:** Pipeline stops, team notified

### Stage 3: Security Checks

**Duration:** ~2 minutes

```
✓ npm audit (production dependencies)
✓ Check for hardcoded secrets
✓ Verify .env.example exists
```

**Failure:** Pipeline stops (can be overridden)

### Stage 4: Verification

**Duration:** ~2 minutes

```
✓ Run pre-deployment script
✓ Verify Firebase configuration
✓ Check all requirements met
```

**Failure:** Pipeline stops

### Stage 5: Deploy to Staging

**Duration:** ~5 minutes

```
✓ Deploy to staging Firebase project
✓ Verify health endpoint
✓ Send Slack notification
```

**Success:** Proceeds to production  
**Failure:** Pipeline stops, team notified

### Stage 6: Deploy to Production

**Duration:** ~5 minutes

```
✓ Create deployment tag
✓ Deploy to production Firebase project
✓ Verify health endpoint (retry 5x)
✓ Create GitHub release
✓ Send Slack notification
```

**Success:** Pipeline complete, monitored  
**Failure:** Rollback procedures initiated

### Stage 7: Post-Deployment Monitoring

**Duration:** ~3 minutes

```
✓ Check application health
✓ Monitor error rate
✓ Verify database connectivity
✓ Send final notification
```

---

## Monitoring & Alerts

### Health Checks

Each deployment verifies:

```bash
curl https://arkan.example.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-24T12:00:00Z",
  "uptime": 3600,
  "version": "0.1.0",
  "checks": {
    "database": "ok",
    "storage": "ok",
    "cache": "ok"
  },
  "environment": "production"
}
```

### Slack Notifications

Deployment status sent to Slack:

```
✅ Quality Checks PASSED
✅ Build PASSED
✅ Security Checks PASSED
✅ Staging deployment PASSED
🚀 Production deployment PASSED
✅ Post-deployment monitoring complete
```

### Error Notifications

If anything fails:

```
❌ Quality Checks FAILED
   - Test failures detected
   - Action: https://github.com/...

Contact: Deployment team
Time: 2026-01-24 12:30 UTC
```

---

## Troubleshooting

### Issue: Workflow fails on tests

**Solution:**
1. Check test output in GitHub Actions logs
2. Run tests locally: `npm run test`
3. Fix failing tests
4. Push fixes to main branch

### Issue: Firebase deployment fails

**Solution:**
1. Verify FIREBASE_TOKEN is valid: `firebase login:ci`
2. Check Firebase project ID is correct
3. Verify service account has required permissions
4. Check Firebase Rules are correct

### Issue: Health check times out

**Solution:**
1. Wait 5-10 minutes for cold start
2. Check Firebase project is active
3. Verify CORS is configured
4. Check network connectivity

### Issue: Slack notifications not working

**Solution:**
1. Verify SLACK_WEBHOOK secret is set
2. Check webhook URL is valid
3. Verify Slack app has permissions
4. Check webhook hasn't expired

### Issue: Production deployment skipped

**Solution:**
Check workflow triggers:
```yaml
if: github.event_name == 'push' && github.ref == 'refs/heads/main'
```

- Only deploys on push to `main` branch
- Use workflow_dispatch for manual deployment
- Check branch protection rules

---

## Best Practices

### 1. Branch Protection

Enable branch protection on `main`:

1. Go to **Settings** → **Branches**
2. Add rule for `main`
3. Require status checks:
   - ✅ quality-checks
   - ✅ build
   - ✅ security-checks
   - ✅ verify-deployment

### 2. Secrets Management

- ✅ Rotate FIREBASE_TOKEN monthly
- ✅ Use separate staging/production Firebase projects
- ✅ Never commit secrets to git
- ✅ Use dependabot for dependency updates

### 3. Monitoring

- ✅ Monitor GitHub Actions usage
- ✅ Review deployment logs regularly
- ✅ Set up error alerts
- ✅ Track deployment frequency

### 4. Deployment Strategy

- ✅ Always test in staging first
- ✅ Deploy during business hours initially
- ✅ Have rollback plan ready
- ✅ Monitor error rates post-deployment

---

## Workflow Customization

### Add Additional Tests

```yaml
- name: Run E2E tests
  run: pnpm run test:e2e
```

### Add Performance Tests

```yaml
- name: Run performance tests
  run: pnpm run test:perf
```

### Add Deployment Validation

```yaml
- name: Validate deployment
  run: bash scripts/validate-production.sh
```

### Add Custom Notifications

```yaml
- name: Send deployment report
  run: |
    curl -X POST ${{ secrets.WEBHOOK_URL }} \
      -d "Deployment completed: ${{ job.status }}"
```

---

## Environment Configuration

### Staging Environment

- **Project ID:** arkan-staging
- **URL:** https://staging-arkan.firebaseapp.com
- **Auto-deployed:** On every main branch push
- **TTL:** Permanent (for testing)

### Production Environment

- **Project ID:** arkan-production
- **URL:** https://arkan.example.com
- **Auto-deployed:** After staging passes
- **Monitoring:** Continuous

---

## Quick Reference

### Manual Deployment

```bash
# Trigger workflow manually
gh workflow run deploy.yml -f environment=production
```

### Check Deployment Status

```bash
# View recent runs
gh run list --workflow=deploy.yml --limit=10

# View specific run
gh run view RUN_ID
```

### View Logs

```bash
# View job logs
gh run view RUN_ID --log
```

### Rollback

```bash
# Revert to previous deployment
firebase hosting:rollback --project=PROJECT_ID
```

---

## Support

For CI/CD issues:
1. Check GitHub Actions logs
2. Review this documentation
3. Check Firebase status page
4. Contact DevOps team

---

## Summary

✅ Automated testing on every push  
✅ Automated building and security checks  
✅ Automated staging deployment  
✅ Conditional production deployment  
✅ Post-deployment monitoring  
✅ Slack notifications  
✅ GitHub releases  

**Deployment Pipeline: Complete and Ready** 🚀

---

**Last Updated:** January 24, 2026  
**Status:** Production Ready
