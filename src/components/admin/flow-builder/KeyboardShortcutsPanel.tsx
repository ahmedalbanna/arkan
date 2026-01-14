/**
 * Keyboard Shortcuts Panel
 * Displays available keyboard shortcuts in a dialog
 */

'use client';

import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Keyboard, 
  Save, 
  Undo2, 
  Redo2, 
  Trash2, 
  Copy, 
  FileText,
  Search,
  X,
  Plus
} from 'lucide-react';

interface KeyboardShortcutsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
  icon: React.ReactNode;
  category: string;
}

const shortcuts: ShortcutItem[] = [
  // File Operations
  { keys: ['Ctrl', 'S'], description: 'Save flow', icon: <Save className="w-4 h-4" />, category: 'File' },
  { keys: ['Ctrl', 'N'], description: 'New flow', icon: <FileText className="w-4 h-4" />, category: 'File' },
  
  // Edit Operations
  { keys: ['Ctrl', 'Z'], description: 'Undo', icon: <Undo2 className="w-4 h-4" />, category: 'Edit' },
  { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo', icon: <Redo2 className="w-4 h-4" />, category: 'Edit' },
  { keys: ['Ctrl', 'C'], description: 'Copy step', icon: <Copy className="w-4 h-4" />, category: 'Edit' },
  { keys: ['Ctrl', 'V'], description: 'Paste step', icon: <Copy className="w-4 h-4" />, category: 'Edit' },
  { keys: ['Ctrl', 'D'], description: 'Duplicate step', icon: <Copy className="w-4 h-4" />, category: 'Edit' },
  { keys: ['Delete'], description: 'Delete selected step', icon: <Trash2 className="w-4 h-4" />, category: 'Edit' },
  { keys: ['Backspace'], description: 'Delete selected step', icon: <Trash2 className="w-4 h-4" />, category: 'Edit' },
  
  // Navigation
  { keys: ['Ctrl', 'K'], description: 'Search steps', icon: <Search className="w-4 h-4" />, category: 'Navigation' },
  { keys: ['Esc'], description: 'Deselect/Close', icon: <X className="w-4 h-4" />, category: 'Navigation' },
  { keys: ['Shift', '?'], description: 'Show shortcuts', icon: <Keyboard className="w-4 h-4" />, category: 'Navigation' },
  
  // Quick Actions
  { keys: ['A'], description: 'Add step (when focused)', icon: <Plus className="w-4 h-4" />, category: 'Quick Actions' },
];

const categories = Array.from(new Set(shortcuts.map(s => s.category)));

export function KeyboardShortcutsPanel({ open, onOpenChange }: KeyboardShortcutsPanelProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Keyboard className="w-6 h-6 text-primary" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Master the flow builder with these keyboard shortcuts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {categories.map((category, catIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIndex * 0.1 }}
            >
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                {category}
                <Badge variant="secondary" className="text-xs">
                  {shortcuts.filter(s => s.category === category).length}
                </Badge>
              </h3>

              <div className="space-y-2">
                {shortcuts
                  .filter(s => s.category === category)
                  .map((shortcut, index) => (
                    <motion.div
                      key={`${category}-${index}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: catIndex * 0.1 + index * 0.05 }}
                    >
                      <Card className="p-3 hover:bg-accent/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-md bg-primary/10 text-primary">
                              {shortcut.icon}
                            </div>
                            <span className="text-sm font-medium">
                              {shortcut.description}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {shortcut.keys.map((key, keyIndex) => (
                              <div key={keyIndex} className="flex items-center gap-1">
                                {keyIndex > 0 && (
                                  <span className="text-xs text-muted-foreground">+</span>
                                )}
                                <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
                                  {key}
                                </kbd>
                              </div>
                            ))}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
              💡
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1">Pro Tip</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Use <kbd className="px-1.5 py-0.5 text-xs bg-white dark:bg-gray-700 border rounded">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 text-xs bg-white dark:bg-gray-700 border rounded">K</kbd> to quickly search and add steps without using the mouse. Press <kbd className="px-1.5 py-0.5 text-xs bg-white dark:bg-gray-700 border rounded">?</kbd> anytime to show this panel.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
