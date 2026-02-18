# Firebase Auth to NextAuth Migration - Complete Index

**Created**: February 17, 2026  
**Status**: ✅ Audit Complete - Ready for Implementation  
**Total Documents**: 5 comprehensive guides  
**Scope**: 74 files, 274 auth references

---

## 📚 Quick Navigation

### For Different Needs

| Need | Document | Read Time |
|------|----------|-----------|
| **Quick Overview** | `FIREBASE_TO_NEXTAUTH_MIGRATION_SUMMARY.md` | 15 min |
| **Full Inventory** | `FIREBASE_TO_NEXTAUTH_MIGRATION_AUDIT.md` | 45 min |
| **Code Examples** | `FIREBASE_TO_NEXTAUTH_MIGRATION_PATTERNS.md` | 30 min |
| **Step-by-Step** | `FIREBASE_TO_NEXTAUTH_MIGRATION_CHECKLIST.md` | 90 min |
| **Navigation** | This file (INDEX) | 5 min |

---

## 📋 Document Descriptions

### 1️⃣ FIREBASE_TO_NEXTAUTH_MIGRATION_SUMMARY.md
**Quick reference for decision makers and project leads**

**Key Sections**:
- Overview (scope, timeline, complexity)
- Four audit documents explained
- Critical findings (what works, what needs attention)
- **4 Critical Decisions** that must be made before starting
- Risk assessment and phase overview
- Next immediate steps (today, this week, next week)
- Success criteria
- FAQ

**Best For**: 
- Executives understanding scope
- Tech leads making decisions
- Project managers planning timeline
- Anyone new to the migration

**Read This First**: ✅ YES - Start here

---

### 2️⃣ FIREBASE_TO_NEXTAUTH_MIGRATION_AUDIT.md
**Comprehensive inventory of all affected files**

**Key Sections**:
- Scope analysis (74 files, 274 references)
- Files categorized by type (10 categories)
- Detailed pattern analysis (4 patterns)
- Risk levels (🟢 Green / 🟡 Yellow / 🔴 Red)
- Files by risk level
- **Blocking questions** requiring answers
- Critical dependencies and integration points
- Statistics and summary

**File Categories Covered**:
- Context & provider layer (2 files)
- Core hooks - auth management (4 files)
- Data hooks (11 files) - HIGHEST VOLUME
- Writing tools hooks (12 files)
- Admin hooks (2 files)
- RAG & report hooks (3 files)
- Core hooks (2 files)
- Pages (10 files)
- Components (14 files)
- Service layer (2 files)

**Best For**:
- Understanding full scope
- Finding specific files
- Identifying dependencies
- Risk assessment
- Planning resource allocation

**Read This When**: Need to understand what files are affected

---

### 3️⃣ FIREBASE_TO_NEXTAUTH_MIGRATION_PATTERNS.md
**Code examples showing actual patterns and migrations**

**Key Sections**:
- Pattern 1: Simple userProfile access (no changes needed)
- Pattern 2: firebaseUser UID/Email access (review needed)
- Pattern 3: Token generation via helper (20+ files, critical)
- Pattern 4: Direct getIdToken() calls (6 files, critical)
- Pattern 5: Complex hook patterns (useQuery, useMutation)
- Pattern 6: RootProviders stack (dual vs single provider)
- Pattern 7: Service layer integration (apiService)
- Pattern 8: Phone auth handling (migration challenge)
- Migration examples (before/after code)
- Token field name lookup guide

**Code Examples Include**:
- Actual file paths and line numbers
- Current code (Firebase)
- NextAuth equivalent
- Migration steps
- Files affected

**Best For**:
- Developers implementing migrations
- Understanding what needs to change
- Code review
- Writing replacement code
- Testing strategies

**Read This When**: Starting to write code changes

---

### 4️⃣ FIREBASE_TO_NEXTAUTH_MIGRATION_CHECKLIST.md
**Step-by-step implementation guide with checkboxes**

**Key Sections**:
- **Pre-Migration**: Answer 4 critical questions
  - Question 1: NextAuth session token field name
  - Question 2: Dual provider strategy
  - Question 3: Phone auth migration path
  - Question 4: ID field name verification
