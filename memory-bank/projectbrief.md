# Project Brief - Arkan

## Vision
To create the most comprehensive AI-powered writing and document generation platform that empowers academics, professionals, and students to produce high-quality, context-aware content efficiently and effectively.

## Mission
Arkan serves as an intelligent writing assistant that combines cutting-edge AI technology with a dynamic, retrieval-augmented knowledge base to democratize access to professional-grade writing and document creation tools.

## Project Goals

### Primary Goals
- **Comprehensive Writing Support**: Provide 23+ AI-powered writing tools.
- **Retrieval-Augmented Generation (RAG)**: Enhance AI responses with relevant, up-to-date context from a vector database.
- **Professional Document Generation**: Support report, proposal, and presentation creation.
- **Multi-language Support**: Full Arabic and English support with RTL capabilities.
- **Enterprise-Ready**: Scalable platform with user management, payment processing, and analytics.

## Core Features

### AI Writing Tools (23+ Tools)
- Content Generation & Manipulation
- Quality Assurance (Grammar, Plagiarism)
- Academic Tools (Citation, Research)

### Advanced Capabilities
- **RAG System**: Semantic search and context retrieval to ground AI responses.
- **Knowledge Base**: Centralized document store (PDF, DOCX, TXT) for RAG.
- **Template-Driven Reports**: Section-based report generation.
- **Document Processing**: PDF parsing and conversion.
- **Export Functions**: DOCX, PPTX, PDF generation.

### Platform Features
- **User Authentication**: Secure authentication with guest mode support.
- **Payment System**: Credit-based pricing.
- **Admin Dashboard**: Comprehensive analytics, user management, and RAG monitoring.
- **State Management**: Stable client-side state with unsaved changes protection.

## Target Audience
- Academic Researchers, Students, Business Professionals, Educators.

## Business Model
- **Freemium Model**: Basic features free with premium AI tools requiring credits.
- **Credit System**: Pay-per-use for advanced AI operations.

## Success Metrics
- **User Engagement**: MAU, session duration, guest-to-user conversion.
- **Content Quality**: User satisfaction, RAG relevance scores.
- **Platform Growth**: New user acquisition, retention rates.
- **Revenue**: Credit purchases, subscription conversions.

## Technology Foundation
- **Frontend**: Next.js 15 with React 18 and TypeScript.
- **AI Engine**: Google Genkit with Gemini, Ollama (Gemma, Phi-3, Llama 3).
- **RAG System**:
  - **Embedding Model**: Ollama with `nomic-embed-text`.
  - **Vector Database**: Qdrant.
- **Backend**: Firebase (Auth, Firestore, Storage, Functions).
- **UI Framework**: Radix UI with Tailwind CSS.
- **State Management**: Zustand and React Query.

## Current Status
Arkan is a stable, production-ready application with a full suite of AI writing tools and an advanced RAG system. The current focus is on increasing test coverage, refining the user experience, and monitoring performance.
