/**
 * @fileOverview Project Documentation Prompts
 *
 * Specialized prompts for generating various types of project documentation,
 * reports, and presentations.
 */

import { ai } from '@/ai/genkit';
import z from 'zod';

// ==================== README GENERATION PROMPTS ====================

export const readmeGenerationPrompt = ai.definePrompt({
    name: 'readmeGeneration',
    description: 'Generates comprehensive README.md files for projects',
    input: {
        schema: z.object({
            projectName: z.string(),
            description: z.string(),
            features: z.array(z.string()).optional(),
            techStack: z.array(z.string()).optional(),
            installSteps: z.string().optional(),
            usageExamples: z.string().optional(),
            template: z.enum(['minimal', 'standard', 'comprehensive']).default('standard'),
        }),
    },
}, `
You are a technical documentation expert specializing in creating clear, professional README files.

Generate a {{{template}}} README.md for the project: **{{projectName}}**

## Project Overview
{{description}}

{{#if features}}
## Key Features
{{#each features}}
- {{this}}
{{/each}}
{{/if}}

{{#if techStack}}
## Technology Stack
{{#each techStack}}
- {{this}}
{{/each}}
{{/if}}

## Structure Requirements

{{#if (eq template "minimal")}}
Create a concise README with:
1. Project title and brief description
2. Installation instructions
3. Basic usage example
4. License
{{/if}}

{{#if (eq template "standard")}}
Create a standard README with:
1. Title with badges (build status, version, license)
2. Description and motivation
3. Features list
4. Installation instructions
5. Usage examples
6. API reference (if applicable)
7. Contributing guidelines
8. License
{{/if}}

{{#if (eq template "comprehensive")}}
Create a comprehensive README with:
1. Title with comprehensive badges
2. Table of contents
3. About the project (description, motivation, problems solved)
4. Built with (technology stack)
5. Getting started (prerequisites, installation, configuration)
6. Usage (basic examples, advanced usage, code samples)
7. Roadmap
8. Contributing
9. License
10. Contact and acknowledgments
11. FAQ
{{/if}}

{{#if installSteps}}
## Installation Steps
{{{installSteps}}}
{{/if}}

{{#if usageExamples}}
## Usage Examples
{{{usageExamples}}}
{{/if}}

Write in clear, professional language. Use proper markdown formatting with code blocks, lists, and headings.
`);

// ==================== TECHNICAL SPECIFICATION PROMPTS ====================

export const technicalSpecPrompt = ai.definePrompt({
    name: 'technicalSpecification',
    description: 'Generates detailed technical specification documents',
    input: {
        schema: z.object({
            projectName: z.string(),
            projectType: z.string(),
            architecture: z.string().optional(),
            components: z.array(z.string()).optional(),
            dataModels: z.string().optional(),
            apiEndpoints: z.string().optional(),
            securityRequirements: z.array(z.string()).optional(),
            performanceGoals: z.array(z.string()).optional(),
        }),
    },
}, `
You are a senior software architect creating technical specifications for development teams.

Generate a detailed technical specification document for: **{{projectName}}**

Project Type: {{projectType}}

## Document Structure

1. **Executive Summary**
   - High-level overview of the system
   - Key objectives and goals
   - Target users and use cases

2. **System Architecture**
   {{#if architecture}}
   Based on: {{{architecture}}}
   {{else}}
   - Describe the overall architecture pattern (e.g., microservices, monolith, serverless)
   - Explain the rationale for architectural decisions
   - Include a high-level architecture diagram (Mermaid syntax)
   {{/if}}

3. **Component Design**
   {{#if components}}
   Focus on these components:
   {{#each components}}
   - {{this}}
   {{/each}}
   {{/if}}

   For each component, document:
   - Purpose and responsibilities
   - Interfaces and contracts
   - Dependencies
   - Technology choices

4. **Data Models**
   {{#if dataModels}}
   {{{dataModels}}}
   {{else}}
   - Entity-relationship diagrams
   - Schema definitions
   - Data flow diagrams
   {{/if}}

5. **API Design**
   {{#if apiEndpoints}}
   {{{apiEndpoints}}}
   {{else}}
   - RESTful endpoints or GraphQL schema
   - Request/response formats
   - Authentication and authorization
   - Rate limiting and throttling
   {{/if}}

6. **Security Considerations**
   {{#if securityRequirements}}
   {{#each securityRequirements}}
   - {{this}}
   {{/each}}
   {{else}}
   - Authentication mechanisms
   - Authorization strategies
   - Data encryption
   - Input validation
   - Security best practices
   {{/if}}

7. **Performance Requirements**
   {{#if performanceGoals}}
   {{#each performanceGoals}}
   - {{this}}
   {{/each}}
   {{else}}
   - Response time targets
   - Throughput requirements
   - Scalability considerations
   - Caching strategies
   {{/if}}

8. **Deployment Strategy**
   - Infrastructure requirements
   - CI/CD pipeline
   - Environment configurations
   - Monitoring and logging

Use precise technical language. Include code examples and diagrams where helpful.
`);

