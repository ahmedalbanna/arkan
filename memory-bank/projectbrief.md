# Project Brief - Arkan

## Overview

**Arkan** is an AI-powered document generation platform that enables users to create professional reports, presentations, and documents using intelligent AI agents. Built with Next.js 15 and Firebase, it provides a sophisticated builder interface for structured content creation with real-time AI assistance.

## Vision & Purpose

### Core Mission
Transform document creation from a tedious manual process into an intelligent, collaborative experience where AI agents assist users in generating high-quality, professionally formatted content.

### Target Users
- Business analysts creating reports
- Researchers writing academic papers
- Consultants generating project documentation
- Content creators building structured documents
- Teams needing collaborative document workflows

## Key Features

### 1. AI-Powered Generation
- Multi-agent system for different document types
- Context-aware content generation
- Intelligent section-by-section creation
- Guidelines and instructions system
- Template-based prompting

### 2. Rich Document Builder
- Visual chapter and section management
- Drag-and-drop organization
- Real-time markdown editing with TipTap
- PlantUML diagram support
- Mathematical equations (KaTeX)
- Image generation and upload

### 3. Export Capabilities
- DOCX export with professional formatting
- PowerPoint (PPTX) generation
- PDF export
- Custom styling and templates
- Cover page generation

### 4. Multi-Language Support
- English and Arabic (RTL)
- Internationalized UI
- Language-aware content generation

### 5. User Management
- Firebase Authentication
- Role-based access control (Admin/User/Guest)
- Credit-based usage system
- User profiles with API keys
- Transaction history

## Business Model

### Credit System
- Users purchase credits for AI operations
- Different models have different costs
- Transparent pricing
- Transaction tracking and reporting

### User Roles
- **Guest**: Limited trial access
- **User**: Standard paid access
- **Admin**: Full platform management

## Technical Approach

### Architecture Philosophy
- **Serverless-first**: Firebase backend for scalability
- **API-driven**: RESTful endpoints for all operations
- **Type-safe**: Comprehensive TypeScript coverage
- **Modern patterns**: React 19, Next.js 15 best practices
- **Modular design**: Clean separation of concerns

### AI Strategy
- **Ollama integration**: Self-hosted model deployment
- **Model diversity**: Different models for different tasks
  - Gemma 2B: Fast conversions
  - Phi3 Mini: Structured reports
  - Llama3 8B: Complex academic content
- **Prompt engineering**: Template-based with Handlebars
- **Context management**: Guidelines + external context injection

### Data Strategy
- **Firestore**: Primary data storage
- **IndexedDB**: Local offline storage via Dexie
- **Firebase Storage**: File and image storage
- **Real-time sync**: Live updates across clients

## Project Goals

### Phase 1 (Current)
✅ Core document generation workflow
✅ Multi-format export (DOCX, PPTX, PDF)
✅ User authentication and profiles
✅ Credit system implementation
✅ Template management
⚠️ Security hardening needed
⚠️ Comprehensive testing required

### Phase 2 (Planned)
- [ ] RAG system for context retrieval
- [ ] Real-time collaboration
- [ ] Version history and document tracking
- [ ] Advanced analytics dashboard
- [ ] Template marketplace
- [ ] Mobile app

### Phase 3 (Future)
- [ ] Enterprise features
- [ ] Custom model fine-tuning
- [ ] Advanced workflow automation
- [ ] Integration ecosystem
- [ ] White-label solutions

## Success Metrics

### User Engagement
- Document creation rate
- Export usage patterns
- Credit consumption
- User retention

### Quality Metrics
- AI generation quality scores
- User satisfaction ratings
- Export success rates
- Error rates

### Performance Metrics
- Generation speed
- API response times
- Bundle size optimization
- Lighthouse scores

## Competitive Advantages

1. **Multi-format Export**: Professional outputs in multiple formats
2. **Model Flexibility**: Choose appropriate AI models per task
3. **Structured Approach**: Chapter/section organization vs. free-form
4. **Context Control**: Fine-grained guidelines and instructions
5. **RTL Support**: Proper Arabic language handling
6. **Offline Capability**: IndexedDB for local work

## Current Challenges

### Critical
- 🔴 Security vulnerabilities with exposed credentials
- 🔴 Missing comprehensive test coverage
- 🔴 Production build verification needed

### Important
- 🟡 Documentation gaps
- 🟡 Performance optimization needed
- 🟡 Accessibility compliance
- 🟡 Error monitoring and logging

### Nice to Have
- 🟢 Admin panel completion
- 🟢 Real-time collaboration features
- 🟢 Advanced analytics

## Project Timeline

- **Started**: ~2024 (inferred from dependencies)
- **Current Status**: Beta/Development
- **Production Ready**: Pending security fixes
- **Next Milestone**: Security hardening + testing

## Team Requirements

### Recommended Roles
- Backend Developer (Firebase/Node.js)
- Frontend Developer (React/Next.js)
- AI Engineer (Genkit/LLM integration)
- Security Engineer (Urgent need)
- QA Engineer (Testing implementation)
- DevOps Engineer (CI/CD setup)

## License & Deployment

- **License**: Private (indicated by package.json)
- **Hosting**: Firebase Hosting + Cloud Functions
- **AI Backend**: Self-hosted Ollama server
- **Database**: Cloud Firestore
- **Authentication**: Firebase Auth

## Contact & Resources

- Project Name: Arkan (also referred to as "nextn" in package.json)
- Version: 0.1.0
- Development Port: 9002
