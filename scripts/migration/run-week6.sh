#!/bin/bash

###############################################################################
# Week 6 Migration - Master Execution Script
# Runs all phases of Week 6 migration in sequence
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Banner
echo "╔════════════════════════════════════════════════════════╗"
echo "║   Week 6 Migration - Full Execution                   ║"
echo "║   Dynamic Flow System                                  ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Check prerequisites
log_info "Checking prerequisites..."

if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    log_error "npm is not installed"
    exit 1
fi

if [ ! -f "docudec-firebase-adminsdk-2maa7-d07a19d3fc.json" ]; then
    log_error "Firebase service account key not found"
    exit 1
fi

log_success "Prerequisites check passed"
echo ""

# Create output directory
log_info "Creating output directory..."
mkdir -p migration-output
log_success "Output directory ready"
echo ""

# Phase 1: Run Migration
log_info "═══════════════════════════════════════════════════════"
log_info "Phase 1: Running Migration (25 flows)"
log_info "═══════════════════════════════════════════════════════"
echo ""

if npx tsx scripts/migration/week6-migration-batch.ts; then
    log_success "Migration completed successfully"
else
    log_error "Migration failed"
    exit 1
fi

echo ""
read -p "Continue to testing? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_warning "Migration stopped by user"
    exit 0
fi

# Phase 2: Run Tests
log_info "═══════════════════════════════════════════════════════"
log_info "Phase 2: Running Tests"
log_info "═══════════════════════════════════════════════════════"
echo ""

if npx tsx scripts/migration/week6-test-migrations.ts; then
    log_success "Tests completed successfully"
else
    log_warning "Some tests failed. Review test report."
    log_info "Test report: migration-output/week6-test-report.json"
fi

echo ""
read -p "Continue to staging deployment? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_warning "Deployment stopped by user"
    exit 0
fi

# Phase 3: Deploy to Staging
log_info "═══════════════════════════════════════════════════════"
log_info "Phase 3: Deploying to Staging"
log_info "═══════════════════════════════════════════════════════"
echo ""

if npx tsx scripts/migration/week6-deploy-staging.ts; then
    log_success "Staging deployment completed successfully"
else
    log_error "Staging deployment failed"
    log_warning "Run rollback if needed: npm run rollback:staging"
    exit 1
fi

# Summary
echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║   Week 6 Migration Complete!                          ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
log_success "25 flows migrated and deployed to staging"
echo ""
log_info "Next Steps:"
echo "  1. Review migration report: migration-output/week6-migration-report.json"
echo "  2. Review test report: migration-output/week6-test-report.json"
echo "  3. Review deployment report: migration-output/week6-deployment-report.json"
echo "  4. Test flows manually in staging environment"
echo "  5. Monitor for 24-48 hours before Week 7"
echo ""
log_info "Documentation: WEEK_6_MIGRATION_COMPLETE.md"
echo ""