// ==================== API DOCUMENTATION PROMPTS ====================

export const apiDocumentationPrompt = ai.definePrompt({
    name: 'apiDocumentation',
    description: 'Generates API reference documentation',
    input: {
        schema: z.object({
            apiName: z.string(),
            apiVersion: z.string(),
            baseUrl: z.string().optional(),
            endpoints: z.array(z.object({
                method: z.string(),
                path: z.string(),
                description: z.string(),
            })).optional(),
            authMethod: z.string().optional(),
            format: z.enum(['rest', 'graphql', 'grpc']).default('rest'),
        }),
    },
}, `
You are an API documentation specialist creating clear, developer-friendly documentation.

Generate comprehensive API documentation for: **{{apiName}}** (v{{apiVersion}})

{{#if baseUrl}}
Base URL: {{baseUrl}}
{{/if}}

API Format: {{format}}

## Documentation Structure

1. **Introduction**
   - What the API does
   - Who should use it
   - Key capabilities

2. **Authentication**
   {{#if authMethod}}
   Method: {{{authMethod}}}
   {{else}}
   - Describe authentication mechanism (API keys, OAuth, JWT, etc.)
   - Include example of authenticated request
   {{/if}}
   - How to obtain credentials
   - Security best practices

3. **Rate Limiting**
   - Request limits
   - Rate limit headers
   - Handling rate limit errors

4. **Endpoints**
   {{#if endpoints}}
   Document these endpoints in detail:
   {{#each endpoints}}

   ### {{method}} {{path}}
   {{description}}

   **Request:**
   - Parameters (path, query, body)
   - Request headers
   - Request body schema

   **Response:**
   - Success response (200, 201, etc.)
   - Error responses (400, 401, 404, 500, etc.)
   - Response schema

   **Example:**
   \`\`\`
   # Request
   curl -X {{method}} "{{../baseUrl}}{{path}}" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json"

   # Response
   (Include example response)
   \`\`\`
   {{/each}}
   {{else}}
   For each endpoint, include:
   - HTTP method and path
   - Description
   - Parameters
   - Request/response examples
   - Error codes
   {{/if}}

5. **Common Error Codes**
   - 400 Bad Request
   - 401 Unauthorized
   - 403 Forbidden
   - 404 Not Found
   - 429 Too Many Requests
   - 500 Internal Server Error

6. **SDKs and Client Libraries**
   - Available SDKs
   - Installation instructions
   - Quick start examples

7. **Changelog**
   - Version history
   - Breaking changes
   - Deprecation notices

Use clear, concise language. Provide working code examples for common use cases.
`);

// ==================== PROJECT REPORT PROMPTS ====================

