/**
 * @fileOverview Graduation Project Documentation Prompts
 * 
 * Specialized prompts for generating each chapter of CS/SE graduation projects.
 * These prompts follow academic standards and best practices.
 */

import { ai, getModel } from '@/ai/genkit';
import { z } from 'zod';

// ==================== ABSTRACT PROMPT ====================

export const abstractPrompt = ai.definePrompt({
  name: 'abstractPrompt',
  description: 'Generate a professional academic abstract for a graduation project',
  model: await getModel('quality'),
  input: {
    schema: z.object({
      title: z.string(),
      projectType: z.string(),
      problemStatement: z.string(),
      objectives: z.array(z.string()),
      methodology: z.string(),
      keyResults: z.array(z.string()).optional(),
      keywords: z.array(z.string()),
    }),
  },
}, `You are an expert academic writer specializing in computer science and software engineering graduation projects.

Generate a professional abstract (250-300 words) for the following graduation project:

**Title:** {{title}}
**Project Type:** {{projectType}}
**Problem Statement:** {{problemStatement}}

**Objectives:**
{{#each objectives}}
- {{this}}
{{/each}}

**Methodology:** {{methodology}}

{{#if keyResults}}
**Key Results:**
{{#each keyResults}}
- {{this}}
{{/each}}
{{/if}}

**Keywords:** {{#each keywords}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}

**Requirements for the Abstract:**
1. **Background (2-3 sentences):** Briefly introduce the domain and context
2. **Problem Statement (1-2 sentences):** Clearly state what problem is being addressed
3. **Objectives (2-3 sentences):** Outline the main goals
4. **Methodology (2-3 sentences):** Describe the approach and technologies used
5. **Key Findings/Results (2-3 sentences):** Highlight main achievements
6. **Conclusion (1-2 sentences):** Summarize significance and impact

**Style Guidelines:**
- Use past tense for completed work, present for general truths
- Be concise and specific
- Avoid jargon and unnecessary technical details
- Use active voice where possible
- No citations in abstract
- Stand-alone (reader should understand without reading full document)
- 250-300 words total

Generate the abstract in a clear, professional academic style.`);

// ==================== INTRODUCTION PROMPT ====================

export const introductionPrompt = ai.definePrompt({
  name: 'introductionPrompt',
  description: 'Generate comprehensive introduction chapter',
  model: await getModel('quality'),
  input: {
    schema: z.object({
      title: z.string(),
      projectType: z.string(),
      problemStatement: z.string(),
      motivation: z.string().optional(),
      objectives: z.array(z.string()),
      scope: z.string().optional(),
      significance: z.string().optional(),
    }),
  },
}, `You are an expert academic writer for computer science graduation projects.

Generate a comprehensive **Introduction** chapter (1500-2000 words) for:

**Project Title:** {{title}}
**Project Type:** {{projectType}}
**Problem Statement:** {{problemStatement}}
{{#if motivation}}**Motivation:** {{motivation}}{{/if}}

**Objectives:**
{{#each objectives}}
{{@index}}. {{this}}
{{/each}}

{{#if scope}}**Scope:** {{scope}}{{/if}}
{{#if significance}}**Significance:** {{significance}}{{/if}}

**Chapter Structure:**

### 1.1 Overview (2-3 paragraphs)
- Introduce the general area and domain
- Provide context for the problem
- Set the stage for the reader

### 1.2 Motivation (2-3 paragraphs)
- Why is this project important?
- What gap does it fill?
- Who benefits and how?

### 1.3 Problem Statement (2-3 paragraphs)
- Clearly articulate the problem
- Explain current limitations
- Describe the need for a solution

### 1.4 Objectives (1-2 paragraphs + list)
- Present specific, measurable objectives
- Explain how each objective addresses the problem
- Use clear, action-oriented language

### 1.5 Scope and Limitations (2 paragraphs)
- Define what IS included in the project
- Define what IS NOT included (boundaries)
- Mention known limitations

### 1.6 Significance and Contributions (2-3 paragraphs)
- Expected impact and benefits
- Novel contributions
- Potential applications

### 1.7 Document Organization (1 paragraph)
- Brief overview of remaining chapters
- Roadmap for the reader

**Writing Guidelines:**
- Use present tense for general statements
- Use past tense when referring to what was done
- Start broad, then narrow to specifics (funnel approach)
- Be clear and precise
- Avoid unnecessary jargon
- Support claims with reasoning
- Maintain academic tone

Generate a well-structured, engaging introduction chapter.`);

// ==================== LITERATURE REVIEW PROMPT ====================

export const literatureReviewPrompt = ai.definePrompt({
  name: 'literatureReviewPrompt',
  description: 'Generate comprehensive literature review chapter',
  model: await getModel('quality'),
  input: {
    schema: z.object({
      projectTitle: z.string(),
      projectType: z.string(),
      relatedWorkSummary: z.string().optional(),
      keywords: z.array(z.string()),
      citationStyle: z.string().default('IEEE'),
    }),
  },
}, `You are an expert academic researcher specializing in computer science literature reviews.

Generate a comprehensive **Literature Review** chapter (3000-4000 words) for:

**Project:** {{projectTitle}}
**Type:** {{projectType}}
**Keywords:** {{#each keywords}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
**Citation Style:** {{citationStyle}}

{{#if relatedWorkSummary}}
**Context:** {{relatedWorkSummary}}
{{/if}}

**Chapter Structure:**

### 2.1 Introduction (1 paragraph)
- Purpose of literature review
- Search strategy and scope
- Organization of the chapter

### 2.2 Theoretical Framework (3-4 paragraphs)
- Fundamental concepts and theories
- Key terminology and definitions
- Foundational principles relevant to the project

### 2.3 Related Technologies and Tools (organized by categories)
For each relevant category:
- Overview of the category
- Key technologies/tools with citations
- Comparative analysis
- Strengths and limitations
- Relevance to current project

### 2.4 Related Work and Existing Solutions (4-6 subsections)
Organize by themes or approaches:
- **Theme/Approach Name**
  - Summary of works in this area [with citations]
  - Methodology used
  - Key findings
  - Limitations and gaps
  - Comparison table if applicable

### 2.5 Critical Analysis and Gap Identification (2-3 paragraphs)
- Synthesize findings from reviewed literature
- Identify research/development gaps
- Explain what is missing or inadequate
- Justify the need for current project

### 2.6 Summary and Positioning (1-2 paragraphs)
- Summarize key insights
- Position current project in the landscape
- Explain how it addresses identified gaps

**Writing Guidelines:**
- Use past tense when describing previous research
- Group related works thematically, not chronologically
- Be critical but fair in analysis
- Include comparison tables where appropriate
- Cite properly using {{citationStyle}} style
- Maintain clear transitions between sections
- Focus on relevance to your project
- Balance breadth and depth

**Important:** Generate realistic citations in {{citationStyle}} format. Use placeholder citations like [1], [2] that would be in the references section.

Generate a comprehensive, well-organized literature review.`);

