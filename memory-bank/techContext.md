# Technical Context - Arkan

## Technology Stack

### Frontend Framework
```
Next.js 15.5.9
├── React 18.3.1
├── TypeScript 5.9.3
└── App Router Architecture
```

**Key Features Used:**
- Server Components
- Server Actions
- API Routes
- Image Optimization
- Internationalization routing

### UI Framework & Styling

**Component Library:**
- **shadcn/ui**: Custom component library built on Radix UI
- **Radix UI**: Unstyled, accessible component primitives
- **Tailwind CSS 3.4.19**: Utility-first styling
- **tailwindcss-animate**: Animation utilities
- **Framer Motion 12.28.1**: Complex animations
- **Lucide React**: Icon system

**Editor:**
- **TipTap 2.27.2**: Rich text editor
  - Bubble menu
  - Drag handle
  - File handler
  - Table support
  - Custom extensions
- **KaTeX 0.16.27**: Math rendering
- **PlantUML**: Diagram generation

### State Management

**Client State:**
```typescript
Zustand 4.5.7
├── useBuilderStore (main app state)
├── useEditorStore (editor state)
├── useGenerationUIStore (UI state)
└── useAgentStore (AI agent state)
```

**Server State:**
```typescript
TanStack Query 5.90.19
├── Projects
├── Users
├── Templates
├── Transactions
└── Notifications
```

**Local State:**
```typescript
Dexie 4.2.1 (IndexedDB)
├── Projects (offline storage)
├── Sections (cached content)
└── Templates (local templates)
```

### Backend & Database

**Firebase 11.10.0:**
```
Firebase Ecosystem
├── Authentication
│   ├── Email/Password
│   ├── Phone Auth
│   └── Session cookies
├── Firestore
│   ├── Collections: users, projects, sections, templates, transactions
│   ├── Indexes: compound queries
│   └── Security Rules: field-level validation
├── Storage
│   ├── User profile pictures
│   ├── Project logos
│   └── Generated images
├── Cloud Messaging (FCM)
│   └── Push notifications
└── Hosting
    └── Static site deployment
```

**Firebase Admin SDK 13.4.0:**
- Server-side authentication
- Token verification
- Privileged operations

### AI & Generation

**Genkit 1.27.0:**
```typescript
Genkit AI Framework
├── @genkit-ai/firebase (Firebase integration)
├── @genkit-ai/googleai (Gemini models)
├── @genkit-ai/dotprompt (Prompt templates)
├── @genkit-ai/evaluator (Quality assessment)
└── genkitx-ollama (Ollama integration)
```

**Models Configuration:**
```typescript
OLLAMA_MODELS = {
  GEMMA_2B: "gemma2:2b",      // Fast conversions
  PHI3_MINI: "phi3:mini",     // Structured reports  
  LLAMA3_8B: "llama3.1:8b",   // Academic content
  QWEN2_5: "qwen2.5:7b"       // General tasks
}

MODEL_BY_TASK = {
  CONVERSION: GEMMA_2B,
  REPORTS: PHI3_MINI,
  ACADEMIC: LLAMA3_8B
}
```

**Ollama Server:**
- Host: 185.190.140.93:11434 (⚠️ should be env var)
- Self-hosted model deployment
- Local inference

### Document Processing

**Export Libraries:**
```typescript
DOCX Export
├── docx 8.5.0 (document generation)
├── html-to-docx 1.8.0 (HTML conversion)
├── mammoth 1.11.0 (DOCX parsing)
└── turndown 7.2.2 (HTML to Markdown)

PPTX Export
├── pptxgenjs 3.12.0 (PowerPoint generation)
└── Custom slide layout engine

PDF Export
├── jspdf 4.0.0
├── html2canvas 1.4.1
└── pdfjs-dist 5.4.530 (parsing)
```

**Markdown Processing:**
```typescript
Markdown Pipeline
├── marked 16.4.2 (parser)
├── remark 15.0.1 (processor)
├── remark-gfm 4.0.1 (GitHub Flavored Markdown)
├── remark-html 16.0.1 (HTML output)
├── rehype-sanitize 6.0.0 (security)
└── unified 11.0.5 (processor framework)
```

### Utilities & Helpers

**Form Handling:**
- react-hook-form 7.71.1
- @hookform/resolvers 4.1.3
- Zod 3.25.76 (validation)

**File Handling:**
- react-dropzone 14.3.8
- file-saver 2.0.5
- jszip 3.10.1
- pako 2.1.0 (compression)

