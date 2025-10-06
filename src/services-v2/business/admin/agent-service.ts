/**
 * خدمة إدارة الوكلاء - Services v2.0
 *
 * خدمة محسنة لإدارة الوكلاء وإنشائها وتحديثها مع مراقبة متقدمة
 */

import { BaseService } from '../../core/base-service';
import { ErrorHandler } from '../../core/error-handler';
import { PerformanceMonitor } from '../../core/performance-monitor';

export interface CreateAgentVariables {
    name: string;
    description: string;
    categoryId: string;
    prompt: string;
    model: string;
    temperature: number;
    maxTokens: number;
    systemPrompt?: string;
    tools?: string[];
    isActive: boolean;
}

export interface UpdateAgentVariables {
    agentId: string;
    payload: Partial<CreateAgentVariables>;
}

export interface UploadedFile {
    name: string;
    content: string;
    type: string;
}

export interface AgentProperties {
    id: string;
    name: string;
    description: string;
    categoryId: string;
    prompt: string;
    model: string;
    temperature: number;
    maxTokens: number;
    systemPrompt?: string;
    tools?: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AgentCategoryDetails {
    id: string;
    name: string;
    description?: string;
    agentCount?: number;
    createdAt: string;
    updatedAt: string;
}

export class AgentServiceV2 extends BaseService {
    constructor() {
        super('AgentServiceV2');
    }

    /**
     * جلب قائمة فئات الوكلاء مع مراقبة الأداء
     */
    async fetchAgentCategories(token: string): Promise<AgentCategoryDetails[]> {
        const operationId = this.startOperation('fetchAgentCategories');

        try {
            const response = await fetch('/api/admin/agent-categories', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch agent categories');
            }

            const categories = await response.json();
            this.endOperation(operationId, { success: true, recordCount: categories.length });
            return categories;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'AgentServiceV2.fetchAgentCategories');
            throw error;
        }
    }

    /**
     * إنشاء فئة وكيل جديدة مع مراقبة شاملة
     */
    async createAgentCategory(data: { id: string; name: string }, token: string): Promise<AgentCategoryDetails> {
        const operationId = this.startOperation('createAgentCategory');

        try {
            const response = await fetch('/api/admin/agent-categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const error = await response.json();
                throw error;
            }

            const category = await response.json();
            this.endOperation(operationId, { success: true });
            return category;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'AgentServiceV2.createAgentCategory');
            throw error;
        }
    }

    /**
     * جلب تفاصيل وكيل محدد مع مراقبة الأداء
     */
    async fetchAgent(agentId: string, token: string): Promise<AgentProperties | null> {
        const operationId = this.startOperation('fetchAgent');

        try {
            if (!agentId) {
                this.endOperation(operationId, { success: true, result: 'no-agent-id' });
                return null;
            }

            const response = await fetch(`/api/admin/agents/${agentId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    this.endOperation(operationId, { success: true, result: 'not-found' });
                    return null;
                }
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch agent');
            }

            const agent = await response.json();
            this.endOperation(operationId, { success: true });
            return agent;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'AgentServiceV2.fetchAgent');
            throw error;
        }
    }

    /**
     * تحديث وكيل مع مراقبة شاملة
     */
    async updateAgent(variables: UpdateAgentVariables, token: string): Promise<AgentProperties> {
        const operationId = this.startOperation('updateAgent');

        try {
            const { agentId, payload } = variables;
            const response = await fetch(`/api/admin/agents/${agentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update agent.');
            }

            const agent = await response.json();
            this.endOperation(operationId, { success: true });
            return agent;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'AgentServiceV2.updateAgent');
            throw error;
        }
    }

    /**
     * إنشاء وكيل جديد مع مراقبة الأداء
     */
    async createAgent(data: CreateAgentVariables, token: string): Promise<AgentProperties> {
        const operationId = this.startOperation('createAgent');

        try {
            const response = await fetch('/api/admin/agents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const error = await response.json();
                throw error;
            }

            const agent = await response.json();
            this.endOperation(operationId, { success: true });
            return agent;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'AgentServiceV2.createAgent');
            throw error;
        }
    }

    /**
     * حذف وكيل مع مراقبة شاملة
     */
    async deleteAgent(agentId: string, token: string): Promise<{ message: string }> {
        const operationId = this.startOperation('deleteAgent');

        try {
            const response = await fetch(`/api/admin/agents/${agentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete agent');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'AgentServiceV2.deleteAgent');
            throw error;
        }
    }

    /**
     * توليد تكوين وكيل جديد مع مراقبة متقدمة
     */
    async generateAgentConfig(variables: { prompt: string, includeJsonOutput: boolean, contextFiles: UploadedFile[] }, token: string) {
        const operationId = this.startOperation('generateAgentConfig');

        try {
            const response = await fetch('/api/admin/agents/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(variables)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to generate agent configuration');
            }

            const config = await response.json();
            this.endOperation(operationId, { success: true });
            return config;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'AgentServiceV2.generateAgentConfig');
            throw error;
        }
    }
}