// ==================== METHODOLOGY PROMPT ====================

export const methodologyPrompt = ai.definePrompt({
  name: 'methodologyPrompt',
  description: 'Generate methodology chapter',
  model: await getModel('quality'),
  input: {
    schema: z.object({
      projectTitle: z.string(),
      methodology: z.string(),
      programmingLanguages: z.array(z.string()),
      frameworks: z.array(z.string()),
      databases: z.array(z.string()).optional(),
      tools: z.array(z.string()),
    }),
  },
}, `You are an expert in software development methodologies and research methods.

Generate a comprehensive **Methodology** chapter (2000-2500 words) for:

**Project:** {{projectTitle}}
**Development Methodology:** {{methodology}}
**Programming Languages:** {{#each programmingLanguages}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
**Frameworks:** {{#each frameworks}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
{{#if databases}}**Databases:** {{#each databases}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}
**Tools:** {{#each tools}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}

**Chapter Structure:**

### 3.1 Introduction (1 paragraph)
- Overview of chapter contents
- Importance of methodology

### 3.2 Development Methodology (3-4 paragraphs)
- Detailed explanation of {{methodology}} methodology
- Why this methodology was chosen
- How it fits the project nature
- Phases and iterations planned

### 3.3 Development Phases (detailed breakdown)
For each phase:
- **Phase Name and Objectives**
- Key activities
- Deliverables
- Success criteria
- Estimated timeline

Typical phases:
1. Requirements Analysis
2. Design
3. Implementation
4. Testing
5. Deployment

### 3.4 Tools and Technologies (organized by category)

#### 3.4.1 Programming Languages
For each language:
- Why chosen
- Key features utilized
- Version used

#### 3.4.2 Frameworks and Libraries
For each framework:
- Purpose and role
- Why selected over alternatives
- Key features used

#### 3.4.3 Database Management
{{#if databases}}
- Database type and rationale
- Design approach
- Management tools
{{else}}
- If applicable to project
{{/if}}

#### 3.4.4 Development Tools
- IDE/Text editors
- Version control (Git, etc.)
- Project management tools
- Testing tools
- Deployment tools

### 3.5 System Development Process (2-3 paragraphs)
- Overall workflow
- Integration between phases
- Quality assurance measures
- Documentation practices

### 3.6 Evaluation and Validation Methods (2-3 paragraphs)
- How will success be measured?
- Testing strategies
- Validation criteria
- User acceptance approach

### 3.7 Summary (1 paragraph)
- Recap of methodology
- Expected outcomes

**Writing Guidelines:**
- Use future tense for planned activities, past for completed
- Justify choices with technical reasoning
- Include diagrams descriptions (workflow, architecture)
- Be specific about versions and configurations
- Explain WHY, not just WHAT
- Maintain technical accuracy

Generate a clear, detailed methodology chapter.`);

// ==================== SYSTEM ANALYSIS PROMPT ====================

export const systemAnalysisPrompt = ai.definePrompt({
  name: 'systemAnalysisPrompt',
  description: 'Generate system analysis and requirements chapter',
  model: await getModel('quality'),
  input: {
    schema: z.object({
      projectTitle: z.string(),
      problemStatement: z.string(),
      functionalRequirements: z.array(z.string()),
      nonFunctionalRequirements: z.array(z.string()).optional(),
    }),
  },
}, `You are an expert systems analyst specializing in software requirements engineering.

Generate a comprehensive **System Analysis and Requirements** chapter (2500-3000 words) for:

**Project:** {{projectTitle}}
**Problem:** {{problemStatement}}

**Functional Requirements:**
{{#each functionalRequirements}}
- {{this}}
{{/each}}

{{#if nonFunctionalRequirements}}
**Non-Functional Requirements:**
{{#each nonFunctionalRequirements}}
- {{this}}
{{/each}}
{{/if}}

**Chapter Structure:**

### 4.1 Introduction (1 paragraph)
- Purpose of system analysis
- Scope of requirements

### 4.2 Problem Analysis (3-4 paragraphs)
- Detailed problem breakdown
- Root cause analysis
- Impact and consequences
- Stakeholder perspectives

### 4.3 Current System Analysis (if applicable, 2-3 paragraphs)
- Description of existing solution/approach
- Limitations and weaknesses
- Why improvement is needed
- Lessons learned from current system

### 4.4 Requirements Gathering (2 paragraphs)
- Methods used (interviews, surveys, observation)
- Stakeholders involved
- Process followed
- Challenges faced

### 4.5 Functional Requirements (detailed)
Organize by modules or features:

**Format for each requirement:**
- **FR-XX: Requirement Title**
  - **Description:** Detailed explanation
  - **Priority:** High/Medium/Low
  - **Rationale:** Why needed
  - **Dependencies:** Related requirements
  - **Acceptance Criteria:** How to verify

Present 10-15 detailed functional requirements.

### 4.6 Non-Functional Requirements (organized by category)

Categories:
1. **Performance Requirements**
   - Response time, throughput, etc.
2. **Security Requirements**
   - Authentication, authorization, data protection
3. **Usability Requirements**
   - User interface, accessibility
4. **Reliability Requirements**
   - Availability, fault tolerance
5. **Scalability Requirements**
   - Growth capacity
6. **Maintainability Requirements**
   - Code quality, documentation

### 4.7 Use Cases (3-5 detailed use cases)

**Format:**
- **UC-XX: Use Case Name**
  - **Actor:** Primary user
  - **Description:** What happens
  - **Preconditions:** State before
  - **Main Flow:** Step-by-step
  - **Alternative Flows:** Other paths
  - **Postconditions:** State after
  - **Exception Handling:** Error cases

### 4.8 System Constraints and Assumptions (2 paragraphs)
**Constraints:**
- Technical limitations
- Budget/resource constraints
- Time constraints
- Platform constraints

**Assumptions:**
- What is assumed to be true
- Dependencies on external factors

### 4.9 Requirements Validation (1-2 paragraphs)
- How requirements were validated
- Stakeholder approval
- Traceability approach

### 4.10 Summary (1 paragraph)
- Total count of requirements
- Completeness statement
- Bridge to next chapter

**Writing Guidelines:**
- Use "shall" for mandatory requirements
- Use "should" for desired requirements
- Be specific and measurable
- Use clear, unambiguous language
- Include use case diagrams descriptions
- Organize logically by feature/module
- Ensure traceability

Generate a comprehensive, well-structured requirements chapter.`);

