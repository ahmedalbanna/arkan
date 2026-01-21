# Dynamic Flow System - Comprehensive Testing Strategy

## Executive Summary

This document outlines the complete testing strategy for the Dynamic Flow System. Based on current analysis:

- **Current Test Coverage:** 8% (10 test files for 131 source files)
- **Target Coverage:** 80%+ for critical components
- **Priority:** Critical components first, then supporting systems
- **Timeline:** 4-week implementation plan

---

## 📊 Current Test Coverage Analysis

### Coverage by Domain

| Domain | Source Files | Test Files | Coverage | Priority |
|--------|--------------|------------|----------|----------|
| **Dynamic Flow Core** | 8 | 6 | 75% | 🟢 GOOD |
| **Services** | 15 | 1 | 7% | 🔴 CRITICAL |
| **Models** | 19 | 2 | 11% | 🔴 CRITICAL |
| **API Routes** | 89 | 1 | 1% | 🔴 CRITICAL |
| **RAG System** | 6 | 4 | 67% | 🟡 MEDIUM |
| **AI Flows** | 54 | 3 | 6% | 🔴 HIGH |
| **React Components** | N/A | 5 | N/A | 🟡 MEDIUM |

### Overall Statistics

```
Total Source Files:    131
Total Test Files:      25
Overall Coverage:      8%
Target Coverage:       80%
Tests Needed:          ~80 new test files
```

---

## 🎯 Testing Pyramid Strategy

### Level 1: Unit Tests (60% of tests)
**Focus:** Individual functions and classes in isolation

**Components:**
- ✅ Dynamic Flow Core (75% complete)
- 🔴 Services (7% complete)
- 🔴 Models (11% complete)
- 🔴 Utility Functions (0% complete)
- 🔴 Step Handlers (0% complete)

**Tools:**
- Jest
- ts-jest
- Zod for schema validation

### Level 2: Integration Tests (30% of tests)
**Focus:** Component interactions and workflows

**Components:**
- 🔴 Flow Execution Pipeline
- 🔴 API + Service Integration
- 🟡 RAG System (67% complete)
- 🔴 Database Operations
- 🔴 Cache Integration

**Tools:**
- Jest
- Supertest for API testing
- Firebase Test SDK

### Level 3: End-to-End Tests (10% of tests)
**Focus:** Complete user workflows

**Scenarios:**
- 🔴 Flow Builder UI → API → Execution
- 🔴 Prompt Management Workflow
- 🔴 Flow Migration Process
- 🔴 Error Recovery Scenarios

**Tools:**
- Playwright or Cypress
- Firebase Emulators

---

## 🚨 Critical Components Requiring Tests

### Priority 1: CRITICAL (Week 1-2)

#### Services (Missing 14 tests)
1. **flow-config-service.ts** ⭐⭐⭐⭐⭐
   - CRUD operations
   - Validation
   - Version management
   - Caching
   - **Test File Created:** ✅ `flow-config-service.test.ts`

2. **prompt-management-service.ts** ⭐⭐⭐⭐⭐
   - Template rendering
   - Variable validation
   - Version control
   - **Test File Created:** ✅ `prompt-management-service.test.ts`

3. **tool-registry-service.ts** ⭐⭐⭐⭐⭐
   - Tool registration
   - Discovery
   - Execution

4. **execution-trace-service.ts** ⭐⭐⭐⭐
   - Already tested ✅
   - Enhance with more scenarios

#### Dynamic Flow Core (Missing 2 tests)
1. **step-handlers.ts** ⭐⭐⭐⭐⭐
   - All 7 step types
   - Error handling
   - RAG integration
   - **Test File Created:** ✅ `step-handlers.test.ts`

2. **example.ts** ⭐
   - Low priority (example file)

#### Models (Missing 17 tests)
1. **flow-config.ts** ⭐⭐⭐⭐⭐
   - Type definitions
   - Validation schemas
   - Helper functions

2. **prompt-config.ts** ⭐⭐⭐⭐⭐
   - Template validation
   - Variable schemas

