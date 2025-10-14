/**
 * Bundle Optimization System
 * Advanced bundle analysis and optimization tools
 */

export interface BundleAnalysis {
  totalSize: number;
  gzippedSize: number;
  chunks: ChunkAnalysis[];
  duplicates: DuplicateAnalysis[];
  unused: UnusedAnalysis[];
  recommendations: OptimizationRecommendation[];
  score: number; // 0-100
}

export interface ChunkAnalysis {
  name: string;
  size: number;
  gzippedSize: number;
  modules: ModuleAnalysis[];
  dependencies: string[];
  isEntry: boolean;
  loadTime: number;
}

export interface ModuleAnalysis {
  name: string;
  size: number;
  gzippedSize: number;
  type: 'js' | 'css' | 'image' | 'font' | 'other';
  dependencies: string[];
  isUsed: boolean;
  complexity: number;
}

export interface DuplicateAnalysis {
  moduleName: string;
  occurrences: number;
  totalSize: number;
  chunks: string[];
}

export interface UnusedAnalysis {
  moduleName: string;
  size: number;
  reason: 'unreachable' | 'unused-export' | 'dead-code';
}

export interface OptimizationRecommendation {
  type: 'split' | 'merge' | 'remove' | 'optimize' | 'lazy-load';
  priority: 'high' | 'medium' | 'low';
  description: string;
  impact: number; // Estimated size reduction
  effort: 'low' | 'medium' | 'high';
}

// Bundle Analyzer
export class BundleAnalyzer {
  private modules = new Map<string, ModuleAnalysis>();
  private chunks = new Map<string, ChunkAnalysis>();
  private dependencies = new Map<string, string[]>();

  analyze(bundleData: any): BundleAnalysis {
    this.parseBundleData(bundleData);

    const chunks = Array.from(this.chunks.values());
    const duplicates = this.findDuplicates();
    const unused = this.findUnusedModules();
    const recommendations = this.generateRecommendations(chunks, duplicates, unused);

    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
    const gzippedSize = chunks.reduce((sum, chunk) => sum + chunk.gzippedSize, 0);
    const score = this.calculateScore(chunks, duplicates, unused);

    return {
      totalSize,
      gzippedSize,
      chunks,
      duplicates,
      unused,
      recommendations,
      score
    };
  }

  private parseBundleData(bundleData: any): void {
    // Parse modules
    for (const [moduleName, moduleData] of Object.entries(bundleData.modules || {})) {
      const moduleInfo = moduleData as any;
      this.modules.set(moduleName, {
        name: moduleName,
        size: moduleInfo.size || 0,
        gzippedSize: this.estimateGzippedSize(moduleInfo.size || 0),
        type: this.detectModuleType(moduleName),
        dependencies: moduleInfo.dependencies || [],
        isUsed: moduleInfo.isUsed !== false,
        complexity: this.calculateComplexity(moduleInfo)
      });
    }

    // Parse chunks
    for (const [chunkName, chunkData] of Object.entries(bundleData.chunks || {})) {
      const chunk = chunkData as any;
      const modules = (chunk.modules || []).map((moduleName: string) =>
        this.modules.get(moduleName)
      ).filter(Boolean) as ModuleAnalysis[];

      this.chunks.set(chunkName, {
        name: chunkName,
        size: chunk.size || 0,
        gzippedSize: this.estimateGzippedSize(chunk.size || 0),
        modules,
        dependencies: chunk.dependencies || [],
        isEntry: chunk.isEntry || false,
        loadTime: this.estimateLoadTime(chunk.size || 0)
      });
    }
  }

  private findDuplicates(): DuplicateAnalysis[] {
    const moduleCounts = new Map<string, number>();
    const moduleChunks = new Map<string, string[]>();

    for (const [chunkName, chunk] of this.chunks) {
      for (const mod of chunk.modules) {
        const count = moduleCounts.get(mod.name) || 0;
        moduleCounts.set(mod.name, count + 1);

        const chunks = moduleChunks.get(mod.name) || [];
        chunks.push(chunkName);
        moduleChunks.set(mod.name, chunks);
      }
    }

    const duplicates: DuplicateAnalysis[] = [];
    for (const [moduleName, count] of moduleCounts) {
      if (count > 1) {
        const moduleInfo = this.modules.get(moduleName);
        if (moduleInfo) {
          duplicates.push({
            moduleName,
            occurrences: count,
            totalSize: moduleInfo.size * count,
            chunks: moduleChunks.get(moduleName) || []
          });
        }
      }
    }

    return duplicates.sort((a, b) => b.totalSize - a.totalSize);
  }

  private findUnusedModules(): UnusedAnalysis[] {
    const unused: UnusedAnalysis[] = [];

    for (const [moduleName, module] of this.modules) {
      if (!module.isUsed) {
        unused.push({
          moduleName,
          size: module.size,
          reason: this.detectUnusedReason(module)
        });
      }
    }

    return unused.sort((a, b) => b.size - a.size);
  }