// ==================== SYSTEM DESIGN PROMPT ====================

export const systemDesignPrompt = ai.definePrompt({
  name: 'systemDesignPrompt',
  description: 'Generate system design and architecture chapter',
  model: await getModel('quality'),
  input: {
    schema: z.object({
      projectTitle: z.string(),
      projectType: z.string(),
      architectureType: z.string().optional(),
      databases: z.array(z.string()).optional(),
      frameworks: z.array(z.string()),
    }),
  },
}, `You are an expert software architect specializing in system design.

Generate a comprehensive **System Design and Architecture** chapter (3000-3500 words) for:

**Project:** {{projectTitle}}
**Type:** {{projectType}}
{{#if architectureType}}**Architecture:** {{architectureType}}{{/if}}
**Frameworks:** {{#each frameworks}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
{{#if databases}}**Database:** {{#each databases}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}

**Chapter Structure:**

### 5.1 Introduction (1 paragraph)
- Overview of design phase
- Design principles followed
- Chapter organization

### 5.2 System Architecture (4-5 paragraphs + diagrams)

#### 5.2.1 Architecture Overview
- High-level architecture description
- Architecture pattern used (MVC, Microservices, Layered, etc.)
- Rationale for architecture choice
- Benefits and trade-offs

#### 5.2.2 System Components
Major components/layers:
- **Component Name**
  - Purpose and responsibility
  - Technologies used
  - Interactions with other components

#### 5.2.3 Architectural Diagrams
Describe the following diagrams:
- **System Architecture Diagram** - Overall structure
- **Component Diagram** - Major components and relationships
- **Deployment Diagram** - Where components run

### 5.3 Database Design (3-4 paragraphs + diagrams)

#### 5.3.1 Database Selection
{{#if databases}}
- Database type: {{databases}}
- Why chosen over alternatives
- Advantages for this project
{{else}}
- If applicable, discuss data storage approach
{{/if}}

#### 5.3.2 Data Model
- **Entity-Relationship Diagram** description
- Key entities and their attributes
- Relationships between entities
- Cardinality specifications

#### 5.3.3 Database Schema
Present main tables:
- **Table Name**
  - Purpose
  - Primary key
  - Foreign keys
  - Important fields

#### 5.3.4 Database Optimization
- Indexing strategy
- Normalization level (3NF, BCNF, etc.) and justification
- Query optimization considerations
- Data integrity constraints

### 5.4 User Interface Design (3-4 paragraphs)

#### 5.4.1 UI/UX Design Principles
- Design philosophy
- User-centered design approach
- Accessibility considerations
- Responsive design strategy

#### 5.4.2 Wireframes and Mockups
Describe key screens:
- **Screen Name**
  - Purpose
  - Key elements
  - User interactions
  - Navigation flow

#### 5.4.3 User Flow
- Main user journeys
- Navigation structure
- Information architecture

### 5.5 Module/Component Design (2-3 paragraphs per module)

For each major module:
- **Module Name**
  - **Purpose:** What it does
  - **Responsibilities:** Specific tasks
  - **Interfaces:** Public methods/APIs
  - **Dependencies:** Other modules needed
  - **Data Structures:** Key data types used

Present 5-7 major modules.

### 5.6 Class Design (if applicable, 2-3 paragraphs)
- **Class Diagram** description
- Key classes and their relationships
- Design patterns used (Singleton, Factory, Observer, etc.)
- Inheritance and composition

### 5.7 API Design (if applicable, 2-3 paragraphs)

For RESTful APIs:
- Endpoint structure
- Resource naming conventions
- HTTP methods usage
- Request/response formats
- Authentication/authorization design

Present key API endpoints in table format:
| Endpoint | Method | Purpose | Parameters | Response |

### 5.8 Security Design (3-4 paragraphs)

#### 5.8.1 Authentication Design
- Authentication mechanism
- User credential management
- Session management

#### 5.8.2 Authorization Design
- Access control approach (RBAC, ABAC)
- Permission levels
- Protected resources

#### 5.8.3 Data Protection
- Encryption (at rest and in transit)
- Sensitive data handling
- Privacy considerations

#### 5.8.4 Security Best Practices
- Input validation
- SQL injection prevention
- XSS protection
- CSRF protection

### 5.9 Interaction Design (2-3 paragraphs)
- **Sequence Diagrams** for key operations
- Communication between components
- Message flow
- Error handling

### 5.10 Design Patterns (2 paragraphs)
- Design patterns applied
- Where and why each pattern is used
- Benefits achieved

### 5.11 Summary (1 paragraph)
- Recap of design decisions
- How design meets requirements
- Transition to implementation

**Writing Guidelines:**
- Include descriptions of ALL diagrams
- Justify design decisions
- Show trade-off analysis
- Use UML notation references
- Be specific about technologies
- Explain the "why" behind choices
- Maintain consistency with requirements

Generate a comprehensive, well-justified system design chapter.`);

