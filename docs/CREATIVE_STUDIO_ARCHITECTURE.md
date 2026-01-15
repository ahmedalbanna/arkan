# 🎨 Creative Content Studio - Architecture Plan

## Overview
نظام توليد محتوى إبداعي متقدم يوفر تحكم كامل في كل خطوة من خطوات الإنشاء.

## Supported Content Types

### 📖 Stories & Novels
- Short Stories
- Novels (Multi-chapter)
- Flash Fiction
- Fan Fiction

### 🎬 Scripts
- Movie Scripts
- TV Series Scripts
- Theater Scripts
- Documentary Scripts

### 🎵 Lyrics & Poetry
- Song Lyrics (with structure)
- Poems (various styles)
- Rap Lyrics
- Haiku & Traditional Forms

### 📄 Reports & Documents
- Academic Reports
- Technical Documentation
- Business Reports
- Research Papers

### 📚 Books
- Textbooks
- Educational Content
- How-to Guides
- Manuals

## Core Architecture

### Data Models

```typescript
// Creative Content Configuration
interface CreativeContentConfig {
  id: string;
  type: ContentType;
  metadata: {
    title: string;
    author: string;
    genre?: string;
    targetAudience?: string;
    language: string;
  };
  structure: ContentStructure;
  generationSteps: GenerationStep[];
  generatedContent: GeneratedContent[];
}

// Generation Steps
interface GenerationStep {
  id: string;
  order: number;
  title: string;
  type: StepType;
  status: 'pending' | 'in-progress' | 'completed' | 'skipped';
  config: StepConfig;
  result?: StepResult;
}

// Step Controls
interface StepConfig {
  tone?: 'dramatic' | 'comedic' | 'serious' | 'lighthearted' | 'dark';
  style?: 'descriptive' | 'minimalist' | 'poetic' | 'journalistic';
  length?: { min: number; max: number; target: number };
  perspective?: 'first-person' | 'second-person' | 'third-person-limited' | 'third-person-omniscient';
  tense?: 'past' | 'present' | 'future';
  pacing?: 'slow' | 'medium' | 'fast';
  customInstructions?: string;
  useRAG?: boolean;
  modelPreference?: string;
}
```

### Component Structure

#### 1. Main Dashboard
- **Location**: `arkan/src/components/creative-studio/ContentStudioDashboard.tsx`
- **Purpose**: Entry point for choosing content type
- **Features**:
  - Content type selector
  - Recent projects list
  - Quick start templates
  - Project management

#### 2. Step-by-Step Generator
- **Location**: `arkan/src/components/creative-studio/StepByStepGenerator.tsx`
- **Purpose**: Orchestrate multi-step generation process
- **Features**:
  - Progress tracking
  - Step navigation
  - Dynamic controls per step
  - Preview panel
  - Undo/Redo functionality

#### 3. Content Type Generators
Each content type has specialized generator:

**Story Generator** (`StoryGenerator.tsx`):
```typescript
Steps:
1. Story Outline (plot summary, theme, setting)
2. Character Development (protagonists, antagonists, supporting)
3. Plot Structure (exposition, rising action, climax, falling action, resolution)
4. Scene Breakdown (individual scenes with purposes)
5. Chapter Writing (actual content generation)
6. Dialogue Enhancement
7. Description Expansion
8. Revision & Polish
```

**Script Generator** (`ScriptGenerator.tsx`):
```typescript
Steps:
1. Story Concept (logline, premise)
2. Character Profiles (with arcs)
3. Three-Act Structure
4. Scene List (with beat sheets)
5. Scene Writing (with proper formatting)
   - Scene Headings (INT./EXT.)
   - Action Lines
   - Character Names
   - Dialogue
   - Parentheticals
   - Transitions
6. Dialogue Polish
7. Format Verification
```

**Lyrics Generator** (`LyricsGenerator.tsx`):
```typescript
Steps:
1. Song Concept (theme, emotion, message)
2. Structure Design (verse-chorus-bridge layout)
3. Rhyme Scheme Selection
4. Verse Writing
5. Chorus Writing
6. Bridge Writing (optional)
7. Pre-Chorus (optional)
8. Final Polish (rhythm, meter, flow)
```

#### 4. Smart Controls Panel
- **Location**: `arkan/src/components/creative-studio/SmartControlsPanel.tsx`
- **Purpose**: Dynamic controls based on current step
- **Controls**:
  - Tone Selector (dropdown with previews)
  - Style Selector (with examples)
  - Length Control (slider with word count)
  - Pacing Control (visual slider)
  - Perspective Selector (radio buttons)
  - Custom Prompt Field (textarea)
  - RAG Context Toggle
  - Model Selector

#### 5. Preview Panel
- **Location**: `arkan/src/components/creative-studio/PreviewPanel.tsx`
- **Purpose**: Live preview of generated content
- **Features**:
  - Markdown rendering
  - Script formatting
  - Lyrics formatting
  - Export options (PDF, DOCX, TXT)
  - Copy to clipboard
  - Version history

### Generation Engine