- Pre-flight checklist (7 items)
- Phase 1: Infrastructure updates (do this first)
  - 1.1 Update getAuthenticatedToken()
  - 1.2 Update apiService()
  - 1.3 Provider stack decision
- Phase 2: Green/Yellow risk files
  - 2.1 Simple components (no changes)
  - 2.2 Data hooks Batch 1 (5 files)
  - 2.3 Data hooks Batch 2 (5 files with direct calls)
- Phase 3: Yellow/Red risk files
  - 3.1 Admin pages (4 files)
  - 3.2 Profile pages (4 files)
  - 3.3 Writing tools hooks (12 files)
  - 3.4 Complex auth hooks (1 file)
- Phase 4: Final cleanup
  - 4.1 Remove AuthProvider
  - 4.2 Deprecate old AuthContext
  - 4.3 Optional: Rename providers
- Testing checklist (unit, integration, E2E, browser)
- Rollback procedures
- Success criteria
- Timeline estimates
- Support & troubleshooting
- Notes & decisions log

**File-by-File Details**:
- Exact changes needed
- Commit messages
- Testing steps
- Risk indicators

**Best For**:
- Executing the migration work
- Day-to-day implementation
- Test planning
- Team coordination
- Progress tracking

**Read This When**: Actually implementing the migration

---

### 5️⃣ FIREBASE_TO_NEXTAUTH_MIGRATION_INDEX.md
**This file - navigation and reference guide**

**Contains**:
- Quick navigation table
- Document descriptions
- How to use each document
- Key concepts explained
- Timeline overview
- Phase summaries
- File organization reference
- Common questions
- Recommended reading order

**Best For**:
- Getting oriented
- Finding the right document
- Understanding structure
- Quick reference

**Read This When**: Confused about which document to use next

---

## 🎯 How to Use These Documents

### Scenario 1: "I need to understand the scope"
**Action**:
1. Read: `SUMMARY.md` (15 min)
2. Skim: `AUDIT.md` (20 min)
3. Result: Full understanding of what needs to change

---

### Scenario 2: "I need to make a decision about strategy"
**Action**:
1. Read: `SUMMARY.md` → "Critical Decisions" section (15 min)
2. Reference: `AUDIT.md` → "Blocking Issues" section (10 min)
3. Decide and document in: `CHECKLIST.md` → "Notes & Decisions Log"
4. Result: Clear strategy documented

---

### Scenario 3: "I need to migrate a specific file"
**Action**:
1. Look up file in: `AUDIT.md` (find risk level)
2. Find pattern in: `PATTERNS.md` (see before/after code)
3. Follow steps in: `CHECKLIST.md` (phase for that file)
4. Implement using pattern examples
5. Test according to checklist
6. Result: File migrated correctly

---

### Scenario 4: "I need to plan the timeline"
**Action**:
1. Read: `SUMMARY.md` → "Implementation Phases" (10 min)
2. Review: `CHECKLIST.md` → "Timeline Estimate" section (5 min)
3. Reference: `AUDIT.md` → "Files by Risk Level" (15 min)
4. Result: Realistic timeline with resource needs

---

### Scenario 5: "Something broke, I need to rollback"
**Action**:
1. Reference: `CHECKLIST.md` → "Rollback Procedures" section
2. Execute appropriate rollback command
3. Communicate status to team
4. Result: Quick recovery with minimal user impact

---

## 🔑 Key Concepts Explained

### Four Critical Decisions
Must be made **before** starting any code changes:

1. **Token Field Name**
   - What: The exact field name in NextAuth session for auth token
   - Why: Needed for all token extraction (20+ locations)
   - How: Check NextAuth config, test in browser, document

2. **Provider Strategy**
   - What: Keep both providers during migration (safer) or remove old one (cleaner)
   - Why: Affects risk level and cleanup timeline
   - How: Choose Option A (dual) or Option B (single) in CHECKLIST

3. **Phone Auth Approach**
   - What: How to handle phone authentication in NextAuth
   - Why: NextAuth doesn't have built-in phone provider
   - How: Choose Option A (keep Firebase), B (remove), or C (custom)