// ==================== IMPLEMENTATION PROMPT ====================

export const implementationPrompt = ai.definePrompt({
  name: 'implementationPrompt',
  description: 'Generate implementation chapter',
  model: await getModel('quality'),
  input: {
    schema: z.object({
      projectTitle: z.string(),
      programmingLanguages: z.array(z.string()),
      frameworks: z.array(z.string()),
      keyFeatures: z.array(z.string()),
      implementationSummary: z.string().optional(),
    }),
  },
}, `You are an expert software developer specializing in implementation documentation.

Generate a comprehensive **Implementation** chapter (3500-4000 words) for:

**Project:** {{projectTitle}}
**Languages:** {{#each programmingLanguages}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
**Frameworks:** {{#each frameworks}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}

**Key Features:**
{{#each keyFeatures}}
- {{this}}
{{/each}}

{{#if implementationSummary}}
**Context:** {{implementationSummary}}
{{/if}}

**Chapter Structure:**

### 6.1 Introduction (1 paragraph)
- Overview of implementation phase
- Development timeline
- Chapter organization

### 6.2 Development Environment (2-3 paragraphs)

#### 6.2.1 Hardware Environment
- Development machines
- Server specifications (if applicable)
- Testing devices

#### 6.2.2 Software Environment
- Operating systems
- IDEs and text editors
- Version control system
- Build tools
- Package managers
- Required software versions

#### 6.2.3 Environment Configuration
- Development environment setup
- Configuration files
- Environment variables
- Dependencies installation

### 6.3 Project Structure (2-3 paragraphs)
- Directory organization
- File naming conventions
- Module organization
- Code structure rationale

Example:
\`\`\`
project/
├── src/
│   ├── components/
│   ├── services/
│   └── utils/
├── tests/
└── docs/
\`\`\`

### 6.4 Implementation of Key Modules (3-4 paragraphs per module)

For each major module/feature:

**Module: [Name]**

#### Purpose and Overview
- What this module does
- Its role in the system

#### Implementation Details
- Technologies used
- Key algorithms or logic
- Data structures employed
- Design patterns applied

#### Key Features
- Feature 1: Implementation approach
- Feature 2: Implementation approach
- Feature 3: Implementation approach

#### Code Snippets
Present and explain critical code sections:
\`\`\`language
// Code example with explanation
\`\`\`

#### Challenges Faced
- Challenge description
- Why it was difficult
- Solution approach
- Lessons learned

Present 6-8 major modules.

### 6.5 Database Implementation (2-3 paragraphs)
- Database setup and configuration
- Schema creation scripts
- Data migration approach
- Connection pooling
- Query optimization implemented
- Example queries for key operations

### 6.6 API Implementation (if applicable, 2-3 paragraphs)
- RESTful API structure
- Endpoint implementation details
- Request validation
- Response formatting
- Error handling
- Example API calls

### 6.7 User Interface Implementation (2-3 paragraphs)
- Frontend framework setup
- Component implementation
- State management
- Routing implementation
- Form validation
- Responsive design implementation

### 6.8 Authentication & Authorization (2-3 paragraphs)
- Authentication implementation
- Token management
- Session handling
- Permission checks
- Security measures implemented

### 6.9 Key Algorithms (2-3 algorithms)

For each algorithm:
- **Algorithm Name**
- **Purpose:** What problem it solves
- **Pseudocode:**
\`\`\`
Step-by-step pseudocode
\`\`\`
- **Time Complexity:** Big-O analysis
- **Space Complexity:** Memory usage
- **Implementation Notes**

### 6.10 Third-Party Integrations (if applicable, 2-3 paragraphs)
For each integration:
- Service name and purpose
- Integration approach
- API keys and configuration
- Error handling
- Example usage

### 6.11 Code Quality Measures (2 paragraphs)
- Coding standards followed
- Code review process
- Documentation in code
- Refactoring done
- Technical debt management

### 6.12 Challenges and Solutions (3-5 challenges)

For each major challenge:
- **Challenge:** Description
- **Impact:** How it affected development
- **Analysis:** Root cause
- **Solution:** How it was solved
- **Outcome:** Result of solution
- **Lesson Learned:** Key takeaway
- **Applicability:** How lesson applies elsewhere

### 6.13 Version Control and Collaboration (1-2 paragraphs)
- Git workflow used
- Branching strategy
- Commit conventions
- Code review process
- Collaboration practices

### 6.14 Summary (1 paragraph)
- Implementation achievements
- Code statistics (lines of code, files, etc.)
- Readiness for testing

**Writing Guidelines:**
- Use past tense (work completed)
- Include code snippets for critical parts
- Explain WHY certain approaches were chosen
- Show problem-solving process
- Balance technical detail with readability
- Reference design decisions from previous chapter
- Include error handling approaches

Generate a detailed, practical implementation chapter.`);

// ==================== TESTING PROMPT ====================

