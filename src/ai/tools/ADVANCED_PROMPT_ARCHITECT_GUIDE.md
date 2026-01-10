# Advanced AI Prompt Architect - Complete Guide

## 🎯 Overview

The **Advanced AI Prompt Architect** is a sophisticated meta-tool that generates highly customized system instructions and user prompts for LLMs. It's designed to create specialized AI agents with precise behavioral controls, reasoning frameworks, and quality assurance mechanisms.

---

## 🧠 Architecture

The Prompt Architect follows a **protocol-based approach** with 7 distinct layers:

### **1. Identity Protocol**
Defines who the AI should be:
- Seniority level (Junior → Strategic Lead)
- Specialization domain
- Behavioral characteristics
- Quality mandates

### **2. Cognitive Framework**
Controls how the AI thinks:
- Analysis depth (Surface → Atomic)
- Reasoning mode (Standard → Socratic)
- Logical fallacy checking

### **3. Communication Standards**
Defines how the AI communicates:
- Communication style (Direct/Narrative/Technical/Persuasive)
- Formality level
- Tone and language
- Audience compatibility

### **4. Tool & Library Protocol**
Technical constraints:
- Specific tools/libraries to use
- Version requirements
- Best practices for technical solutions

### **5. Knowledge Management**
Fact-checking approach:
- Standard (balanced)
- Strict (no hallucination)
- Creative Synthesis

### **6. Quality Assurance**
Self-audit mechanisms:
- Constraint violation checks
- Success metrics validation
- Complexity level verification
- Fact accuracy checks

### **7. Operational Boundaries**
Rules and constraints:
- Mandatory requirements
- Prohibited actions
- Safety guidelines

---

## 🚀 Quick Start

### **Basic Usage**

