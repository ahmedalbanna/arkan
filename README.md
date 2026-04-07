# Arkan application

## Application Overview

Arkan is a sophisticated AI-powered platform designed for writing and document generation. It is built utilizing Next.js 15, Firebase, and Google's Genkit AI. Although the README presents a basic overview, the application functions as a comprehensive academic and professional writing assistant with extensive capabilities.

## Architecture Strengths

### Technology Stack

*   **Frontend:** Next.js 15 with React 18, TypeScript, and Tailwind CSS.
*   **AI Integration:** Google Genkit utilizing the Gemini 2.5 Flash Lite model.
*   **Backend:** SQLite with Drizzle ORM. Firebase is used only for Storage and FCM (Notifications).
*   **UI Framework:** Radix UI components with custom theming.
*   **State Management:** Zustand combined with React Query for efficient data management.
*   **Result Pattern:** Mandatory `Result<T, E>` pattern across application and adapter layers for robust error handling.

### Code Organization (Clean Architecture / DDD)

*   The codebase follows a strict 4-layer DDD structure: `domain`, `application`, `adapters`, and `infrastructure`.
*   **Adapters Layer Triad**: Standardized `controllers` (Server), `hooks` (Client), and `state` (Client) separation.
*   Barrel exports are employed for streamlined import paths (e.g., `src/ai/flows/index.ts`).
*   Barrel exports are employed for streamlined import paths (e.g., `src/ai/flows/index.ts`).
*   AI flows are type-safe through the use of Zod schemas.
*   Consistent naming conventions and file organization are maintained throughout the project.

## Key Features

### AI Writing Tools (23 tools available)

*   Text generation, summarization, and paraphrasing capabilities.
*   Grammar checking and plagiarism detection.
*   AI content detection and humanization of text.
*   Citation generation and fact-checking functionalities.
*   Document conversion between Markdown and Microsoft Word/PowerPoint formats.

### Advanced Capabilities

*   **Report Generation:** A template-driven system with a section-based approach.
*   **Diagram Generation:** Support for creating PlantUML and UML diagrams.
*   **Presentation Builder:** AI-powered generation of slide decks.
*   **Multi-language Support:** Functionality for Arabic and English, including Right-to-Left (RTL) support.
*   **Document Processing:** Capabilities for PDF parsing and handwriting recognition.

### Professional Features

*   **User Management:** Includes authentication, user profiles, and team management functionalities.
*   **Payment System:** A credit-based system with transaction tracking.
*   **Admin Dashboard:** Provides analytics, user management tools, and feature toggles.
*   **Project Management:** Features a session-based workflow with autosave functionality.

## Technical Highlights

### AI Integration

```typescript
// Clean AI flow architecture
const generateTextFlow = ai.defineFlow({
  name: 'generateTextFlow',
  inputSchema: GenerateTextInputSchema,
  outputSchema: GenerateTextOutputSchema,
}, async input => {
  const { output } = await promptTemplate(input);
  return output!;
});
```

### Authentication System

*   Local authentication system using SQLite and secure JWT sessions.
*   Features server-side protection implemented via HTTP-only cookies and Next.js middleware.
*   Includes automatic user profile creation and device fingerprinting for security.
*   Fully self-contained, no external dependency for identity management.

### Database & Setup

To initialize the local database:
```bash
npm run db:push   # Create arkan.db and sync schema
npm run db:seed   # Seed default agents, templates, and settings
```

Management commands:
- `npm run db:generate`: Create SQL migration files.
- `npm run db:push`: Direct schema-to-DB synchronization (dev).
- `npm run db:seed`: Populate/Reset core data.

### Internationalization

*   Comprehensive internationalization (i18n) support for Arabic and English.
*   Includes handling for RTL layout configurations.
*   Custom font loading is implemented to accommodate different languages.
## TypeScript & Code Quality

Arkan maintains **100% type safety** in all source code. The following documentation helps you understand and maintain these standards:

### TypeScript Documentation

- **[TypeScript Cleanup Summary](./docs/TYPESCRIPT_CLEANUP_SUMMARY.md)** - Overview of the type safety initiative and achievements
- **[TypeScript Patterns](./docs/TYPESCRIPT_PATTERNS.md)** - Complete reference for TypeScript patterns used in the codebase
- **[Migration Guide](./docs/TYPESCRIPT_MIGRATION_GUIDE.md)** - How to work with the new type-safe patterns
- **[Suppressions Reference](./docs/TYPESCRIPT_SUPPRESSIONS.md)** - Documentation of all @ts-expect-error uses and removal plans

### Code Quality Standards

- ✅ Zero type errors in source code
- ✅ Immutable state management patterns
- ✅ Type-safe AI flows with Zod validation
- ✅ Fully typed React components and hooks
- ✅ Mandatory Result Pattern Compliance (`Result<T, E>`)
- ✅ Strict Clean Architecture Boundary Enforcement
- ✅ Comprehensive type coverage (99%+)
- ✅ Clear type organization and exports

### Quick Type Check

```bash
# Run TypeScript type checking
npm run typecheck

# Run with watch mode
npm run typecheck -- --watch
```
