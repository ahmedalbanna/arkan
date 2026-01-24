# Deployment Runbook - Arkan v0.1.0

**Last Updated:** January 24, 2026  
**Status:** Production Ready ✅  
**Version:** v0.1.0

---

## Table of Contents

1. [Pre-Deployment](#pre-deployment)
2. [Deployment Steps](#deployment-steps)
3. [Post-Deployment Verification](#post-deployment-verification)
4. [Monitoring & Alerts](#monitoring--alerts)
5. [Rollback Procedures](#rollback-procedures)
6. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment

### 1. Run Verification Script

```bash
# Make script executable
chmod +x scripts/pre-deployment-verify.sh

# Run comprehensive checks
bash scripts/pre-deployment-verify.sh
```

**Expected Output:**
```
✅ ALL PRE-DEPLOYMENT CHECKS PASSED ✅
🚀 READY FOR PRODUCTION DEPLOYMENT 🚀
```

### 2. Verify Environment Variables

```bash
# Check .env file exists and contains all required variables
cat .env

# Required variables:
# - NEXT_PUBLIC_FIREBASE_API_KEY
# - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
# - NEXT_PUBLIC_FIREBASE_PROJECT_ID
# - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
# - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
# - NEXT_PUBLIC_FIREBASE_APP_ID
# - FIREBASE_ADMIN_SDK_KEY (if using admin functions)
# - DATABASE_URL (if using external database)
# - API_SECRET_KEY (for internal APIs)
```

### 3. Create Git Release Tag

```bash
# Tag the release
git tag -a v0.1.0 -m "Production release v0.1.0"

# Push tag to repository
git push origin v0.1.0

# Verify tag
git describe --tags
```

### 4. Final Test Run

```bash
# Run full test suite one final time
npm run test

# Expected: 351/351 tests passing (100%)
```

---

## Deployment Steps

### Step 1: Production Build

```bash
# Clean previous build
rm -rf .next node_modules

# Install dependencies
npm install --production

# Create optimized production build
npm run build

# Verify build output
du -sh .next/
# Expected: < 100MB
```

### Step 2: Firebase Deployment

#### Option A: Using Firebase CLI

```bash
# Login to Firebase (if not already logged in)
firebase login

# Deploy to production
firebase deploy --only hosting,firestore,storage,functions

# Expected output:
# ✔ Deploy complete!
```

#### Option B: Using GitHub Actions / CI/CD

```yaml
# Example GitHub Actions deployment
- name: Deploy to Firebase
  uses: FirebaseExtended/action-hosting-deploy@v0
  with:
    repoToken: ${{ secrets.GITHUB_TOKEN }}
    firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
    channelId: live
    projectId: your-project-id
```

### Step 3: Database Migration (if applicable)

```bash
# Run any pending database migrations
npm run migrate:up

# Verify migration status
npm run migrate:status

# Expected: All migrations completed
```

### Step 4: Verify Deployment

```bash
# Check deployment status
firebase hosting:list

# View deployment logs
firebase functions:log

# Expected: No critical errors
```

---

## Post-Deployment Verification

### 1. Health Check Endpoint

```bash
# Check service health
curl https://arkan.example.com/api/health

# Expected response:
# {
#   "status": "healthy",
#   "timestamp": "2026-01-24T12:00:00Z",
#   "uptime": 45,
#   "version": "0.1.0",
#   "checks": {
#     "database": "ok",
#     "storage": "ok",
#     "cache": "ok"
#   },
#   "metrics": {
#     "memoryUsage": 65,
#     "cpuUsage": 0,
#     "responseTime": 12.5
#   },
#   "environment": "production"
# }
```

### 2. Critical Functionality Tests

```bash
# Test user signup
POST /api/auth/signup
{
  "email": "test@example.com",
  "password": "TestPassword123!",
  "name": "Test User"
}

# Expected: 200 OK with user data

# Test project creation
POST /api/projects
{
  "title": "Test Project",
  "type": "report"
}

# Expected: 200 OK with project data

# Test generation endpoint
POST /api/generate
{
  "projectId": "proj-123",
  "sectionId": "sec-123"
}

# Expected: 200 OK with generation status
```

### 3. Performance Monitoring

```bash
# Check page load time (should be < 2s)
curl -w "Time: %{time_total}s\n" https://arkan.example.com

# Check API response time (should be < 100ms)
curl -w "Time: %{time_starttransfer}s\n" https://arkan.example.com/api/health

# Expected: All responses within target times
```

### 4. Error Monitoring

```bash
# Check error logs
firebase functions:log --follow

# Check Firestore logs
gcloud firestore logs read --limit 50

# Expected: No critical errors
```

### 5. User Acceptance Testing

- [ ] User can sign up
- [ ] User can log in
- [ ] User can create project
- [ ] User can generate content
- [ ] User can export document (DOCX)
- [ ] User can purchase credits
- [ ] Admin dashboard accessible
- [ ] All forms functional

---

## Monitoring & Alerts

### 1. Setup Google Cloud Monitoring

```bash
# Enable monitoring
gcloud monitoring policies create \
  --display-name="Arkan Production" \
  --condition-display-name="High Error Rate" \
  --condition-threshold-value=1 \
  --notification-channels=[YOUR_CHANNEL_ID]
```

### 2. Configure Alerts

**Critical Alerts:**
- High error rate (>1% of requests)
- Service unavailable (0 healthy instances)
- High latency (>5s response time)
- High memory usage (>85%)

**Warning Alerts:**
- Moderate error rate (0.1-1%)
- Elevated latency (2-5s)
- Memory trending high (70-85%)

### 3. Monitoring Dashboard

```bash
# View Cloud Monitoring dashboard
gcloud monitoring dashboards create --config-from-file=monitoring-config.json

# Key metrics to monitor:
# - Request rate (target: 100-1000 req/min)
# - Error rate (target: <0.1%)
# - Latency P95 (target: <500ms)
# - Memory usage (target: <70%)
# - CPU usage (target: <60%)
```

### 4. Logging Setup

```bash
# Configure Cloud Logging
gcloud logging write arkan-deploy "Arkan v0.1.0 deployed to production"

# View logs
gcloud logging read "resource.type=cloud_function" --limit 50

# Setup log-based alerts
gcloud alpha logging sinks create arkan-errors \
  logging.googleapis.com/projects/PROJECT_ID/logs/arkan_errors
```

---

## Rollback Procedures

### Quick Rollback (if issues detected)

```bash
# Option 1: Revert to previous Firebase hosting version
firebase hosting:versions:list
firebase hosting:clone-version [VERSION_ID] live

# Option 2: Redeploy previous code
git checkout v0.0.9  # or previous stable version
npm run build
firebase deploy --only hosting

# Option 3: Full infrastructure rollback
# Contact DevOps team for database rollback if needed
```

### Database Rollback (if data issues)

```bash
# Restore from backup
gcloud firestore backups restore [BACKUP_ID]

# Verify data integrity
npm run verify:data

# Monitor for issues
firebase functions:log --follow
```

---

## Troubleshooting

### Issue: Deployment Fails

**Symptoms:** `firebase deploy` fails with error

**Solutions:**
1. Check authentication: `firebase login`
2. Verify project ID: `firebase projects:list`
3. Check build: `npm run build`
4. View detailed logs: `firebase deploy --debug`

### Issue: High Error Rate After Deployment

**Symptoms:** >1% of requests returning errors

**Solutions:**
1. Check error logs: `firebase functions:log`
2. Verify database connectivity
3. Check environment variables
4. Review recent changes
5. Consider rollback if > 5% error rate

### Issue: Performance Degradation

**Symptoms:** Response times > 5s

**Solutions:**
1. Check memory usage: `gcloud compute instances describe [INSTANCE]`
2. Review slow queries in Firestore
3. Check for database locks
4. Verify API rate limits
5. Scale up if necessary

### Issue: Authentication Failures

**Symptoms:** Users unable to log in

**Solutions:**
1. Verify Firebase Auth configuration
2. Check CORS settings
3. Verify API keys in .env
4. Review auth logs
5. Check for certificate issues

### Issue: File Upload Failures

**Symptoms:** Export/upload endpoints failing

**Solutions:**
1. Check Cloud Storage permissions
2. Verify bucket configuration
3. Check CORS rules in storage.rules
4. Verify file size limits
5. Check disk space on server

---

## Maintenance Tasks

### Daily (First Week)

- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Review user feedback
- [ ] Monitor disk space
- [ ] Check for security alerts

### Weekly

- [ ] Review analytics
- [ ] Check backup status
- [ ] Performance analysis
- [ ] Security audit
- [ ] Database optimization

### Monthly

- [ ] Full security audit
- [ ] Performance optimization
- [ ] Dependency updates (if safe)
- [ ] Documentation updates
- [ ] Capacity planning

---

## Emergency Contacts

| Role | Contact | Response Time |
|------|---------|----------------|
| On-Call Engineer | [Number] | 15 min |
| DevOps Lead | [Number] | 30 min |
| Security Lead | [Number] | 1 hour |
| Project Manager | [Email] | 2 hours |

---

## Success Metrics

### Deployment Success Criteria

- ✅ All services operational
- ✅ No critical errors
- ✅ Response time < 500ms
- ✅ Error rate < 0.1%
- ✅ All endpoints responding
- ✅ Database connected
- ✅ File uploads working
- ✅ Authentication working

### Post-Deployment Targets

| Metric | Target | Priority |
|--------|--------|----------|
| Uptime | 99.9% | Critical |
| Error Rate | <0.1% | Critical |
| Latency P95 | <500ms | High |
| Memory Usage | <70% | High |
| Data Consistency | 100% | Critical |

---

## Sign-Off

**Deployment Date:** [To be filled]  
**Deployed By:** [Name]  
**Reviewed By:** [Name]  
**Status:** ✅ Completed

---

## Quick Reference

```bash
# Pre-deployment
bash scripts/pre-deployment-verify.sh

# Deploy
npm run build && firebase deploy

# Verify
curl https://arkan.example.com/api/health

# Monitor
firebase functions:log --follow

# Rollback
firebase hosting:clone-version [VERSION_ID] live
```

---

**For detailed information, see PRODUCTION_DEPLOYMENT_CHECKLIST.md**