\`\`\`typescript
import { advancedPromptArchitectTool, generatePrompt } from '@/ai/tools';

// Simple usage
const prompt = await advancedPromptArchitectTool({
  projectName: 'My API Documentation',
  projectDescription: 'REST API for e-commerce platform',
  documentType: 'API Reference',
  specialization: 'Backend Development',
  language: 'en',
});

console.log(prompt.systemInstructions);
console.log(prompt.userPrompt);
\`\`\`

### **Using as Function**

\`\`\`typescript
import { generatePrompt } from '@/ai/tools';

const promptData = generatePrompt({
  projectName: 'Security Audit Report',
  projectDescription: 'Comprehensive security analysis',
  documentType: 'Security Report',
  specialization: 'Cybersecurity',
  // ... more options
});
\`\`\`

---

## 📊 Complete Parameter Reference

### **Basic Project Information**

\`\`\`typescript
{
  projectName: string;              // Required: Project/document name
  projectDescription: string;       // Required: What to generate
  projectUrl?: string;              // Optional: Reference URL
  projectPath?: string;             // Optional: Local path
  projectType?: ProjectType;        // Optional: Project category
  documentType: string;             // Required: Type of document
}
\`\`\`

### **Expertise & Context**

\`\`\`typescript
{
  specialization?: string;          // Domain expertise (e.g., "Cloud Architecture")
  educationalLevel?: string;        // Academic level if applicable
  university?: string;              // Institution if applicable

  seniorityLevel: SeniorityLevel;   // Default: 'Senior'
  // Options: 'Junior' | 'Mid-Level' | 'Senior' | 'Principal/Expert' | 'Strategic Lead'

  audienceLevel: AudienceLevel;     // Default: 'Professional'
  // Options: 'Beginner' | 'Student' | 'Professional' | 'Expert/Researcher' | 'Executive'
}
\`\`\`

### **Cognitive Settings**

\`\`\`typescript
{
  analysisDepth: AnalysisDepth;     // Default: 'Comprehensive'
  // Options:
  // - 'Surface': Quick, high-level summaries
  // - 'Comprehensive': Balanced breadth and depth
  // - 'Deep-Dive': Nuanced, covers edge cases
  // - 'Atomic/Extremely Detailed': Deconstruct to smallest parts

  reasoningFramework: ReasoningFramework;  // Default: 'Standard'
  // Options:
  // - 'Standard': Direct analytical responses
  // - 'Chain of Thought': Show reasoning process step-by-step
  // - 'Step-by-Step': Incremental logical progression
  // - 'First Principles': Rebuild from fundamental truths
  // - 'Socratic': Lead through questions

  logicalFallacyCheck: boolean;     // Default: false
  // Audit for circular reasoning, straw man, false dilemma, etc.
}
\`\`\`

### **Communication Style**

\`\`\`typescript
{
  communicationStyle: CommunicationStyle;  // Default: 'Technical'
  // Options:
  // - 'Direct': Concise, action-oriented
  // - 'Narrative': Story-driven, engaging
  // - 'Technical': Precise, industry terminology
  // - 'Persuasive': Logic-driven persuasion

  formality: FormalityLevel;        // Default: 'Balanced'
  // Options: 'Informal' | 'Balanced' | 'Very Formal'

  tone: string;                     // Default: 'professional'
  // Examples: 'friendly', 'authoritative', 'encouraging', 'formal'

  language: string;                 // Default: 'en'
  // ISO language code: 'en', 'ar', 'es', etc.
}
\`\`\`

### **Output Configuration**

\`\`\`typescript
{
  outputFormats: OutputFormatType[];  // Default: ['heading', 'paragraph']
  // Options:
  // - 'heading': Semantic markdown headers
  // - 'paragraph': Professional prose
  // - 'list': Bullet/numbered lists
  // - 'table': Data tables
  // - 'code': Syntax-highlighted code
  // - 'diagram': Mermaid diagrams
  // - 'math': LaTeX formulas
  // - 'citation': Academic citations

  programmingLanguage?: string;     // For code examples
  diagramType?: DiagramType;        // For architecture diagrams
  citationStyle?: CitationStyle;    // For academic citations
  tableCaption?: string;            // For table titles
  wordCount?: string;               // Target length
}
\`\`\`

### **Quality & Constraints**

\`\`\`typescript
{
  complexity: number;               // Default: 50 (0-100 scale)

  behaviors: string[];              // Default: []
  // Example: ['Detail-oriented', 'User-focused', 'Security-conscious']

  mandatoryRules: string[];         // Default: []
  // Must-follow requirements

  constraints: string[];            // Default: []
  // Things to strictly avoid

  outputVerification: boolean;      // Default: true
  // Enable post-generation self-audit

  successCriteria?: string;         // What makes output successful

  knowledgeHandling: KnowledgeHandling;  // Default: 'Standard'
  // Options:
  // - 'Standard': Balanced accuracy
  // - 'Strict (No Hallucination)': Only confirmed facts
  // - 'Creative Synthesis': Innovative combinations
}
\`\`\`

### **Technical Guidance**

\`\`\`typescript
{
  toolLibraryGuidance?: string;     // Specific tool instructions
  // Example: "Use only official AWS SDK v3, avoid deprecated methods"

  includedTopics?: string;          // Topics to cover (newline-separated)
  customGuidelines?: string;        // Additional custom instructions
}
\`\`\`

---

## 💡 Real-World Examples

### **Example 1: Security Architecture Document**

\`\`\`typescript
const securityPrompt = await advancedPromptArchitectTool({
  // Identity
  projectName: 'Zero Trust Network Architecture',
  projectDescription: 'Design secure microservices architecture with zero-trust principles',
  documentType: 'Security Architecture Document',
  specialization: 'Cloud Security Architecture',
  seniorityLevel: 'Principal/Expert',

  // Cognitive Framework
  analysisDepth: 'Deep-Dive',
  reasoningFramework: 'First Principles',
  logicalFallacyCheck: true,

  // Communication
  communicationStyle: 'Technical',
  formality: 'Very Formal',
  tone: 'authoritative',
  audienceLevel: 'Expert/Researcher',

  // Output
  outputFormats: ['heading', 'diagram', 'code', 'table'],
  diagramType: 'architecture',
  programmingLanguage: 'go',

  // Quality
  complexity: 90,
  mandatoryRules: [
    'Include threat modeling with STRIDE methodology',
    'Reference NIST Cybersecurity Framework',
    'Provide code examples for all security controls',
    'Include compliance mapping (SOC2, ISO 27001)'
  ],
  constraints: [
    'No generic security advice without specific implementation',
    'No deprecated cryptographic algorithms',
    'No hardcoded credentials in examples',
  ],

  // Technical
  toolLibraryGuidance: `
