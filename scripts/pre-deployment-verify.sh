#!/bin/bash

################################################################################
# Pre-Deployment Verification Script for Arkan v0.1.0
# 
# This script performs comprehensive checks before production deployment:
# - Code quality verification
# - Test suite validation
# - Security audit
# - Performance checks
# - Build verification
# - Environment configuration
#
# Usage: bash scripts/pre-deployment-verify.sh
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
CHECKS_PASSED=0
CHECKS_FAILED=0
CHECKS_WARNING=0

# Helper functions
print_header() {
    echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"
}

print_check() {
    echo -e "${YELLOW}→ Checking: $1${NC}"
}

print_pass() {
    echo -e "${GREEN}✅ PASS: $1${NC}"
    ((CHECKS_PASSED++))
}

print_fail() {
    echo -e "${RED}❌ FAIL: $1${NC}"
    ((CHECKS_FAILED++))
}

print_warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
    ((CHECKS_WARNING++))
}

################################################################################
# 1. CODE QUALITY CHECKS
################################################################################

print_header "1. CODE QUALITY VERIFICATION"

print_check "TypeScript Compilation"
if npm run typecheck > /dev/null 2>&1; then
    print_pass "TypeScript compilation successful (0 errors)"
else
    print_fail "TypeScript compilation failed"
fi

print_check "ESLint Validation"
if npm run lint > /dev/null 2>&1; then
    print_pass "ESLint validation passed (0 errors)"
else
    print_fail "ESLint validation failed"
fi

print_check "Build Process"
if npm run build > /dev/null 2>&1; then
    print_pass "Production build successful"
    BUILD_SIZE=$(du -sh .next/ 2>/dev/null | cut -f1)
    echo -e "        Build size: ${GREEN}${BUILD_SIZE}${NC}"
else
    print_fail "Production build failed"
fi

################################################################################
# 2. TEST SUITE VALIDATION
################################################################################

print_header "2. TEST SUITE VALIDATION"

print_check "Running Full Test Suite"
TEST_OUTPUT=$(npm run test 2>&1 || true)
PASSED_TESTS=$(echo "$TEST_OUTPUT" | grep -oP 'Tests: \K[0-9]+(?= passed)' || echo "0")
FAILED_TESTS=$(echo "$TEST_OUTPUT" | grep -oP 'Tests:.*?\K[0-9]+(?= failed)' || echo "0")

if [ "$FAILED_TESTS" -eq 0 ] && [ "$PASSED_TESTS" -gt 0 ]; then
    print_pass "All tests passing (${PASSED_TESTS} tests)"
else
    print_fail "Test suite failures detected (${FAILED_TESTS} failed, ${PASSED_TESTS} passed)"
fi

print_check "Test Coverage"
if npm run test -- --coverage > /dev/null 2>&1; then
    COVERAGE=$(grep -oP 'Statements\s*:\s*\K[0-9.]+' coverage/coverage-summary.json || echo "0")
    if (( $(echo "$COVERAGE >= 70" | bc -l) )); then
        print_pass "Test coverage adequate (${COVERAGE}% >= 70%)"
    else
        print_warning "Test coverage below target (${COVERAGE}% < 70%)"
    fi
else
    print_warning "Could not generate coverage report"
fi

################################################################################
# 3. SECURITY AUDIT
################################################################################

print_header "3. SECURITY AUDIT"

print_check "Credentials in Code"
CREDENTIALS=$(grep -r "private_key\|api_key\|secret\|password" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "node_modules" | wc -l || true)
if [ "$CREDENTIALS" -eq 0 ]; then
    print_pass "No hardcoded credentials found"
else
    print_fail "Hardcoded credentials detected (${CREDENTIALS} occurrences)"
fi

print_check "Environment Variables"
if [ -f ".env.example" ]; then
    print_pass "Environment template exists"
    ENV_VARS=$(grep -c "=" .env.example || echo "0")
    echo -e "        Variables configured: ${GREEN}${ENV_VARS}${NC}"
else
    print_fail "Environment template (.env.example) not found"
fi

print_check "Dependencies Security"
if npm audit --production > /dev/null 2>&1; then
    print_pass "No critical security vulnerabilities in dependencies"
else
    print_warning "Some dependencies may have security advisories (check manually)"
fi

print_check "Firebase Configuration"
if [ -f "firestore.rules" ] && [ -f "storage.rules" ]; then
    print_pass "Firebase security rules configured"
else
    print_fail "Firebase security rules missing"
fi

################################################################################
# 4. PERFORMANCE CHECKS
################################################################################

print_header "4. PERFORMANCE CHECKS"