3. **tool-config.ts** ⭐⭐⭐⭐
   - Tool schemas
   - Parameter validation

4. **execution-trace.ts** ⭐⭐⭐⭐
   - Trace structure
   - Metrics calculation

### Priority 2: HIGH (Week 3)

#### API Routes (Missing 88 tests)
**Admin Flow APIs:**
- `POST /api/admin/flows` - Create flow
- `GET /api/admin/flows` - List flows
- `GET /api/admin/flows/[id]` - Get flow
- `PUT /api/admin/flows/[id]` - Update flow
- `DELETE /api/admin/flows/[id]` - Delete flow
- **Test File Created:** ✅ `admin-flows.test.ts`

**Admin Prompt APIs:**
- `POST /api/admin/prompts` - Create prompt
- `GET /api/admin/prompts` - List prompts
- `GET /api/admin/prompts/[id]` - Get prompt
- `PUT /api/admin/prompts/[id]` - Update prompt

**Execution APIs:**
- `POST /api/flows/execute` - Execute flow
- `POST /api/flows/test` - Test flow

#### AI Flows (Missing 51 tests)
**Phase 1 Flows (15 flows):**
- generate-text.ts
- summarize-text.ts
- paraphrase-text.ts
- translate-text.ts
- humanize-text.ts
- etc.

**Phase 2-5 Flows (39 flows):**
- analyze-context.ts
- fact-checker.ts
- plagiarism-checker.ts
- etc.

### Priority 3: MEDIUM (Week 4)

#### Supporting Services
- rag-service.ts
- credit-service.ts
- generation-service.ts
- ab-testing-service.ts

#### UI Components
- FlowBuilderInterface.tsx
- FlowCanvas.tsx
- StepEditor.tsx
- PromptEditor.tsx

---

## 📝 Test Templates Created

### ✅ Completed Templates

1. **Step Handlers Test** (`step-handlers.test.ts`)
   - 7 handler types tested
   - Error scenarios covered
   - Mocking patterns established

2. **Flow Config Service Test** (`flow-config-service.test.ts`)
   - Complete CRUD coverage
   - Validation tests
   - Version management
   - Caching verification

3. **Prompt Management Service Test** (`prompt-management-service.test.ts`)
   - Template rendering
   - Variable validation
   - Version control

4. **Admin Flow API Test** (`admin-flows.test.ts`)
   - REST endpoint testing
   - Authentication/authorization
   - Error handling

---

## 🛠️ Testing Infrastructure

### Current Setup ✅

**Test Framework:**
```json
{
  "test": "jest",
  "testEnvironment": "jsdom",
  "preset": "ts-jest"
}
```

**Key Dependencies:**
- ✅ Jest 29.7.0
- ✅ ts-jest 29.4.6
- ✅ @testing-library/jest-dom 6.9.1
- ✅ @testing-library/react 16.3.2
- ✅ jest-environment-jsdom 29.7.0

**Configuration:**
- ✅ Module path mapping configured
- ✅ Transform patterns set
- ✅ Setup files configured
- ✅ Mocks for canvas, ResizeObserver, matchMedia

### Additional Tools Needed

**For API Testing:**
```bash
npm install --save-dev supertest @types/supertest
```

**For E2E Testing:**
```bash
npm install --save-dev @playwright/test
# OR
npm install --save-dev cypress
```

**For Coverage Reporting:**
```bash
npm install --save-dev jest-coverage-badges
```

### Jest Configuration Enhancements

Add to `jest.config.js`:
```javascript
module.exports = {
  // ... existing config
  
  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/index.ts',
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
    // Critical components require higher coverage
    './src/ai/dynamic-flow/**/*.ts': {
      statements: 90,
      branches: 85,
      functions: 90,
      lines: 90,
    },
    './src/services/**/*service.ts': {
      statements: 85,
      branches: 80,
      functions: 85,
      lines: 85,
    },
  },
  
  // Test organization
  testMatch: [
    '**/__tests__/**/*.test.{ts,tsx}',
    '**/*.test.{ts,tsx}',
  ],
  
  // Reporting
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
};
```