export const testingPrompt = ai.definePrompt({
  name: 'testingPrompt',
  description: 'Generate testing and quality assurance chapter',
  model: await getModel('quality'),
  input: {
    schema: z.object({
      projectTitle: z.string(),
      testingApproach: z.string().optional(),
      testResults: z.string().optional(),
    }),
  },
}, `You are an expert in software testing and quality assurance.

Generate a comprehensive **Testing and Quality Assurance** chapter (2500-3000 words) for:

**Project:** {{projectTitle}}
{{#if testingApproach}}**Testing Approach:** {{testingApproach}}{{/if}}
{{#if testResults}}**Results Summary:** {{testResults}}{{/if}}

**Chapter Structure:**

### 7.1 Introduction (1 paragraph)
- Importance of testing
- Testing objectives
- Chapter overview

### 7.2 Testing Strategy (2-3 paragraphs)
- Overall testing approach
- Testing levels planned
- Testing schedule
- Resources allocated
- Success criteria

### 7.3 Testing Environment (2 paragraphs)

#### 7.3.1 Hardware Setup
- Testing machines
- Device configurations
- Network setup

#### 7.3.2 Software Setup
- Testing tools
- Test data preparation
- Environment configuration

### 7.4 Testing Types and Methodologies (3-4 paragraphs per type)

#### 7.4.1 Unit Testing
- **Purpose:** Test individual components
- **Approach:** How conducted
- **Tools Used:** Testing frameworks
- **Coverage:** Percentage or scope
- **Example Test Cases:** 2-3 examples
- **Results:** Summary of findings

#### 7.4.2 Integration Testing
- **Purpose:** Test component interactions
- **Approach:** Integration strategy (top-down, bottom-up, etc.)
- **Test Scenarios:** Key integration points
- **Results:** Issues found and resolved

#### 7.4.3 System Testing
- **Purpose:** Test complete system
- **Approach:** End-to-end testing
- **Test Cases:** Major scenarios
- **Results:** System behavior validation

#### 7.4.4 Acceptance Testing
- **Purpose:** User acceptance
- **Participants:** User profiles
- **Scenarios:** Real-world use cases
- **Results:** User feedback and acceptance

#### 7.4.5 Performance Testing (if applicable)
- **Load Testing:** System under load
- **Stress Testing:** Breaking points
- **Metrics Measured:** Response time, throughput
- **Results:** Performance benchmarks

#### 7.4.6 Security Testing (if applicable)
- **Vulnerability Assessment**
- **Penetration Testing**
- **Security Audit**
- **Results:** Vulnerabilities and fixes

#### 7.4.7 Usability Testing (if applicable)
- **Participants:** User demographics
- **Tasks:** User scenarios
- **Metrics:** Success rate, time, satisfaction
- **Results:** Usability improvements

### 7.5 Test Cases (detailed examples)

Present 10-15 detailed test cases:

**TC-XX: Test Case Title**
- **Test ID:** TC-XX
- **Module:** Which module/feature
- **Objective:** What is being tested
- **Priority:** High/Medium/Low
- **Preconditions:** Required state
- **Test Data:** Input data used
- **Test Steps:**
  1. Step one
  2. Step two
  3. Step three
- **Expected Result:** What should happen
- **Actual Result:** What happened
- **Status:** ✅ Passed / ❌ Failed / ⏳ Pending
- **Notes:** Additional observations

Organize by module or feature.

### 7.6 Test Results Summary (2-3 paragraphs)

#### 7.6.1 Overall Results
- Total test cases: XX
- Passed: XX (XX%)
- Failed: XX (XX%)
- Pending: XX (XX%)
- Pass rate achieved

#### 7.6.2 Defects Analysis
- Critical defects: X
- Major defects: X
- Minor defects: X
- Defects fixed: X
- Defects deferred: X

#### 7.6.3 Test Coverage
- Code coverage percentage
- Feature coverage
- Requirements coverage
- Areas not tested (with justification)

### 7.7 Defect Management (2 paragraphs)
- Defect logging process
- Defect prioritization
- Resolution workflow
- Verification process

### 7.8 Regression Testing (1-2 paragraphs)
- When performed
- Scope of regression tests
- Results
- Automated vs manual

### 7.9 Test Automation (if applicable, 2 paragraphs)
- Automated testing tools
- What was automated
- Benefits achieved
- Automation coverage

### 7.10 User Feedback (if applicable, 2-3 paragraphs)
- Feedback collection method
- Number of participants
- Key feedback points
- Improvements made
- Satisfaction scores

### 7.11 Quality Metrics (1-2 paragraphs)
Present quality metrics:
- Defect density
- Mean time to failure
- Code quality scores
- Test effectiveness

### 7.12 Lessons Learned (2 paragraphs)
- What worked well
- What could be improved
- Testing challenges
- Best practices identified

### 7.13 Summary (1 paragraph)
- Testing achievements
- System quality assessment
- Readiness for deployment

**Writing Guidelines:**
- Use tables for test cases
- Include actual numbers and percentages
- Show both successes and failures
- Explain how defects were resolved
- Be honest about limitations
- Use visual indicators (✅ ❌ ⏳ 📊)
- Reference requirements being validated

Generate a comprehensive, data-driven testing chapter.`);

// ==================== RESULTS PROMPT ====================

