/**
 * @fileOverview Graduation Project Documentation Schemas
 * 
 * Comprehensive type-safe schemas for Computer Science and Software Engineering
 * graduation project documentation following academic standards.
 */

import { z } from 'genkit';

// ==================== ENUMS & CONSTANTS ====================

export const ProjectTypeSchema = z.enum([
  'web_application',
  'mobile_application',
  'desktop_application',
  'machine_learning',
  'data_science',
  'cybersecurity',
  'embedded_systems',
  'game_development',
  'blockchain',
  'iot',
  'cloud_computing',
  'devops',
  'ai_nlp',
  'computer_vision',
  'network_systems',
  'database_systems',
  'research_theoretical'
]).describe('Type of graduation project');

export const MethodologySchema = z.enum([
  'agile',
  'scrum',
  'waterfall',
  'iterative',
  'prototype',
  'experimental',
  'design_science',
  'action_research'
]).describe('Development methodology used');

export const DocumentChapterSchema = z.enum([
  'abstract',
  'introduction',
  'literature_review',
  'methodology',
  'system_analysis',
  'system_design',
  'implementation',
  'testing',
  'results',
  'discussion',
  'conclusion',
  'recommendations',
  'references',
  'appendices'
]).describe('Documentation chapter type');

// ==================== PROJECT METADATA ====================

export const ProjectMetadataSchema = z.object({
  title: z.string().describe('Project title'),
  arabicTitle: z.string().optional().describe('Arabic translation of title'),
  studentName: z.string().describe('Student full name'),
  studentId: z.string().describe('Student ID/registration number'),
  supervisorName: z.string().describe('Project supervisor name'),
  coSupervisorName: z.string().optional().describe('Co-supervisor name if any'),
  department: z.string().describe('Academic department'),
  university: z.string().describe('University name'),
  degree: z.enum(['bachelor', 'master', 'phd']).describe('Academic degree'),
  academicYear: z.string().describe('Academic year (e.g., 2023-2024)'),
  submissionDate: z.string().describe('Submission date'),
  projectType: ProjectTypeSchema,
  keywords: z.array(z.string()).describe('Project keywords (3-7 keywords)'),
  programmingLanguages: z.array(z.string()).describe('Programming languages used'),
  frameworks: z.array(z.string()).describe('Frameworks and libraries used'),
  tools: z.array(z.string()).describe('Development tools used'),
});

// ==================== CHAPTER SCHEMAS ====================

export const AbstractSchema = z.object({
  background: z.string().describe('Brief background (2-3 sentences)'),
  problemStatement: z.string().describe('Clear problem statement'),
  objectives: z.array(z.string()).describe('Main objectives (3-5 points)'),
  methodology: z.string().describe('Brief methodology description'),
  keyFindings: z.array(z.string()).describe('Key findings or contributions'),
  conclusion: z.string().describe('Brief conclusion'),
  wordCount: z.number().describe('Word count (typically 250-300)'),
});

export const IntroductionSchema = z.object({
  overview: z.string().describe('Project overview and context'),
  motivation: z.string().describe('Motivation and rationale'),
  problemStatement: z.string().describe('Detailed problem statement'),
  researchQuestions: z.array(z.string()).optional().describe('Research questions if applicable'),
  objectives: z.array(z.string()).describe('Specific objectives'),
  scope: z.string().describe('Project scope and boundaries'),
  significance: z.string().describe('Project significance and contributions'),
  documentStructure: z.string().describe('Document organization overview'),
});

export const LiteratureReviewSchema = z.object({
  introduction: z.string().describe('Introduction to literature review'),
  theoreticalFramework: z.string().describe('Theoretical foundations'),
  relatedWork: z.array(z.object({
    category: z.string().describe('Category of related work'),
    summary: z.string().describe('Summary of works in this category'),
    criticalAnalysis: z.string().describe('Critical analysis and gaps'),
    relevance: z.string().describe('Relevance to current project'),
  })).describe('Related work organized by categories'),
  comparativeAnalysis: z.string().describe('Comparative analysis of existing solutions'),
  identifiedGaps: z.array(z.string()).describe('Research/development gaps identified'),
  synthesis: z.string().describe('Synthesis and positioning of current work'),
  citations: z.array(z.object({
    authors: z.string(),
    year: z.string(),
    title: z.string(),
    source: z.string(),
  })).describe('Key citations used'),
});