print_check "Bundle Size"
if [ -d ".next" ]; then
    BUNDLE_SIZE=$(du -sb .next/ | awk '{print $1}')
    BUNDLE_MB=$((BUNDLE_SIZE / 1024 / 1024))
    if [ "$BUNDLE_MB" -lt 100 ]; then
        print_pass "Bundle size optimal (${BUNDLE_MB}MB < 100MB)"
    else
        print_warning "Bundle size large (${BUNDLE_MB}MB >= 100MB)"
    fi
else
    print_fail "Build output not found"
fi

print_check "Performance Tests"
if npm run test -- src/__tests__/performance/ > /dev/null 2>&1; then
    print_pass "Performance benchmarks all passing"
else
    print_fail "Performance benchmarks failed"
fi

################################################################################
# 5. CONFIGURATION VERIFICATION
################################################################################

print_header "5. CONFIGURATION VERIFICATION"

print_check "Firebase Configuration"
if [ -f "firebase.json" ]; then
    print_pass "Firebase configuration exists"
else
    print_fail "Firebase configuration missing"
fi

print_check "Next.js Configuration"
if [ -f "next.config.ts" ]; then
    print_pass "Next.js configuration exists"
else
    print_fail "Next.js configuration missing"
fi

print_check "TypeScript Configuration"
if [ -f "tsconfig.json" ]; then
    print_pass "TypeScript configuration exists"
else
    print_fail "TypeScript configuration missing"
fi

print_check "Tailwind Configuration"
if [ -f "tailwind.config.ts" ]; then
    print_pass "Tailwind configuration exists"
else
    print_fail "Tailwind configuration missing"
fi

################################################################################
# 6. DOCUMENTATION VERIFICATION
################################################################################

print_header "6. DOCUMENTATION VERIFICATION"

print_check "Testing Guide"
if [ -f "docs/TESTING_GUIDE.md" ]; then
    LINES=$(wc -l < docs/TESTING_GUIDE.md)
    print_pass "Testing guide exists (${LINES} lines)"
else
    print_warning "Testing guide not found"
fi

print_check "Deployment Checklist"
if [ -f "docs/PRODUCTION_DEPLOYMENT_CHECKLIST.md" ]; then
    LINES=$(wc -l < docs/PRODUCTION_DEPLOYMENT_CHECKLIST.md)
    print_pass "Deployment checklist exists (${LINES} lines)"
else
    print_warning "Deployment checklist not found"
fi

print_check "README Documentation"
if [ -f "README.md" ]; then
    print_pass "README exists"
else
    print_warning "README not found"
fi

################################################################################
# 7. GIT STATUS
################################################################################

print_header "7. GIT STATUS"

print_check "Git Repository"
if git rev-parse --git-dir > /dev/null 2>&1; then
    UNCOMMITTED=$(git status --short 2>/dev/null | wc -l)
    if [ "$UNCOMMITTED" -eq 0 ]; then
        print_pass "Repository clean (0 uncommitted changes)"
    else
        print_warning "Uncommitted changes detected (${UNCOMMITTED})"
    fi
else
    print_warning "Not a git repository"
fi

print_check "Git Tags"
LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "none")
echo -e "        Latest tag: ${GREEN}${LATEST_TAG}${NC}"

################################################################################
# 8. SUMMARY REPORT
################################################################################

print_header "VERIFICATION SUMMARY"

TOTAL_CHECKS=$((CHECKS_PASSED + CHECKS_FAILED + CHECKS_WARNING))

echo -e "Total Checks: ${TOTAL_CHECKS}"
echo -e "  ${GREEN}✅ Passed: ${CHECKS_PASSED}${NC}"
echo -e "  ${RED}❌ Failed: ${CHECKS_FAILED}${NC}"
echo -e "  ${YELLOW}⚠️  Warnings: ${CHECKS_WARNING}${NC}"

echo ""

if [ "$CHECKS_FAILED" -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                            ║${NC}"
    echo -e "${GREEN}║     ✅ ALL PRE-DEPLOYMENT CHECKS PASSED ✅                ║${NC}"
    echo -e "${GREEN}║                                                            ║${NC}"
    echo -e "${GREEN}║        🚀 READY FOR PRODUCTION DEPLOYMENT 🚀              ║${NC}"
    echo -e "${GREEN}║                                                            ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                                                            ║${NC}"
    echo -e "${RED}║         ❌ DEPLOYMENT CHECKS FAILED ❌                    ║${NC}"
    echo -e "${RED}║                                                            ║${NC}"
    echo -e "${RED}║    Please fix the failures above before deployment         ║${NC}"
    echo -e "${RED}║                                                            ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
    exit 1
fi
