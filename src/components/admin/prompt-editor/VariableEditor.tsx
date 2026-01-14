/**
 * Variable Editor Component
 * Week 4 - Day 4-5: Variable Configuration
 * 
 * Modal for adding/editing prompt variables.
 */

'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { PromptVariable } from '@/lib/models/prompt-config';
import { X } from 'lucide-react';

interface VariableEditorProps {
  variable?: PromptVariable;
  onSave: (variable: PromptVariable) => void;
  onClose: () => void;
}

export function VariableEditor({ variable, onSave, onClose }: VariableEditorProps) {
  const [formData, setFormData] = useState<Partial<PromptVariable>>(
    variable || {
      name: '',
      label: '',
      type: 'string',
      required: true,
      description: '',
      defaultValue: '',
      placeholder: '',
    }
  );

  const handleSave = () => {
    if (!formData.name || !formData.label) {
      alert('Name and label are required');
      return;
    }

    onSave(formData as PromptVariable);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {variable ? 'Edit Variable' : 'Add Variable'}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label>Variable Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="variableName"
            />
            <p className="text-xs text-gray-500 mt-1">
              Used in template as {'{{'}{formData.name || 'variableName'}{'}}'}
            </p>
          </div>

          <div>
            <Label>Label</Label>
            <Input
              value={formData.label}
              onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
              placeholder="Human-readable label"
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this variable is for"
              rows={3}
            />
          </div>

          <div>
            <Label>Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="string">String</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="boolean">Boolean</SelectItem>
                <SelectItem value="text">Text (Multi-line)</SelectItem>
                <SelectItem value="array">Array</SelectItem>
                <SelectItem value="object">Object</SelectItem>
                <SelectItem value="enum">Enum</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.type === 'enum' && (
            <div>
              <Label>Enum Values (comma-separated)</Label>
              <Input
                value={formData.enumValues?.join(', ') || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  enumValues: e.target.value.split(',').map(v => v.trim()),
                }))}
                placeholder="option1, option2, option3"
              />
            </div>
          )}

          <div>
            <Label>Default Value</Label>
            <Input
              value={formData.defaultValue as string || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, defaultValue: e.target.value }))}
              placeholder="Optional default value"
            />
          </div>

          <div>
            <Label>Placeholder</Label>
            <Input
              value={formData.placeholder || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, placeholder: e.target.value }))}
              placeholder="Placeholder text"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Required</Label>
              <p className="text-xs text-gray-500">
                Must this variable be provided?
              </p>
            </div>
            <Switch
              checked={formData.required}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, required: checked }))}
            />
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {variable ? 'Update' : 'Add'} Variable
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
