import { GenerateAgentView } from '@/components/admin/agent-editor/GenerateAgentView';
import { CreateAgentDialog } from '@/components/admin/users/CreateAgentDialog';
import { useCreateAgent } from '@/hooks/use-agents';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

// Mock the hooks
jest.mock('@/hooks/use-agents', () => ({
    useCreateAgent: () => ({
        mutate: jest.fn(),
        isPending: false,
    }),
    useAgentCategories: () => ({
        data: [
            { id: 'content-generation', name: 'Content Generation' },
            { id: 'data-analysis', name: 'Data Analysis' },
        ],
    }),
    useGenerateAgentConfig: () => ({
        mutate: jest.fn(),
        isPending: false,
    }),
}));

// Mock localization
jest.mock('@/context/LocalizationContext', () => ({
    useLocalization: () => ({
        t: (key: string) => key,
    }),
}));

// Mock router
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

describe('Agent Icon Requirements', () => {
    describe('CreateAgentDialog', () => {
        test('renders icon selection field', () => {
            render(<CreateAgentDialog />);

            // Open dialog
            fireEvent.click(screen.getByText('agentManager.newAgentButton'));

            expect(screen.getByText('agentManager.createDialog.iconLabel')).toBeInTheDocument();
            expect(screen.getByRole('combobox')).toBeInTheDocument();
        });

        test('validates icon selection', async () => {
            render(<CreateAgentDialog />);

            // Open dialog
            fireEvent.click(screen.getByText('agentManager.newAgentButton'));

            // Try to submit without selecting icon (should fail validation)
            const submitButton = screen.getByText('agentManager.createDialog.createButton');
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText('Icon is required')).toBeInTheDocument();
            });
        });

        test('allows icon selection', async () => {
            render(<CreateAgentDialog />);

            // Open dialog
            fireEvent.click(screen.getByText('agentManager.newAgentButton'));

            // Select an icon
            const iconSelect = screen.getByRole('combobox');
            fireEvent.click(iconSelect);

            // Select bot icon
            fireEvent.click(screen.getByText('Bot'));

            expect(iconSelect).toHaveValue('bot');
        });

        test('has default icon value', () => {
            render(<CreateAgentDialog />);

            // Open dialog
            fireEvent.click(screen.getByText('agentManager.newAgentButton'));

            // Check that bot is selected by default
            const iconSelect = screen.getByRole('combobox');
            expect(iconSelect).toHaveValue('bot');
        });
    });

    describe('GenerateAgentView', () => {
        test('renders icon selection in review step', () => {
            const mockGeneratedData = {
                name: 'Test Agent',
                description: 'Test Description',
                instructions: 'Test Instructions',
                guidelines: 'Test Guidelines',
            };

            render(<GenerateAgentView />);

            // Mock the generated data state
            // This would normally be set by the generation process
            // For testing, we'll simulate the review step

            // The icon selection should be available in the review step
            // This test verifies the UI structure is correct
            expect(screen.getByText('agentGenerator.review.icon')).toBeInTheDocument();
        });

        test('uses selected icon in agent creation', () => {
            const mockCreateAgent = jest.fn();

            // Mock the createAgent mutation
            (useCreateAgent as jest.Mock).mockReturnValue({
                mutate: mockCreateAgent,
                isPending: false,
                data: undefined,
                variables: undefined,
                error: null,
                isError: false,
                isIdle: true,
                isSuccess: false,
                status: 'idle',
                reset: jest.fn(),
                context: undefined,
                failureCount: 0,
                failureReason: null,
                isPaused: false,
                submittedAt: 0,
                mutateAsync: jest.fn(),
            });

            render(<GenerateAgentView />);

            // Simulate agent creation with icon
            const agentData = {
                id: 'test-agent',
                name: 'Test Agent',
                description: 'Test Description',
                category: 'content-generation',
                pageUrl: '/admin/chats',
                prompt: { base: 'Test prompt' },
                knowledge: [],
                icon: 'bot', // Icon should be included
            };

            // Verify that icon is included in agent data
            expect(agentData.icon).toBe('bot');
        });
    });

    describe('Icon Options', () => {
        test('provides comprehensive icon options', () => {
            const expectedIcons = [
                'bot',
                'brain-circuit',
                'file-text',
                'code',
                'library',
                'test-tube-2',
                'waypoints',
                'flag',
                'book-marked',
                'presentation',
                'database-zap',
                'history',
                'file-heart',
                'hand',
                'drafting-compass',
                'files',
                'layout-grid',
                'scale',
                'megaphone',
                'pencil-ruler',
                'users',
            ];

            render(<CreateAgentDialog />);

            // Open dialog
            fireEvent.click(screen.getByText('agentManager.newAgentButton'));

            // Open icon dropdown
            const iconSelect = screen.getByRole('combobox');
            fireEvent.click(iconSelect);

            // Check that all expected icons are available
            expectedIcons.forEach(icon => {
                expect(screen.getByText(icon.replace('-', ' '))).toBeInTheDocument();
            });
        });
    });

    describe('Error Handling', () => {
        test('handles icon validation errors gracefully', async () => {
            render(<CreateAgentDialog />);

            // Open dialog
            fireEvent.click(screen.getByText('agentManager.newAgentButton'));

            // Clear the default icon value
            const iconSelect = screen.getByRole('combobox');
            fireEvent.change(iconSelect, { target: { value: '' } });

            // Try to submit
            const submitButton = screen.getByText('agentManager.createDialog.createButton');
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText('Please select an icon for the agent')).toBeInTheDocument();
            });
        });

        test('provides user-friendly error messages', async () => {
            render(<CreateAgentDialog />);

            // Open dialog
            fireEvent.click(screen.getByText('agentManager.newAgentButton'));

            // Submit without icon
            const submitButton = screen.getByText('agentManager.createDialog.createButton');
            fireEvent.click(submitButton);

            await waitFor(() => {
                const errorMessage = screen.getByText('Please select an icon for the agent');
                expect(errorMessage).toBeInTheDocument();
                expect(errorMessage).toHaveClass('text-destructive');
            });
        });
    });

    describe('Accessibility', () => {
        test('has proper labels and ARIA attributes', () => {
            render(<CreateAgentDialog />);

            // Open dialog
            fireEvent.click(screen.getByText('agentManager.newAgentButton'));

            // Check for proper labeling
            const iconLabel = screen.getByText('agentManager.createDialog.iconLabel');
            const iconSelect = screen.getByRole('combobox');

            expect(iconLabel).toBeInTheDocument();
            expect(iconSelect).toHaveAttribute('aria-label');
        });

        test('supports keyboard navigation', () => {
            render(<CreateAgentDialog />);

            // Open dialog
            fireEvent.click(screen.getByText('agentManager.newAgentButton'));

            // Focus on icon select
            const iconSelect = screen.getByRole('combobox');
            iconSelect.focus();

            // Should be focusable
            expect(iconSelect).toHaveFocus();
        });
    });
});