export const MethodologySchema_Chapter = z.object({
  introduction: z.string().describe('Introduction to methodology'),
  developmentMethodology: MethodologySchema,
  methodologyJustification: z.string().describe('Why this methodology was chosen'),
  developmentPhases: z.array(z.object({
    phase: z.string().describe('Phase name'),
    description: z.string().describe('Phase description'),
    activities: z.array(z.string()).describe('Key activities'),
    deliverables: z.array(z.string()).describe('Phase deliverables'),
    duration: z.string().optional().describe('Estimated duration'),
  })).describe('Development phases'),
  toolsAndTechnologies: z.object({
    programmingLanguages: z.array(z.string()),
    frameworks: z.array(z.string()),
    databases: z.array(z.string()),
    developmentTools: z.array(z.string()),
    testingTools: z.array(z.string()),
    versionControl: z.string(),
  }).describe('Tools and technologies used'),
  dataCollection: z.string().optional().describe('Data collection methods if applicable'),
  evaluationMethods: z.array(z.string()).describe('How the system will be evaluated'),
});

export const SystemAnalysisSchema = z.object({
  introduction: z.string().describe('Introduction to system analysis'),
  problemAnalysis: z.string().describe('Detailed problem analysis'),
  currentSystemAnalysis: z.string().optional().describe('Analysis of current/existing system'),
  requirementsGathering: z.object({
    methods: z.array(z.string()).describe('Requirements gathering methods'),
    stakeholders: z.array(z.string()).describe('Identified stakeholders'),
  }),
  functionalRequirements: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    priority: z.enum(['high', 'medium', 'low']),
  })).describe('Functional requirements'),
  nonFunctionalRequirements: z.array(z.object({
    category: z.string().describe('Category (performance, security, usability, etc.)'),
    requirement: z.string(),
    metric: z.string().optional().describe('How to measure it'),
  })).describe('Non-functional requirements'),
  useCases: z.array(z.object({
    id: z.string(),
    title: z.string(),
    actor: z.string(),
    description: z.string(),
    preconditions: z.array(z.string()),
    mainFlow: z.array(z.string()),
    alternativeFlows: z.array(z.string()).optional(),
    postconditions: z.array(z.string()),
  })).describe('Use cases'),
  constraintsAndAssumptions: z.object({
    constraints: z.array(z.string()),
    assumptions: z.array(z.string()),
  }),
});

export const SystemDesignSchema = z.object({
  introduction: z.string().describe('Introduction to system design'),
  systemArchitecture: z.object({
    overview: z.string().describe('Architecture overview'),
    architectureType: z.string().describe('Architecture pattern (MVC, microservices, etc.)'),
    justification: z.string().describe('Why this architecture'),
    diagram: z.string().describe('Description of architecture diagram'),
  }),
  databaseDesign: z.object({
    databaseType: z.string().describe('Database type (SQL, NoSQL, etc.)'),
    erDiagram: z.string().describe('Description of ER diagram'),
    tables: z.array(z.object({
      name: z.string(),
      purpose: z.string(),
      keyFields: z.array(z.string()),
    })).optional(),
    relationships: z.string().describe('Key relationships'),
    normalization: z.string().optional().describe('Normalization level and justification'),
  }),
  uiDesign: z.object({
    designPrinciples: z.array(z.string()).describe('UI/UX design principles followed'),
    wireframes: z.string().describe('Description of wireframes/mockups'),
    userFlow: z.string().describe('User flow description'),
    responsiveness: z.string().optional().describe('Responsive design approach'),
  }).optional(),
  componentDesign: z.array(z.object({
    component: z.string(),
    responsibility: z.string(),
    interfaces: z.array(z.string()),
    dependencies: z.array(z.string()),
  })).describe('Key components/modules'),
  securityDesign: z.object({
    authentication: z.string(),
    authorization: z.string(),
    dataProtection: z.string(),
    otherMeasures: z.array(z.string()),
  }).optional(),
  classdiagrams: z.string().optional().describe('Description of class diagrams'),
  sequenceDiagrams: z.string().optional().describe('Description of key sequence diagrams'),
});