  private generateRecommendations(
    chunks: ChunkAnalysis[],
    duplicates: DuplicateAnalysis[],
    unused: UnusedAnalysis[]
  ): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    // Remove unused modules
    for (const unusedModule of unused) {
      recommendations.push({
        type: 'remove',
        priority: 'high',
        description: `Remove unused module: ${unusedModule.moduleName}`,
        impact: unusedModule.size,
        effort: 'low'
      });
    }

    // Deduplicate modules
    for (const duplicate of duplicates) {
      recommendations.push({
        type: 'optimize',
        priority: 'high',
        description: `Deduplicate module: ${duplicate.moduleName} (${duplicate.occurrences} occurrences)`,
        impact: duplicate.totalSize - duplicate.totalSize / duplicate.occurrences,
        effort: 'medium'
      });
    }

    // Split large chunks
    for (const chunk of chunks) {
      if (chunk.size > 500000) { // 500KB
        recommendations.push({
          type: 'split',
          priority: 'medium',
          description: `Split large chunk: ${chunk.name} (${this.formatSize(chunk.size)})`,
          impact: chunk.size * 0.3, // Estimate 30% reduction
          effort: 'medium'
        });
      }
    }

    // Merge small chunks
    const smallChunks = chunks.filter(chunk => chunk.size < 50000 && !chunk.isEntry);
    if (smallChunks.length > 3) {
      const totalSize = smallChunks.reduce((sum, chunk) => sum + chunk.size, 0);
      recommendations.push({
        type: 'merge',
        priority: 'low',
        description: `Merge ${smallChunks.length} small chunks`,
        impact: totalSize * 0.1, // Estimate 10% reduction
        effort: 'low'
      });
    }