- Cryptography: Use Go's crypto/tls with TLS 1.3 minimum
- Authentication: OAuth 2.0 + PKCE, JWT with RS256
- Secrets: HashiCorp Vault or AWS Secrets Manager
- Reference: OWASP ASVS 4.0
  `,

  knowledgeHandling: 'Strict (No Hallucination)',
  outputVerification: true,
  successCriteria: 'Document can be used as implementation blueprint with zero ambiguity',
});
\`\`\`

### **Example 2: Beginner Tutorial**

\`\`\`typescript
const tutorialPrompt = await advancedPromptArchitectTool({
  // Identity
  projectName: 'React Hooks for Beginners',
  projectDescription: 'Teach React Hooks to developers new to React',
  documentType: 'Interactive Tutorial',
  specialization: 'Frontend Development Education',
  seniorityLevel: 'Senior',

  // Cognitive
  analysisDepth: 'Comprehensive',
  reasoningFramework: 'Step-by-Step',

  // Communication
  communicationStyle: 'Narrative',
  formality: 'Informal',
  tone: 'friendly and encouraging',
  audienceLevel: 'Beginner',

  // Output
  outputFormats: ['heading', 'code', 'list'],
  programmingLanguage: 'javascript',

  // Quality
  complexity: 30,
  behaviors: [
    'Patient and supportive',
    'Uses real-world analogies',
    'Celebrates small wins',
    'Anticipates common mistakes'
  ],
  mandatoryRules: [
    'Explain WHY before HOW',
    'Provide working code examples for every concept',
    'Include common pitfalls and solutions',
    'Use simple, everyday language'
  ],
  constraints: [
    'No advanced concepts without building foundation',
    'No jargon without explanation',
    'No assuming prior knowledge'
  ],

  successCriteria: 'A complete beginner can build a functional React app with hooks after reading',
});
\`\`\`

### **Example 3: Executive Business Report**

\`\`\`typescript
const executivePrompt = await advancedPromptArchitectTool({
  // Identity
  projectName: 'Q4 2024 Engineering Metrics Report',
  projectDescription: 'Quarterly engineering productivity and outcomes for C-suite',
  documentType: 'Executive Report',
  specialization: 'Engineering Management',
  seniorityLevel: 'Strategic Lead',

  // Cognitive
  analysisDepth: 'Surface',
  reasoningFramework: 'Standard',

  // Communication
  communicationStyle: 'Persuasive',
  formality: 'Very Formal',
  tone: 'confident and data-driven',
  audienceLevel: 'Executive',

  // Output
  outputFormats: ['heading', 'table', 'paragraph'],

  // Quality
  complexity: 40,
  behaviors: [
    'Results-focused',
    'ROI-conscious',
    'Strategic perspective',
    'Action-oriented recommendations'
  ],
  mandatoryRules: [
    'Lead with business impact, not technical details',
    'Use metrics that tie to revenue/cost',
    'Include year-over-year comparisons',
    'Provide clear recommendations with costs'
  ],
  constraints: [
    'No technical jargon',
    'No metrics without business context',
    'No problems without solutions'
  ],

  includedTopics: `