#### Unified Generator
```typescript
// arkan/src/lib/generators/unified-generator.ts

class UnifiedContentGenerator {
  async generateStep(
    step: GenerationStep,
    context: GenerationContext,
    config: StepConfig
  ): Promise<StepResult> {
    // 1. Prepare prompt based on step type and config
    const prompt = this.buildPrompt(step, context, config);
    
    // 2. Get RAG context if enabled
    const ragContext = config.useRAG 
      ? await this.retrieveRAGContext(context)
      : null;
    
    // 3. Select appropriate model
    const model = config.modelPreference || this.selectBestModel(step.type);
    
    // 4. Execute generation
    const result = await this.executeGeneration(prompt, ragContext, model);
    
    // 5. Post-process and validate
    return this.validateAndFormat(result, step.type);
  }
  
  private buildPrompt(
    step: GenerationStep,
    context: GenerationContext,
    config: StepConfig
  ): string {
    // Build context-aware prompt with all controls
    const basePrompt = this.getBasePrompt(step.type);
    const styleInstructions = this.buildStyleInstructions(config);
    const contextInfo = this.buildContextInfo(context);
    
    return `${basePrompt}\n\n${styleInstructions}\n\n${contextInfo}`;
  }
}
```

### Templates System

#### Pre-built Templates
```typescript
// arkan/src/lib/templates/creative-templates.ts

export const storyTemplates = {
  heroJourney: {
    name: "Hero's Journey",
    steps: [...],
    defaultConfig: {...}
  },
  thrillerMystery: {
    name: "Thriller/Mystery",
    steps: [...],
    defaultConfig: {...}
  },
  romanceNovel: {
    name: "Romance Novel",
    steps: [...],
    defaultConfig: {...}
  }
};

export const scriptTemplates = {
  actionMovie: {
    name: "Action Movie",
    format: "screenplay",
    acts: 3,
    steps: [...]
  },
  dramaSeries: {
    name: "TV Drama Series",
    format: "teleplay",
    acts: 4, // with commercial breaks
    steps: [...]
  }
};

export const lyricsTemplates = {
  popSong: {
    name: "Pop Song",
    structure: ["intro", "verse1", "chorus", "verse2", "chorus", "bridge", "chorus", "outro"],
    rhymeScheme: "AABB"
  },
  ballad: {
    name: "Ballad",
    structure: ["verse1", "chorus", "verse2", "chorus", "bridge", "chorus"],
    rhymeScheme: "ABAB"
  }
};
```

## User Flow

### Creating New Story
```
1. User clicks "Create New" → "Story"
2. Template selection (optional):
   - Hero's Journey
   - Mystery/Thriller
   - Romance
   - Custom (blank)
3. Basic info form:
   - Title
   - Genre
   - Target length
   - Target audience
4. Enter Step-by-Step Generator:
   - Shows all steps with status
   - User can start from any step
   - Each step has custom controls
5. Generate step-by-step:
   - Step 1: Outline → User reviews → Accept/Regenerate/Edit
   - Step 2: Characters → User reviews → Accept/Regenerate/Edit
   - ...continues for all steps
6. Preview & Export:
   - Full preview
   - Export options
   - Save project
```

## Technical Implementation

### State Management
```typescript
// Using Zustand for creative studio state
interface CreativeStudioState {
  currentProject: CreativeContentConfig | null;
  currentStep: number;
  generatedContent: Map<string, StepResult>;
  isGenerating: boolean;
  
  // Actions
  createProject: (type: ContentType) => void;
  loadProject: (id: string) => void;
  generateStep: (stepId: string, config: StepConfig) => Promise<void>;
  updateStepConfig: (stepId: string, config: Partial<StepConfig>) => void;
  navigateToStep: (stepIndex: number) => void;
  saveProject: () => Promise<void>;
}
```

### API Routes
```
/api/creative-studio/projects           - CRUD for projects
/api/creative-studio/generate-step      - Generate single step
/api/creative-studio/templates          - Get templates
/api/creative-studio/export             - Export project
```

### Database Schema
```typescript
// Firestore collections
projects/{projectId} {
  id: string;
  userId: string;
  type: ContentType;
  metadata: object;
  structure: object;
  steps: array;
  content: map;
  createdAt: timestamp;
  updatedAt: timestamp;
}

templates/{templateId} {
  id: string;
  name: string;
  type: ContentType;
  description: string;
  steps: array;
  defaultConfig: object;
  isPublic: boolean;
}
```

## Integration Points

### 1. Report Mode Integration
- Reuse existing report generation for structured documents
- Share templates system
- Share export functionality

### 2. Writing Tools Integration
- Use existing tools as step components
- Grammar checker for revision steps
- Plagiarism checker for final content

### 3. RAG System Integration
- Use indexed documents for context
- Support uploading reference materials
- Character/world building knowledge base

### 4. Dynamic Flow Integration
- Use dynamic flows for complex generation
- Step orchestration
- Error handling and retries

## Performance Optimization

### 1. Lazy Loading
- Load content type components on demand
- Lazy load preview panel
- Progressive template loading

### 2. Caching
- Cache generated steps
- Cache template configurations
- Cache model responses

### 3. Streaming
- Stream long-form content generation
- Real-time preview updates
- Progress indicators

## Future Enhancements

### Phase 2
- Collaborative editing
- Version control with branching
- AI-powered suggestions during editing
- Character consistency checker
- Plot hole detector

### Phase 3
- Audio narration generation
- Image generation for scenes
- Storyboard creator (for scripts)
- Music generation (for lyrics)

### Phase 4
- Mobile apps
- Offline mode
- Publishing integrations
- Community marketplace for templates

## Conclusion

This architecture provides:
✅ **Full Control**: User controls every step
✅ **Flexibility**: Supports multiple content types
✅ **Extensibility**: Easy to add new content types
✅ **Scalability**: Built on existing robust infrastructure
✅ **User-Friendly**: Clear step-by-step process
✅ **Professional**: Industry-standard formatting

Next steps: Start with Phase 1 implementation of core components.