---

## 📋 Testing Patterns and Best Practices

### 1. Unit Test Pattern

```typescript
describe('ComponentName', () => {
  let component: ComponentType;
  let mockDependency: MockType;

  beforeEach(() => {
    // Setup
    mockDependency = createMock();
    component = new ComponentType(mockDependency);
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup
    jest.restoreAllMocks();
  });

  describe('methodName', () => {
    it('should handle success case', () => {
      // Arrange
      const input = {...};
      
      // Act
      const result = component.method(input);
      
      // Assert
      expect(result).toBe(expected);
    });

    it('should handle error case', () => {
      // Arrange
      mockDependency.method.mockRejectedValue(new Error('Test error'));
      
      // Act & Assert
      expect(() => component.method()).rejects.toThrow('Test error');
    });
  });
});
```

### 2. Integration Test Pattern

```typescript
describe('Integration: Flow Execution', () => {
  beforeAll(async () => {
    // Setup test environment
    await setupTestDatabase();
    await initializeFirebaseEmulators();
  });

  afterAll(async () => {
    // Teardown
    await cleanupTestDatabase();
    await shutdownFirebaseEmulators();
  });

  it('should execute flow end-to-end', async () => {
    // Create flow
    const flow = await createTestFlow();
    
    // Execute
    const result = await executeFlow(flow, testInput);
    
    // Verify
    expect(result.success).toBe(true);
    expect(result.output).toMatchSnapshot();
  });
});
```

### 3. API Test Pattern

```typescript
describe('API: /api/admin/flows', () => {
  let request: supertest.SuperTest<supertest.Test>;

  beforeAll(() => {
    request = supertest(app);
  });

  it('should create flow with valid data', async () => {
    const response = await request
      .post('/api/admin/flows')
      .set('Authorization', `Bearer ${authToken}`)
      .send(validFlowData);

    expect(response.status).toBe(201);
    expect(response.body.flow.id).toBeDefined();
  });
});
```

### 4. Mocking Strategies

**Firebase Mock:**
```typescript
jest.mock('firebase-admin', () => ({
  firestore: () => ({
    collection: jest.fn(() => ({
      doc: jest.fn(),
      where: jest.fn(),
      add: jest.fn(),
    })),
  }),
}));
```

**Genkit AI Mock:**
```typescript
jest.mock('../../genkit', () => ({
  ai: {
    generate: jest.fn().mockResolvedValue({
      text: 'Generated content',
      usage: { totalTokens: 100 },
    }),
  },
}));
```

**RAG Service Mock:**
```typescript
jest.mock('../../../services/rag-service', () => ({
  searchDocuments: jest.fn().mockResolvedValue({
    documents: [{ content: 'Doc', score: 0.9 }],
  }),
}));
```

---

## 🗓️ Implementation Timeline

### Week 1: Critical Services (25 tests)
**Goal:** Achieve 80%+ coverage for services

- ✅ flow-config-service.test.ts
- ✅ prompt-management-service.test.ts
- ⬜ tool-registry-service.test.ts
- ⬜ rag-service.test.ts
- ⬜ credit-service.test.ts
- ⬜ generation-service.test.ts
- ⬜ Enhance execution-trace-service.test.ts

**Deliverables:**
- 6 complete service test suites
- Service testing documentation
- Mock library for common services

### Week 2: Models & Core (20 tests)
**Goal:** Complete dynamic flow core and critical models

- ✅ step-handlers.test.ts
- ⬜ flow-config.test.ts
- ⬜ prompt-config.test.ts
- ⬜ tool-config.test.ts
- ⬜ execution-trace.test.ts
- ⬜ project.test.ts
- ⬜ template.test.ts

**Deliverables:**
- 7 model test suites
- Type validation tests
- Schema test helpers

### Week 3: API Routes (20 tests)
**Goal:** Achieve 25%+ API coverage