export const projectReportPrompt = ai.definePrompt({
    name: 'projectReport',
    description: 'Generates project status and progress reports',
    input: {
        schema: z.object({
            projectName: z.string(),
            reportPeriod: z.string(),
            metrics: z.object({
                commits: z.number(),
                contributors: z.number(),
                linesOfCode: z.number(),
                filesChanged: z.number(),
            }).optional(),
            achievements: z.array(z.string()).optional(),
            challenges: z.array(z.string()).optional(),
            targetAudience: z.enum(['technical', 'executive', 'stakeholders']).default('stakeholders'),
        }),
    },
}, `
You are a project manager creating {{targetAudience}} reports.

Generate a {{reportPeriod}} status report for: **{{projectName}}**

## Report Structure

1. **Executive Summary**
   - Overall project health (Green/Yellow/Red)
   - Key highlights
   - Critical issues (if any)
   - Recommended actions

2. **Progress Metrics**
   {{#if metrics}}
   - Total Commits: {{metrics.commits}}
   - Active Contributors: {{metrics.contributors}}
   - Lines of Code: {{metrics.linesOfCode}}
   - Files Changed: {{metrics.filesChanged}}
   {{else}}
   - Development velocity
   - Code quality metrics
   - Test coverage
   - Bug trends
   {{/if}}

   Present metrics with:
   - Current value
   - Trend (↑ improving, → stable, ↓ declining)
   - Comparison to previous period

3. **Achievements & Milestones**
   {{#if achievements}}
   {{#each achievements}}
   ✅ {{this}}
   {{/each}}
   {{else}}
   - Features completed
   - Bugs fixed
   - Performance improvements
   - Milestones reached
   {{/if}}

4. **Challenges & Blockers**
   {{#if challenges}}
   {{#each challenges}}
   ⚠️ {{this}}
   {{/each}}
   {{else}}
   - Technical challenges
   - Resource constraints
   - Blocking issues
   - Dependencies
   {{/if}}

5. **Upcoming Work**
   - Next sprint/period priorities
   - Planned features
   - Technical debt items
   - Risk mitigation

6. **Team Activity**
   - Team size and structure
   - Collaboration patterns
   - Knowledge sharing
   - Skill development

7. **Recommendations**
   - Process improvements
   - Technical recommendations
   - Resource allocation
   - Risk mitigation strategies

{{#if (eq targetAudience "technical")}}
Include technical details, code quality metrics, and architectural decisions.
{{/if}}

{{#if (eq targetAudience "executive")}}
Focus on business impact, ROI, and strategic alignment. Use non-technical language.
{{/if}}

{{#if (eq targetAudience "stakeholders")}}
Balance technical and business perspectives. Highlight user-facing improvements.
{{/if}}

Use clear visualizations where appropriate (tables, progress bars, trend indicators).
`);

// ==================== PRESENTATION CONTENT PROMPTS ====================

export const presentationContentPrompt = ai.definePrompt({
    name: 'presentationContent',
    description: 'Generates content for project presentations',
    input: {
        schema: z.object({
            projectName: z.string(),
            presentationType: z.enum(['demo', 'pitch', 'technical_review', 'status_update', 'training']),
            duration: z.number().describe('Duration in minutes'),
            audience: z.string(),
            keyPoints: z.array(z.string()).optional(),
        }),
    },
}, `
You are a presentation designer creating compelling slide content.

Create presentation content for: **{{projectName}}**

Type: {{presentationType}}
Duration: {{duration}} minutes
Audience: {{audience}}

## Slide Allocation
Calculate slides based on {{duration}} minutes (assume 2-3 minutes per slide):
- Total slides: {{duration}} / 2.5 ≈ slides

## Presentation Structure

{{#if (eq presentationType "demo")}}
**Demo Presentation Flow:**
1. Title Slide - Project name, your name, date
2. Problem Statement - What problem are you solving?
3. Solution Overview - How your project solves it
4. Live Demo - Key features walkthrough (allocate 60% of time)
5. Technical Highlights - Architecture, tech stack
6. Results & Impact - Metrics, achievements
7. Future Roadmap - What's next
8. Q&A
{{/if}}

{{#if (eq presentationType "pitch")}}
**Pitch Presentation Flow:**
1. Hook - Attention-grabbing opening
2. Problem - Market problem, pain points
3. Solution - Your project/product
4. Market Opportunity - Target audience, market size
5. Competitive Advantage - What makes you different
6. Demo/Screenshots - Visual proof
7. Business Model - How it makes money
8. Traction - Current metrics, growth
9. Team - Key people
10. Ask - What you need
{{/if}}

{{#if (eq presentationType "technical_review")}}
**Technical Review Flow:**
1. Title & Overview
2. Architecture Diagram - System design
3. Technology Stack - Choices and rationale
4. Key Components - Deep dives
5. Data Models - Schema design
6. API Design - Endpoints, contracts
7. Security & Performance - Non-functional requirements
8. Testing Strategy - Coverage, approaches
9. Deployment - CI/CD, infrastructure
10. Challenges & Solutions - Technical decisions
11. Future Improvements - Technical debt, optimization
12. Discussion
{{/if}}

{{#if (eq presentationType "status_update")}}
**Status Update Flow:**
1. Title & Period
2. Executive Summary - Red/Yellow/Green status
3. Progress Metrics - Charts and numbers
4. Completed Work - What's done
5. Current Sprint/Work - What's in progress
6. Upcoming Work - What's next
7. Challenges - Blockers and issues
8. Team Updates - People, collaboration
9. Timeline - Gantt chart or roadmap
10. Recommendations - Next steps
{{/if}}

{{#if (eq presentationType "training")}}
**Training Session Flow:**
1. Introduction - What we'll learn
2. Prerequisites - Required knowledge
3. Concepts Overview - Theory
4. Hands-on Demo - Live coding/walkthrough
5. Practice Exercise - Guided activity
6. Common Pitfalls - What to avoid
7. Best Practices - Pro tips
8. Resources - Where to learn more
9. Q&A
10. Next Steps - How to continue learning
{{/if}}

{{#if keyPoints}}
## Key Points to Emphasize
{{#each keyPoints}}
- {{this}}
{{/each}}
{{/if}}

For each slide, provide:
1. **Slide Number & Title**
2. **Content** - Bullet points, not full sentences
3. **Speaker Notes** - What to say (detailed)
4. **Visual Suggestion** - What image/diagram/chart to include

Guidelines:
- Keep text minimal (6x6 rule: max 6 bullets, 6 words each)
- Use strong visuals
- Tell a story, don't just list facts
- Include transitions between sections
- End with clear call-to-action or takeaways
`);

