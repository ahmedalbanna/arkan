# PostgreSQL Migration - Quick Start Guide

**🚀 Get started with the migration in 5 minutes**

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Docker installed and running
- [ ] Git repository cloned
- [ ] Terminal/command line ready

## Quick Setup Steps

### 1. Install Dependencies (30 seconds)

```bash
# Already installed in this project:
# - prisma
# - @prisma/client
# - next-auth
# - @next-auth/prisma-adapter
# - bcrypt
```

### 2. Configure Environment (1 minute)

```bash
# Copy environment template
cp .env.migration .env.local

# Edit .env.local and set:
# - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)
# - DB_PASSWORD (your secure password)
# - HASURA_ADMIN_SECRET (your secure secret)
```

### 3. Start Docker Services (2-5 minutes)

```bash
# Start all services
npm run docker:up

# Wait for services to be healthy
# This may take a few minutes on first run (downloading images)

# Verify services are running
docker ps
```

Expected output:
```
NAMES              STATUS                    PORTS
arkan-hasura       Up (healthy)              0.0.0.0:8080->8080/tcp
arkan-postgres     Up (healthy)              0.0.0.0:5432->5432/tcp
arkan-qdrant       Up (healthy)              0.0.0.0:6333->6333/tcp
arkan-ollama       Up (healthy)              0.0.0.0:11434->11434/tcp
```

### 4. Initialize Database (1 minute)

```bash
# Generate Prisma client
npm run prisma:generate

# Create database schema
npm run prisma:migrate
# When prompted, name it: "init"

# Seed initial data
npm run db:seed

# Verify everything works
npm run migration:verify
```

### 5. Verify Installation (30 seconds)

```bash
# Open Prisma Studio (database GUI)
npm run prisma:studio
# Opens at: http://localhost:5555

# Open Hasura Console (GraphQL)
# Navigate to: http://localhost:8080
# Login with your HASURA_ADMIN_SECRET
```

## ✅ Success Criteria

You should see:
- ✅ 4 Docker containers running and healthy
- ✅ Prisma Studio showing 20+ database tables
- ✅ 2 users in the database (admin, test)
- ✅ Hasura Console accessible with GraphQL API
- ✅ Verification script passes all checks

## 🎯 What You Get

### Database Schema
- **NextAuth Models**: Users, Accounts, Sessions, Tokens
- **Financial Models**: Transactions, Credit Ledger
- **Project Models**: Projects, Templates (Report, DOCX, PPTX)
- **Agent Models**: Agents, Agent Categories
- **RAG Models**: Indexed Documents
- **System Models**: Settings, Features, Notifications, API Tokens, Logs

### Pre-configured Users
- **Admin**: `admin@arkan.dev` (10,000 credits)
- **Test User**: `test@arkan.dev` (100 credits)

### Services Running
- **PostgreSQL**: Database on port 5432
- **Hasura**: GraphQL API on port 8080
- **Prisma Studio**: Database GUI on port 5555 (when started)
- **Qdrant**: Vector database on port 6333
- **Ollama**: Local LLM on port 11434

## 🔧 Useful Commands

```bash
# Docker Management
npm run docker:up          # Start all services
npm run docker:down        # Stop all services
npm run docker:logs        # View all logs

# Prisma Operations
npm run prisma:studio      # Open database GUI
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Create new migration
npm run prisma:reset       # Reset database (⚠️ deletes data)

# Database Operations
npm run db:seed            # Seed database
npm run migration:verify   # Verify setup

# Direct Database Access
docker exec -it arkan-postgres psql -U arkan_user -d arkan_dev
```

## 🐛 Troubleshooting

### Docker containers not starting?
```bash
# Check Docker is running
docker --version

# Check logs
docker compose logs postgres
docker compose logs hasura

# Restart services
npm run docker:down
npm run docker:up
```

### Prisma migration fails?
```bash
# Reset and try again
npm run prisma:reset
npm run prisma:migrate
npm run db:seed
```

### Can't connect to database?
```bash
# Check PostgreSQL is healthy
docker exec arkan-postgres pg_isready -U arkan_user -d arkan_dev

# Check connection string in .env.local
# Should be: postgresql://arkan_user:YOUR_PASSWORD@localhost:5432/arkan_dev
```

## 📚 Next Steps

1. **Explore the Database**
   - Open Prisma Studio: `npm run prisma:studio`
   - Browse tables and relationships

2. **Try GraphQL API**
   - Open Hasura Console: http://localhost:8080
   - Run sample queries

3. **Review Documentation**
   - Read: `docs/migration/PHASE_0_SETUP_GUIDE.md`
   - Review: `docs/migration/IMPLEMENTATION_STATUS.md`

4. **Proceed to Phase 1**
   - Create database triggers
   - Setup Row-Level Security
   - Configure Hasura metadata

## 🆘 Need Help?

Check these resources:
- `docs/migration/PHASE_0_SETUP_GUIDE.md` - Detailed setup guide
- `docs/migration/IMPLEMENTATION_STATUS.md` - Current status
- `docs/migration/MIGRATION_PLAN.md` - Full migration plan
- `prisma/schema.prisma` - Database schema
- `.env.migration` - Environment template

## 📊 Current Migration Status

**Phase 0**: ✅ 85% Complete (Infrastructure Setup)
- Docker services configured
- Prisma schema created
- NPM scripts added
- Seed data ready
- Verification tools created

**Next Phase**: Phase 1 - Database Schema & Triggers

**Estimated Total Timeline**: 6-8 weeks
**Time Elapsed**: ~1 hour

---

**You're ready to start migrating from Firebase to PostgreSQL! 🎉**