export const ImplementationSchema = z.object({
  introduction: z.string().describe('Introduction to implementation'),
  developmentEnvironment: z.object({
    hardware: z.array(z.string()),
    software: z.array(z.string()),
    configuration: z.string(),
  }),
  implementationDetails: z.array(z.object({
    module: z.string(),
    description: z.string(),
    keyFeatures: z.array(z.string()),
    challenges: z.array(z.string()).optional(),
    solutions: z.array(z.string()).optional(),
    codeSnippets: z.string().optional().describe('Reference to key code snippets'),
  })).describe('Implementation of key modules'),
  algorithms: z.array(z.object({
    name: z.string(),
    purpose: z.string(),
    pseudocode: z.string(),
    complexity: z.string().optional(),
  })).optional(),
  apiEndpoints: z.array(z.object({
    endpoint: z.string(),
    method: z.string(),
    description: z.string(),
    parameters: z.string(),
    response: z.string(),
  })).optional(),
  thirdPartyIntegrations: z.array(z.object({
    service: z.string(),
    purpose: z.string(),
    implementation: z.string(),
  })).optional(),
  challenges: z.array(z.object({
    challenge: z.string(),
    impact: z.string(),
    solution: z.string(),
  })).describe('Major implementation challenges'),
});

export const TestingSchema = z.object({
  introduction: z.string().describe('Introduction to testing'),
  testingStrategy: z.string().describe('Overall testing strategy'),
  testingTypes: z.array(z.object({
    type: z.string().describe('Testing type (unit, integration, system, etc.)'),
    description: z.string(),
    tools: z.array(z.string()),
    coverage: z.string().optional(),
  })),
  testCases: z.array(z.object({
    id: z.string(),
    title: z.string(),
    objective: z.string(),
    preconditions: z.array(z.string()),
    steps: z.array(z.string()),
    expectedResult: z.string(),
    actualResult: z.string(),
    status: z.enum(['passed', 'failed', 'pending']),
  })).describe('Key test cases'),
  usabilityTesting: z.object({
    participants: z.string(),
    tasks: z.array(z.string()),
    findings: z.array(z.string()),
    improvements: z.array(z.string()),
  }).optional(),
  performanceTesting: z.object({
    metrics: z.array(z.string()),
    results: z.string(),
    analysis: z.string(),
  }).optional(),
  securityTesting: z.object({
    vulnerabilities: z.array(z.string()),
    mitigations: z.array(z.string()),
  }).optional(),
  testResults: z.object({
    summary: z.string(),
    passRate: z.string(),
    defectsFound: z.number(),
    defectsFixed: z.number(),
  }),
});

export const ResultsSchema = z.object({
  introduction: z.string().describe('Introduction to results'),
  functionalResults: z.array(z.object({
    feature: z.string(),
    description: z.string(),
    screenshots: z.string().describe('Reference to screenshots'),
    validation: z.string(),
  })).describe('Functional results and features'),
  performanceResults: z.object({
    metrics: z.array(z.object({
      metric: z.string(),
      target: z.string(),
      achieved: z.string(),
      status: z.enum(['met', 'exceeded', 'not_met']),
    })),
    analysis: z.string(),
  }).optional(),
  userFeedback: z.object({
    methodology: z.string(),
    participants: z.string(),
    questionnaire: z.string().optional(),
    findings: z.array(z.string()),
    satisfactionScore: z.string().optional(),
  }).optional(),
  requirementsValidation: z.array(z.object({
    requirementId: z.string(),
    description: z.string(),
    status: z.enum(['fully_met', 'partially_met', 'not_met']),
    evidence: z.string(),
  })),
  comparison: z.object({
    comparedSystems: z.array(z.string()),
    comparisonCriteria: z.array(z.string()),
    results: z.string(),
    advantages: z.array(z.string()),
  }).optional(),
});

export const DiscussionSchema = z.object({
  introduction: z.string().describe('Introduction to discussion'),
  findingsInterpretation: z.string().describe('Interpretation of key findings'),
  objectivesAchievement: z.array(z.object({
    objective: z.string(),
    achievement: z.string(),
    evidence: z.string(),
  })),
  strengthsAndLimitations: z.object({
    strengths: z.array(z.string()),
    limitations: z.array(z.string()),
  }),
  comparisonWithLiterature: z.string().describe('How results compare with literature'),
  implications: z.object({
    theoretical: z.array(z.string()).optional(),
    practical: z.array(z.string()),
  }),
  challengesAndLessons: z.array(z.object({
    challenge: z.string(),
    lesson: z.string(),
  })),
  unexpectedFindings: z.array(z.string()).optional(),
});

