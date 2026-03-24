import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';

jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../../core/useBuilderStore', () => ({ 
  useBuilderStore: jest.fn(() => ({
    project: { toStateObject: () => ({ id: '123' }) }
  }))
}));
jest.mock('ai/react', () => ({
  useChat: jest.fn(() => ({
    messages: [],
    input: '',
    handleInputChange: jest.fn(),
    handleSubmit: jest.fn(),
    isLoading: false,
    setMessages: jest.fn(),
  }))
}));

const { useChat } = require('ai/react');
const { useProjectChat } = require('../useProjectChat');

describe('useProjectChat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes useChat with correct parameters', () => {
    renderHook(() => useProjectChat());
    
    expect(useChat).toHaveBeenCalledWith(expect.objectContaining({
      api: '/api/chat/project-consultant',
      body: {
        projectContext: JSON.stringify({ id: '123' }),
      }
    }));
  });

  it('provides the correct chat interface', () => {
    const { result } = renderHook(() => useProjectChat());
    
    expect(result.current).toHaveProperty('messages');
    expect(result.current).toHaveProperty('input');
    expect(result.current).toHaveProperty('handleSubmit');
  });
});