4. **User ID Field Name**
   - What: Exact field name in NextAuth session for user ID
   - Why: Needed for profile routing and identification
   - How: Check schema, test, document (e.g., session.user.id or session.user.uid)

---

## 📊 Migration Overview

### Numbers at a Glance
```
Files to review:        74
Files using useAuth():  57
Auth references:        274
Unique patterns:        8
Risk categories:        3 (Green/Yellow/Red)
Phases:                 4
Timeline:               2-3 weeks
Team effort:            ~100-150 hours
```

### File Breakdown
```
Pages:              10 files (admin, profile, dashboard)
Components:         14 files (shared, admin, feature-specific)
Hooks - Auth:       4 files (mutations, sign-in flows)
Hooks - Data:       11 files (template, transaction, analytics)
Hooks - Tools:      12 files (writing tool logic)
Hooks - Other:      7 files (admin, RAG, report)
Services:           2 files (API layer, utilities)
Context:            2 files (auth providers)
                    ---
TOTAL:              74 files
```

### Risk Distribution
```
🟢 Green (safe):    12 files (need no changes or simple update)
🟡 Yellow (review): 44 files (standard pattern replacement)
🔴 Red (careful):   18 files (complex, need analysis)
```

---

## ⏱️ Timeline Overview

### Phase 1: Infrastructure (2-3 days)
- Update token generation
- Update API service
- Answer critical questions
- Foundation for all other work

### Phase 2: Safe Migrations (3-4 days)
- Simple components
- Standard data hooks
- Low-risk pattern replacements
- High success rate

### Phase 3: Complex Migrations (5-7 days)
- Admin pages and components
- Auth mutations
- Writing tools
- Careful testing needed

### Phase 4: Cleanup (1-2 days)
- Remove legacy code
- Final testing
- Deployment prep
- Validation

### Total: 12-18 days (2-3 weeks)

---

## 🚀 Quick Start Guide

### Day 1: Planning
- [ ] Read: `SUMMARY.md`
- [ ] Gather team
- [ ] Answer 4 critical questions
- [ ] Make decisions (document in `CHECKLIST.md`)

### Day 2: Setup
- [ ] Create feature branch
- [ ] Review NextAuth config
- [ ] Verify token fields
- [ ] Read: `PATTERNS.md`
- [ ] Read: `CHECKLIST.md` Phase 1

### Day 3-5: Phase 1
- [ ] Update `getAuthenticatedToken()`
- [ ] Update `apiService()`
- [ ] Test both auth methods
- [ ] Code review
- [ ] Merge Phase 1 PR

### Day 6-9: Phase 2
- [ ] Migrate 16 simple files
- [ ] Follow `CHECKLIST.md` batch by batch
- [ ] Test after each batch
- [ ] Code reviews
- [ ] Merge PRs

### Day 10-16: Phase 3
- [ ] Migrate 42 complex files
- [ ] Use `PATTERNS.md` for reference
- [ ] Careful testing
- [ ] Multiple code reviews
- [ ] Merge PRs incrementally

### Day 17-18: Phase 4
- [ ] Remove legacy code
- [ ] Full integration testing
- [ ] Performance check
- [ ] Deployment prep

---

## 📚 Document Organization

```
Root Level Documents:
├── FIREBASE_TO_NEXTAUTH_MIGRATION_SUMMARY.md      ← START HERE
├── FIREBASE_TO_NEXTAUTH_MIGRATION_AUDIT.md        ← Deep dive
├── FIREBASE_TO_NEXTAUTH_MIGRATION_PATTERNS.md     ← Code examples
├── FIREBASE_TO_NEXTAUTH_MIGRATION_CHECKLIST.md    ← Implementation
└── FIREBASE_TO_NEXTAUTH_MIGRATION_INDEX.md        ← This file

Reference: All documents are at workspace root for easy access
```

---

## 🤔 Common Questions & Answers

### Q: Which document should I read first?
**A**: Start with `SUMMARY.md` (15 min), then decide what you need next based on your role.

### Q: I'm a developer - what's my reading order?
**A**: 
1. `SUMMARY.md` (get overview)
2. `CHECKLIST.md` pre-flight section (answer questions)
3. `PATTERNS.md` (understand patterns)
4. `CHECKLIST.md` phase for your assigned files (implementation)

