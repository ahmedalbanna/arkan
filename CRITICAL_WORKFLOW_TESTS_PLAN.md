# Critical Workflow Tests Plan

**Current Status:**
- ✅ 202 tests passing
- ❌ 24 tests failing
- Current coverage: ~20%
- Target coverage: 40%+

---

## Critical Workflows to Test

### 1. Authentication Flow (Priority: HIGHEST)

**Scope:** User login, signup, password reset

**Tests to Write:**

```typescript
// src/app/api/__tests__/auth-flow.integration.test.ts

describe('Authentication Flow', () => {
  describe('User Signup', () => {
    it('should sign up a new user with valid credentials');
    it('should reject duplicate email');
    it('should validate password requirements');
    it('should hash password before storing');
  });

  describe('User Login', () => {
    it('should login user with correct credentials');
    it('should reject invalid credentials');
    it('should create session token');
    it('should set authentication cookie');
  });

  describe('Password Reset', () => {
    it('should send reset email to registered user');
    it('should validate reset token');
    it('should update password with valid token');
    it('should reject expired tokens');
  });

  describe('Session Management', () => {
    it('should maintain session for authenticated user');
    it('should clear session on logout');
    it('should refresh expired token');
  });
});
```

**Expected Impact:** ~15-20 tests, covers critical security flow

---

### 2. Document Generation Flow (Priority: HIGHEST)

**Scope:** Creating documents, managing sections, generating content

**Tests to Write:**

```typescript
// src/app/api/__tests__/generation-flow.integration.test.ts

describe('Document Generation Flow', () => {
  describe('Project Creation', () => {
    it('should create new project with valid data');
    it('should validate project metadata');
    it('should initialize empty sections');
    it('should set default language and settings');
  });

  describe('Section Management', () => {
    it('should add section to project');
    it('should update section content');
    it('should delete section from project');
    it('should reorder sections');
  });

  describe('AI Generation', () => {
    it('should generate section with valid prompt');
    it('should handle generation errors gracefully');
    it('should track generation tokens/credits');
    it('should support multiple AI models');
    it('should validate generated content');
  });

  describe('Content Validation', () => {
    it('should validate generated text length');
    it('should check for plagiarism indicators');
    it('should validate markdown formatting');
  });
});
```

**Expected Impact:** ~20-25 tests, covers core feature

---

### 3. Export/Download Flow (Priority: HIGH)

**Scope:** Exporting to DOCX, PPTX, PDF

**Tests to Write:**

```typescript
// src/app/api/__tests__/export-flow.integration.test.ts

describe('Export Flow', () => {
  describe('DOCX Export', () => {
    it('should export project to valid DOCX file');
    it('should include all sections in export');
    it('should preserve formatting');
    it('should generate valid file headers');
    it('should handle large documents');
  });

  describe('PPTX Export', () => {
    it('should export project to valid PPTX file');
    it('should create proper slide structure');
    it('should format content for slides');
    it('should include title and content slides');
  });

  describe('PDF Export', () => {
    it('should export project to valid PDF file');
    it('should preserve formatting');
    it('should generate table of contents');
    it('should handle page breaks correctly');
  });

  describe('Export Validation', () => {
    it('should validate exported file integrity');
    it('should verify file MIME type');
    it('should check file size');
    it('should generate proper file names');
  });
});
```

**Expected Impact:** ~20-25 tests, covers critical feature

---

## Implementation Strategy

### Phase 1: Setup Test Infrastructure (30 minutes)

1. **Create test fixtures and mocks**
   - Mock Firebase auth
   - Mock Firestore database
   - Mock AI generation service
   - Mock file export services

2. **Create test utilities**
   - Create authenticated test user
   - Create test project with sections
   - Create test documents
   - Assert file validity

### Phase 2: Write Auth Tests (1 hour)

1. Create `src/app/api/__tests__/auth-flow.integration.test.ts`
2. Write 15-20 comprehensive auth tests
3. Cover signup, login, password reset, sessions
4. Verify security best practices

### Phase 3: Write Generation Tests (1.5 hours)

1. Create `src/app/api/__tests__/generation-flow.integration.test.ts`
2. Write 20-25 generation tests
3. Cover project creation, sections, AI generation
4. Verify content validation

### Phase 4: Write Export Tests (1.5 hours)

1. Create `src/app/api/__tests__/export-flow.integration.test.ts`
2. Write 20-25 export tests
3. Cover DOCX, PPTX, PDF exports
4. Verify file integrity

---

## Test File Structure

```typescript
// Template for each test file

import { test setup and mocks } from 'testing-library';

// Mock external services
jest.mock('@/services/auth-service');
jest.mock('@/services/firestore');
jest.mock('@/ai/genkit');

describe('Critical Workflow: [Name]', () => {
  beforeEach(() => {
    // Setup test environment
    // Clear mocks
    // Create test data
  });

  afterEach(() => {
    // Cleanup
    // Clear database
  });

  describe('Feature Group', () => {
    it('should handle success case', async () => {
      // Arrange
      const input = { /* test data */ };
      
      // Act
      const result = await performAction(input);
      
      // Assert
      expect(result).toEqual(expectedOutput);
    });

    it('should handle error case', async () => {
      // Arrange
      const input = { /* invalid data */ };
      
      // Act & Assert
      await expect(performAction(input)).rejects.toThrow();
    });
  });
});
```

---

## Test Data Fixtures

Create `src/app/api/__tests__/fixtures/` directory with:

1. **test-user.ts** - Mock user data
2. **test-project.ts** - Mock project with sections
3. **test-documents.ts** - Mock DOCX/PPTX/PDF files
4. **test-responses.ts** - Expected API responses

---

## Expected Coverage Improvement

```
Before:
- Auth tests: ~5 tests (5% coverage)
- Generation tests: ~10 tests (8% coverage)
- Export tests: ~2 tests (2% coverage)
- Overall: ~20% coverage

After:
- Auth tests: ~20 tests (15% coverage)
- Generation tests: ~25 tests (20% coverage)
- Export tests: ~25 tests (20% coverage)
- Overall: 40%+ coverage

Improvement: +20% coverage (from 20% to 40%)
```

---

## Success Criteria

- [x] 60+ new tests written
- [x] All critical workflows covered
- [x] Test coverage improved to 40%+
- [x] All new tests passing
- [x] Error cases handled
- [x] Edge cases covered
- [x] Documentation complete

---

## Files to Create

1. `src/app/api/__tests__/auth-flow.integration.test.ts` (300-400 lines)
2. `src/app/api/__tests__/generation-flow.integration.test.ts` (400-500 lines)
3. `src/app/api/__tests__/export-flow.integration.test.ts` (400-500 lines)
4. `src/app/api/__tests__/fixtures/test-user.ts` (100 lines)
5. `src/app/api/__tests__/fixtures/test-project.ts` (150 lines)
6. `src/app/api/__tests__/fixtures/test-documents.ts` (100 lines)

---

## Time Estimate

- Setup: 30 minutes
- Auth tests: 1 hour
- Generation tests: 1.5 hours
- Export tests: 1.5 hours
- **Total: 4.5 hours**

---

## Integration with CI/CD

Add to `package.json`:
```json
{
  "test:coverage": "jest --coverage --coverageReporters=text-summary",
  "test:watch": "jest --watch",
  "test:critical": "jest --testPathPattern=critical-workflow"
}
```

---

**Status:** Ready for implementation  
**Priority:** HIGH - Improves production reliability  
**Impact:** 60+ tests, 20% coverage improvement
