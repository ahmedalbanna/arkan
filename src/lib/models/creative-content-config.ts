/**
 * Creative Content Configuration Models
 * نماذج البيانات لنظام توليد المحتوى الإبداعي
 */

import { z } from 'zod';

// ============================================================================
// Content Types - أنواع المحتوى
// ============================================================================

export type ContentType =
  | 'story'           // قصة قصيرة
  | 'novel'           // رواية
  | 'movie-script'    // سيناريو فيلم
  | 'tv-script'       // سيناريو مسلسل
  | 'theater-script'  // سيناريو مسرحي
  | 'song-lyrics'     // كلمات أغنية
  | 'poem'            // قصيدة
  | 'report'          // تقرير
  | 'book'            // كتاب
  | 'article';        // مقال

// ============================================================================
// Step Types - أنواع الخطوات
// ============================================================================

export type StepType =
  | 'outline'         // مخطط عام
  | 'character'       // تطوير شخصيات
  | 'plot'            // بناء الحبكة
  | 'scene'           // كتابة مشهد
  | 'chapter'         // كتابة فصل
  | 'dialogue'        // كتابة حوار
  | 'description'     // وصف تفصيلي
  | 'verse'           // بيت شعري / مقطع
  | 'chorus'          // كورس
  | 'bridge'          // بريدج
  | 'revision'        // مراجعة
  | 'expansion'       // توسيع
  | 'polish'          // صقل نهائي
  | 'custom';         // خطوة مخصصة

// ============================================================================
// Control Options - خيارات التحكم
// ============================================================================

export type ToneOption =
  | 'dramatic'        // درامي
  | 'comedic'         // كوميدي
  | 'serious'         // جاد
  | 'lighthearted'    // خفيف
  | 'dark'            // مظلم
  | 'inspirational'   // ملهم
  | 'mysterious'      // غامض
  | 'romantic'        // رومانسي
  | 'suspenseful'     // مشوق
  | 'melancholic';    // حزين

export type StyleOption =
  | 'descriptive'     // وصفي
  | 'minimalist'      // بسيط
  | 'poetic'          // شعري
  | 'journalistic'    // صحفي
  | 'academic'        // أكاديمي
  | 'conversational'  // حواري
  | 'literary'        // أدبي
  | 'experimental';   // تجريبي

export type PerspectiveOption =
  | 'first-person'              // الأنا
  | 'second-person'             // أنت
  | 'third-person-limited'      // الغائب المحدود
  | 'third-person-omniscient';  // الغائب العليم

export type TenseOption =
  | 'past'    // الماضي
  | 'present' // الحاضر
  | 'future'; // المستقبل

export type PacingOption =
  | 'very-slow'
  | 'slow'
  | 'medium'
  | 'fast'
  | 'very-fast';

// ============================================================================
// Schemas
// ============================================================================

