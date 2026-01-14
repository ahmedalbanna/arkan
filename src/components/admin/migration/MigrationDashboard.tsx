/**
 * Migration Dashboard
 * Week 5 - Day 3-4: Migration Dashboard UI
 * 
 * Dashboard for tracking and managing flow migrations.
 */

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { FlowAnalysisResult } from '@/lib/migration/analyzer/FlowAnalyzer';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Play,
  FileSearch,
  TrendingUp
} from 'lucide-react';

interface MigrationStatus {
  flowName: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  progress: number;
  analysis: FlowAnalysisResult;
  startTime?: Date;
  endTime?: Date;
  error?: string;
}

export function MigrationDashboard() {
  const [migrations, setMigrations] = useState<MigrationStatus[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<MigrationStatus | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Calculate overall statistics
  const stats = {
    total: migrations.length,
    completed: migrations.filter(m => m.status === 'completed').length,
    inProgress: migrations.filter(m => m.status === 'in-progress').length,
    failed: migrations.filter(m => m.status === 'failed').length,
    pending: migrations.filter(m => m.status === 'pending').length,
  };

  const overallProgress = stats.total > 0 
    ? Math.round((stats.completed / stats.total) * 100) 
    : 0;

  // Handle analyze flows
  const handleAnalyzeFlows = async () => {
    setIsAnalyzing(true);
    try {
      // Call analyzer API
      const response = await fetch('/api/admin/migration/analyze', {
        method: 'POST',
      });
      const data = await response.json();

      // Convert to migration statuses
      const newMigrations: MigrationStatus[] = data.flows.map((analysis: FlowAnalysisResult) => ({
        flowName: analysis.flowName,
        status: 'pending' as const,
        progress: 0,
        analysis,
      }));

      setMigrations(newMigrations);
    } catch (error) {
      console.error('Error analyzing flows:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle migrate single flow
  const handleMigrateFlow = async (migration: MigrationStatus) => {
    setMigrations(prev => prev.map(m => 
      m.flowName === migration.flowName 
        ? { ...m, status: 'in-progress', startTime: new Date() }
        : m
    ));

    try {
      const response = await fetch('/api/admin/migration/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flowName: migration.flowName,
          analysis: migration.analysis,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMigrations(prev => prev.map(m =>
          m.flowName === migration.flowName
            ? { 
                ...m, 
                status: 'completed', 
                progress: 100,
                endTime: new Date(),
              }
            : m
        ));
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setMigrations(prev => prev.map(m =>
        m.flowName === migration.flowName
          ? { 
              ...m, 
              status: 'failed',
              error: error instanceof Error ? error.message : 'Unknown error',
            }
          : m
      ));
    }
  };

  // Handle migrate all
  const handleMigrateAll = async () => {
    const pendingMigrations = migrations.filter(m => m.status === 'pending');
    
    for (const migration of pendingMigrations) {
      await handleMigrateFlow(migration);
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Migration Dashboard</h1>
          <p className="text-gray-500">Track and manage flow migrations</p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleAnalyzeFlows}
            disabled={isAnalyzing}
          >
            <FileSearch className="w-4 h-4 mr-2" />
            {isAnalyzing ? 'Analyzing...' : 'Analyze Flows'}
          </Button>

          {migrations.length > 0 && (
            <Button
              onClick={handleMigrateAll}
              disabled={stats.pending === 0}
            >
              <Play className="w-4 h-4 mr-2" />
              Migrate All
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      {migrations.length > 0 && (
        <div className="grid grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Flows</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Failed</p>
                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </Card>
        </div>
      )}

      {/* Overall Progress */}
      {migrations.length > 0 && (
        <Card className="p-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Overall Progress</h3>
              <span className="text-2xl font-bold">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
            <p className="text-sm text-gray-500">
              {stats.completed} of {stats.total} flows migrated
            </p>
          </div>
        </Card>
      )}

      {/* Migration List */}
      {migrations.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Flows</h2>
          {migrations.map(migration => (
            <Card
              key={migration.flowName}
              className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedFlow(migration)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{migration.flowName}</h3>
                    <Badge
                      variant={
                        migration.status === 'completed' ? 'default' :
                        migration.status === 'failed' ? 'destructive' :
                        migration.status === 'in-progress' ? 'secondary' :
                        'outline'
                      }
                    >
                      {migration.status}
                    </Badge>
                    <Badge variant="outline">{migration.analysis.complexity}</Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{migration.analysis.analysis.stepCount} steps</span>
                    <span>Est. {migration.analysis.estimatedMigrationTime}min</span>
                    {migration.analysis.warnings.length > 0 && (
                      <span className="text-yellow-600">
                        {migration.analysis.warnings.length} warnings
                      </span>
                    )}
                  </div>

                  {migration.status === 'in-progress' && (
                    <div className="mt-2">
                      <Progress value={migration.progress} className="h-2" />
                    </div>
                  )}

                  {migration.error && (
                    <div className="mt-2 text-sm text-red-600">
                      Error: {migration.error}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {migration.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMigrateFlow(migration);
                      }}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Migrate
                    </Button>
                  )}
                  {migration.status === 'completed' && (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  )}
                  {migration.status === 'failed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMigrateFlow(migration);
                      }}
                    >
                      Retry
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <FileSearch className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">No Flows Analyzed Yet</h3>
          <p className="text-gray-500 mb-4">
            Click "Analyze Flows" to scan your existing flows
          </p>
          <Button onClick={handleAnalyzeFlows}>
            <FileSearch className="w-4 h-4 mr-2" />
            Start Analysis
          </Button>
        </Card>
      )}

      {/* Selected Flow Details */}
      {selectedFlow && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {selectedFlow.flowName} - Details
          </h3>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Analysis</h4>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Type:</dt>
                  <dd className="font-medium">{selectedFlow.analysis.flowType}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Complexity:</dt>
                  <dd className="font-medium">{selectedFlow.analysis.complexity}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Steps:</dt>
                  <dd className="font-medium">{selectedFlow.analysis.analysis.stepCount}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h4 className="font-medium mb-2">Features</h4>
              <div className="space-y-2">
                {selectedFlow.analysis.analysis.hasRAG && (
                  <Badge>RAG Retrieval</Badge>
                )}
                {selectedFlow.analysis.analysis.hasLLM && (
                  <Badge>LLM Generation</Badge>
                )}
                {selectedFlow.analysis.analysis.hasTools && (
                  <Badge>Tool Execution</Badge>
                )}
              </div>
            </div>
          </div>

          {selectedFlow.analysis.recommendations.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Recommendations</h4>
              <ul className="space-y-1 text-sm">
                {selectedFlow.analysis.recommendations.map((rec, i) => (
                  <li key={i} className="text-gray-700">• {rec}</li>
                ))}
              </ul>
            </div>
          )}

          {selectedFlow.analysis.warnings.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2 text-yellow-700">Warnings</h4>
              <ul className="space-y-1 text-sm">
                {selectedFlow.analysis.warnings.map((warn, i) => (
                  <li key={i} className="text-yellow-700">{warn}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
