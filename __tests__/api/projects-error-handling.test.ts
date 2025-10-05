/**
 * اختبارات معالجة الأخطاء في API المشاريع
 */

// Mock all Firebase modules before any imports
jest.mock('@/lib/firebase/server-init', () => ({
    adminDb: {
        collection: jest.fn(() => ({
            doc: jest.fn(() => ({
                get: jest.fn(),
                set: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
            })),
        })),
    },
}));

jest.mock('@/lib/firebase/client-init', () => ({}));

jest.mock('@/lib/core/api', () => ({
    createApiResponseEnhanced: jest.fn((data, status) => ({
        json: () => Promise.resolve(data),
        status,
    })),
    handleApiErrorEnhanced: jest.fn((error) => ({
        json: () => Promise.resolve({
            success: false,
            error: {
                type: error.name === 'ProjectNotFoundError' ? 'CLIENT_ERROR' : 'AUTHORIZATION_ERROR',
                code: error.name === 'ProjectNotFoundError' ? 'API_ENDPOINT_NOT_FOUND' : 'ACCESS_DENIED',
                message: error.message,
            },
        }),
        status: error.name === 'ProjectNotFoundError' ? 404 : 403,
    })),
}));

// Mock Temp Project Manager
jest.mock('@/lib/services/temp-project-manager', () => ({
    tempProjectManager: {
        validateTempProject: jest.fn(),
    },
}));

// Mock Next.js modules
jest.mock('next/cache', () => ({
    revalidatePath: jest.fn(),
}));

// Mock AI schemas
jest.mock('@/ai/schemas', () => ({
    ProjectStateSchema: {},
}));

import { GET } from '@/app/api/projects/[id]/route';
import { NextRequest } from 'next/server';

describe('Projects API Error Handling', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/projects/[id]', () => {
        it('should return 404 for non-existent project', async () => {
            const { adminDb } = require('@/lib/firebase/server-init');
            const { tempProjectManager } = require('@/lib/services/temp-project-manager');

            // Mock project not found
            adminDb.collection().doc().get.mockResolvedValue({
                exists: false,
            });

            // Mock temp project validation
            tempProjectManager.validateTempProject.mockResolvedValue(false);

            const request = new NextRequest('http://localhost:3000/api/projects/non-existent-project');
            const response = await GET(request, { params: { id: 'non-existent-project' } });

            expect(response.status).toBe(404);

            const responseData = await response.json();
            expect(responseData.success).toBe(false);
            expect(responseData.error.type).toBe('CLIENT_ERROR');
            expect(responseData.error.code).toBe('API_ENDPOINT_NOT_FOUND');
            expect(responseData.error.message).toBe('Project not found');
        });

        it('should return 404 for expired temporary project', async () => {
            const { adminDb } = require('@/lib/firebase/server-init');
            const { tempProjectManager } = require('@/lib/services/temp-project-manager');

            // Mock temp project validation (expired)
            tempProjectManager.validateTempProject.mockResolvedValue(false);

            const request = new NextRequest('http://localhost:3000/api/projects/temp-1234567890');
            const response = await GET(request, { params: { id: 'temp-1234567890' } });

            expect(response.status).toBe(404);

            const responseData = await response.json();
            expect(responseData.success).toBe(false);
            expect(responseData.error.type).toBe('CLIENT_ERROR');
            expect(responseData.error.code).toBe('API_ENDPOINT_NOT_FOUND');
            expect(responseData.error.message).toBe('Temporary project has expired or does not exist');
        });

        it('should return 403 for project access denied', async () => {
            const { adminDb } = require('@/lib/firebase/server-init');
            const { tempProjectManager } = require('@/lib/services/temp-project-manager');

            // Mock temp project validation (valid)
            tempProjectManager.validateTempProject.mockResolvedValue(true);

            // Mock project exists but belongs to different user
            adminDb.collection().doc().get.mockResolvedValue({
                exists: true,
                data: () => ({
                    userId: 'different-user-id',
                    title: 'Test Project',
                }),
            });

            const request = new NextRequest('http://localhost:3000/api/projects/test-project');
            const response = await GET(request, { params: { id: 'test-project' } });

            expect(response.status).toBe(403);

            const responseData = await response.json();
            expect(responseData.success).toBe(false);
            expect(responseData.error.type).toBe('AUTHORIZATION_ERROR');
            expect(responseData.error.code).toBe('ACCESS_DENIED');
            expect(responseData.error.message).toBe('Forbidden: You do not own this project');
        });

        it('should return 200 for valid project access', async () => {
            const { adminDb } = require('@/lib/firebase/server-init');
            const { tempProjectManager } = require('@/lib/services/temp-project-manager');

            // Mock temp project validation (valid)
            tempProjectManager.validateTempProject.mockResolvedValue(true);

            // Mock project exists and belongs to user
            const projectData = {
                userId: 'test-user-id',
                title: 'Test Project',
                description: 'Test Description',
            };

            adminDb.collection().doc().get.mockResolvedValue({
                exists: true,
                data: () => projectData,
            });

            const request = new NextRequest('http://localhost:3000/api/projects/test-project');
            const response = await GET(request, { params: { id: 'test-project' } });

            expect(response.status).toBe(200);

            const responseData = await response.json();
            expect(responseData.success).toBe(true);
            expect(responseData.data).toEqual({
                id: 'test-project',
                ...projectData,
            });
        });
    });
});