export const ContentMetadataSchema = z.object({
  title: z.string().min(1, 'العنوان مطلوب'),
  author: z.string().optional(),
  genre: z.string().optional(),
  targetAudience: z.string().optional(),
  language: z.string().default('ar'),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const LengthControlSchema = z.object({
  min: z.number().min(0),
  max: z.number().min(0),
  target: z.number().min(0),
  unit: z.enum(['words', 'characters', 'pages', 'minutes']).default('words'),
});

export const StepConfigSchema = z.object({
  // التحكم في الأسلوب
  tone: z.enum([
    'dramatic', 'comedic', 'serious', 'lighthearted', 'dark',
    'inspirational', 'mysterious', 'romantic', 'suspenseful', 'melancholic'
  ]).optional(),
  
  style: z.enum([
    'descriptive', 'minimalist', 'poetic', 'journalistic',
    'academic', 'conversational', 'literary', 'experimental'
  ]).optional(),
  
  // التحكم في الطول
  length: LengthControlSchema.optional(),
  
  // التحكم في السرد
  perspective: z.enum([
    'first-person', 'second-person',
    'third-person-limited', 'third-person-omniscient'
  ]).optional(),
  
  tense: z.enum(['past', 'present', 'future']).optional(),
  
  pacing: z.enum(['very-slow', 'slow', 'medium', 'fast', 'very-fast']).optional(),
  
  // تعليمات مخصصة
  customInstructions: z.string().optional(),
  
  // خيارات متقدمة
  useRAG: z.boolean().default(false),
  ragCollectionId: z.string().optional(),
  modelPreference: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  
  // خيارات إضافية خاصة بنوع الخطوة
  additionalOptions: z.record(z.any()).optional(),
});

export const StepResultSchema = z.object({
  content: z.string(),
  metadata: z.record(z.any()).optional(),
  tokensUsed: z.number().optional(),
  modelUsed: z.string().optional(),
  generatedAt: z.string(),
  version: z.number().default(1),
});

export const GenerationStepSchema = z.object({
  id: z.string(),
  order: z.number(),
  title: z.string(),
  description: z.string().optional(),
  type: z.enum([
    'outline', 'character', 'plot', 'scene', 'chapter',
    'dialogue', 'description', 'verse', 'chorus', 'bridge',
    'revision', 'expansion', 'polish', 'custom'
  ]),
  status: z.enum(['pending', 'in-progress', 'completed', 'skipped']).default('pending'),
  config: StepConfigSchema,
  dependencies: z.array(z.string()).optional(),
  optional: z.boolean().default(false),
  result: StepResultSchema.optional(),
});

export const ContentStructureSchema = z.object({
  type: z.string(), // 'chapters', 'acts', 'verses', etc.
  elements: z.array(z.object({
    id: z.string(),
    title: z.string(),
    order: z.number(),
    type: z.string(),
    metadata: z.record(z.any()).optional(),
  })),
});

export const CreativeContentConfigSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum([
    'story', 'novel', 'movie-script', 'tv-script', 'theater-script',
    'song-lyrics', 'poem', 'report', 'book', 'article'
  ]),
  metadata: ContentMetadataSchema,
  structure: ContentStructureSchema.optional(),
  generationSteps: z.array(GenerationStepSchema),
  currentStepIndex: z.number().default(0),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ============================================================================
// TypeScript Types
// ============================================================================

export type ContentMetadata = z.infer<typeof ContentMetadataSchema>;
export type LengthControl = z.infer<typeof LengthControlSchema>;
export type StepConfig = z.infer<typeof StepConfigSchema>;
export type StepResult = z.infer<typeof StepResultSchema>;
export type GenerationStep = z.infer<typeof GenerationStepSchema>;
export type ContentStructure = z.infer<typeof ContentStructureSchema>;
export type CreativeContentConfig = z.infer<typeof CreativeContentConfigSchema>;

// ============================================================================
// Template Definitions - قوالب جاهزة
// ============================================================================

export interface ContentTemplate {
  id: string;
  name: string;
  nameAr: string;
  type: ContentType;
  description: string;
  descriptionAr: string;
  icon: string;
  steps: Omit<GenerationStep, 'id' | 'status' | 'result'>[];
  defaultMetadata?: Partial<ContentMetadata>;
  structure?: ContentStructure;
}

// ============================================================================
// Predefined Templates
// ============================================================================

export const STORY_TEMPLATES: ContentTemplate[] = [
  {
    id: 'hero-journey',
    name: "Hero's Journey",
    nameAr: 'رحلة البطل',
    type: 'story',
    description: 'Classic hero journey structure',
    descriptionAr: 'بنية رحلة البطل الكلاسيكية',
    icon: '🦸',
    steps: [
      {
        order: 1,
        title: 'Story Outline',
        description: 'Create the basic outline following the hero journey structure',
        type: 'outline',
        config: {
          length: { min: 200, max: 500, target: 300, unit: 'words' },
          tone: 'inspirational',
        },
        optional: false,
      },
      {
        order: 2,
        title: 'Hero Character Development',
        description: 'Develop the hero character with strengths, weaknesses, and arc',
        type: 'character',
        config: {
          length: { min: 300, max: 600, target: 400, unit: 'words' },
        },
        optional: false,
      },
      {
        order: 3,
        title: 'Supporting Characters',
        description: 'Create mentor, allies, and antagonist characters',
        type: 'character',
        config: {
          length: { min: 400, max: 800, target: 600, unit: 'words' },
        },
        optional: false,
      },
      {
        order: 4,
        title: 'Plot Structure',
        description: 'Build the complete plot with all journey stages',
        type: 'plot',
        config: {
          length: { min: 500, max: 1000, target: 750, unit: 'words' },
        },
        optional: false,
      },
      {
        order: 5,
        title: 'Scene Breakdown',
        description: 'Break the story into individual scenes',
        type: 'scene',
        config: {
          length: { min: 300, max: 600, target: 400, unit: 'words' },
        },
        optional: false,
      },
      {
        order: 6,
        title: 'Write Story',
        description: 'Write the complete story',
        type: 'chapter',
        config: {
          length: { min: 2000, max: 5000, target: 3000, unit: 'words' },
          perspective: 'third-person-limited',
          tense: 'past',
          pacing: 'medium',
        },
        dependencies: ['outline', 'character', 'plot', 'scene'],
        optional: false,
      },
      {
        order: 7,
        title: 'Dialogue Enhancement',
        description: 'Enhance and polish dialogue',
        type: 'dialogue',
        config: {
          tone: 'dramatic',
        },
        optional: true,
      },
      {
        order: 8,
        title: 'Description Polish',
        description: 'Enhance descriptions and imagery',
        type: 'description',
        config: {
          style: 'descriptive',
        },
        optional: true,
      },
      {
        order: 9,
        title: 'Final Revision',
        description: 'Final polish and revision',
        type: 'revision',
        config: {},
        optional: false,
      },
    ],
  },
  {
    id: 'mystery-thriller',
    name: 'Mystery/Thriller',
    nameAr: 'رواية غموض وتشويق',
    type: 'story',
    description: 'Mystery and thriller story structure',
    descriptionAr: 'بنية قصة الغموض والتشويق',
    icon: '🔍',
    steps: [
      {
        order: 1,
        title: 'Mystery Setup',
        description: 'Setup the mystery and initial crime/problem',
        type: 'outline',
        config: {
          tone: 'mysterious',
          length: { min: 300, max: 600, target: 400, unit: 'words' },
        },
        optional: false,
      },
      {
        order: 2,
        title: 'Detective Character',
        description: 'Create the detective/protagonist character',
        type: 'character',
        config: {
          length: { min: 300, max: 600, target: 400, unit: 'words' },
        },
        optional: false,
      },
      {
        order: 3,
        title: 'Suspects & Clues',
        description: 'Develop suspects and plant clues',
        type: 'character',
        config: {
          tone: 'suspenseful',
          length: { min: 500, max: 1000, target: 750, unit: 'words' },
        },
        optional: false,
      },
      {
        order: 4,
        title: 'Investigation Plot',
        description: 'Build the investigation timeline with red herrings',
        type: 'plot',
        config: {
          pacing: 'fast',
          length: { min: 600, max: 1200, target: 800, unit: 'words' },
        },
        optional: false,
      },
      {
        order: 5,
        title: 'Write Mystery',
        description: 'Write the complete mystery story',
        type: 'chapter',
        config: {
          tone: 'suspenseful',
          perspective: 'third-person-limited',
          tense: 'past',
          pacing: 'fast',
          length: { min: 3000, max: 6000, target: 4000, unit: 'words' },
        },
        dependencies: ['outline', 'character', 'plot'],
        optional: false,
      },
      {
        order: 6,
        title: 'Suspense Enhancement',
        description: 'Enhance suspense and tension',
        type: 'revision',
        config: {
          tone: 'suspenseful',
        },
        optional: true,
      },
    ],
  },
];

export const SCRIPT_TEMPLATES: ContentTemplate[] = [
  {
    id: 'action-movie',
    name: 'Action Movie',
    nameAr: 'فيلم أكشن',
    type: 'movie-script',
    description: 'Three-act action movie structure',
    descriptionAr: 'بنية فيلم أكشن من ثلاثة فصول',
    icon: '🎬',
    steps: [
      {
        order: 1,
        title: 'Logline & Premise',
        description: 'Create compelling logline and premise',
        type: 'outline',
        config: {
          length: { min: 100, max: 300, target: 200, unit: 'words' },
        },
        optional: false,
      },
      {
        order: 2,
        title: 'Hero Character',
        description: 'Develop action hero with skills and motivation',
        type: 'character',
        config: {
          tone: 'dramatic',
          length: { min: 300, max: 500, target: 400, unit: 'words' },
        },
        optional: false,
      },
      {
        order: 3,
        title: 'Antagonist & Stakes',
        description: 'Create villain and establish stakes',
        type: 'character',
        config: {
          tone: 'dark',
          length: { min: 300, max: 500, target: 400, unit: 'words' },
        },
        optional: false,
      },
      {
        order: 4,
        title: 'Three-Act Structure',
        description: 'Build three-act structure with action set pieces',
        type: 'plot',
        config: {
          pacing: 'fast',
          length: { min: 800, max: 1500, target: 1000, unit: 'words' },
        },
        optional: false,
      },
      {
        order: 5,
        title: 'Scene List',
        description: 'Create detailed scene list with beats',
        type: 'scene',
        config: {
          length: { min: 500, max: 1000, target: 700, unit: 'words' },
        },
        optional: false,
      },
      {
        order: 6,
        title: 'Write Screenplay',
        description: 'Write the complete screenplay in proper format',
        type: 'chapter',
        config: {
          tone: 'dramatic',
          pacing: 'fast',
          length: { min: 80, max: 120, target: 100, unit: 'pages' },
        },
        dependencies: ['outline', 'character', 'plot', 'scene'],
        optional: false,
      },
      {
        order: 7,
        title: 'Dialogue Polish',
        description: 'Polish dialogue for impact',
        type: 'dialogue',
        config: {},
        optional: true,
      },
      {
        order: 8,
        title: 'Format Check',
        description: 'Verify screenplay format',
        type: 'revision',
        config: {},
        optional: false,
      },
    ],
  },
];

export const LYRICS_TEMPLATES: ContentTemplate[] = [
  {
    id: 'pop-song',
    name: 'Pop Song',
    nameAr: 'أغنية بوب',
    type: 'song-lyrics',
    description: 'Standard pop song structure',
    descriptionAr: 'بنية أغنية بوب قياسية',
    icon: '🎵',
    steps: [
      {
        order: 1,
        title: 'Song Concept',
        description: 'Define theme, emotion, and message',
        type: 'outline',
        config: {
          length: { min: 100, max: 200, target: 150, unit: 'words' },
        },
        optional: false,
      },
      {
        order: 2,
        title: 'Structure Design',
        description: 'Design verse-chorus-bridge layout',
        type: 'outline',
        config: {
          length: { min: 50, max: 150, target: 100, unit: 'words' },
        },
        optional: false,
      },
      {
        order: 3,
        title: 'Verse 1',
        description: 'Write first verse',
        type: 'verse',
        config: {
          tone: 'lighthearted',
          length: { min: 50, max: 100, target: 75, unit: 'words' },
        },
        optional: false,
      },
      {
        order: 4,
        title: 'Chorus',
        description: 'Write catchy chorus',
        type: 'chorus',
        config: {
          tone: 'inspirational',
          length: { min: 30, max: 60, target: 45, unit: 'words' },
        },
        optional: false,
      },
      {
        order: 5,
        title: 'Verse 2',
        description: 'Write second verse',
        type: 'verse',
        config: {
          length: { min: 50, max: 100, target: 75, unit: 'words' },
        },
        optional: false,
      },
      {
        order: 6,
        title: 'Bridge',
        description: 'Write bridge section',
        type: 'bridge',
        config: {
          tone: 'dramatic',
          length: { min: 40, max: 80, target: 60, unit: 'words' },
        },
        optional: true,
      },
      {
        order: 7,
        title: 'Rhyme & Flow Polish',
        description: 'Polish rhyme scheme and flow',
        type: 'polish',
        config: {},
        optional: false,
      },
    ],
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

export function createDefaultSteps(contentType: ContentType): GenerationStep[] {
  const template = [...STORY_TEMPLATES, ...SCRIPT_TEMPLATES, ...LYRICS_TEMPLATES].find(
    t => t.type === contentType
  );
  
  if (!template) {
    return [];
  }
  
  return template.steps.map((step, index) => ({
    ...step,
    id: `step-${index + 1}`,
    status: 'pending' as const,
  }));
}

export function getTemplatesByType(type: ContentType): ContentTemplate[] {
  return [...STORY_TEMPLATES, ...SCRIPT_TEMPLATES, ...LYRICS_TEMPLATES].filter(
    t => t.type === type
  );
}

export function getTemplateById(id: string): ContentTemplate | undefined {
  return [...STORY_TEMPLATES, ...SCRIPT_TEMPLATES, ...LYRICS_TEMPLATES].find(
    t => t.id === id
  );
}