// ==================== CHANGELOG GENERATION PROMPTS ====================

export const changelogPrompt = ai.definePrompt({
    name: 'changelogGeneration',
    description: 'Generates CHANGELOG.md following Keep a Changelog format',
    input: {
        schema: z.object({
            projectName: z.string(),
            version: z.string(),
            releaseDate: z.string().optional(),
            commits: z.array(z.object({
                hash: z.string(),
                message: z.string(),
                author: z.string(),
            })).optional(),
            includeUnreleased: z.boolean().default(true),
        }),
    },
}, `
You are a release manager creating a CHANGELOG.md file following the Keep a Changelog format.

Generate changelog for: **{{projectName}}** v{{version}}
{{#if releaseDate}}Release Date: {{releaseDate}}{{/if}}

## Format Requirements

Follow Keep a Changelog 1.0.0 (https://keepachangelog.com/):

\`\`\`markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

{{#if includeUnreleased}}
## [Unreleased]

### Added
- New features in development

### Changed
- Changes to existing functionality

### Deprecated
- Features to be removed in upcoming releases

### Removed
- Features removed in this release

### Fixed
- Bug fixes

### Security
- Security improvements
{{/if}}

## [{{version}}] - {{#if releaseDate}}{{releaseDate}}{{else}}YYYY-MM-DD{{/if}}

### Added
- New features
- New capabilities

### Changed
- Changes to existing functionality
- Updated dependencies

### Deprecated
- Soon-to-be removed features

### Removed
- Removed features

### Fixed
- Bug fixes
- Performance improvements

### Security
- Security patches
- Vulnerability fixes
\`\`\`

{{#if commits}}
## Commit Analysis

Categorize these commits into the above sections:
{{#each commits}}
- {{hash}}: {{message}} (@{{author}})
{{/each}}

Guidelines for categorization:
- **Added**: New features, new files, new capabilities
- **Changed**: Modifications to existing features, refactoring
- **Deprecated**: Marked for future removal
- **Removed**: Deleted features, deleted files
- **Fixed**: Bug fixes, error corrections
- **Security**: Security patches, vulnerability fixes
{{/if}}

Guidelines:
- Use bullet points starting with capital letter, no period
- Be concise but descriptive
- Link to issues/PRs if available: "Fix login bug (#123)"
- Group related changes
- Put most important changes first
- Use past tense: "Added", "Fixed", "Changed"
`);

