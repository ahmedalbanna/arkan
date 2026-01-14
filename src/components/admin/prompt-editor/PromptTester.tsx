/**
 * Prompt Tester Component
 * Week 4 - Day 4-5: Prompt Testing Panel
 * 
 * Interface for testing prompts with sample data.
 */

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { PromptConfiguration } from '@/lib/models/prompt-config';
import { Play, Copy, CheckCircle } from 'lucide-react';

interface PromptTesterProps {
  prompt: PromptConfiguration;
  onTest: (prompt: PromptConfiguration, variables: Record<string, any>) => void;
}

export function PromptTester({ prompt, onTest }: PromptTesterProps) {
  const [variables, setVariables] = useState<Record<string, any>>(
    prompt.variables.reduce((acc, v) => ({
      ...acc,
      [v.name]: v.defaultValue || '',
    }), {})
  );
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Handle variable change
  const handleVariableChange = (name: string, value: any) => {
    setVariables(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Generate preview
  const generatePreview = () => {
    let preview = prompt.template;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      preview = preview.replace(regex, String(value));
    });
    return preview;
  };

  // Handle test
  const handleTest = async () => {
    setIsTesting(true);
    try {
      await onTest(prompt, variables);
      // Mock result for now
      setTestResult('Test executed successfully!\n\nGenerated output would appear here.');
    } catch (error) {
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTesting(false);
    }
  };

  // Copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(generatePreview());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full p-6 overflow-auto bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 gap-6">
          {/* Left Side - Input Variables */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Input Variables</h3>
              
              {prompt.variables.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No variables defined</p>
                  <p className="text-sm mt-2">Add variables in the Variables tab</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {prompt.variables.map((variable) => (
                    <div key={variable.name}>
                      <Label>
                        {variable.label}
                        {variable.required && <span className="text-red-500">*</span>}
                      </Label>
                      {variable.description && (
                        <p className="text-xs text-gray-500 mb-2">
                          {variable.description}
                        </p>
                      )}
                      
                      {variable.type === 'text' ? (
                        <Textarea
                          value={variables[variable.name] || ''}
                          onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                          placeholder={variable.placeholder || `Enter ${variable.label}`}
                          rows={4}
                        />
                      ) : variable.type === 'enum' && variable.enumValues ? (
                        <select
                          className="w-full border border-gray-300 rounded-md p-2"
                          value={variables[variable.name] || ''}
                          onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                        >
                          <option value="">Select...</option>
                          {variable.enumValues.map(val => (
                            <option key={val} value={val}>{val}</option>
                          ))}
                        </select>
                      ) : (
                        <Input
                          type={variable.type === 'number' ? 'number' : 'text'}
                          value={variables[variable.name] || ''}
                          onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                          placeholder={variable.placeholder || `Enter ${variable.label}`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6">
                <Button
                  className="w-full"
                  onClick={handleTest}
                  disabled={isTesting || prompt.variables.some(v => v.required && !variables[v.name])}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isTesting ? 'Testing...' : 'Run Test'}
                </Button>
              </div>
            </Card>

            {/* Variable Values (JSON) */}
            <Card className="p-6">
              <h3 className="text-sm font-semibold mb-2">Variable Values (JSON)</h3>
              <pre className="bg-gray-900 text-white p-4 rounded text-xs overflow-auto max-h-48">
                {JSON.stringify(variables, null, 2)}
              </pre>
            </Card>
          </div>

          {/* Right Side - Preview & Results */}
          <div className="space-y-6">
            {/* Preview */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Preview</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <pre className="whitespace-pre-wrap text-sm">
                  {generatePreview()}
                </pre>
              </div>
            </Card>

            {/* Test Results */}
            {testResult && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Test Results</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap text-sm">
                    {testResult}
                  </pre>
                </div>
              </Card>
            )}

            {/* Configuration Info */}
            <Card className="p-6 bg-gray-50">
              <h3 className="text-sm font-semibold mb-3">Configuration</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Temperature:</span>
                  <span className="font-medium">
                    {prompt.modelConfig?.temperature || 0.7}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Tokens:</span>
                  <span className="font-medium">
                    {prompt.modelConfig?.maxTokens || 2048}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Output Format:</span>
                  <span className="font-medium">
                    {prompt.outputFormat.type}
                  </span>
                </div>
              </div>
            </Card>

            {/* Tips */}
            <Card className="p-6 bg-blue-50 border-blue-200">
              <h4 className="font-semibold text-sm mb-2">💡 Testing Tips</h4>
              <ul className="text-xs space-y-1 text-gray-700">
                <li>• Fill in all required variables to enable testing</li>
                <li>• Try different values to see how the output changes</li>
                <li>• Copy the preview to use in other contexts</li>
                <li>• Adjust model settings to fine-tune results</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
