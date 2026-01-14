/**
 * A/B Testing Service
 * Week 4 - Day 1: A/B Testing Framework
 * 
 * Enables A/B testing for prompt variants with:
 * - Variant management
 * - Traffic distribution
 * - Metrics tracking
 * - Statistical analysis
 */

import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// ============================================================================
// A/B Testing Service
// ============================================================================

export class ABTestingService {
  private db = getFirestore();
  private experimentsCollection = 'ab_experiments';

  // ============================================================================
  // Experiment Management
  // ============================================================================

  /**
   * Create a new A/B test experiment
   */
  async createExperiment(params: CreateExperimentParams): Promise<ABExperiment> {
    const experiment: ABExperiment = {
      id: `exp_${Date.now()}`,
      name: params.name,
      description: params.description || '',
      flowId: params.flowId,
      stepId: params.stepId,
      status: 'draft',
      variants: params.variants.map((v, i) => ({
        ...v,
        id: v.id || `variant_${i}`,
        traffic: v.traffic,
        metrics: {
          impressions: 0,
          successes: 0,
          failures: 0,
          avgDuration: 0,
          avgTokens: 0,
          avgCost: 0,
        },
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
      startedAt: null,
      endedAt: null,
    };

    await this.db
      .collection(this.experimentsCollection)
      .doc(experiment.id)
      .set({
        ...experiment,
        createdAt: Timestamp.fromDate(experiment.createdAt),
        updatedAt: Timestamp.fromDate(experiment.updatedAt),
      });

    return experiment;
  }

  /**
   * Get experiment by ID
   */
  async getExperiment(experimentId: string): Promise<ABExperiment | null> {
    const doc = await this.db
      .collection(this.experimentsCollection)
      .doc(experimentId)
      .get();

    if (!doc.exists) return null;

    const data = doc.data()!;
    return {
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      startedAt: data.startedAt?.toDate() || null,
      endedAt: data.endedAt?.toDate() || null,
    } as ABExperiment;
  }

  /**
   * List experiments for a flow
   */
  async listExperiments(flowId: string): Promise<ABExperiment[]> {
    const snapshot = await this.db
      .collection(this.experimentsCollection)
      .where('flowId', '==', flowId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        startedAt: data.startedAt?.toDate() || null,
        endedAt: data.endedAt?.toDate() || null,
      } as ABExperiment;
    });
  }

  /**
   * Start an experiment
   */
  async startExperiment(experimentId: string): Promise<void> {
    await this.db
      .collection(this.experimentsCollection)
      .doc(experimentId)
      .update({
        status: 'running',
        startedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
  }

  /**
   * Stop an experiment
   */
  async stopExperiment(experimentId: string): Promise<void> {
    await this.db
      .collection(this.experimentsCollection)
      .doc(experimentId)
      .update({
        status: 'completed',
        endedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
  }

  // ============================================================================
  // Variant Selection
  // ============================================================================

  /**
   * Select a variant for execution (based on traffic distribution)
   */
  async selectVariant(
    experimentId: string,
    userId?: string
  ): Promise<ABVariant | null> {
    const experiment = await this.getExperiment(experimentId);
    
    if (!experiment || experiment.status !== 'running') {
      return null;
    }

    // If user ID provided, use consistent hashing for stable assignment
    if (userId) {
      const hash = this.hashUserId(userId);
      const index = hash % experiment.variants.length;
      return experiment.variants[index];
    }

    // Otherwise, use weighted random selection
    const random = Math.random() * 100;
    let cumulative = 0;

    for (const variant of experiment.variants) {
      cumulative += variant.traffic;
      if (random <= cumulative) {
        return variant;
      }
    }

    // Fallback to first variant
    return experiment.variants[0];
  }

  /**
   * Get active experiment for a flow step
   */
  async getActiveExperiment(
    flowId: string,
    stepId: string
  ): Promise<ABExperiment | null> {
    const snapshot = await this.db
      .collection(this.experimentsCollection)
      .where('flowId', '==', flowId)
      .where('stepId', '==', stepId)
      .where('status', '==', 'running')
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    const data = snapshot.docs[0].data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      startedAt: data.startedAt?.toDate() || null,
      endedAt: data.endedAt?.toDate() || null,
    } as ABExperiment;
  }

  // ============================================================================
  // Metrics Tracking
  // ============================================================================

  /**
   * Record an impression (variant was used)
   */
  async recordImpression(
    experimentId: string,
    variantId: string,
    result: {
      success: boolean;
      duration?: number;
      tokens?: number;
      cost?: number;
    }
  ): Promise<void> {
    const experimentRef = this.db
      .collection(this.experimentsCollection)
      .doc(experimentId);

    await this.db.runTransaction(async (transaction) => {
      const doc = await transaction.get(experimentRef);
      if (!doc.exists) return;

      const experiment = doc.data() as any;
      const variantIndex = experiment.variants.findIndex(
        (v: any) => v.id === variantId
      );

      if (variantIndex === -1) return;

      const variant = experiment.variants[variantIndex];
      const metrics = variant.metrics;

      // Update metrics
      const newImpressions = metrics.impressions + 1;
      metrics.impressions = newImpressions;
      metrics.successes += result.success ? 1 : 0;
      metrics.failures += result.success ? 0 : 1;

      if (result.duration !== undefined) {
        metrics.avgDuration =
          (metrics.avgDuration * (newImpressions - 1) + result.duration) /
          newImpressions;
      }

      if (result.tokens !== undefined) {
        metrics.avgTokens =
          (metrics.avgTokens * (newImpressions - 1) + result.tokens) /
          newImpressions;
      }

      if (result.cost !== undefined) {
        metrics.avgCost =
          (metrics.avgCost * (newImpressions - 1) + result.cost) /
          newImpressions;
      }

      experiment.variants[variantIndex] = variant;
      transaction.update(experimentRef, {
        variants: experiment.variants,
        updatedAt: Timestamp.now(),
      });
    });
  }

  // ============================================================================
  // Statistical Analysis
  // ============================================================================

  /**
   * Calculate statistical significance between variants
   */
  calculateStatisticalSignificance(
    variantA: ABVariant,
    variantB: ABVariant
  ): StatisticalResult {
    const successRateA = variantA.metrics.successes / variantA.metrics.impressions;
    const successRateB = variantB.metrics.successes / variantB.metrics.impressions;

    // Z-test for proportions
    const pooledRate =
      (variantA.metrics.successes + variantB.metrics.successes) /
      (variantA.metrics.impressions + variantB.metrics.impressions);

    const standardError = Math.sqrt(
      pooledRate *
        (1 - pooledRate) *
        (1 / variantA.metrics.impressions + 1 / variantB.metrics.impressions)
    );

    const zScore = (successRateA - successRateB) / standardError;
    const pValue = this.calculatePValue(Math.abs(zScore));

    return {
      variantASuccessRate: successRateA,
      variantBSuccessRate: successRateB,
      difference: successRateA - successRateB,
      zScore,
      pValue,
      isSignificant: pValue < 0.05, // 95% confidence level
      confidenceLevel: 1 - pValue,
    };
  }

  /**
   * Get experiment results with statistical analysis
   */
  async getExperimentResults(experimentId: string): Promise<ExperimentResults> {
    const experiment = await this.getExperiment(experimentId);
    if (!experiment) {
      throw new Error('Experiment not found');
    }

    // Calculate success rates
    const results = experiment.variants.map((variant) => ({
      variantId: variant.id,
      variantName: variant.name,
      impressions: variant.metrics.impressions,
      successes: variant.metrics.successes,
      failures: variant.metrics.failures,
      successRate: variant.metrics.impressions > 0
        ? variant.metrics.successes / variant.metrics.impressions
        : 0,
      avgDuration: variant.metrics.avgDuration,
      avgTokens: variant.metrics.avgTokens,
      avgCost: variant.metrics.avgCost,
    }));

    // Statistical comparison (first variant as control)
    let statistical: StatisticalResult | null = null;
    if (results.length === 2 && results[0].impressions > 30 && results[1].impressions > 30) {
      statistical = this.calculateStatisticalSignificance(
        experiment.variants[0],
        experiment.variants[1]
      );
    }

    // Find winner
    const winner = results.reduce((best, current) =>
      current.successRate > best.successRate ? current : best
    );

    return {
      experimentId: experiment.id,
      experimentName: experiment.name,
      status: experiment.status,
      totalImpressions: results.reduce((sum, r) => sum + r.impressions, 0),
      results,
      statistical,
      winner: {
        variantId: winner.variantId,
        variantName: winner.variantName,
        successRate: winner.successRate,
      },
      recommendation: this.generateRecommendation(results, statistical),
    };
  }

  // ============================================================================
  // Utilities
  // ============================================================================

  /**
   * Hash user ID for consistent variant assignment
   */
  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = (hash << 5) - hash + userId.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  /**
   * Calculate p-value from z-score
   */
  private calculatePValue(zScore: number): number {
    // Approximation of standard normal cumulative distribution
    const t = 1 / (1 + 0.2316419 * zScore);
    const d = 0.3989423 * Math.exp((-zScore * zScore) / 2);
    const p =
      d *
      t *
      (0.3193815 +
        t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return 2 * p; // Two-tailed test
  }

  /**
   * Generate recommendation based on results
   */
  private generateRecommendation(
    results: any[],
    statistical: StatisticalResult | null
  ): string {
    if (!statistical) {
      return 'Continue collecting data. Need at least 30 impressions per variant for statistical analysis.';
    }

    if (statistical.isSignificant) {
      const better = statistical.difference > 0 ? results[0] : results[1];
      const improvement = Math.abs(statistical.difference * 100);
      return `${better.variantName} performs ${improvement.toFixed(1)}% better with ${(statistical.confidenceLevel * 100).toFixed(1)}% confidence. Recommend rolling out this variant.`;
    }

    return 'No statistically significant difference detected. Either variant can be used, or continue testing.';
  }
}

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface ABExperiment {
  id: string;
  name: string;
  description: string;
  flowId: string;
  stepId: string;
  status: 'draft' | 'running' | 'completed' | 'cancelled';
  variants: ABVariant[];
  createdAt: Date;
  updatedAt: Date;
  startedAt: Date | null;
  endedAt: Date | null;
}

export interface ABVariant {
  id: string;
  name: string;
  prompt?: string;
  config?: any;
  traffic: number; // Percentage (0-100)
  metrics: VariantMetrics;
}

export interface VariantMetrics {
  impressions: number;
  successes: number;
  failures: number;
  avgDuration: number;
  avgTokens: number;
  avgCost: number;
}

export interface CreateExperimentParams {
  name: string;
  description?: string;
  flowId: string;
  stepId: string;
  variants: Array<{
    id?: string;
    name: string;
    prompt?: string;
    config?: any;
    traffic: number;
  }>;
}

export interface StatisticalResult {
  variantASuccessRate: number;
  variantBSuccessRate: number;
  difference: number;
  zScore: number;
  pValue: number;
  isSignificant: boolean;
  confidenceLevel: number;
}

export interface ExperimentResults {
  experimentId: string;
  experimentName: string;
  status: string;
  totalImpressions: number;
  results: Array<{
    variantId: string;
    variantName: string;
    impressions: number;
    successes: number;
    failures: number;
    successRate: number;
    avgDuration: number;
    avgTokens: number;
    avgCost: number;
  }>;
  statistical: StatisticalResult | null;
  winner: {
    variantId: string;
    variantName: string;
    successRate: number;
  };
  recommendation: string;
}

// ============================================================================
// Singleton Instance
// ============================================================================

let abTestingServiceInstance: ABTestingService | null = null;

export function getABTestingService(): ABTestingService {
  if (!abTestingServiceInstance) {
    abTestingServiceInstance = new ABTestingService();
  }
  return abTestingServiceInstance;
}