Delivery Velocity & Business Outcomes
Cost Optimization Initiatives
Quality Metrics (customer-facing)
Team Productivity & Retention
Strategic Initiatives Progress
Risk Assessment & Mitigation
  `,

  successCriteria: 'Executives can make strategic decisions based on this report alone',
});
\`\`\`

### **Example 4: API Documentation for Developers**

\`\`\`typescript
const apiDocsPrompt = await advancedPromptArchitectTool({
  // Identity
  projectName: 'Payment Gateway API v3',
  projectDescription: 'REST API documentation for payment processing',
  documentType: 'API Reference Documentation',
  specialization: 'API Design & Documentation',
  seniorityLevel: 'Senior',

  // Cognitive
  analysisDepth: 'Comprehensive',
  reasoningFramework: 'Standard',

  // Communication
  communicationStyle: 'Technical',
  formality: 'Balanced',
  tone: 'helpful and precise',
  audienceLevel: 'Professional',

  // Output
  outputFormats: ['heading', 'code', 'table', 'list'],
  programmingLanguage: 'typescript',

  // Quality
  complexity: 60,
  behaviors: [
    'Developer-first mindset',
    'Example-driven',
    'Error-scenario focused',
    'Security-conscious'
  ],
  mandatoryRules: [
    'Every endpoint must have working code example',
    'Include error responses with solutions',
    'Show authentication for every request',
    'Provide rate limit information',
    'Include webhook event examples'
  ],
  constraints: [
    'No example with placeholder values only',
    'No endpoints without error handling',
    'No security-sensitive data in examples'
  ],

  toolLibraryGuidance: `
