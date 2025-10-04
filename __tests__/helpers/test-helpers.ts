/**
 * Comprehensive test helpers and utilities
 * Provides reusable mocks, factories, and assertions for all test suites
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from 'next-themes';

// Mock data factories
export const createMockUser = (overrides = {}) => ({
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
});

export const createMockProject = (overrides = {}) => ({
    id: 'project-1',
    title: 'Test Project',
    description: 'A test project',
    content: 'Project content',
    sections: [
        { id: 'section-1', title: 'Introduction', content: '', order: 1 },
        { id: 'section-2', title: 'Conclusion', content: '', order: 2 },
    ],
    tags: ['business', 'analysis'],
    metadata: { category: 'report', priority: 'high' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
});

export const createMockAIResponse = (overrides = {}) => ({
    content: 'AI generated content',
    sections: ['Introduction', 'Analysis', 'Conclusion'],
    metadata: {
        wordCount: 500,
        confidence: 0.95,
        model: 'gpt-4',
        tokensUsed: 750,
    },
    ...overrides,
});

export const createMockFile = (overrides = {}) => ({
    id: 'file-1',
    name: 'test.pdf',
    type: 'pdf',
    size: 1024 * 1024, // 1MB
    content: 'PDF content',
    uploadedAt: new Date().toISOString(),
    ...overrides,
});

export const createMockError = (message = 'Test error', code = 'TEST_ERROR') => ({
    message,
    code,
    timestamp: new Date().toISOString(),
    context: 'test-environment',
});

// Mock store factory
export const createMockStore = (initialState = {}) => {
    return configureStore({
        reducer: {
            projects: (state = [], action) => {
                switch (action.type) {
                    case 'projects/fetchProjectsSuccess':
                        return action.payload;
                    case 'projects/createProjectSuccess':
                        return [...state, action.payload];
                    case 'projects/updateProjectSuccess':
                        return state.map(p => p.id === action.payload.id ? action.payload : p);
                    case 'projects/deleteProjectSuccess':
                        return state.filter(p => p.id !== action.payload);
                    default:
                        return state;
                }
            },
            auth: (state = null, action) => {
                switch (action.type) {
                    case 'auth/loginSuccess':
                        return action.payload;
                    case 'auth/logout':
                        return null;
                    default:
                        return state;
                }
            },
            ui: (state = { loading: false, error: null }, action) => {
                switch (action.type) {
                    case 'ui/setLoading':
                        return { ...state, loading: action.payload };
                    case 'ui/setError':
                        return { ...state, error: action.payload };
                    default:
                        return state;
                }
            },
            ...initialState,
        },
    });
};

// Custom render with providers
export const renderWithProviders = (
    ui: React.ReactElement,
    {
        initialReduxState = {},
        store = createMockStore(initialReduxState),
        theme = 'light',
        ...renderOptions
    }: {
        initialReduxState?: any;
        store?: any;
        theme?: 'light' | 'dark';
    } & Omit<RenderOptions, 'wrapper'> = {}
) => {
    const AllTheProviders = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider attribute= "class" defaultTheme = { theme } >
            <Provider store={ store }>
                { children }
                </Provider>
                </ThemeProvider>

    return { store, ...render(ui, { wrapper: AllTheProviders, ...renderOptions }) };
};

// API mocking helpers
export const mockSuccessfulResponse = (data: any, status = 200) => ({
    ok: true,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
});

export const mockErrorResponse = (message = 'Internal server error', status = 500) => ({
    ok: false,
    status,
    json: () => Promise.resolve({ error: message }),
    text: () => Promise.resolve(message),
});

export const mockDelayedResponse = <T>(data: T, delay = 1000) =>
    new Promise(resolve =>
        setTimeout(() => resolve(mockSuccessfulResponse(data)), delay)
    );

// Form testing helpers
export const fillFormField = async (label: string, value: string) => {
    const userEvent = require('@testing-library/user-event').default;
    const inputElement = document.querySelector(`[aria-label*="${label}"], label:contains("${label}") + input`) as HTMLElement;
    if (inputElement) {
        await userEvent.clear(inputElement);
        await userEvent.type(inputElement, value);
    }
};

export const submitForm = async (formTestId = 'form') => {
    const userEvent = require('@testing-library/user-event').default;
    const form = document.querySelector(`[data-testid="${formTestId}"]`) as HTMLElement;
    const submitButton = form?.querySelector('button[type="submit"]') as HTMLElement;
    if (submitButton) {
        await userEvent.click(submitButton);
    }
};

// AI testing helpers
export const mockAIGeneration = (
    responseType: 'success' | 'error' | 'loading',
    responseData = createMockAIResponse()
) => {
    const fetchMock = global.fetch as jest.Mock;

    switch (responseType) {
        case 'success':
            fetchMock.mockResolvedValueOnce(mockSuccessfulResponse(responseData));
            break;
        case 'error':
            fetchMock.mockRejectedValueOnce(new Error('AI generation failed'));

            break;
        case 'loading':
            fetchMock.mockImplementationOnce(() =>
                new Promise(resolve => {
                    // Keep promise pending to simulate loading
                    setTimeout(() => {
                        resolve(mockSuccessfulResponse(responseData));
                    }, 5000); // Long delay
                })
            );
            break;
    }
};

// Performance testing helpers
export const measurePerformance = async (fn: () => Promise<any> | any) => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();

    return {
        result,
        duration: end - start,
        performanceMetrics: {
            start,
            end,
            duration: end - start,
        },
    };
};

export const expectPerformanceToBeUnder = (duration: number, maxDuration: number) => {
    expect(duration).toBeLessThan(maxDuration);
};

// Validation testing helpers
export const expectFormValidation = async (
    formConfig: {
        fields: Array<{ name: string; rules: any }>;
        onSubmit: () => void;
    }
) => {
    const { renderHook } = require('@testing-library/react');
    const { z } = require('zod');

    const schema = z.object(
        Object.fromEntries(
            formConfig.fields.map(field => [field.name, field.rules])
        )
    );

    // Test each field individually
    for (const field of formConfig.fields) {
        // Test valid input
        const validResult = schema.safeParse({ [field.name]: 'valid-value' });
        expect(validResult.success).toBe(true);

        // Test invalid input
        const invalidResult = schema.safeParse({ [field.name]: '' });
        expect(invalidResult.success).toBe(false);
    }
};

// Error boundary testing helpers
export const createErrorThrowingComponent = (error: Error) => {
    return function ErrorThrowingComponent() {
        throw error;
    };
};

export const expectErrorBoundaryToCatch = async (
    Component: React.ComponentType,
    expectedError: Error
) => {
    const { getByText } = render(<Component />);
    await waitFor(() => {
        expect(getByText(/something went wrong/i)).toBeInTheDocument();
    });
};

// Accessibility testing helpers
export const expectAriaLabels = (container: HTMLElement, expectedLabels: string[]) => {
    expectedLabels.forEach(label => {
        expect(container.querySelector(`[aria-label="${label}"]`)).toBeInTheDocument();
    });
};

export const expectRoleElements = (container: HTMLElement, roles: string[]) => {
    roles.forEach(role => {
        expect(container.querySelector(`[role="${role}"]`)).toBeInTheDocument();
    });
};

export const testKeyboardNavigation = async (elements: HTMLElement[]) => {
    const userEvent = require('@testing-library/user-event').default;

    elements.forEach(async (element, index) => {
        await userEvent.tab();
        expect(element).toHaveFocus();
    });
};

// State management testing helpers
export const dispatchMockAction = (store: any, action: any) => {
    store.dispatch(action);
};

export const expectStateToMatch = (store: any, expectedState: any) => {
    expect(store.getState()).toEqual(expectedState);
};

export const waitForStateUpdate = async (
    store: any,
    selector: (state: any) => any,
    expectedValue: any,
    timeout = 1000
) => {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
        if (selector(store.getState()) === expectedValue) {
            return;
        }
        await new Promise(resolve => setTimeout(resolve, 10));
    }

    throw new Error(`State did not update to expected value within ${timeout}ms`);
};

// Database mocking helpers
export const mockDatabaseOperation = <T>(
    operation: 'create' | 'read' | 'update' | 'delete',
    data: T,
    shouldSucceed = true
) => {
    if (shouldSucceed) {
        return Promise.resolve(data);
    } else {
        return Promise.reject(new Error(`Database ${operation} operation failed`));
    }
};

// File handling testing helpers
export const createMockFileUpload = (fileOptions = {}) => {
    const defaultFile = createMockFile(fileOptions);

    return {
        files: [defaultFile],
        target: {
            files: [
                Object.assign(defaultFile, {
                    size: defaultFile.size,
                    type: defaultFile.type,
                })
            ],
        },
    };
};

export const mockFileReader = (content: string) => {
    const mockReader = {
        readAsText: jest.fn(function (this: any) {
            setTimeout(() => {
                this.onload({ target: { result: content } });
            }, 0);
        }),
        result: content,
    };

    (global as any).FileReader = jest.fn(() => mockReader);
    return mockReader;
};

// Cleanup helpers
export const cleanupAfterTest = () => {
    // Clear all mocks
    jest.clearAllMocks();

    // Clear timers
    jest.clearAllTimers();

    // Reset modules
    jest.resetModules();

    // Clear DOM
    document.body.innerHTML = '';
};

// Test environment validation
export const validateTestEnvironment = () => {
    const requiredGlobals = ['fetch', 'TextEncoder', 'TextDecoder', 'crypto'];
    const missing = requiredGlobals.filter(global => !(global in window || global in globalThis));

    if (missing.length > 0) {
        throw new Error(`Missing required test globals: ${missing.join(', ')}`);
    }
};

// Export all helpers
export default {
    // Data factories
    createMockUser,
    createMockProject,
    createMockAIResponse,
    createMockFile,
    createMockError,

    // Rendering helpers
    createMockStore,
    renderWithProviders,

    // API helpers
    mockSuccessfulResponse,
    mockErrorResponse,
    mockDelayedResponse,

    // Form helpers
    fillFormField,
    submitForm,
    expectFormValidation,

    // AI helpers
    mockAIGeneration,

    // Performance helpers
    measurePerformance,
    expectPerformanceToBeUnder,

    // Validation helpers
    expectFormValidation,

    // Error handling helpers
    createErrorThrowingComponent,
    expectErrorBoundaryToCatch,

    // Accessibility helpers
    expectAriaLabels,
    expectRoleElements,
    testKeyboardNavigation,

    // State management helpers
    dispatchMockAction,
    expectStateToMatch,
    waitForStateUpdate,

    // Database helpers
    mockDatabaseOperation,

    // File handling helpers
    createMockFileUpload,
    mockFileReader,

    // Cleanup helpers
    cleanupAfterTest,
    validateTestEnvironment,
};