**Date & Time:**
- date-fns 3.6.0

**Drag & Drop:**
- @dnd-kit/core 6.3.1
- @dnd-kit/sortable 8.0.0

**Internationalization:**
- i18next 25.8.0
- react-i18next 16.5.3

**Sanitization:**
- isomorphic-dompurify 2.35.0

**UUID Generation:**
- uuid 10.0.0

### Development Tools

**Testing:**
```json
{
  "jest": "29.7.0",
  "jest-environment-jsdom": "29.7.0",
  "@testing-library/react": "16.3.2",
  "@testing-library/jest-dom": "6.9.1"
}
```

**Linting:**
```json
{
  "eslint": "9.39.2",
  "@typescript-eslint/eslint-plugin": "8.53.1",
  "@typescript-eslint/parser": "8.53.1"
}
```

**Build Tools:**
- tsx 4.21.0 (TypeScript execution)
- genkit-cli 1.27.0 (Genkit dev tools)
- firebase-tools 15.3.1

### API Architecture

**Route Structure:**
```
/api
├── /auth
│   ├── /guest (guest login)
│   ├── /session (session verification)
│   ├── /signup (user registration)
│   └── /logout (logout)
├── /generate
│   ├── /section (AI section generation)
│   ├── /project (project generation)
│   └── /image (image generation)
├── /export
│   ├── /docx (Word export)
│   └── /pptx (PowerPoint export)
├── /projects (CRUD)
│   └── /[id] (project operations)
├── /templates
│   ├── /report (report templates)
│   ├── /docx (Word templates)
│   └── /pptx (PowerPoint templates)
├── /users (user management)
├── /transactions (payment history)
├── /notifications (notification system)
├── /payment (credit purchases)
└── /chat
    └── /project-consultant (AI chat)
```

**API Utilities:**
```typescript
// src/lib/utils/api-utils.ts
- withAuth(): Auth middleware
- withValidation(): Zod validation
- handleError(): Centralized error handling
- ApiResponse<T>: Typed responses
```

### Performance Optimizations

**Implemented:**
- React Query caching (staleTime: Infinity for profiles)
- IndexedDB for offline storage
- Next.js Image optimization
- Zustand for efficient re-renders

**Missing:**
- Code splitting (editor bundle)
- Lazy loading for heavy components
- Pagination for large lists
- Streaming for large documents

### Security Implementation

**Current:**
- Server-side token verification
- Firestore security rules
- Input sanitization (DOMPurify)
- CSRF protection (Next.js automatic)

**Missing:**
- Rate limiting
- Environment variable usage (⚠️ CRITICAL)
- Request throttling
- CAPTCHA on forms

### Build Configuration

**next.config.ts:**
```typescript
{
  turbopack: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },
  images: {
    remotePatterns: [/* image sources */]
  }
}
```

**TypeScript Config:**
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "module": "ESNext",
    "jsx": "preserve"
  }
}
```

### Deployment Setup

**Firebase Configuration:**
```json
{
  "hosting": {
    "public": "out",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

**Development Scripts:**
```bash
npm run dev          # Next.js + Genkit dev servers
npm run genkit:dev   # Genkit standalone
npm run build        # Production build
npm run test         # Jest tests
npm run lint         # ESLint
npm run typecheck    # TypeScript validation
```

### Third-Party Integrations

**Google Services:**
- Google Translate API (@vitalets/google-translate-api)
- Google AI (Gemini models)

**Monitoring:**
- OpenTelemetry exporter (Jaeger)
- Winston transport for logging

**PWA:**
- @ducanh2912/next-pwa 10.2.9
- Service worker for offline support

### Browser Compatibility

**Target:**
- Modern evergreen browsers
- ES2020+ features
- No IE11 support

**Polyfills:**
- Not explicitly configured (relies on Next.js defaults)

### Code Statistics

- **Total Lines**: ~29,466 TS/TSX
- **Files**: 150+ TypeScript files
- **Components**: 50+ React components
- **API Routes**: 25+ endpoints
- **Test Files**: 6 (⚠️ insufficient coverage)

### Known Technical Debt

1. **Security**: Hardcoded credentials in source code
2. **Testing**: <20% test coverage
3. **Documentation**: Incomplete API documentation
4. **Performance**: No code splitting for editor
5. **Error Handling**: Console.log instead of proper logging
6. **TypeScript**: Errors related to missing admin routes
7. **Dependencies**: Some unused packages detected
