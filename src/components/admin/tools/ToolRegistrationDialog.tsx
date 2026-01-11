/**
 * Tool Registration Dialog
 * 
 * Interface for registering new tools in the system.
 */

'use client';

import React, { useState } from 'react';
import { ToolConfiguration } from '@/lib/models/tool-config';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, AlertCircle } from 'lucide-react';

interface ToolRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (tool: Partial<ToolConfiguration>) => Promise<void>;
  initialTool?: ToolConfiguration;
}

export function ToolRegistrationDialog({
  open,
  onOpenChange,
  onSubmit,
  initialTool,
}: ToolRegistrationDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tool, setTool] = useState<Partial<ToolConfiguration>>(
    initialTool || {
      name: '',
      description: '',
      type: 'custom',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      outputSchema: {
        type: 'object',
        properties: {},
      },
      handler: '',
      timeout: 30000,
    }
  );

  const handleSubmit = async () => {
    setError(null);

    // Validation
    if (!tool.name) {
      setError('Tool name is required');
      return;
    }

    if (!tool.description) {
      setError('Description is required');
      return;
    }

    if (!tool.handler && tool.type === 'custom') {
      setError('Handler is required for custom tools');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(tool);
      onOpenChange(false);
      
      // Reset form
      setTool({
        name: '',
        description: '',
        type: 'custom',
        inputSchema: { type: 'object', properties: {} },
        outputSchema: { type: 'object', properties: {} },
        handler: '',
        timeout: 30000,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to register tool');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateTool = (updates: Partial<ToolConfiguration>) => {
    setTool({ ...tool, ...updates });
  };

  const updateSchema = (schemaType: 'inputSchema' | 'outputSchema', value: string) => {
    try {
      const parsed = JSON.parse(value);
      updateTool({ [schemaType]: parsed });
    } catch (err) {
      // Invalid JSON, keep current
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {initialTool ? 'Edit Tool' : 'Register New Tool'}
          </DialogTitle>
          <DialogDescription>
            Register a custom tool to use in dynamic flows
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="schemas">Schemas</TabsTrigger>
              <TabsTrigger value="handler">Handler</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tool-name">Tool Name *</Label>
                <Input
                  id="tool-name"
                  value={tool.name}
                  onChange={(e) => updateTool({ name: e.target.value })}
                  placeholder="my-custom-tool"
                />
                <p className="text-xs text-muted-foreground">
                  Use kebab-case. This will be the tool identifier.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={tool.description}
                  onChange={(e) => updateTool({ description: e.target.value })}
                  placeholder="Describe what this tool does..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tool Type</Label>
                <Select
                  value={tool.type}
                  onValueChange={(value: any) => updateTool({ type: value })}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="built-in">Built-in</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                    <SelectItem value="external">External API</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timeout">Timeout (ms)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    value={tool.timeout}
                    onChange={(e) => updateTool({ timeout: parseInt(e.target.value) })}
                    min={1000}
                    max={300000}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="version">Version</Label>
                  <Input
                    id="version"
                    value={tool.version || '1.0.0'}
                    onChange={(e) => updateTool({ version: e.target.value })}
                    placeholder="1.0.0"
                  />
                </div>
              </div>

              {tool.type === 'external' && (
                <div className="space-y-2">
                  <Label htmlFor="endpoint">API Endpoint</Label>
                  <Input
                    id="endpoint"
                    value={(tool.config as any)?.endpoint || ''}
                    onChange={(e) =>
                      updateTool({
                        config: { ...(tool.config || {}), endpoint: e.target.value },
                      })
                    }
                    placeholder="https://api.example.com/endpoint"
                  />
                </div>
              )}
            </TabsContent>

            {/* Schemas Tab */}
            <TabsContent value="schemas" className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Define JSON schemas for input and output validation using JSON Schema format.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="input-schema">Input Schema</Label>
                <Textarea
                  id="input-schema"
                  value={JSON.stringify(tool.inputSchema, null, 2)}
                  onChange={(e) => updateSchema('inputSchema', e.target.value)}
                  placeholder='{"type": "object", "properties": {...}}'
                  rows={10}
                  className="font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground">
                  JSON Schema definition for tool inputs
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="output-schema">Output Schema</Label>
                <Textarea
                  id="output-schema"
                  value={JSON.stringify(tool.outputSchema, null, 2)}
                  onChange={(e) => updateSchema('outputSchema', e.target.value)}
                  placeholder='{"type": "object", "properties": {...}}'
                  rows={10}
                  className="font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground">
                  JSON Schema definition for tool outputs
                </p>
              </div>
            </TabsContent>

            {/* Handler Tab */}
            <TabsContent value="handler" className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  The handler is the function that will be executed when the tool is called.
                  For custom tools, provide the function path or code reference.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="handler">Handler</Label>
                <Textarea
                  id="handler"
                  value={tool.handler}
                  onChange={(e) => updateTool({ handler: e.target.value })}
                  placeholder={
                    tool.type === 'custom'
                      ? '@/tools/my-custom-tool'
                      : tool.type === 'external'
                      ? 'POST /api/external/tool'
                      : 'Built-in handler'
                  }
                  rows={4}
                  className="font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground">
                  {tool.type === 'custom' &&
                    'Import path to the tool function (e.g., @/tools/my-tool)'}
                  {tool.type === 'external' &&
                    'HTTP method and endpoint (e.g., POST /api/tool)'}
                  {tool.type === 'built-in' && 'Built-in tools use predefined handlers'}
                </p>
              </div>

              {tool.type === 'custom' && (
                <div className="space-y-2">
                  <Label>Example Handler Code</Label>
                  <div className="p-4 bg-muted rounded-lg">
                    <pre className="text-xs font-mono">
{`export async function myCustomTool(input: any) {
  // Process input
  const result = await processData(input);
  
  // Return output
  return {
    success: true,
    data: result
  };
}`}
                    </pre>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={tool.tags?.join(', ') || ''}
                  onChange={(e) =>
                    updateTool({
                      tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                    })
                  }
                  placeholder="data-processing, api, custom"
                />
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {initialTool ? 'Update Tool' : 'Register Tool'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ToolRegistrationDialog;
