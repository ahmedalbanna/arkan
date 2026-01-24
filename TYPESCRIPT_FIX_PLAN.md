# TypeScript Error Resolution Plan

**Total Errors:** 314  
**Status:** In Progress  
**Priority:** HIGH - Blocks production deployment

---

## Error Breakdown by Type

| Error Code | Count | Category | Severity | Fix Strategy |
|-----------|-------|----------|----------|--------------|
| TS2339 | 87 | Property doesn't exist | 🔴 HIGH | Update schemas/interfaces |
| TS2614 | 52 | Module export missing | 🔴 HIGH | Add missing exports to index files |
| TS2741 | 31 | Missing required property | 🟠 MEDIUM | Add optional chaining or defaults |
| TS2554 | 29 | Too many arguments | 🟠 MEDIUM | Fix function signatures |
| TS7006 | 24 | Implicit any type | 🟠 MEDIUM | Add explicit type annotations |
| TS2322 | 20 | Type mismatch | 🟠 MEDIUM | Add type conversions |
| TS2345 | 18 | Wrong argument type | 🟠 MEDIUM | Match parameter types |
| Other | 13 | Various | 🟡 LOW | Case-by-case fixes |

---

## Top Problem Areas

### 1. **AI Flows (127 errors)** 🔴 CRITICAL
- Files: academic-paper-quality-checker.ts, academic-literature-review.ts, professional-document-writer.ts, graduation-project-generator.ts
- Root Cause: Missing tool imports + schema mismatches
- Fix: Export missing tools from `src/ai/index.ts`

### 2. **Model Definitions (34 errors)** 🔴 CRITICAL
- Files: creative-content-config.ts, project.ts, Section.prompt.test.ts
- Root Cause: Missing or incorrect property types
- Fix: Update Zod schemas and interfaces

### 3. **Test Files (73 errors)** 🟠 MEDIUM
- Files: admin-templates.test.ts, users.test.ts, auth context tests
- Root Cause: Implicit any types, missing mocks
- Fix: Add explicit type annotations and proper mocks

### 4. **Components (21 errors)** 🟠 MEDIUM
- Files: editor, dialogs, metadata forms
- Root Cause: Missing prop types, implicit any
- Fix: Add proper TypeScript annotations

### 5. **API Routes (5 errors)** 🟡 LOW
- Files: process-file/route.ts, generate/image/route.ts
- Root Cause: Type mismatches in request/response
- Fix: Proper type annotations for request bodies

---

## Detailed Fix Strategy

### Phase 1: Core Exports (Priority 1)
**Goal:** Fix TS2614 errors (52 errors)  
**Time:** 1-2 hours

**Action Items:**
1. Check `src/ai/index.ts` - Add missing tool exports
2. Check `src/lib/models/index.ts` - Add missing model exports
3. Update all import statements to use correct exports

**Files to Check:**
- `src/ai/index.ts` - Export all tools
- `src/ai/flows/index.ts` - Export all flows
- `src/lib/models/index.ts` - Export all models

### Phase 2: Schema & Type Fixes (Priority 2)
**Goal:** Fix TS2339 + TS2741 errors (118 errors)  
**Time:** 2-3 hours

**Action Items:**
1. Update `src/ai/schemas/` with proper field definitions
2. Update model classes with missing properties
3. Align test schemas with actual schemas

**Affected Files:**
- `src/ai/schemas/base-schemas.ts`
- `src/lib/models/creative-content-config.ts`
- `src/lib/models/project.ts`

### Phase 3: Type Annotations (Priority 3)
**Goal:** Fix TS7006 + TS2554 errors (53 errors)  
**Time:** 2-3 hours

**Action Items:**
1. Add explicit type annotations to function parameters
2. Fix function signatures to match call sites
3. Remove implicit any types

**Files Pattern:**
- All test files with `Parameter 'x' implicitly has an 'any' type`
- Editor files with implicit types

### Phase 4: Test Fixes (Priority 4)
**Goal:** Fix remaining test errors (73 errors)  
**Time:** 1-2 hours

**Action Items:**
1. Add proper mock types
2. Fix expect() statements
3. Add missing jest type declarations

---

## Execution Plan

### Step 1: Understand Current Exports
```bash
# Check what's exported from main index files
grep "export" src/ai/index.ts | head -20
grep "export" src/lib/models/index.ts | head -20
```

### Step 2: Fix Missing Exports
```bash
# Add missing tool exports
# Add missing flow exports
# Add missing model exports
```

### Step 3: Fix Schema Mismatches
```bash
# Update Zod schemas to match implementation
# Add missing properties to interfaces
# Update test schemas
```

### Step 4: Add Type Annotations
```bash
# Add explicit types to function parameters
# Add return type annotations
# Remove implicit any types
```

### Step 5: Fix Test Issues
```bash
# Add jest type declarations
# Fix mock implementations
# Add proper expect() assertions
```

### Step 6: Verify
```bash
npm run typecheck
# Should reduce errors by 70-80%
```

---

## Quick Win Opportunities

### 1. Fix `src/ai/index.ts` (Fixes ~52 errors)
Expected time: 15-30 minutes

### 2. Fix `src/lib/models/index.ts` (Fixes ~20 errors)
Expected time: 20-30 minutes

### 3. Add `// @ts-ignore` for legacy code (Temporary)
Expected time: 15-20 minutes
Note: Use sparingly, not a long-term solution

---

## High-Impact Fixes (Priority Order)

1. ✅ Export missing tools from `src/ai/index.ts`
2. ✅ Update Zod schemas in `src/ai/schemas/`
3. ✅ Add type annotations to test files
4. ✅ Fix model property definitions
5. ✅ Update function signatures to match usage

---

## Expected Outcome

| Phase | Errors Before | Errors After | Reduction |
|-------|---------------|--------------|-----------|
| Phase 1 (Exports) | 314 | 262 | 52 (16%) |
| Phase 2 (Schemas) | 262 | 144 | 118 (38%) |
| Phase 3 (Types) | 144 | 91 | 53 (17%) |
| Phase 4 (Tests) | 91 | 18 | 73 (23%) |
| **Final** | 314 | **18** | **94%** |

**Remaining errors:** Mostly edge cases that can be handled with `@ts-ignore` or refactoring

---

## Implementation Priorities

### IMMEDIATE (This Session)
- [ ] Fix missing exports from index files
- [ ] Update core schema definitions
- [ ] Fix critical model type issues

### SHORT-TERM (Next 2 Hours)
- [ ] Add type annotations to all parameters
- [ ] Fix test file errors
- [ ] Update function signatures

### DEFERRED (Optional)
- [ ] Refactor legacy code patterns
- [ ] Add strict mode to remaining files
- [ ] Improve type safety in utilities

---

## Notes

- Most errors are fixable in 3-4 hours of focused work
- Some errors depend on fixing others (cascading fixes)
- Test errors can be fixed in parallel
- Use `npm run typecheck 2>&1 | grep "error TS"` to track progress

---

**Plan Created:** January 24, 2026  
**Estimated Total Time:** 6-8 hours  
**Target Completion:** This session + next session