export const ConclusionSchema = z.object({
  introduction: z.string().describe('Brief restatement of problem and objectives'),
  summary: z.string().describe('Summary of work done'),
  mainFindings: z.array(z.string()).describe('Main findings and achievements'),
  contributions: z.array(z.string()).describe('Project contributions'),
  objectivesFulfillment: z.string().describe('How objectives were fulfilled'),
  finalRemarks: z.string().describe('Final remarks and reflections'),
});

export const RecommendationsSchema = z.object({
  futureWork: z.array(z.object({
    recommendation: z.string(),
    description: z.string(),
    priority: z.enum(['high', 'medium', 'low']),
    effort: z.enum(['high', 'medium', 'low']).optional(),
  })).describe('Future work and enhancements'),
  scalability: z.array(z.string()).optional(),
  commercialization: z.string().optional(),
  researchDirections: z.array(z.string()).optional(),
  practicalRecommendations: z.array(z.string()).optional(),
});

// ==================== COMPLETE PROJECT SCHEMA ====================

export const GraduationProjectDocumentationSchema = z.object({
  metadata: ProjectMetadataSchema,
  abstract: AbstractSchema,
  introduction: IntroductionSchema,
  literatureReview: LiteratureReviewSchema,
  methodology: MethodologySchema_Chapter,
  systemAnalysis: SystemAnalysisSchema,
  systemDesign: SystemDesignSchema,
  implementation: ImplementationSchema,
  testing: TestingSchema,
  results: ResultsSchema,
  discussion: DiscussionSchema,
  conclusion: ConclusionSchema,
  recommendations: RecommendationsSchema,
  generatedAt: z.string().describe('Generation timestamp'),
  wordCount: z.object({
    total: z.number(),
    byChapter: z.record(z.number()),
  }),
});

// ==================== INPUT SCHEMAS ====================

export const GraduationProjectInputSchema = z.object({
  // Project Metadata
  title: z.string().describe('Project title'),
  arabicTitle: z.string().optional().describe('Arabic title'),
  studentName: z.string().describe('Student name'),
  studentId: z.string().describe('Student ID'),
  supervisorName: z.string().describe('Supervisor name'),
  coSupervisorName: z.string().optional(),
  department: z.string().describe('Department'),
  university: z.string().describe('University'),
  degree: z.enum(['bachelor', 'master', 'phd']).default('bachelor'),
  academicYear: z.string().describe('Academic year'),
  submissionDate: z.string().describe('Submission date'),
  
  // Project Details
  projectType: ProjectTypeSchema,
  methodology: MethodologySchema,
  
  // Project Description
  projectDescription: z.string().describe('Comprehensive project description'),
  problemStatement: z.string().describe('Clear problem statement'),
  objectives: z.array(z.string()).describe('Project objectives'),
  
  // Technical Details
  programmingLanguages: z.array(z.string()),
  frameworks: z.array(z.string()),
  databases: z.array(z.string()).optional(),
  tools: z.array(z.string()),
  
  // Requirements
  functionalRequirements: z.array(z.string()).describe('List of functional requirements'),
  nonFunctionalRequirements: z.array(z.string()).optional(),
  
  // Implementation Details
  implementationSummary: z.string().optional().describe('Summary of implementation'),
  keyFeatures: z.array(z.string()).describe('Key features implemented'),
  
  // Testing & Results
  testingApproach: z.string().optional().describe('Testing approach used'),
  testResults: z.string().optional().describe('Summary of test results'),
  
  // Literature & References
  relatedWorkSummary: z.string().optional().describe('Summary of related work'),
  keywords: z.array(z.string()).describe('Project keywords'),
  
  // Customization
  chaptersToGenerate: z.array(DocumentChapterSchema).optional().describe('Specific chapters to generate'),
  detailLevel: z.enum(['brief', 'standard', 'comprehensive']).default('standard'),
  includeArabic: z.boolean().default(false).describe('Include Arabic sections'),
  citationStyle: z.enum(['IEEE', 'APA', 'Harvard', 'MLA', 'Chicago']).default('IEEE'),
  
  // Additional Context
  existingDocumentation: z.string().optional().describe('Any existing documentation to incorporate'),
  specialInstructions: z.string().optional().describe('Special instructions or focus areas'),
});

export type GraduationProjectInput = z.infer<typeof GraduationProjectInputSchema>;
export type GraduationProjectDocumentation = z.infer<typeof GraduationProjectDocumentationSchema>;
