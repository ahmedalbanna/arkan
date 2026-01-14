/**
 * Flow Settings Component
 * Week 4 - Day 1-3: Flow Configuration Settings
 * 
 * Modal for editing flow-level settings.
 */

'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import type { FlowConfiguration } from '@/lib/models/flow-config';
import { X } from 'lucide-react';

interface FlowSettingsProps {
  flow: FlowConfiguration;
  onSave: (updates: Partial<FlowConfiguration>) => void;
  onClose: () => void;
}

export function FlowSettings({ flow, onSave, onClose }: FlowSettingsProps) {
  const [settings, setSettings] = useState({
    name: flow.name,
    description: flow.description,
    version: flow.version,
    status: flow.status,
    tags: flow.tags.join(', '),
    timeout: flow.config.timeout || 60000,
    cache: flow.config.cache || false,
    cacheTTL: flow.config.cacheTTL || 3600,
    tracing: flow.config.tracing !== false,
  });

  const handleSave = () => {
    onSave({
      name: settings.name,
      description: settings.description,
      version: settings.version,
      status: settings.status,
      tags: settings.tags.split(',').map(t => t.trim()).filter(Boolean),
      config: {
        ...flow.config,
        timeout: settings.timeout,
        cache: settings.cache,
        cacheTTL: settings.cacheTTL,
        tracing: settings.tracing,
      },
    });
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Flow Settings</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="general" className="mt-4">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="schemas">Schemas</TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-4">
            <div>
              <Label>Flow Name</Label>
              <Input
                value={settings.name}
                onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter flow name"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={settings.description}
                onChange={(e) => setSettings(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this flow does"
                rows={4}
              />
            </div>

            <div>
              <Label>Version</Label>
              <Input
                value={settings.version}
                onChange={(e) => setSettings(prev => ({ ...prev, version: e.target.value }))}
                placeholder="1.0.0"
              />
            </div>

            <div>
              <Label>Status</Label>
              <Select
                value={settings.status}
                onValueChange={(value: any) => setSettings(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="deprecated">Deprecated</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tags (comma-separated)</Label>
              <Input
                value={settings.tags}
                onChange={(e) => setSettings(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="tag1, tag2, tag3"
              />
            </div>
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="config" className="space-y-4">
            <div>
              <Label>Timeout (milliseconds)</Label>
              <Input
                type="number"
                value={settings.timeout}
                onChange={(e) => setSettings(prev => ({ ...prev, timeout: parseInt(e.target.value) }))}
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum execution time (default: 60000ms / 1 minute)
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Caching</Label>
                <p className="text-xs text-gray-500">
                  Cache flow execution results
                </p>
              </div>
              <Switch
                checked={settings.cache}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, cache: checked }))}
              />
            </div>

            {settings.cache && (
              <div>
                <Label>Cache TTL (seconds)</Label>
                <Input
                  type="number"
                  value={settings.cacheTTL}
                  onChange={(e) => setSettings(prev => ({ ...prev, cacheTTL: parseInt(e.target.value) }))}
                />
                <p className="text-xs text-gray-500 mt-1">
                  How long to keep cached results (default: 3600s / 1 hour)
                </p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Tracing</Label>
                <p className="text-xs text-gray-500">
                  Record detailed execution traces
                </p>
              </div>
              <Switch
                checked={settings.tracing}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, tracing: checked }))}
              />
            </div>
          </TabsContent>

          {/* Schemas Tab */}
          <TabsContent value="schemas" className="space-y-4">
            <div>
              <Label>Input Schema</Label>
              <Textarea
                value={JSON.stringify(flow.inputSchema, null, 2)}
                readOnly
                className="bg-gray-50 font-mono text-xs"
                rows={10}
              />
              <p className="text-xs text-gray-500 mt-1">
                Input schema cannot be edited here. Use the Schema Editor.
              </p>
            </div>

            <div>
              <Label>Output Schema</Label>
              <Textarea
                value={JSON.stringify(flow.outputSchema, null, 2)}
                readOnly
                className="bg-gray-50 font-mono text-xs"
                rows={10}
              />
              <p className="text-xs text-gray-500 mt-1">
                Output schema cannot be edited here. Use the Schema Editor.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
