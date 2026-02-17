# Phase 0: Infrastructure Setup Guide

This guide walks you through setting up the PostgreSQL migration infrastructure.

## Prerequisites

- Node.js 18+ installed
- Docker and Docker Compose installed
- Git

## Step-by-Step Setup

### 1. Environment Configuration

Copy the migration environment template:

```bash
cp .env.migration .env.local
```

Edit `.env.local` and update the following:

```env
# Generate a secure secret for NextAuth
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Set a strong database password
DB_PASSWORD="your-secure-password-here"

# Set a strong Hasura admin secret
HASURA_ADMIN_SECRET="your-hasura-secret-here"
```

### 2. Start Docker Services

Start PostgreSQL and Hasura:

```bash
npm run docker:up
```

Verify services are running:

```bash
docker ps
```

You should see:
- `arkan-postgres` (port 5432)
- `arkan-hasura` (port 8080)
- `arkan-qdrant` (port 6333)
- `arkan-ollama` (port 11434)

### 3. Initialize Prisma

Generate Prisma client:

```bash
npm run prisma:generate
```

Create initial migration:

```bash
npm run prisma:migrate
```

When prompted, name the migration: `init`

### 4. Seed the Database

Populate with initial data:

```bash
npm run db:seed
```

This creates:
- Admin user: `admin@arkan.dev` (password: `admin123`)
- Test user: `test@arkan.dev`
- Agent categories
- Feature flags
- System settings

### 5. Verify Installation

Run the verification script:

```bash
npm run migration:verify
```

Expected output:
```
✅ PostgreSQL connected successfully
✅ Found XX tables
✅ All critical tables exist
✅ Migration verification completed successfully!
```

### 6. Access Admin Interfaces

**Prisma Studio** (Database GUI):
```bash
npm run prisma:studio
```
Open: http://localhost:5555

**Hasura Console** (GraphQL):
Open: http://localhost:8080

Login with:
- Admin Secret: (value from `.env.local`)

## Verification Checklist

- [ ] PostgreSQL running on port 5432
- [ ] Hasura running on port 8080
- [ ] Prisma client generated
- [ ] Database migrations applied
- [ ] Seed data created
- [ ] Verification script passes
- [ ] Prisma Studio accessible
- [ ] Hasura Console accessible

## Common Issues

### PostgreSQL Connection Failed

**Problem**: Cannot connect to PostgreSQL

**Solution**:
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check logs
docker logs arkan-postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### Prisma Migration Failed

**Problem**: Migration fails with "relation already exists"

**Solution**:
```bash
# Reset the database (WARNING: deletes all data)
npm run prisma:reset

# Re-run migrations
npm run prisma:migrate
```

### Hasura Not Starting

**Problem**: Hasura fails to start

**Solution**:
```bash
# Check if PostgreSQL is healthy
docker exec arkan-postgres pg_isready -U arkan_user

# Check Hasura logs
docker logs arkan-hasura

# Ensure DATABASE_URL is correct in docker-compose.yml
```

## Next Steps

Once Phase 0 is complete:

1. ✅ Review the database schema in Prisma Studio
2. ✅ Test Hasura GraphQL queries
3. ✅ Proceed to Phase 1: Database Triggers and Functions

## Useful Commands

```bash
# View all Docker logs
npm run docker:logs

# Stop all services
npm run docker:down

# Restart services
npm run docker:down && npm run docker:up

# Access PostgreSQL CLI
docker exec -it arkan-postgres psql -U arkan_user -d arkan_dev

# View Prisma Studio
npm run prisma:studio

# Generate Prisma client after schema changes
npm run prisma:generate

# Create a new migration
npm run prisma:migrate

# Apply migrations in production
npm run prisma:migrate:deploy
```

## Phase 0 Deliverables

- ✅ Docker Compose with PostgreSQL and Hasura
- ✅ Prisma schema configured
- ✅ Database migrations created
- ✅ Seed data script
- ✅ Verification script
- ✅ NPM scripts for common operations
- ✅ Environment configuration template

## Timeline

**Estimated Duration**: 2-4 hours

**Status**: Ready for implementation

---

**Next Phase**: [Phase 1: Schema & Database](./MIGRATION_PLAN.md#phase-1-schema--database-week-2)