export const resultsPrompt = ai.definePrompt({
  name: 'resultsPrompt',
  description: 'Generate results and evaluation chapter',
  model: await getModel('quality'),
  input: {
    schema: z.object({
      projectTitle: z.string(),
      keyFeatures: z.array(z.string()),
      testResults: z.string().optional(),
    }),
  },
}, `You are an expert in presenting and analyzing project results.

Generate a comprehensive **Results and Evaluation** chapter (2500-3000 words) for:

**Project:** {{projectTitle}}
**Key Features:** {{#each keyFeatures}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
{{#if testResults}}**Testing Summary:** {{testResults}}{{/if}}

**Chapter Structure:**

### 8.1 Introduction (1 paragraph)
- Overview of results presentation
- Evaluation criteria
- Chapter organization

### 8.2 System Features and Functionality (3-4 paragraphs per feature)

For each major feature:

**Feature: [Name]**

#### Description
- What the feature does
- How it addresses requirements

#### Implementation Results
- Screenshots/interface description
- Functionality demonstration
- User interaction flow

#### Validation
- How feature was tested
- Performance metrics
- User feedback
- Requirements met (reference requirement IDs)

Present 6-8 major features.

### 8.3 Performance Evaluation (3-4 paragraphs)

#### 8.3.1 Performance Metrics
Present performance data in table format:

| Metric | Target | Achieved | Status |
|--------|--------|----------|--------|
| Response Time | < 2s | 1.5s | ✅ Met |
| Load Capacity | 100 users | 150 users | ✅ Exceeded |
| etc. | | | |

#### 8.3.2 Performance Analysis
- Analysis of each metric
- Comparison with targets
- Performance under different conditions
- Optimization results

#### 8.3.3 Scalability Assessment
- System behavior under increased load
- Resource utilization
- Bottlenecks identified
- Scalability potential

### 8.4 Usability Evaluation (2-3 paragraphs)

#### 8.4.1 User Testing Setup
- Number of participants
- User demographics
- Testing scenarios
- Evaluation criteria

#### 8.4.2 Usability Findings
- Task completion rates
- Time on task
- Error rates
- User satisfaction scores
- Qualitative feedback

#### 8.4.3 Usability Improvements
- Issues identified
- Solutions implemented
- Impact of improvements

### 8.5 Security Evaluation (if applicable, 2 paragraphs)
- Security testing results
- Vulnerabilities found and fixed
- Security compliance
- Access control validation

### 8.6 Requirements Validation (3-4 paragraphs)

Present requirements traceability:

| Req ID | Requirement | Status | Evidence |
|--------|-------------|--------|----------|
| FR-01 | User login | ✅ Fully Met | Test case TC-05 passed |
| FR-02 | Data export | ✅ Fully Met | Feature implemented |
| etc. | | | |

Categories:
- ✅ Fully Met: XX requirements (XX%)
- ⚠️ Partially Met: XX requirements (XX%)
- ❌ Not Met: XX requirements (XX%)

Explain any requirements not fully met.

### 8.7 Comparison with Existing Solutions (2-3 paragraphs)

#### 8.7.1 Comparison Criteria
Features/metrics compared

#### 8.7.2 Comparison Table

| Feature | Solution A | Solution B | Our System |
|---------|-----------|-----------|------------|
| Feature 1 | ❌ | ✅ | ✅ |
| Feature 2 | ⚠️ | ✅ | ✅ |
| etc. | | | |

#### 8.7.3 Advantages of Current System
- Novel features
- Performance advantages
- Usability improvements
- Cost benefits
- Other strengths

#### 8.7.4 Limitations
- Features present in other systems but not ours
- Performance aspects where others excel
- Honest assessment of gaps

### 8.8 User Feedback Analysis (2-3 paragraphs)

#### 8.8.1 Feedback Collection
- Method (surveys, interviews, analytics)
- Number of respondents
- Demographics

#### 8.8.2 Quantitative Feedback
- Satisfaction ratings (scale 1-5)
- Net Promoter Score
- Feature ratings
- Overall system rating

#### 8.8.3 Qualitative Feedback
- Common positive comments
- Common concerns
- Suggestions for improvement
- Testimonials

### 8.9 Objectives Achievement (2-3 paragraphs)

For each objective from Chapter 1:
- **Objective:** [State the objective]
- **Achievement:** How it was met
- **Evidence:** Specific results demonstrating achievement
- **Status:** ✅ Achieved / ⚠️ Partially / ❌ Not Achieved

### 8.10 System Limitations (1-2 paragraphs)
Be honest about:
- Known limitations
- Edge cases not handled
- Performance constraints
- Platform limitations
- Future improvements needed

### 8.11 Summary (1 paragraph)
- Overall success assessment
- Key achievements highlighted
- Bridge to discussion chapter

**Writing Guidelines:**
- Use tables and charts descriptions
- Include screenshots references
- Present actual data and numbers
- Be objective and honest
- Use visual indicators (✅ ⚠️ ❌ 📊 📈)
- Back claims with evidence
- Compare against requirements
- Show both successes and limitations

Generate a comprehensive, evidence-based results chapter.`);

// ==================== DISCUSSION PROMPT ====================

