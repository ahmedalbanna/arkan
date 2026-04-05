import { MetadataRoute } from 'next';

/**
 * sitemap.ts — Dynamic crawl manifest for search engine indexing.
 * Maps public platform nodes including landing, writing tools, and documentation.
 */

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://arkan.io';

  // Core Platform Nodes
  const routes = [
    '',
    '/login',
    '/signup',
    '/writing-tools',
    '/docs',
    '/demo/rag',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Writing Tool Dynamic Nodes (High-Fidelity discovery)
  const tools = [
    'ai-detector',
    'ai-image-generator',
    'ai-researcher',
    'assignments-solver',
    'citation-generator',
    'document-writer',
    'grammar-checker',
    'paraphraser',
    'summarizer',
    'translator',
  ].map((tool) => ({
    url: `${baseUrl}/writing-tools/${tool}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...routes, ...tools];
}