- Use fetch API for examples (not axios)
- Show TypeScript types for all request/response
- Authentication: Bearer token in Authorization header
- Base URL: https://api.payment.example.com/v3
- SDK: @payment/sdk v3.x
  `,

  citationStyle: 'APA',
  outputVerification: true,
  successCriteria: 'Developer can integrate API successfully using only this documentation',
});
\`\`\`

---

## 🎨 Use Case Patterns

### **Pattern 1: Technical Deep Dive**

\`\`\`typescript
{
  seniorityLevel: 'Principal/Expert',
  analysisDepth: 'Deep-Dive',
  communicationStyle: 'Technical',
  audienceLevel: 'Expert/Researcher',
  reasoningFramework: 'First Principles',
  logicalFallacyCheck: true,
  complexity: 85-95,
  outputVerification: true,
}
\`\`\`

**Use for:** Architecture reviews, research papers, technical RFCs

### **Pattern 2: Business Communication**

\`\`\`typescript
{
  seniorityLevel: 'Strategic Lead',
  analysisDepth: 'Surface',
  communicationStyle: 'Persuasive',
  audienceLevel: 'Executive',
  reasoningFramework: 'Standard',
  complexity: 30-40,
  formality: 'Very Formal',
}
\`\`\`

**Use for:** Executive reports, business cases, strategic proposals

### **Pattern 3: Educational Content**

\`\`\`typescript
{
  seniorityLevel: 'Senior',
  analysisDepth: 'Comprehensive',
  communicationStyle: 'Narrative',
  audienceLevel: 'Beginner' | 'Student',
  reasoningFramework: 'Step-by-Step',
  complexity: 25-35,
  formality: 'Informal',
  tone: 'friendly and encouraging',
}
\`\`\`

**Use for:** Tutorials, courses, onboarding docs

### **Pattern 4: API/SDK Documentation**

\`\`\`typescript
{
  seniorityLevel: 'Senior',
  analysisDepth: 'Comprehensive',
  communicationStyle: 'Technical',
  audienceLevel: 'Professional',
  outputFormats: ['heading', 'code', 'table'],
  programmingLanguage: 'typescript',
  complexity: 50-65,
  mandatoryRules: ['Every endpoint has example', 'Include error handling'],
}
\`\`\`

**Use for:** API docs, SDK references, integration guides

---

## 🔍 Advanced Features

### **Reasoning Framework Examples**

#### **Chain of Thought**
\`\`\`typescript
reasoningFramework: 'Chain of Thought'
\`\`\`
**Output style:** "Let me think through this step by step. First, we need to consider... This leads us to... Therefore, the conclusion is..."

#### **First Principles**
\`\`\`typescript
reasoningFramework: 'First Principles'
\`\`\`
**Output style:** "Let's break this down to fundamental truths: What do we know for certain? Starting from these foundations..."

#### **Socratic**
\`\`\`typescript
reasoningFramework: 'Socratic'
\`\`\`
**Output style:** "What problem are we solving? Why is this the right approach? How does this align with our goals?"

### **Logical Fallacy Checking**

\`\`\`typescript
logicalFallacyCheck: true
\`\`\`

Enables self-audit for:
- Circular reasoning
- Straw man arguments
- False dilemmas
- Ad hominem
- Appeal to authority
- Slippery slope
- Hasty generalization

### **Knowledge Handling Modes**

\`\`\`typescript
// Strict mode - no hallucination
knowledgeHandling: 'Strict (No Hallucination)'
\`\`\`
**Behavior:** Only states confirmed facts, explicitly says "I don't have confirmed information" when uncertain

\`\`\`typescript
// Creative mode - innovative synthesis
knowledgeHandling: 'Creative Synthesis'
\`\`\`
**Behavior:** Combines knowledge from multiple domains for novel solutions, clearly distinguishes facts from hypotheses

---

## 🎯 Best Practices

### **DO:**
✅ Be specific with \`projectDescription\`
✅ Use \`mandatoryRules\` for critical requirements
✅ Match \`audienceLevel\` to your actual audience
✅ Provide \`toolLibraryGuidance\` for technical docs
✅ Enable \`outputVerification\` for high-stakes content
✅ Use \`successCriteria\` to define quality bar

### **DON'T:**
❌ Use vague descriptions
❌ Mix audience levels (e.g., Executive + Deep-Dive)
❌ Overcomplicate simple tasks
❌ Skip \`constraints\` for safety-critical docs
❌ Forget to specify \`outputFormats\`

---

## 📊 Output Structure

### **Generated Prompt Object**

\`\`\`typescript
{
  systemInstructions: string;    // AI behavior and capabilities
  userPrompt: string;            // Specific task instructions
  metadata: {
    generatedAt: string;         // ISO timestamp
    version: string;             // Prompt version
    estimatedTokens: number;     // Approximate token count
  }
}
\`\`\`

### **Using Generated Prompts**

\`\`\`typescript
const { systemInstructions, userPrompt } = await advancedPromptArchitectTool({
  // ... config
});

// Use with Genkit
const result = await ai.generate({
  model: 'ollama/gemma:2b',
  system: systemInstructions,
  prompt: userPrompt,
});

// Use with OpenAI
const completion = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [
    { role: 'system', content: systemInstructions },
    { role: 'user', content: userPrompt }
  ]
});
\`\`\`

---

## 🚀 Integration with Flows

The Prompt Architect is used internally by all documentation flows:

\`\`\`typescript
// Example: How flows use it internally
export const myCustomFlow = ai.defineFlow({
  name: 'myCustomFlow',
  inputSchema: MyInputSchema,
  outputSchema: MyOutputSchema,
}, async (input) => {
  // Generate custom prompt
  const customPrompt = generatePrompt({
    projectName: input.name,
    documentType: 'Custom Doc',
    specialization: input.domain,
    // ... more config
  });

  // Use generated prompt
  const result = await ai.generate({
    model: 'ollama/gemma:2b',
    system: customPrompt.systemInstructions,
    prompt: customPrompt.userPrompt,
  });

  return result.output;
});
\`\`\`

---

## 📈 Performance & Token Estimation

The Prompt Architect generates prompts ranging from:
- **Minimal:** ~500-800 tokens
- **Standard:** ~1,000-1,500 tokens
- **Comprehensive:** ~1,500-2,500 tokens
- **Maximum:** ~2,500-3,500 tokens

Token count increases with:
- More \`mandatoryRules\` and \`constraints\`
- Longer \`toolLibraryGuidance\`
- More \`outputFormats\`
- Higher \`complexity\` settings
- \`logicalFallacyCheck\` enabled

---

## 🎉 Summary

The **Advanced AI Prompt Architect** is your meta-tool for creating specialized AI agents with:

✅ **7 protocol layers** for complete behavioral control
✅ **4 reasoning frameworks** for different thinking styles
✅ **5 audience levels** from beginner to expert
✅ **4 communication styles** for any context
✅ **8 output formats** for flexible documentation
✅ **Quality assurance** with self-audit capabilities
✅ **Zero-hallucination mode** for fact-critical content

Use it to generate custom prompts for any specialized documentation task! 🚀
