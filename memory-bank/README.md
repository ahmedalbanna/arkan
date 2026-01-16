# 🧠 Arkan Memory Bank - README

## Overview

This directory, `memory-bank`, serves as the persistent, long-term memory for the AI development agent working on the **Arkan** project. It contains comprehensive documentation about the project's context, architecture, progress, and technical decisions.

The purpose of this memory bank is to ensure the AI has a deep and accurate understanding of the project, enabling it to make informed decisions, maintain code quality, and follow established patterns consistently.

---

## 📚 File Index

Below is an index of the files within this directory and their specific purpose.

### 1. `activeContext.md`
- **Purpose**: Provides a real-time snapshot of the current development state.
- **Contains**:
  - Recently completed features.
  - Current development priorities (High, Medium, Low).
  - Active challenges and technical hurdles.
  - Key metrics being tracked.

### 2. `productContext.md`
- **Purpose**: Defines the "what" and "why" of the Arkan project from a business and user perspective.
- **Contains**:
  - Product vision and mission.
  - Target audience and market.
  - Core product features, including the RAG system.
  - Competitive advantages and unique value propositions.
  - Business model and revenue streams.

### 3. `techContext.md`
- **Purpose**: A high-level overview of the technologies and architectural patterns used in the project.
- **Contains**:
  - Complete technology stack (Frontend, Backend, AI, Database).
  - RAG system architecture overview.
  - State management strategy (Zustand, React Query).
  - Security and performance patterns.

### 4. `systemPatterns.md`
- **Purpose**: A deep dive into the specific architectural and design patterns implemented in the codebase.
- **Contains**:
  - Detailed RAG pipeline explanation (Indexing & Retrieval).
  - State management patterns (Zustand vs. React Query).
  - Error handling and security patterns (API guards, Image Proxy).

### 5. `progress.md`
- **Purpose**: Tracks the project's history and completion status over time.
- **Contains**:
  - Development milestones by phase.
  - Feature completion status across different modules.
  - Key technical achievements and code quality metrics.

### 6. `recentUpdates.md`
- **Purpose**: A chronological log of significant recent changes, fixes, and feature implementations.
- **Contains**:
  - Detailed summaries of major updates (e.g., RAG system implementation, state management overhaul).
  - Links to relevant documentation or code.

### 7. `performanceOptimizations.md`
- **Purpose**: Documents specific performance enhancements made to the system.
- **Contains**:
  - Caching strategies for RAG and Agent Lab.
  - Re-ranking algorithms for search quality.
  - Database performance optimizations.
  - API and document generation (PPTX, DOCX) improvements.

### 8. `projectbrief.md`
- **Purpose**: A concise, high-level summary of the entire project.
- **Contains**:
  - Vision and mission.
  - Primary goals and core features.
  - Target audience and business model.

---

## Guidelines for Use

- **Consult Before Acting**: Before implementing new features or making significant changes, the AI should consult these documents to ensure alignment with existing patterns and priorities.
- **Keep Updated**: After implementing major changes, the AI is responsible for updating the relevant files in this directory to reflect the new state of the project.
- **Use for Onboarding**: These documents serve as the primary source of truth for understanding the project's history, architecture, and current state.