### Q: I'm a manager - what do I need?
**A**: 
1. `SUMMARY.md` entire document (45 min)
2. `CHECKLIST.md` timeline section (10 min)
3. Reference `AUDIT.md` for any specific scope questions

### Q: I'm QA/testing - where do I start?
**A**:
1. `SUMMARY.md` overview (10 min)
2. `CHECKLIST.md` testing section (detailed)
3. `PATTERNS.md` for examples of what changes (reference)

### Q: Which document has the file list?
**A**: `AUDIT.md` - organized by category and risk level

### Q: Which document shows code examples?
**A**: `PATTERNS.md` - before/after code with line numbers

### Q: Which document is my checklist?
**A**: `CHECKLIST.md` - step-by-step with checkboxes

### Q: Can I start migration before answering the 4 critical questions?
**A**: NO - the token field name is essential for Phase 1

### Q: What if I only have 1 week instead of 3?
**A**: Prioritize: Phase 1 (critical) → Phase 2 (safe) → Phase 3 (time permitting)

---

## ✅ Success Checklist

### Pre-Migration ✓
- [ ] All documents read and understood
- [ ] 4 critical questions answered
- [ ] Team aligned on strategy
- [ ] Feature branch created
- [ ] Backup of current state taken

### During Migration ✓
- [ ] Phase 1 complete and tested
- [ ] Phase 2 migrations on track
- [ ] Phase 3 migrations careful and reviewed
- [ ] Testing passing at each phase
- [ ] Team coordinated

### Post-Migration ✓
- [ ] All 74 files reviewed/updated
- [ ] All tests passing
- [ ] No Firebase Auth references (except phone if needed)
- [ ] Code review completed
- [ ] Ready for production deployment

---

## 📞 Support

### If You Get Stuck
1. Check relevant document's troubleshooting section
2. Look up specific file in `AUDIT.md`
3. Find similar pattern in `PATTERNS.md`
4. Reference checklist for exact steps

### If You Find an Issue
1. Note the file and issue
2. Check against `PATTERNS.md` example
3. Reference test section in `CHECKLIST.md`
4. Escalate to tech lead if blocking

---

## 🎓 Learning Resources

### Understanding the Migration
- Firebase Auth concepts: Firebase docs
- NextAuth concepts: NextAuth docs
- This codebase: Review `src/context/` files

### Code Review
- `PATTERNS.md` shows expected patterns
- `AUDIT.md` shows all affected files
- `CHECKLIST.md` shows expected outcomes

### Testing
- Unit test examples: Existing test files in `__tests__/`
- Integration patterns: `CHECKLIST.md` testing section

---

## 📝 Notes Section

### Migration Decision Log
Document your decisions here (or in `CHECKLIST.md` Notes section):

```
Decision 1: Provider Strategy
Chosen: [A] Dual / [B] Single
Reason: ___________
Date: ___________

Decision 2: Phone Auth Approach
Chosen: [A] Keep Firebase / [B] Remove / [C] Custom
Reason: ___________
Date: ___________

Decision 3: Token Field Name
Field: session.user.___________
Date: ___________

Decision 4: ID Field Name
Field: session.user.___________
Date: ___________
```

---

## 🔗 Related Documents in Repository

- Migration guides: `docs/migration/`
- Configuration: `next.config.ts`, NextAuth config file
- Auth code: `src/context/`, `src/lib/firebase/`, `src/services/api/`
- Type definitions: `src/types/`

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-17 | Initial complete audit |
| - | - | Ready for implementation |

---

## Final Notes

This migration is **well-scoped and achievable** with:
- ✅ Clear documentation
- ✅ Phased approach
- ✅ Risk-based prioritization
- ✅ Rollback procedures
- ✅ Testing strategies

**Recommended Next Step**: 
Schedule a meeting to answer the 4 critical questions in `SUMMARY.md`, then begin Phase 1 infrastructure updates.

---

**Prepared by**: Rovo Dev  
**Audit Date**: 2026-02-17  
**Status**: ✅ Complete & Ready  
**Contact**: See project repository for team information

---

**START HERE** → Read `FIREBASE_TO_NEXTAUTH_MIGRATION_SUMMARY.md` next
