/**
 * RAG Health Check API Endpoint
 * 
 * Returns the health status of the RAG system including:
 * - Vector store connectivity
 * - Ollama embedding service
 * - Collection statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { getVectorStore } from '@/lib/rag/vector-store';
import { RAGConfig, validateRAGConfig } from '@/lib/rag/config';

export async function GET(_request: NextRequest) {
  try {
    const checks = {
      config: { status: 'unknown' as 'ok' | 'error', details: {} as any },
      vectorStore: { status: 'unknown' as 'ok' | 'error', details: {} as any },
      ollama: { status: 'unknown' as 'ok' | 'error', details: {} as any },
    };

    // 1. Validate configuration
    const configValidation = validateRAGConfig();
    checks.config.status = configValidation.valid ? 'ok' : 'error';
    checks.config.details = {
      provider: RAGConfig.vectorStore.provider,
      dimension: RAGConfig.vectorStore.dimension,
      errors: configValidation.errors,
    };

    // 2. Check vector store
    try {
      const vectorStore = getVectorStore();
      
      // Check if it's Qdrant with healthCheck method
      if (typeof vectorStore.healthCheck === 'function') {
        const isHealthy = await vectorStore.healthCheck();
        checks.vectorStore.status = isHealthy ? 'ok' : 'error';
        
        if (isHealthy) {
          const stats = await vectorStore.getStats();
          checks.vectorStore.details = {
            type: 'qdrant',
            url: RAGConfig.qdrant.url,
            collection: RAGConfig.qdrant.collectionName,
            totalChunks: stats.totalChunks,
            vectorDimension: stats.vectorDimension,
          };
        } else {
          checks.vectorStore.details = { error: 'Health check failed' };
        }
      } else {
        // In-memory store
        const size = typeof vectorStore.size === 'function' 
          ? await vectorStore.size() 
          : vectorStore.size();
        
        checks.vectorStore.status = 'ok';
        checks.vectorStore.details = {
          type: 'memory',
          totalChunks: size,
        };
      }
    } catch (error) {
      checks.vectorStore.status = 'error';
      checks.vectorStore.details = {
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    // 3. Check Ollama embedding service
    try {
      const response = await fetch(`${RAGConfig.ollama.baseUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        const hasEmbeddingModel = data.models?.some(
          (m: any) => m.name.includes(RAGConfig.ollama.embeddingModel)
        );

        checks.ollama.status = hasEmbeddingModel ? 'ok' : 'error';
        checks.ollama.details = {
          url: RAGConfig.ollama.baseUrl,
          model: RAGConfig.ollama.embeddingModel,
          modelAvailable: hasEmbeddingModel,
          availableModels: data.models?.map((m: any) => m.name).slice(0, 5) || [],
        };
      } else {
        checks.ollama.status = 'error';
        checks.ollama.details = {
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }
    } catch (error) {
      checks.ollama.status = 'error';
      checks.ollama.details = {
        error: error instanceof Error ? error.message : 'Connection failed',
        url: RAGConfig.ollama.baseUrl,
      };
    }

    // Determine overall status
    const allOk = Object.values(checks).every(check => check.status === 'ok');
    const overallStatus = allOk ? 'healthy' : 'degraded';

    return NextResponse.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks,
      config: {
        provider: RAGConfig.vectorStore.provider,
        embeddingModel: RAGConfig.ollama.embeddingModel,
        vectorDimension: RAGConfig.vectorStore.dimension,
      },
    });

  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
