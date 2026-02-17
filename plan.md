Here's the plan:

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                               Replace Firebase with PostgreSQL - Implementation Plan                               ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛


                                                       Overview

Replace all remaining Firebase Firestore operations with PostgreSQL/Prisma, building on the existing migration
infrastructure already in place.


                                               Current Status Analysis

 • ✅ Already Migrated: Auth (NextAuth), Users, Projects, Templates, Notifications, Settings, Features, Agents
 • ❌ Still Using Firebase: Transactions, Document Tracking, Generation Logs, FCM Tokens, Sections, Admin queries


                                                 Implementation Steps

                                              1. Database Schema Updates

 • Add missing tables to Prisma schema:
    • device_tokens (FCM push notifications)
    • generation_logs (already exists as GenerationLog)
 • Verify indexed_documents table schema matches tracking service needs

                                       2. Service Layer Migration (6 services)

Replace Firebase → Prisma:

 • transactionService.ts → Use existing Prisma Transaction model
 • document-tracking-service.ts → Create Prisma operations for indexed_documents
 • generation-service.ts → Use existing Prisma GenerationLog model
 • Seed scripts (seed-agents.ts, seed-sections.ts, seed-templates.ts) → Already have Prisma equivalents

                                         3. API Routes Migration (10 routes)

Update adminDb calls:

 • /api/admins/route.ts → Prisma user queries with role filter
 • /api/agents/[id]/route.ts → Use Prisma agent operations
 • /api/fcm/route.ts → Create device_tokens Prisma model
 • /api/payment/request/route.ts → Prisma admin user queries
 • /api/templates/docx/[key]/route.ts → Already using Prisma
 • /api/templates/pptx/[key]/route.ts → Already using Prisma
 • /api/admin/sections/* → Use Prisma Section model
 • /api/admin/notifications/send/route.ts → Prisma device tokens
 • /api/admin/templates/*/[id]/route.ts → Already using Prisma

                                                4. Client-Side Updates

 • Remove FirebaseMessagingProvider dependency (or stub for now)
 • Keep Firebase Storage for file uploads (out of scope)
 • Update AuthContext to not import Firebase auth

                                               5. Configuration Cleanup

 • Mark Firebase config files as deprecated
 • Update environment variables documentation
 • Remove Firebase imports from active code paths


                                                     Out of Scope

 • Firebase Storage (file uploads) - keep for now
 • Firebase Realtime Database - minimal usage
 • Complete removal of Firebase SDK (keep for Storage)


                                                   Success Criteria

 • All Firestore collection() and doc() calls replaced with Prisma
 • No active Firebase Firestore operations in service layer
 • All tests passing with PostgreSQL backend
 • Migration scripts documented