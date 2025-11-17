# Arkan application

## Application Overview

Arkan is a sophisticated AI-powered platform designed for writing and document generation. It is built utilizing Next.js 15, Firebase, and Google's Genkit AI. Although the README presents a basic overview, the application functions as a comprehensive academic and professional writing assistant with extensive capabilities.

## Architecture Strengths

### Technology Stack

*   **Frontend:** Next.js 15 with React 18, TypeScript, and Tailwind CSS.
*   **AI Integration:** Google Genkit utilizing the Gemini 2.5 Flash Lite model.
*   **Backend:** Firebase services including Authentication, Firestore, Storage, and Functions.
*   **UI Framework:** Radix UI components with custom theming.
*   **State Management:** Zustand combined with React Query for efficient data management.

### Code Organization

*   The codebase exhibits an excellent modular structure with a clear separation of concerns.
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

*   Utilizes Firebase Authentication with integrated session management.
*   Features server-side authentication protection implemented via middleware.
*   Includes automatic user profile creation.
*   Supports real-time synchronization of user profiles.

### Internationalization

*   Comprehensive internationalization (i18n) support for Arabic and English.
*   Includes handling for RTL layout configurations.
*   Custom font loading is implemented to accommodate different languages.