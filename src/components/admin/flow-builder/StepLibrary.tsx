/**
 * Step Library Component
 * Week 4 - Day 1-3: Step Library Panel
 * 
 * Displays available step types that can be added to flows.
 * Enhanced with animations and improved categorization.
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { 
  Database, 
  Zap, 
  Wrench, 
  FileText, 
  Shuffle,
  Search,
  Plus,
  GitBranch,
  Repeat,
  Sparkles
} from 'lucide-react';

interface StepLibraryProps {
  onAddStep: (stepType: string) => void;
}

interface StepType {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  category: string;
}

const STEP_TYPES: StepType[] = [
  {
    id: 'rag-retrieval',
    name: 'RAG Retrieve',
    description: 'Retrieve relevant documents from vector database',
    icon: Database,
    color: 'bg-blue-500',
    category: 'Data',
  },
  {
    id: 'ai-generation',
    name: 'AI Generate',
    description: 'Generate text using AI language models',
    icon: Sparkles,
    color: 'bg-purple-500',
    category: 'AI',
  },
  {
    id: 'tool-execution',
    name: 'Tool',
    description: 'Execute a custom tool or function',
    icon: Wrench,
    color: 'bg-green-500',
    category: 'Tools',
  },
  {
    id: 'output-formatting',
    name: 'Format',
    description: 'Format output using templates',
    icon: FileText,
    color: 'bg-yellow-500',
    category: 'Transform',
  },
  {
    id: 'data-transformation',
    name: 'Transform',
    description: 'Transform data with custom functions',
    icon: Shuffle,
    color: 'bg-orange-500',
    category: 'Transform',
  },
  {
    id: 'conditional-logic',
    name: 'Condition',
    description: 'Branch execution based on conditions',
    icon: GitBranch,
    color: 'bg-pink-500',
    category: 'Control',
  },
  {
    id: 'iteration',
    name: 'Loop',
    description: 'Iterate over arrays and collections',
    icon: Repeat,
    color: 'bg-indigo-500',
    category: 'Control',
  },
];

export function StepLibrary({ onAddStep }: StepLibraryProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter steps
  const filteredSteps = STEP_TYPES.filter(step => {
    const matchesSearch = step.name.toLowerCase().includes(search.toLowerCase()) ||
                         step.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || step.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = Array.from(new Set(STEP_TYPES.map(s => s.category)));

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <motion.div 
        className="p-4 border-b border-gray-200 bg-white"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Step Library
        </h3>
        <p className="text-xs text-gray-500">
          {filteredSteps.length} steps available
        </p>
      </motion.div>

      {/* Search */}
      <motion.div 
        className="p-4 border-b border-gray-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search steps..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </motion.div>

      {/* Category Filter */}
      <motion.div 
        className="p-4 border-b border-gray-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex flex-wrap gap-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="sm"
              variant={selectedCategory === null ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(null)}
            >
              All ({STEP_TYPES.length})
            </Button>
          </motion.div>
          {categories.map(category => (
            <motion.div 
              key={category}
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="sm"
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Step List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="p-4 cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary/30">
                    <div className="flex items-start gap-3">
                      <motion.div 
                        className={`p-2 rounded-lg ${step.color} text-white shadow-md`}
                        whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Icon className="w-5 h-5" />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{step.name}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {step.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                          {step.description}
                        </p>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() => onAddStep(step.id)}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add to Flow
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredSteps.length === 0 && (
          <motion.div 
            className="text-center py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium mb-1">No steps found</p>
            <p className="text-xs text-gray-400">Try adjusting your search or filters</p>
          </motion.div>
        )}
      </div>

      {/* Help Section */}
      <motion.div 
        className="p-4 border-t border-gray-200 bg-gradient-to-br from-blue-50 to-purple-50"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
          💡 <span>Quick Tip</span>
        </h4>
        <p className="text-xs text-gray-600 leading-relaxed">
          Click "Add to Flow" to insert a step. Drag steps on the canvas to reorder them.
        </p>
      </motion.div>
    </div>
  );
}
