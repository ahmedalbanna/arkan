# PostgreSQL Migration - Quick Reference

**Status**: ✅ 100% Complete - Ready for Production

---

## 🚀 Quick Start

### Start All Services
\`\`\`bash
npm run docker:up
\`\`\`

### Access Tools
- **Prisma Studio**: http://localhost:5555 (`npm run prisma:studio`)
- **Hasura Console**: http://localhost:8080 (`npm run hasura:console`)
- **PostgreSQL**: localhost:5432

---

## 📋 Essential Commands

### Development
\`\`\`bash
npm run dev                 # Start Next.js dev server
npm run docker:up           # Start all Docker services
npm run docker:down         # Stop all Docker services
npm run prisma:studio       # Open Prisma Studio
npm run hasura:console      # Open Hasura Console
\`\`\`

### Testing
\`\`\`bash
npm run test:all            # Run all tests
npm run test:integration    # Integration tests only
npm run test:performance    # Performance benchmarks
npm run migration:verify    # Verify migration setup
\`\`\`

### Migration
\`\`\`bash
npm run migrate:full        # Full migration from Firebase
npm run migrate:validate    # Validate migration data
\`\`\`

### Production
\`\`\`bash
npm run prod:pre-cutover    # Pre-deployment checklist
npm run prod:backup         # Create database backup
npm run prod:monitor        # Monitor system health
npm run prod:validate       # Post-deployment validation
\`\`\`

---

## 📚 Documentation Index

### Migration Phases
1. [Phase 0 Complete](docs/migration/PHASE_0_COMPLETE.md) - Infrastructure
2. [Phase 1 Complete](docs/migration/PHASE_1_COMPLETE.md) - Database Enhancement
3. [Phase 2 Complete](docs/migration/PHASE_2_COMPLETE.md) - Authentication
4. [Phase 3 Complete](docs/migration/PHASE_3_COMPLETE.md) - Data Migration
5. [Phase 4 Complete](docs/migration/PHASE_4_COMPLETE.md) - Real-time GraphQL
6. [Phase 5 Complete](docs/migration/PHASE_5_COMPLETE.md) - Testing & Optimization
7. [Phase 6 Complete](docs/migration/PHASE_6_COMPLETE.md) - Production Cutover

### Essential Guides
- [Migration Complete Summary](MIGRATION_COMPLETE.md)
- [Migration Progress](docs/migration/MIGRATION_PROGRESS.md)
- [Production Cutover Plan](docs/migration/PRODUCTION_CUTOVER_PLAN.md)
- [Rollback Procedures](docs/migration/ROLLBACK_PROCEDURES.md)
- [Quick Start Guide](docs/migration/QUICK_START.md)

---

## 🎯 Production Deployment Checklist

### Before Cutover
- [ ] Review production cutover plan
- [ ] Run pre-cutover checklist (`npm run prod:pre-cutover`)
- [ ] Create database backup (`npm run prod:backup`)
- [ ] Brief team on rollback procedures
- [ ] Prepare monitoring dashboard

### During Cutover
- [ ] Deploy to staging first
- [ ] Enable feature flag gradually (5% → 25% → 50% → 100%)
- [ ] Monitor health continuously (`npm run prod:monitor`)
- [ ] Watch error rates and performance
- [ ] Be ready to rollback if needed

### After Cutover
- [ ] Run post-cutover validation (`npm run prod:validate`)
- [ ] Monitor for 24 hours
- [ ] Address user feedback
- [ ] Keep Firebase in read-only mode for 2 weeks
- [ ] Plan Firebase deprecation

---

## 🔧 Troubleshooting

### Services Not Starting
\`\`\`bash
docker-compose down
docker-compose up -d
docker ps  # Verify all running
\`\`\`

### Database Connection Issues
\`\`\`bash
# Check PostgreSQL logs
docker logs arkan-postgres

# Verify connection
docker exec arkan-postgres pg_isready -U arkan_user
\`\`\`

### Prisma Issues
\`\`\`bash
# Regenerate Prisma Client
npm run prisma:generate

# Check migration status
npx prisma migrate status
\`\`\`

---

## 📊 System Status

### Infrastructure
- ✅ PostgreSQL 15 (port 5432)
- ✅ Hasura GraphQL (port 8080)
- ✅ Qdrant Vector DB (port 6333)
- ✅ Ollama LLM (port 11434)

### Database
- ✅ 19 tables
- ✅ 65+ indexes
- ✅ 15+ triggers
- ✅ 44 RLS policies

### Features
- ✅ NextAuth authentication
- ✅ Real-time subscriptions
- ✅ GraphQL API
- ✅ Row-Level Security
- ✅ Audit logging

---

## 🆘 Emergency Contacts

### Rollback
If critical issues occur:
\`\`\`bash
# 1. Set feature flag
NEXT_PUBLIC_USE_POSTGRES=false

# 2. Deploy previous version
vercel rollback

# 3. Investigate and fix
# 4. Review docs/migration/ROLLBACK_PROCEDURES.md
\`\`\`

---

**Last Updated**: 2026-02-17  
**Status**: Ready for Production Deployment