export const discussionPrompt = ai.definePrompt({
  name: 'discussionPrompt',
  description: 'Generate discussion and analysis chapter',
  model: await getModel('quality'),
  input: {
    schema: z.object({
      projectTitle: z.string(),
      objectives: z.array(z.string()),
      keyFindings: z.array(z.string()).optional(),
    }),
  },
}, `You are an expert in critical analysis and academic discussion.

Generate a comprehensive **Discussion** chapter (2000-2500 words) for:

**Project:** {{projectTitle}}
**Objectives:** {{#each objectives}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
{{#if keyFindings}}**Key Findings:** {{#each keyFindings}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}

**Chapter Structure:**

### 9.1 Introduction (1 paragraph)
- Purpose of discussion
- Link to results chapter
- Chapter overview

### 9.2 Interpretation of Results (3-4 paragraphs)

#### 9.2.1 Key Findings Interpretation
- What the results mean
- Why these results occurred
- Significance of findings
- Unexpected discoveries

#### 9.2.2 Pattern Analysis
- Patterns observed in results
- Relationships between different aspects
- Trends identified

### 9.3 Objectives Achievement Analysis (2-3 paragraphs per objective)

For each objective:
- **Objective:** [Restate the objective]
- **How Achieved:** Detailed explanation
- **Evidence:** Reference to results
- **Quality of Achievement:** To what extent
- **Challenges Faced:** Difficulties encountered
- **Lessons Learned:** Insights gained

### 9.4 Comparison with Literature (3-4 paragraphs)

#### 9.4.1 Alignment with Previous Work
- How results compare with related work [citations]
- Confirmations of previous findings
- Novel contributions

#### 9.4.2 Divergences from Literature
- Where results differ from expectations
- Why differences occurred
- Implications of differences

#### 9.4.3 Contribution to Field
- What this work adds
- Gaps filled
- New insights provided

### 9.5 Strengths of the Project (2-3 paragraphs)

Technical Strengths:
- Robust architecture
- Effective algorithms
- Good performance
- etc.

Process Strengths:
- Methodology effectiveness
- Development practices
- Quality assurance

Product Strengths:
- User satisfaction
- Feature completeness
- Innovation

### 9.6 Limitations and Constraints (2-3 paragraphs)

#### 9.6.1 Technical Limitations
- Technology constraints
- Performance limitations
- Scalability issues
- Compatibility concerns

#### 9.6.2 Methodological Limitations
- Development approach limitations
- Testing constraints
- Evaluation limitations

#### 9.6.3 Scope Limitations
- Features not included
- Platforms not supported
- User groups not addressed

#### 9.6.4 Impact of Limitations
- How limitations affected results
- Mitigation strategies employed
- Why certain trade-offs were made

### 9.7 Challenges and Solutions (2-3 challenges, 1-2 paragraphs each)

For significant challenges:
- **Challenge:** Description
- **Context:** When/why it occurred
- **Impact:** How it affected the project
- **Analysis:** Root cause investigation
- **Solution Approach:** How it was addressed
- **Outcome:** Result of solution
- **Lesson Learned:** Key takeaway
- **Applicability:** How lesson applies elsewhere

### 9.8 Unexpected Findings (1-2 paragraphs)
- Surprising results
- Unintended consequences (positive/negative)
- Serendipitous discoveries
- What was learned from surprises

### 9.9 Implications (2-3 paragraphs)

#### 9.9.1 Practical Implications
- How results can be applied
- Who can benefit
- Use cases
- Deployment considerations

#### 9.9.2 Theoretical Implications
- Contribution to knowledge
- Validation of theories
- New questions raised

#### 9.9.3 Societal/Industry Implications
- Broader impact
- Potential applications
- Industry relevance

### 9.10 Methodological Reflection (2 paragraphs)

#### 9.10.1 Methodology Effectiveness
- What worked well
- What could be improved
- Suitability for project type

#### 9.10.2 Process Improvements
- Better approaches identified
- Tools that helped/hindered
- Recommendations for similar projects

### 9.11 Critical Self-Reflection (1-2 paragraphs)
- Honest assessment of work
- What could have been done better
- Alternative approaches considered
- Growth and learning

### 9.12 Summary (1 paragraph)
- Synthesis of discussion
- Key insights recap
- Transition to conclusion

**Writing Guidelines:**
- Use critical thinking and analysis
- Support interpretations with evidence
- Reference results chapter frequently
- Cite literature when comparing
- Be honest about limitations
- Balance strengths and weaknesses
- Avoid simply repeating results
- Focus on "why" and "what it means"
- Maintain academic tone
- Connect to broader context

Generate a thoughtful, analytical discussion chapter.`);

// ==================== CONCLUSION PROMPT ====================

export const conclusionPrompt = ai.definePrompt({
  name: 'conclusionPrompt',
  description: 'Generate conclusion chapter',
  model: await getModel('quality'),
  input: {
    schema: z.object({
      projectTitle: z.string(),
      objectives: z.array(z.string()),
      keyAchievements: z.array(z.string()).optional(),
    }),
  },
}, `You are an expert in academic writing and project conclusions.

Generate a comprehensive **Conclusion** chapter (1500-2000 words) for:

**Project:** {{projectTitle}}
**Objectives:** {{#each objectives}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
{{#if keyAchievements}}**Achievements:** {{#each keyAchievements}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}

**Chapter Structure:**

### 10.1 Introduction (1 paragraph)
- Brief restatement of problem
- Reminder of project purpose
- Overview of conclusion chapter

### 10.2 Project Summary (3-4 paragraphs)

#### 10.2.1 Problem Recap
- The problem addressed
- Why it was important
- Current state of the problem

#### 10.2.2 Solution Approach
- Brief summary of methodology
- Key technologies used
- Development process

#### 10.2.3 System Overview
- What was built
- Main features and capabilities
- System architecture (briefly)

### 10.3 Key Findings and Achievements (3-4 paragraphs)

Present main findings:
1. **Finding 1:** Description and significance
2. **Finding 2:** Description and significance
3. **Finding 3:** Description and significance
etc.

Highlight achievements:
- Technical achievements
- Performance achievements
- Innovation achievements
- Process achievements

### 10.4 Objectives Fulfillment (2-3 paragraphs)

Summarize how each objective was met:

**Objective 1:** [State objective]
✅ Achievement: [How it was fulfilled]

**Objective 2:** [State objective]
✅ Achievement: [How it was fulfilled]

Overall fulfillment rate and quality.

### 10.5 Contributions (2-3 paragraphs)

#### 10.5.1 Technical Contributions
- Novel algorithms or approaches
- Architectural innovations
- Performance improvements
- Technical solutions

#### 10.5.2 Practical Contributions
- Usable system delivered
- Problem solved
- Users benefited
- Real-world application

#### 10.5.3 Academic Contributions
- Knowledge added to field
- Validation of concepts
- Documentation and resources

### 10.6 Impact and Significance (2 paragraphs)

#### 10.6.1 Immediate Impact
- Current users/beneficiaries
- Problems solved now
- Immediate value delivered

#### 10.6.2 Long-term Significance
- Potential future impact
- Scalability possibilities
- Broader applications
- Contribution to field advancement

### 10.7 Limitations Acknowledgment (1-2 paragraphs)
Briefly acknowledge:
- Known limitations
- Scope boundaries
- Future work needed
- Honest assessment

(Keep brief - details were in Discussion)

### 10.8 Lessons Learned (2 paragraphs)

Key lessons from project:
- Technical lessons
- Process lessons
- Collaboration lessons
- Personal growth

Value for future projects.

### 10.9 Future Work and Recommendations (will be detailed in next chapter)
Brief mention of:
- Immediate next steps
- Future enhancements possible
- Research directions
(Full details in Chapter 11)

### 10.10 Final Remarks (1-2 paragraphs)
- Overall project success
- Personal reflection
- Acknowledgment of journey
- Hope for future impact
- Closing statement

**Writing Guidelines:**
- Use past tense (work completed)
- Be concise but comprehensive
- Avoid introducing new information
- No citations typically needed
- Summarize, don't repeat verbatim
- End on positive, forward-looking note
- Maintain professional tone
- Show pride in achievement (balanced)
- Acknowledge team/support
- Connect back to introduction

Generate a strong, conclusive ending chapter.`);