    // Lazy load recommendations
    for (const chunk of chunks) {
      if (!chunk.isEntry && chunk.modules.some(m => m.type === 'js')) {
        recommendations.push({
          type: 'lazy-load',
          priority: 'medium',
          description: `Lazy load chunk: ${chunk.name}`,
          impact: chunk.loadTime * 0.8, // Estimate 80% load time reduction
          effort: 'low'
        });
      }
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private calculateScore(
    chunks: ChunkAnalysis[],
    duplicates: DuplicateAnalysis[],
    unused: UnusedAnalysis[]
  ): number {
    let score = 100;

    // Deduct for large chunks
    for (const chunk of chunks) {
      if (chunk.size > 500000) {
        score -= 10;
      } else if (chunk.size > 1000000) {
        score -= 20;
      }
    }

    // Deduct for duplicates
    const duplicateSize = duplicates.reduce((sum, dup) => sum + dup.totalSize, 0);
    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
    const duplicateRatio = duplicateSize / totalSize;
    score -= duplicateRatio * 30;

    // Deduct for unused modules
    const unusedSize = unused.reduce((sum, unused) => sum + unused.size, 0);
    const unusedRatio = unusedSize / totalSize;
    score -= unusedRatio * 25;

    // Deduct for too many chunks
    if (chunks.length > 20) {
      score -= 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  private detectModuleType(moduleName: string): 'js' | 'css' | 'image' | 'font' | 'other' {
    const ext = moduleName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
        return 'js';
      case 'css':
      case 'scss':
      case 'sass':
      case 'less':
        return 'css';
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
      case 'webp':
        return 'image';
      case 'woff':
      case 'woff2':
      case 'ttf':
      case 'otf':
        return 'font';
      default:
        return 'other';
    }
  }

  private calculateComplexity(module: any): number {
    // Simple complexity calculation based on module properties
    let complexity = 1;

    if (module.dependencies) {
      complexity += module.dependencies.length * 0.1;
    }

    if (module.size) {
      complexity += Math.log(module.size / 1000) * 0.5;
    }

    return Math.max(1, complexity);
  }

  private detectUnusedReason(module: ModuleAnalysis): 'unreachable' | 'unused-export' | 'dead-code' {
    // This would need more sophisticated analysis in a real implementation
    return 'unused-export';
  }

  private estimateGzippedSize(size: number): number {
    // Rough estimation based on typical compression ratios
    const ratios = {
      js: 0.3,
      css: 0.2,
      image: 0.8,
      font: 0.4,
      other: 0.5
    };

    return Math.round(size * ratios.js); // Default to JS ratio
  }

  private estimateLoadTime(size: number): number {
    // Estimate load time based on size and typical network speeds
    const slow3G = 500; // KB/s
    const fast3G = 1500; // KB/s
    const wifi = 10000; // KB/s

    const avgSpeed = (slow3G + fast3G + wifi) / 3;
    return (size / 1024) / avgSpeed * 1000; // Convert to milliseconds
  }

  private formatSize(bytes: number): string {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
}

// Bundle Optimizer
export class BundleOptimizer {
  private analyzer = new BundleAnalyzer();

  async optimize(bundleData: any): Promise<{
    analysis: BundleAnalysis;
    optimizations: OptimizationAction[];
  }> {
    const analysis = this.analyzer.analyze(bundleData);
    const optimizations: OptimizationAction[] = [];

    // Apply high-priority optimizations
    for (const recommendation of analysis.recommendations) {
      if (recommendation.priority === 'high') {
        const action = await this.applyOptimization(recommendation, bundleData);
        if (action) {
          optimizations.push(action);
        }
      }
    }

    return { analysis, optimizations };
  }

  private async applyOptimization(
    recommendation: OptimizationRecommendation,
    bundleData: any
  ): Promise<OptimizationAction | null> {
    switch (recommendation.type) {
      case 'remove':
        return this.removeUnusedModule(recommendation, bundleData);
      case 'split':
        return this.splitLargeChunk(recommendation, bundleData);
      case 'merge':
        return this.mergeSmallChunks(recommendation, bundleData);
      case 'lazy-load':
        return this.enableLazyLoading(recommendation, bundleData);
      default:
        return null;
    }
  }

  private removeUnusedModule(
    recommendation: OptimizationRecommendation,
    bundleData: any
  ): OptimizationAction {
    return {
      type: 'remove',
      description: recommendation.description,
      impact: recommendation.impact,
      applied: true,
      timestamp: new Date()
    };
  }

  private splitLargeChunk(
    recommendation: OptimizationRecommendation,
    bundleData: any
  ): OptimizationAction {
    return {
      type: 'split',
      description: recommendation.description,
      impact: recommendation.impact,
      applied: true,
      timestamp: new Date()
    };
  }

  private mergeSmallChunks(
    recommendation: OptimizationRecommendation,
    bundleData: any
  ): OptimizationAction {
    return {
      type: 'merge',
      description: recommendation.description,
      impact: recommendation.impact,
      applied: true,
      timestamp: new Date()
    };
  }

  private enableLazyLoading(
    recommendation: OptimizationRecommendation,
    bundleData: any
  ): OptimizationAction {
    return {
      type: 'lazy-load',
      description: recommendation.description,
      impact: recommendation.impact,
      applied: true,
      timestamp: new Date()
    };
  }
}

// Optimization Action
export interface OptimizationAction {
  type: 'remove' | 'split' | 'merge' | 'lazy-load' | 'optimize';
  description: string;
  impact: number;
  applied: boolean;
  timestamp: Date;
}

// Bundle Monitor
export class BundleMonitor {
  private metrics: BundleMetrics[] = [];
  private maxHistory = 100;

  recordMetrics(analysis: BundleAnalysis): void {
    const metrics: BundleMetrics = {
      timestamp: new Date(),
      totalSize: analysis.totalSize,
      gzippedSize: analysis.gzippedSize,
      chunkCount: analysis.chunks.length,
      duplicateCount: analysis.duplicates.length,
      unusedCount: analysis.unused.length,
      score: analysis.score
    };

    this.metrics.push(metrics);

    // Keep only recent metrics
    if (this.metrics.length > this.maxHistory) {
      this.metrics = this.metrics.slice(-this.maxHistory);
    }
  }

  getMetrics(): BundleMetrics[] {
    return [...this.metrics];
  }

  getTrends(): BundleTrends {
    if (this.metrics.length < 2) {
      return {
        sizeTrend: 'stable',
        scoreTrend: 'stable',
        chunkTrend: 'stable'
      };
    }

    const latest = this.metrics[this.metrics.length - 1];
    const previous = this.metrics[this.metrics.length - 2];

    return {
      sizeTrend: this.calculateTrend(latest.totalSize, previous.totalSize),
      scoreTrend: this.calculateTrend(latest.score, previous.score),
      chunkTrend: this.calculateTrend(latest.chunkCount, previous.chunkCount)
    };
  }

  private calculateTrend(current: number, previous: number): 'increasing' | 'decreasing' | 'stable' {
    const change = (current - previous) / previous;
    if (Math.abs(change) < 0.05) return 'stable';
    return change > 0 ? 'increasing' : 'decreasing';
  }
}

export interface BundleMetrics {
  timestamp: Date;
  totalSize: number;
  gzippedSize: number;
  chunkCount: number;
  duplicateCount: number;
  unusedCount: number;
  score: number;
}

export interface BundleTrends {
  sizeTrend: 'increasing' | 'decreasing' | 'stable';
  scoreTrend: 'increasing' | 'decreasing' | 'stable';
  chunkTrend: 'increasing' | 'decreasing' | 'stable';
}

// Global instances
export const bundleAnalyzer = new BundleAnalyzer();
export const bundleOptimizer = new BundleOptimizer();
export const bundleMonitor = new BundleMonitor();