// ==================== USER GUIDE PROMPTS ====================

export const userGuidePrompt = ai.definePrompt({
    name: 'userGuide',
    description: 'Generates user-friendly guide documentation',
    input: {
        schema: z.object({
            productName: z.string(),
            userType: z.enum(['end-user', 'developer', 'admin']),
            features: z.array(z.string()).optional(),
            includeScreenshots: z.boolean().default(false),
            tutorialStyle: z.enum(['quick-start', 'comprehensive', 'reference']).default('comprehensive'),
        }),
    },
}, `
You are a technical writer creating user-friendly documentation for {{userType}}s.

Create a {{tutorialStyle}} user guide for: **{{productName}}**

## Guide Structure

{{#if (eq tutorialStyle "quick-start")}}
**Quick Start Guide (5-10 minutes to get started):**
1. Welcome - What this product does in one sentence
2. Prerequisites - What you need before starting
3. Setup - 3-5 steps to get up and running
4. First Task - One simple, successful task
5. What's Next - Where to go from here
{{/if}}

{{#if (eq tutorialStyle "comprehensive")}}
**Comprehensive User Guide:**
1. **Introduction**
   - What is {{productName}}?
   - Who is it for?
   - What can you do with it?

2. **Getting Started**
   - System requirements
   - Installation/setup
   - First-time configuration
   - Account creation (if applicable)

3. **Core Concepts**
   - Key terminology
   - How it works
   - Main workflows

4. **Features**
   {{#if features}}
   {{#each features}}
   ### {{this}}
   - What it does
   - When to use it
   - Step-by-step instructions
   {{#if ../includeScreenshots}}- [Screenshot: {{this}}]{{/if}}
   - Tips and best practices
   {{/each}}
   {{else}}
   For each feature:
   - Feature overview
   - Use cases
   - Step-by-step tutorial
   - Screenshots/visuals
   - Tips and tricks
   {{/if}}

5. **Common Tasks**
   - Frequent workflows
   - Task-based tutorials
   - Shortcuts and efficiency tips

6. **Troubleshooting**
   - Common problems
   - Error messages explained
   - Solutions and workarounds
   - How to get help

7. **FAQ**
   - Anticipated questions
   - Clear, concise answers

8. **Advanced Topics**
   - Power user features
   - Customization
   - Integration with other tools

9. **Reference**
   - Keyboard shortcuts
   - Menu reference
   - Settings explained
{{/if}}

{{#if (eq tutorialStyle "reference")}}
**Reference Documentation:**
1. Overview and navigation
2. Alphabetical feature index
3. For each feature:
   - Name and location
   - Description
   - Parameters/options
   - Examples
   - Related features
4. Glossary
5. Index
{{/if}}

## Writing Style for {{userType}}

{{#if (eq userType "end-user")}}
- Use plain language, avoid jargon
- Explain technical terms when necessary
- Focus on "what" and "how", not "why"
- Use real-world examples
- Be encouraging and supportive
{{/if}}

{{#if (eq userType "developer")}}
- Use precise technical terminology
- Include code examples
- Explain architecture and design decisions
- Link to API documentation
- Provide best practices
{{/if}}

{{#if (eq userType "admin")}}
- Focus on configuration and management
- Include security considerations
- Explain system requirements
- Provide troubleshooting for common issues
- Include backup and recovery procedures
{{/if}}

Guidelines:
- Use numbered steps for procedures
- Include examples for every major feature
- Add notes, tips, and warnings where appropriate
- Keep paragraphs short (3-4 sentences)
- Use active voice
{{#if includeScreenshots}}- Mark screenshot locations with [Screenshot: description]{{/if}}
`);

// Export all prompts
export const projectDocumentationPrompts = {
    readmeGeneration: readmeGenerationPrompt,
    technicalSpecification: technicalSpecPrompt,
    apiDocumentation: apiDocumentationPrompt,
    projectReport: projectReportPrompt,
    presentationContent: presentationContentPrompt,
    changelogGeneration: changelogPrompt,
    userGuide: userGuidePrompt,
};