**Admin APIs:**
- ✅ admin-flows.test.ts
- ⬜ admin-prompts.test.ts
- ⬜ admin-tools.test.ts
- ⬜ admin-templates.test.ts
- ⬜ admin-sections.test.ts

**Execution APIs:**
- ⬜ flows-execute.test.ts
- ⬜ flows-test.test.ts

**User APIs:**
- ⬜ users.test.ts
- ⬜ payment.test.ts
- ⬜ transactions.test.ts

**Deliverables:**
- 10 API test suites
- API test helper library
- Auth mocking utilities

### Week 4: AI Flows & Integration (35 tests)
**Goal:** Cover critical AI flows and integration scenarios

**AI Flow Tests (Sample):**
- ⬜ generate-text.test.ts
- ⬜ summarize-text.test.ts
- ⬜ paraphrase-text.test.ts
- ⬜ translate-text.test.ts
- ⬜ humanize-text.test.ts
- ⬜ fact-checker.test.ts
- ⬜ grammar-checker.test.ts
- ⬜ plagiarism-checker.test.ts
- ⬜ dynamic-flow-executor.test.ts (enhance)

**Integration Tests:**
- ⬜ flow-execution-pipeline.test.ts
- ⬜ cache-integration.test.ts
- ⬜ error-recovery.test.ts
- ⬜ migration-workflow.test.ts

**Deliverables:**
- 15 AI flow test suites
- 5 integration test suites
- End-to-end test framework
- Complete testing documentation

---

## 📊 Success Metrics

### Coverage Targets

**By End of Week 1:**
- Services: 7% → 80%
- Overall: 8% → 25%

**By End of Week 2:**
- Dynamic Flow Core: 75% → 95%
- Models: 11% → 70%
- Overall: 25% → 40%

**By End of Week 3:**
- API Routes: 1% → 25%
- Overall: 40% → 55%

**By End of Week 4:**
- AI Flows: 6% → 30%
- Overall: 55% → 80%+

### Quality Metrics

- ✅ All critical paths tested
- ✅ Error scenarios covered
- ✅ Edge cases identified
- ✅ Performance benchmarks established
- ✅ Regression test suite complete

---

## 🚀 Quick Start Commands

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

### Run Specific Test File
```bash
npm test -- step-handlers.test.ts
```

### Run Tests for Specific Domain
```bash
npm test -- --testPathPattern=services
npm test -- --testPathPattern=dynamic-flow
npm test -- --testPathPattern=api
```

### Generate Coverage Report
```bash
npm test -- --coverage --coverageReporters=html
# Open coverage/index.html in browser
```

---

## 📚 Testing Resources

### Documentation
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Supertest](https://github.com/visionmedia/supertest)

### Internal Resources
- Test Templates: `src/**/__tests__/*.test.ts`
- Mock Libraries: `src/__mocks__/`
- Test Utilities: `src/__tests__/utils/`

### Best Practices
- Write tests before fixing bugs (TDD)
- Keep tests isolated and independent
- Use descriptive test names
- Mock external dependencies
- Test error paths, not just happy paths
- Maintain test data factories
- Use snapshots sparingly

---

## 🎯 Next Steps

### Immediate Actions
1. ✅ Review test templates
2. ✅ Setup test infrastructure
3. ⬜ Begin Week 1 implementation
4. ⬜ Create mock library
5. ⬜ Setup CI/CD integration

### Long-term Goals
- Achieve 80%+ overall coverage
- Implement E2E test suite
- Setup performance testing
- Create visual regression tests
- Build test documentation site

---

## 📞 Support

**Questions or Issues?**
- Create GitHub issue with `testing` label
- Consult testing team leads
- Review existing test examples

**Contributing:**
- Follow test template patterns
- Maintain coverage thresholds
- Document complex test scenarios
- Update this document with learnings

---

**Last Updated:** 2026-01-21  
**Version:** 1.0.0  
**Status:** 🚀 Ready for Implementation
