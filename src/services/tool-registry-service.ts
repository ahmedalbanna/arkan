/**
 * Tool Registry Service
 * 
 * Manages tool configurations and executions.
 * Handles built-in, custom, and external tools.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client-init';
import {
  ToolConfiguration,
  ToolType,
  ToolStatus,
  BuiltinToolMetadata,
  ExternalToolConfig,
  TOOL_COLLECTIONS,
  TOOL_CATEGORIES,
  validateToolConfiguration,
  createToolConfiguration,
  ToolNotFoundError as ModelToolNotFoundError,
  ToolExecutionError as ModelToolExecutionError,
  ToolTimeoutError as ModelToolTimeoutError,
} from '@/lib/models/tool-config';

/**
 * Tool Registry Service Class
 */
export class ToolRegistryService {
  private readonly toolsCollection = collection(db, TOOL_COLLECTIONS.CONFIGURATIONS);
  private builtinTools: Map<string, BuiltinToolMetadata> = new Map();

  /**
   * Register a built-in tool
   */
  registerBuiltin(metadata: BuiltinToolMetadata): void {
    this.builtinTools.set(metadata.name, metadata);
    console.log(`Registered built-in tool: ${metadata.name}`);
  }

  /**
   * Get tool by name
   */
  async getToolByName(toolName: string): Promise<ToolConfiguration | null> {
    try {
      // Check built-in tools first
      const builtin = this.builtinTools.get(toolName);
      if (builtin) {
        return this.builtinToConfiguration(builtin);
      }

      // Query Firestore for custom/external tools
      const q = query(
        this.toolsCollection,
        where('name', '==', toolName),
        where('status', '==', 'active')
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      return snapshot.docs[0].data() as ToolConfiguration;
    } catch (error) {
      console.error('Error getting tool by name:', error);
      throw new ToolServiceError('Failed to get tool by name', error);
    }
  }

  /**
   * List all available tools
   */
  async listTools(filters?: ToolFilters): Promise<ToolConfiguration[]> {
    try {
      const tools: ToolConfiguration[] = [];

      // Add built-in tools
      if (!filters?.type || filters.type === 'builtin') {
        for (const builtin of this.builtinTools.values()) {
          const config = this.builtinToConfiguration(builtin);

          // Apply filters
          if (filters?.category && config.category !== filters.category) {
            continue;
          }

          if (filters?.tags && !filters.tags.some(tag => config.tags.includes(tag))) {
            continue;
          }

          tools.push(config);
        }
      }

      // Query Firestore for custom/external tools
      if (!filters?.type || filters.type !== 'builtin') {
        const constraints: QueryConstraint[] = [];

        if (filters?.type) {
          constraints.push(where('type', '==', filters.type));
        }

        if (filters?.category) {
          constraints.push(where('category', '==', filters.category));
        }

        if (filters?.status) {
          constraints.push(where('status', '==', filters.status));
        }

        if (filters?.tags && filters.tags.length > 0) {
          constraints.push(where('tags', 'array-contains-any', filters.tags));
        }

        constraints.push(orderBy('createdAt', 'desc'));

        const q = query(this.toolsCollection, ...constraints);
        const snapshot = await getDocs(q);

        tools.push(...snapshot.docs.map(doc => doc.data() as ToolConfiguration));
      }

      return tools;
    } catch (error) {
      console.error('Error listing tools:', error);
      throw new ToolServiceError('Failed to list tools', error);
    }
  }

  /**
   * Register a custom or external tool
   */
  async registerTool(
    tool: Partial<ToolConfiguration>,
    userId: string
  ): Promise<ToolConfiguration> {
    try {
      // Validate tool configuration
      const errors = validateToolConfiguration(tool);
      if (errors.length > 0) {
        throw new ValidationError('Tool validation failed', errors);
      }

      // Check if tool with same name already exists
      const existing = await this.getToolByName(tool.name!);
      if (existing) {
        throw new ToolAlreadyExistsError(tool.name!);
      }

      // Create tool configuration with defaults
      const toolConfig = createToolConfiguration({
        ...tool,
        createdBy: userId,
      });

      // Create new document
      const docRef = doc(this.toolsCollection);
      const now = Timestamp.now();

      const toolData: ToolConfiguration = {
        ...toolConfig,
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(docRef, toolData);

      return toolData;
    } catch (error) {
      console.error('Error registering tool:', error);
      if (error instanceof ToolServiceError) {
        throw error;
      }
      throw new ToolServiceError('Failed to register tool', error);
    }
  }

  /**
   * Update tool configuration
   */
  async updateTool(
    toolName: string,
    updates: Partial<ToolConfiguration>,
    userId: string
  ): Promise<ToolConfiguration> {
    try {
      // Cannot update built-in tools
      if (this.builtinTools.has(toolName)) {
        throw new ToolServiceError('Cannot update built-in tool');
      }

      const existing = await this.getToolByName(toolName);

      if (!existing) {
        throw new ToolNotFoundError(toolName);
      }

      // Validate updated configuration
      const updatedTool = { ...existing, ...updates };
      const errors = validateToolConfiguration(updatedTool);
      if (errors.length > 0) {
        throw new ValidationError('Tool validation failed', errors);
      }

      // Find document by name
      const q = query(this.toolsCollection, where('name', '==', toolName));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        throw new ToolNotFoundError(toolName);
      }

      const docRef = doc(this.toolsCollection, snapshot.docs[0].id);

      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });

      return { ...existing, ...updates, updatedAt: Timestamp.now() };
    } catch (error) {
      console.error('Error updating tool:', error);
      if (error instanceof ToolServiceError) {
        throw error;
      }
      throw new ToolServiceError('Failed to update tool', error);
    }
  }

  /**
   * Execute a tool
   */
  async executeTool(
    toolName: string,
    parameters: Record<string, any>,
    timeoutMs?: number
  ): Promise<any> {
    try {
      const tool = await this.getToolByName(toolName);

      if (!tool) {
        throw new ToolNotFoundError(toolName);
      }

      if (tool.status !== 'active') {
        throw new ToolServiceError(`Tool is not active: ${toolName} (status: ${tool.status})`);
      }

      const timeout = timeoutMs || tool.timeout || 30000;

      // Execute based on tool type
      switch (tool.type) {
        case 'builtin':
          return await this.executeBuiltinTool(toolName, parameters, timeout);

        case 'custom':
          return await this.executeCustomTool(tool, parameters, timeout);

        case 'external':
          return await this.executeExternalTool(tool, parameters, timeout);

        default:
          throw new ToolServiceError(`Unknown tool type: ${tool.type}`);
      }
    } catch (error) {
      console.error('Error executing tool:', error);
      if (error instanceof ToolServiceError) {
        throw error;
      }
      throw new ModelToolExecutionError(toolName, 'Tool execution failed', error as Error);
    }
  }

  /**
   * Execute built-in tool
   */
  private async executeBuiltinTool(
    toolName: string,
    parameters: Record<string, any>,
    timeout: number
  ): Promise<any> {
    const metadata = this.builtinTools.get(toolName);

    if (!metadata) {
      throw new ToolNotFoundError(toolName);
    }

    // Execute with timeout
    return await this.withTimeout(
      metadata.handler(parameters),
      timeout,
      toolName
    );
  }

  /**
   * Execute custom tool
   */
  private async executeCustomTool(
    tool: ToolConfiguration,
    parameters: Record<string, any>,
    timeout: number
  ): Promise<any> {
    // For custom tools, the handler is a function name that should be imported
    // This is a placeholder - implement dynamic import based on your needs
    throw new ToolServiceError('Custom tool execution not yet implemented');
  }

  /**
   * Execute external tool (HTTP API)
   */
  private async executeExternalTool(
    tool: ToolConfiguration,
    parameters: Record<string, any>,
    timeout: number
  ): Promise<any> {
    try {
      const url = tool.handler;

      // Parse as ExternalToolConfig if available
      const externalConfig: ExternalToolConfig = {
        name: tool.name,
        endpoint: url,
        method: 'POST', // Default to POST
        authType: 'none',
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...externalConfig.headers,
      };

      // Add authentication if configured
      if (externalConfig.authType === 'bearer' && externalConfig.authConfig?.token) {
        headers['Authorization'] = `Bearer ${externalConfig.authConfig.token}`;
      } else if (externalConfig.authType === 'api-key' && externalConfig.authConfig?.apiKey) {
        headers['X-API-Key'] = externalConfig.authConfig.apiKey;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method: externalConfig.method,
        headers,
        body: JSON.stringify(parameters),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new ToolServiceError(`External tool returned ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      // Extract result based on response mapping if configured
      return result;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ModelToolTimeoutError(tool.name, timeout);
      }
      throw error;
    }
  }

  /**
   * Execute promise with timeout
   */
  private async withTimeout<T>(
    promise: Promise<T>,
    timeout: number,
    toolName: string
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new ModelToolTimeoutError(toolName, timeout)), timeout)
      ),
    ]);
  }

  /**
   * Convert built-in metadata to configuration
   */
  private builtinToConfiguration(metadata: BuiltinToolMetadata): ToolConfiguration {
    return {
      name: metadata.name,
      displayName: metadata.displayName,
      description: metadata.description,
      category: metadata.category,
      tags: [],
      type: 'builtin',
      handler: metadata.name,
      inputSchema: metadata.inputSchema,
      outputSchema: metadata.outputSchema,
      status: 'active',
      version: '1.0.0',
      createdBy: 'system',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      examples: metadata.examples,
    };
  }

  /**
   * Get tool documentation
   */
  async getToolDocumentation(toolName: string): Promise<string> {
    const tool = await this.getToolByName(toolName);

    if (!tool) {
      throw new ToolNotFoundError(toolName);
    }

    let doc = `# ${tool.displayName}\n\n`;
    doc += `${tool.description}\n\n`;
    doc += `**Category:** ${tool.category}\n`;
    doc += `**Type:** ${tool.type}\n\n`;

    doc += `## Input Schema\n\`\`\`json\n${JSON.stringify(tool.inputSchema, null, 2)}\n\`\`\`\n\n`;
    doc += `## Output Schema\n\`\`\`json\n${JSON.stringify(tool.outputSchema, null, 2)}\n\`\`\`\n\n`;

    if (tool.examples && tool.examples.length > 0) {
      doc += `## Examples\n\n`;
      tool.examples.forEach((example, i) => {
        doc += `### ${i + 1}. ${example.name}\n\n`;
        doc += `**Input:**\n\`\`\`json\n${JSON.stringify(example.input, null, 2)}\n\`\`\`\n\n`;
        doc += `**Output:**\n\`\`\`json\n${JSON.stringify(example.expectedOutput, null, 2)}\n\`\`\`\n\n`;
      });
    }

    if (tool.documentation) {
      doc += `## Additional Documentation\n\n${tool.documentation}\n`;
    }

    return doc;
  }
}

/**
 * Interfaces
 */
export interface ToolFilters {
  type?: ToolType;
  category?: string;
  status?: ToolStatus;
  tags?: string[];
}

/**
 * Custom error classes
 */
export class ToolServiceError extends Error {
  public readonly cause?: any;

  constructor(message: string, cause?: any) {
    super(message);
    this.name = 'ToolServiceError';
    this.cause = cause;
  }
}

export class ToolNotFoundError extends ToolServiceError {
  constructor(toolName: string) {
    super(`Tool not found: ${toolName}`);
    this.name = 'ToolNotFoundError';
  }
}

export class ToolAlreadyExistsError extends ToolServiceError {
  constructor(toolName: string) {
    super(`Tool already exists: ${toolName}`);
    this.name = 'ToolAlreadyExistsError';
  }
}

export class ValidationError extends ToolServiceError {
  public readonly errors: string[];

  constructor(message: string, errors: string[]) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/**
 * Singleton instance
 */
export const toolRegistryService = new ToolRegistryService();

/**
 * Convenience functions
 */
export async function getToolByName(toolName: string): Promise<ToolConfiguration | null> {
  return toolRegistryService.getToolByName(toolName);
}

export async function listAvailableTools(filters?: ToolFilters): Promise<ToolConfiguration[]> {
  return toolRegistryService.listTools(filters);
}

export async function executeTool(
  toolName: string,
  parameters: Record<string, any>,
  timeout?: number
): Promise<any> {
  return toolRegistryService.executeTool(toolName, parameters, timeout);
}

export function registerBuiltinTool(metadata: BuiltinToolMetadata): void {
  toolRegistryService.registerBuiltin(metadata);
}
