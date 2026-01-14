/**
 * Flow Canvas Component - Enhanced Version
 * Week 4 - Day 1-3: Visual Canvas for Flow Steps
 * 
 * Displays flow steps in a visual canvas with drag-and-drop support.
 * Enhanced with Framer Motion animations and better visuals.
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { FlowStep } from '@/lib/models/flow-config';
import { 
  ArrowDown, 
  Trash2, 
  Edit, 
  GripVertical,
  Database,
  Zap,
  Wrench,
  FileText,
  Shuffle,
  GitBranch,
  Repeat,
  Sparkles,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface FlowCanvasProps {
  steps: FlowStep[];
  selectedStep: FlowStep | null;
  onSelectStep: (step: FlowStep) => void;
  onReorderSteps: (steps: FlowStep[]) => void;
  onDeleteStep: (stepId: string) => void;
}

export function FlowCanvas({
  steps,
  selectedStep,
  onSelectStep,
  onReorderSteps,
  onDeleteStep,
}: FlowCanvasProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Handle drag start
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === index) return;

    const newSteps = [...steps];
    const [draggedStep] = newSteps.splice(draggedIndex, 1);
    newSteps.splice(index, 0, draggedStep);

    onReorderSteps(newSteps);
    setDraggedIndex(index);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Get icon for step type
  const getStepIcon = (stepType: string) => {
    const icons: Record<string, any> = {
      retrieve: Database,
      'rag-retrieval': Database,
      generate: Zap,
      'ai-generation': Sparkles,
      tool: Wrench,
      'tool-execution': Wrench,
      format: FileText,
      'output-formatting': FileText,
      transform: Shuffle,
      'data-transformation': Shuffle,
      condition: GitBranch,
      'conditional-logic': GitBranch,
      loop: Repeat,
      iteration: Repeat,
    };
    const Icon = icons[stepType] || FileText;
    return Icon;
  };

  // Get color scheme for step type
  const getStepColor = (stepType: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; icon: string }> = {
      retrieve: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700', icon: 'bg-blue-500' },
      'rag-retrieval': { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700', icon: 'bg-blue-500' },
      generate: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700', icon: 'bg-purple-500' },
      'ai-generation': { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700', icon: 'bg-purple-500' },
      tool: { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700', icon: 'bg-green-500' },
      'tool-execution': { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700', icon: 'bg-green-500' },
      format: { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-700', icon: 'bg-yellow-500' },
      'output-formatting': { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-700', icon: 'bg-yellow-500' },
      transform: { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700', icon: 'bg-orange-500' },
      'data-transformation': { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700', icon: 'bg-orange-500' },
      condition: { bg: 'bg-pink-50', border: 'border-pink-300', text: 'text-pink-700', icon: 'bg-pink-500' },
      'conditional-logic': { bg: 'bg-pink-50', border: 'border-pink-300', text: 'text-pink-700', icon: 'bg-pink-500' },
      loop: { bg: 'bg-indigo-50', border: 'border-indigo-300', text: 'text-indigo-700', icon: 'bg-indigo-500' },
      iteration: { bg: 'bg-indigo-50', border: 'border-indigo-300', text: 'text-indigo-700', icon: 'bg-indigo-500' },
    };
    return colors[stepType] || { bg: 'bg-gray-50', border: 'border-gray-300', text: 'text-gray-700', icon: 'bg-gray-500' };
  };

  // Empty state
  if (steps.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100"
      >
        <div className="text-center max-w-md">
          <motion.div 
            className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/10 to-purple-100 flex items-center justify-center"
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Sparkles className="w-12 h-12 text-primary" />
          </motion.div>
          <motion.h3 
            className="text-lg font-semibold text-gray-900 mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Ready to Build Your Flow?
          </motion.h3>
          <motion.p 
            className="text-gray-500 mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Add your first step from the library on the left to get started building your dynamic AI flow
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <Badge variant="secondary" className="text-xs">
              💡 Drag steps to reorder them
            </Badge>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="h-full overflow-auto p-8 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto space-y-4 pb-20">
        {/* Start Node */}
        <motion.div 
          className="flex justify-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div 
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-3 rounded-full font-medium shadow-lg"
            whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(34, 197, 94, 0.3)' }}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span>Start Flow</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Steps */}
        <AnimatePresence mode="popLayout">
          {steps.map((step, index) => {
            const Icon = getStepIcon(step.type);
            const colors = getStepColor(step.type);
            
            return (
              <motion.div 
                key={step.id}
                layout
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                {/* Connector Arrow */}
                <motion.div 
                  className="flex justify-center py-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 + 0.1 }}
                >
                  <motion.div
                    animate={{ y: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ArrowDown className="w-6 h-6 text-gray-400" />
                  </motion.div>
                </motion.div>

                {/* Step Card */}
                <motion.div
                  layout
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      'cursor-move transition-all hover:shadow-xl border-2',
                      selectedStep?.id === step.id && 'ring-2 ring-primary shadow-xl',
                      draggedIndex === index && 'opacity-50 scale-95',
                      colors.bg,
                      colors.border
                    )}
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Drag Handle */}
                        <motion.div 
                          className="cursor-grab active:cursor-grabbing"
                          whileHover={{ scale: 1.1 }}
                        >
                          <GripVertical className="w-5 h-5 text-gray-400" />
                        </motion.div>

                        {/* Step Icon */}
                        <motion.div 
                          className={cn(
                            'p-3 rounded-lg text-white shadow-md',
                            colors.icon
                          )}
                          whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Icon className="w-6 h-6" />
                        </motion.div>

                        {/* Step Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              Step {index + 1}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {step.type}
                            </Badge>
                          </div>
                          <h4 className={cn("font-semibold text-base mb-1", colors.text)}>
                            {step.name}
                          </h4>
                          {step.description && (
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {step.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            {Object.keys(step.config || {}).length > 0 && (
                              <span className="flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                {Object.keys(step.config).length} configs
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onSelectStep(step)}
                              className="h-8 w-8 p-0"
                              title="Edit step"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onDeleteStep(step.id)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                              title="Delete step"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* End Node */}
        <motion.div 
          className="flex justify-center py-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: steps.length * 0.05 + 0.2 }}
        >
          <motion.div
            animate={{ y: [0, 3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            <ArrowDown className="w-6 h-6 text-gray-400" />
          </motion.div>
        </motion.div>
        <motion.div 
          className="flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: steps.length * 0.05 + 0.3 }}
        >
          <motion.div 
            className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-8 py-3 rounded-full font-medium shadow-lg"
            whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(239, 68, 68, 0.3)' }}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>End Flow</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