// ==================== RECOMMENDATIONS PROMPT ====================

export const recommendationsPrompt = ai.definePrompt({
  name: 'recommendationsPrompt',
  description: 'Generate future work and recommendations chapter',
  model: await getModel('quality'),
  input: {
    schema: z.object({
      projectTitle: z.string(),
      projectType: z.string(),
      currentLimitations: z.array(z.string()).optional(),
    }),
  },
}, `You are an expert in identifying research directions and system enhancements.

Generate a comprehensive **Future Work and Recommendations** chapter (1500-2000 words) for:

**Project:** {{projectTitle}}
**Type:** {{projectType}}
{{#if currentLimitations}}**Current Limitations:** {{#each currentLimitations}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}

**Chapter Structure:**

### 11.1 Introduction (1 paragraph)
- Purpose of recommendations
- Categories of future work
- Chapter organization

### 11.2 Immediate Enhancements (2-3 paragraphs)

Short-term improvements (3-6 months):

**Enhancement 1: [Name]**
- **Description:** What to add/improve
- **Rationale:** Why it's needed
- **Priority:** High/Medium/Low
- **Effort:** High/Medium/Low
- **Impact:** Expected benefit
- **Technical Approach:** How to implement

Present 5-7 immediate enhancements.

### 11.3 Medium-term Development (2-3 paragraphs)

Mid-term additions (6-12 months):

**Development 1: [Name]**
- **Description:** Feature description
- **Value Proposition:** What value it adds
- **Requirements:** What's needed
- **Challenges:** Anticipated difficulties
- **Priority:** High/Medium/Low

Present 3-5 medium-term items.

### 11.4 Long-term Vision (2-3 paragraphs)

Long-term possibilities (1-2 years):

**Vision Item 1: [Name]**
- **Description:** Ambitious feature/direction
- **Potential Impact:** Transformative possibilities
- **Technical Requirements:** Advanced needs
- **Research Needed:** What must be explored

Present 3-4 long-term vision items.

### 11.5 Functional Enhancements (2 paragraphs)

Additional features to consider:
- Feature expansion suggestions
- New modules
- Enhanced capabilities
- Integration opportunities
- Platform extensions

### 11.6 Performance Optimization (1-2 paragraphs)

Performance improvement opportunities:
- Speed optimizations
- Resource efficiency
- Scalability improvements
- Load handling
- Response time reduction
- Database query optimization

### 11.7 User Experience Improvements (1-2 paragraphs)

UX enhancement recommendations:
- Interface refinements
- Accessibility improvements
- Mobile experience
- User onboarding
- Help and documentation
- Personalization features

### 11.8 Security Enhancements (1-2 paragraphs)

Security improvement suggestions:
- Advanced authentication (2FA, biometric)
- Enhanced encryption
- Audit logging
- Intrusion detection
- Compliance certifications
- Privacy features

### 11.9 Scalability Recommendations (1-2 paragraphs)

Scaling suggestions:
- Horizontal scaling approach
- Cloud deployment strategies
- Load balancing
- Caching strategies
- Microservices migration
- Database sharding

### 11.10 Integration Opportunities (1-2 paragraphs)

Integration suggestions:
- Third-party services
- APIs to expose
- Platform integrations
- Data import/export
- Ecosystem connections

### 11.11 Research Directions (2 paragraphs)

For academic context:
- **Research Direction 1:** Description
  - Research questions to explore
  - Methodology suggestions
  - Expected contributions
  - Publications potential

Present 3-4 research directions.

### 11.12 Commercialization Potential (1-2 paragraphs)

If applicable:
- Market opportunities
- Business model suggestions
- Target customer segments
- Revenue streams
- Go-to-market strategy
- Competitive positioning

### 11.13 Deployment Recommendations (1-2 paragraphs)

Production deployment suggestions:
- Hosting platforms
- CI/CD pipeline
- Monitoring and logging
- Backup strategies
- Update procedures
- Support infrastructure

### 11.14 Community and Open Source (1 paragraph)

If applicable:
- Open source potential
- Community building
- Documentation needs
- Contribution guidelines
- Project sustainability

### 11.15 Recommendations for Similar Projects (2 paragraphs)

Advice for others:
- What to do from the start
- Pitfalls to avoid
- Tools and practices recommended
- Lessons applicable to others
- Best practices identified

### 11.16 Summary and Prioritization (1-2 paragraphs)

Summarize recommendations:
- **High Priority:** Must-have improvements
- **Medium Priority:** Should-have features
- **Low Priority:** Nice-to-have additions

Suggested roadmap sequence.

**Writing Guidelines:**
- Use future tense or conditional
- Be specific and actionable
- Prioritize realistically
- Consider resource constraints
- Balance ambition with feasibility
- Provide technical direction
- Consider stakeholder needs
- Think both short and long term
- Be innovative but grounded

Generate forward-thinking, actionable recommendations.`);

export default {
  abstractPrompt,
  introductionPrompt,
  literatureReviewPrompt,
  methodologyPrompt,
  systemAnalysisPrompt,
  systemDesignPrompt,
  implementationPrompt,
  testingPrompt,
  resultsPrompt,
  discussionPrompt,
  conclusionPrompt,
  recommendationsPrompt,
};
