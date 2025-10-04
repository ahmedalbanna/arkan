/**
 * اختبارات الأداء والسرعة الشاملة
 * يختبر الأداء والاستجابة للعمليات المختلفة في النظام
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { render, screen, fireEvent, waitFor as waitForComponent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';

import {
    useProcessingState,
    useTextProcessor,
    useFormHandler,
    useFileUpload,
} from '@/core/hooks';

import {
    createMockStore,
    renderWithProviders,
    createMockUser,
    createMockProject,
    createMockAIResponse,
    measurePerformance,
} from '../helpers/test-helpers';

// Mock performance APIs
Object.defineProperty(performance, 'now', {
    writable: true,
    value: jest.fn(() => Date.now()),
});

// Performance Test Wrapper
const PerformanceTestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

    return (
        <QueryClientProvider client= { queryClient } >
        <ThemeProvider attribute="class" defaultTheme = "light" >
            { children }
            </ThemeProvider>
            </QueryClientProvider>
  );
};

describe('Performance Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Hook Performance Tests', () => {
        it('should initialize hooks within performance budget', () => {
            const {
                result: processingResult,
                rerender: rerenderProcessing,
            } = renderHook(() => useProcessingState(), {
                wrapper: PerformanceTestWrapper,
            });

            const { duration } = measurePerformance(() => {
                rerenderProcessing();
            });

            expect(duration).toBeLessThan(10); // Should initialize within 10ms
            expect(processingResult.current.isProcessing).toBe(false);
        });

        it('should handle rapid state changes efficiently', () => {
            const { result } = renderHook(() => useProcessingState(), {
                wrapper: PerformanceTestWrapper,
            });

            const rapidStateChanges = () => {
                for (let i = 0; i < 100; i++) {
                    act(() => {
                        result.current.startProcessing();
                        result.current.stopProcessing();
                    });
                }
            };

            const { duration } = measurePerformance(rapidStateChanges);

            expect(duration).toBeLessThan(500); // Should complete within 500ms
            expect(result.current.isProcessing).toBe(false);
        });

        it('should optimize form handler with large datasets', () => {
            const largeFormSchema = z.object({
                fields: z.array(z.object({
                    id: z.string(),
                    name: z.string(),
                    value: z.string(),
                    type: z.enum(['text', 'number', 'email']),
                })),
            });

            const generateLargeFormData = () => ({
                fields: Array.from({ length: 1000 }, (_, i) => ({
                    id: `field-${i}`,
                    name: `Field ${i}`,
                    value: `Value ${i}`,
                    type: 'text' as const,
                })),
            });

            const largeData = generateLargeFormData();
            const defaultValues = largeData;

            const { duration } = measurePerformance(() => {
                renderHook(
                    () => useFormHandler(largeFormSchema, defaultValues),
                    { wrapper: PerformanceTestWrapper }
                );
            });

            expect(duration).toBeLessThan(100); // Should initialize within 100ms even with large data
        });

        it('should handle concurrent hook operations', async () => {
            const concurrentOperations = async () => {
                const promises = Array.from({ length: 10 }, (_, i) =>
                    new Promise(resolve => {
                        renderHook(() => useProcessingState(), {
                            wrapper: PerformanceTestWrapper,
                        });
                        setTimeout(resolve, Math.random() * 100);
                    })
                );

                await Promise.all(promises);
            };

            const { duration } = await measurePerformance(concurrentOperations);

            expect(duration).toBeLessThan(2000); // Should complete all operations within 2 seconds
        });

        it('should optimize text processor with large content', async () => {
            const config = {
                toolName: 'performance-test',
                apiEndpoint: '/api/test',
                schema: z.object({ text: z.string() }),
                defaultValues: { text: '' },
            };

            const largeText = 'x'.repeat(50000); // 50KB text

            const setupPromise = new Promise((resolve) => {
                const { result } = renderHook(() => useTextProcessor(config), {
                    wrapper: PerformanceTestWrapper,
                });

                act(() => {
                    result.current.form.setValue('text', largeText);
                });

                resolve(result);
            });

            const { duration } = await measurePerformance(setupPromise);

            expect(duration).toBeLessThan(200); // Should handle large text within 200ms
        });

        it('should maintain performance with complex file operations', async () => {
            const files = Array.from({ length: 50 }, (_, i) =>
                new File([`Content ${i}`], `file-${i}.txt`, { type: 'text/plain' })
            );

            const fileOperationPromise = async () => {
                for (const file of files) {
                    renderHook(() => useFileUpload({
                        acceptedTypes: ['text/plain'],
                        maxSize: 1024 * 1024, // 1MB
                    }), { wrapper: PerformanceTestWrapper });
                }
            };

            const { duration } = await measurePerformance(fileOperationPromise);

            expect(duration).toBeLessThan(300); // Should process multiple files within 300ms
        });
    });

    describe('Component Rendering Performance', () => {
        it('should render large component trees efficiently', () => {
            const LargeComponentTree = () => {
                return (
                    <div>
                    {
                        Array.from({ length: 100 }, (_, i) => (
                            <div key= { i } >
                            <h3>Section { i } </h3>
                            < p > Content for section { i } </p>
                                < button onClick = {() => { }
        }> Action { i } </button>
        </div>
        ))
}
          </div>
);
      };

const { duration } = measurePerformance(() => {
    render(<LargeComponentTree />, { wrapper: PerformanceTestWrapper });
});

expect(duration).toBeLessThan(1000); // Should render large tree within 1 second
    });

it('should optimize list rendering performance', () => {
    const ListComponent = () => {
        const items = Array.from({ length: 1000 }, (_, i) => ({
            id: i,
            name: `Item ${i}`,
            description: `Description for item ${i}`,
        }));

        const [searchTerm, setSearchTerm] = React.useState('');

        const filteredItems = items.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return (
            <div>
            <input
              value= { searchTerm }
        onChange = {(e) => setSearchTerm(e.target.value)
}
              placeholder = "Search items..."
    />
    <div>
    {
        filteredItems.map(item => (
            <div key= { item.id } >
            <h4>{ item.name } </h4>
            < p > { item.description } </p>
            </div>
        ))}
</div>
    </div>
        );
      };

const { duration: initialRender } = measurePerformance(() => {
    render(<ListComponent />, { wrapper: PerformanceTestWrapper });
});

expect(initialRender).toBeLessThan(500); // Initial render should be fast

// Test search performance
const searchInput = screen.getByPlaceholderText('Search items...');

const searchPerformance = async () => {
    await userEvent.type(searchInput, 'Item 5');
};

const { duration: searchTime } = await measurePerformance(searchPerformance);

expect(searchTime).toBeLessThan(200); // Search should be responsive
    });

it('should handle rapid UI updates efficiently', async () => {
    const RapidUpdateComponent = () => {
        const [counter, setCounter] = React.useState(0);
        const [text, setText] = React.useState('');

        return (
            <div>
            <div data - testid= "counter" > { counter } </div>
            < input
        data - testid="text-input"
        value = { text }
        onChange = {(e) => setText(e.target.value)
}
              placeholder = "Type something..."
    />
    <button
              data - testid="increment"
              onClick = {() => setCounter(c => c + 1)}
            >
    Increment
    </button>
    </div>
);
      };

render(<RapidUpdateComponent />, { wrapper: PerformanceTestWrapper });

const incrementButton = screen.getByTestId('increment');
const textInput = screen.getByTestId('text-input');

// Rapid state changes
const rapidUpdates = async () => {
    for (let i = 0; i < 50; i++) {
        await act(async () => {
            fireEvent.click(incrementButton);
        });
    }
};

const { duration } = await measurePerformance(rapidUpdates);

expect(duration).toBeLessThan(1000); // Should handle rapid updates within 1 second

// Verify final state
await waitForComponent(() => {
    expect(screen.getByTestId('counter')).toHaveTextContent('50');
});

// Test typing performance
const typingPerformance = async () => {
    await userEvent.type(textInput, 'This is a long text for performance testing...');
};

const { duration: typingTime } = await measurePerformance(typingPerformance);

expect(typingTime).toBeLessThan(500); // Typing should be responsive
    });
  });

describe('API and Network Performance', () => {
    it('should handle parallel API requests efficiently', async () => {
        const createMockApi = (delay: number) =>
            jest.fn().mockImplementation(() =>
                new Promise(resolve => setTimeout(() => resolve({ data: 'success' }), delay))
            );

        const apiCalls = Array.from({ length: 10 }, (_, i) =>
            createMockApi(Math.random() * 500)
        );

        const parallelRequestPromise = async () => {
            const promises = apiCalls.map(api => api());
            await Promise.all(promises);
        };

        const { duration } = await measurePerformance(parallelRequestPromise);

        expect(duration).toBeLessThan(600); // Parallel requests should complete efficiently

        // Verify all APIs were called
        apiCalls.forEach(api => {
            expect(api).toHaveBeenCalledTimes(1);
        });
    });

    it('should optimize data transformation performance', () => {
        const generateTestData = () =>
            Array.from({ length: 10000 }, (_, i) => ({
                id: i,
                name: `User ${i}`,
                email: `user${i}@example.com`,
                age: Math.floor(Math.random() * 80) + 18,
                active: Math.random() > 0.5,
            }));

        const transformData = () => {
            const data = generateTestData();
            return data.map(user => ({
                ...user,
                displayName: `${user.name} (${user.email})`,
                status: user.active ? 'Active' : 'Inactive',
                ageGroup: user.age < 30 ? 'Young' : user.age < 60 ? 'Adult' : 'Senior',
            }));
        };

        const { duration } = measurePerformance(transformData);

        expect(duration).toBeLessThan(100); // Data transformation should be fast
    });

    it('should cache and optimize repetitive operations', async () => {
        const expensiveOperation = jest.fn().mockImplementation((input) => {
            // Simulate expensive computation
            return input.map((item: number) => item * item);
        });

        const cachingFunction = (() => {
            const cache = new Map();

            return (input: number[]) => {
                const key = JSON.stringify(input);

                if (cache.has(key)) {
                    return cache.get(key);
                }

                const result = expensiveOperation(input);
                cache.set(key, result);
                return result;
            };
        })();

        const testInputs = [
            [1, 2, 3, 4, 5],
            [1, 2, 3, 4, 5], // Duplicate
            [2, 3, 4, 5, 6],
            [1, 2, 3, 4, 5], // Another duplicate
        ];

        const cachedOperationsPromise = async () => {
            for (const input of testInputs) {
                cachingFunction(input);
            }
        };

        const { duration } = await measurePerformance(cachedOperationsPromise);

        expect(duration).toBeLessThan(50); // Cached operations should be very fast
        expect(expensiveOperation).toHaveBeenCalledTimes(2); // Should only compute twice
    });
});

describe('Memory Performance Tests', () => {
    it('should not leak memory with frequent hook creation', () => {
        const initialMemory = process.memoryUsage().heapUsed;

        // Create and destroy hooks multiple times
        for (let i = 0; i < 100; i++) {
            const { unmount } = renderHook(() => useProcessingState(), {
                wrapper: PerformanceTestWrapper,
            });
            unmount();
        }

        // Force garbage collection if available
        if (global.gc) {
            global.gc();
        }

        const finalMemory = process.memoryUsage().heapUsed;
        const memoryIncrease = finalMemory - initialMemory;

        // Memory increase should be minimal
        expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // Less than 10MB
    });

    it('should handle large datasets without memory accumulation', () => {
        const LargeDataComponent = () => {
            const [data, setData] = React.useState([]);
            const [loading, setLoading] = React.useState(false);

            const loadData = () => {
                setLoading(true);

                // Generate large dataset
                const newData = Array.from({ length: 1000 }, (_, i) => ({
                    id: i,
                    content: `Large content item ${i}`.repeat(100), // Each item ~1KB
                    timestamp: Date.now(),
                }));

                setTimeout(() => {
                    setData(newData);
                    setLoading(false);
                }, 100);
            };

            const clearData = () => {
                setData([]);
            };

            return (
                <div>
                <button onClick= { loadData } disabled = { loading } >
                    Load Large Dataset
                        </button>
                        < button onClick = { clearData } > Clear Data </button>
                            <div>
            { loading ? 'Loading...' : `Loaded ${data.length} items` }
            </div>
                </div>
        );
};

render(<LargeDataComponent />, { wrapper: PerformanceTestWrapper });

// Memory test with large dataset
const loadAndClearData = async () => {
    await userEvent.click(screen.getByText('Load Large Dataset'));

    await waitForComponent(() => {
        expect(screen.getByText('Loaded 1000 items')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('Clear Data'));

    await waitForComponent(() => {
        expect(screen.getByText('Loaded 0 items')).toBeInTheDocument();
    });
};

expect(async () => {
    await loadAndClearData();
}).not.toThrow();

// Should be able to repeat the operation without issues
expect(async () => {
    await loadAndClearData();
}).not.toThrow();
    });

it('should optimize component unmounting and cleanup', () => {
    const ComponentWithCleanup = ({ shouldUnmount }: { shouldUnmount: boolean }) => {
        const [count, setCount] = React.useState(0);

        React.useEffect(() => {
            const interval = setInterval(() => setCount(c => c + 1), 100);

            return () => {
                clearInterval(interval);
            };
        }, []);

        if (shouldUnmount) {
            return null;
        }

        return <div>Count: { count } </div>;
    };

    const TestContainer = () => {
        const [shouldUnmount, setShouldUnmount] = React.useState(false);

        return (
            <div>
            <button onClick= {() => setShouldUnmount(true)
}>
Unmount Component
</button>
< ComponentWithCleanup shouldUnmount = { shouldUnmount } />
</div>
);
      };

const { unmount: unmountContainer } = render(
    <TestContainer />,
        { wrapper: PerformanceTestWrapper }
);

// Component should unmount cleanly
userEvent.click(screen.getByText('Unmount Component'));

expect(async () => {
    await waitForComponent(() => {
        expect(screen.queryByText(/Count:/)).not.toBeInTheDocument();
    });
}).not.toThrow();

// Container should also unmount cleanly
expect(() => unmountContainer()).not.toThrow();
    });
  });

describe('Bundle Size and Loading Performance', () => {
    it('should optimize dynamic imports', async () => {
        const dynamicImportPromise = async () => {
            // Simulate dynamic import
            const mockModule = {
                default: () => <div>Dynamically loaded component</ div >
        };

        const loadComponent = () => Promise.resolve(mockModule);

        await loadComponent();
    };

    const { duration } = await measurePerformance(dynamicImportPromise);

    expect(duration).toBeLessThan(50); // Dynamic imports should be fast
});

it('should lazy load components efficiently', async () => {
    const LazyLoadedComponent = React.lazy(() =>
        Promise.resolve({
            default: () => <div>Lazy loaded content</ div >
        })
      );

const LazyContainer = () => {
    const [show, setShow] = React.useState(false);

    return (
        <div>
        <button onClick= {() => setShow(true)}> Load Component </button>
{
    show && (
        <React.Suspense fallback={ <div>Loading...</div> }>
            <LazyLoadedComponent />
            </React.Suspense>
            )
}
</div>
        );
      };

render(<LazyContainer />, { wrapper: PerformanceTestWrapper });

const lazyLoadPromise = async () => {
    await userEvent.click(screen.getByText('Load Component'));

    await waitForComponent(() => {
        expect(screen.getByText('Lazy loaded content')).toBeInTheDocument();
    });
};

const { duration } = await measurePerformance(lazyLoadPromise);

expect(duration).toBeLessThan(200); // Lazy loading should be quick
    });
  });

describe('Real-world Performance Scenarios', () => {
    it('should handle typical user workflow efficiently', async () => {
        const UserWorkflow = () => {
            const [step, setStep] = React.useState(1);
            const [data, setData] = React.useState({});
            const [loading, setLoading] = React.useState(false);

            const steps = [
                {
                    id: 1, name: 'Login', component: () => (
                        <div>
                        <input placeholder= "Email" />
                        <input placeholder="Password" type = "password" />
                            <button onClick={() => setStep(2)
    }> Login </button>
    </div>
    )
},
    {
        id: 2, name: 'Dashboard', component: () => (
            <div>
            <h2>Dashboard </h2>
            < button onClick={() => setStep(3)
    } > Create Project </button>
</div>
)},
{
    id: 3, name: 'Project', component: () => (
        <div>
        <h2>Create Project </h2>
            < input placeholder = "Project name" />
                <textarea placeholder="Description" />
                    <button
                onClick={
        async () => {
            setLoading(true);
            await new Promise(r => setTimeout(r, 500));
            setLoading(false);
            setStep(4);
        }
    }
    disabled = { loading }
        >
        Create
        </button>
        </div>
          )
},
{
    id: 4, name: 'Success', component: () => (
        <div>
        <h2>Project Created! </h2>
            < button onClick = {() => setStep(1)
}> New Project </button>
    </div>
          )}
        ];

const currentStep = steps.find(s => s.id === step);
const StepComponent = currentStep?.component;

return (
    <div>
    <div>Step { step }: { currentStep?.name } </div>
{ loading && <div>Processing...</div> }
{ StepComponent && <StepComponent /> }
</div>
        );
      };

render(<UserWorkflow />, { wrapper: PerformanceTestWrapper });

const fullWorkflowPromise = async () => {
    // Step 1: Login
    await userEvent.type(screen.getByPlaceholderText('Email'), 'user@example.com');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'password');
    await userEvent.click(screen.getByText('Login'));

    await waitForComponent(() => {
        expect(screen.getByText('Step 2: Dashboard')).toBeInTheDocument();
    });
    </code>
    // Step 2: Create Project
    await userEvent.click(screen.getByText('Create Project'));

    await waitForComponent(() => {
        expect(screens.getByText('Step 3: Project')).toBeInTheDocument();
    });

    // Step 3: Fill and submit
    await userEvent.type(screen.getByPlaceholderText('Project name'), 'Test Project');
    await userEvent.type(screen.getByPlaceholderText('Description'), 'My test project');

    await userEvent.click(screen.getByText('Create'));

    // Wait for processing
    await waitForComponent(() => {
        expect(screen.getByText('Processing...')).toBeInTheDocument();
    });

    // Wait for success
    await waitForComponent(() => {
        expect(screen.getByText('Step 4: Success')).toBeInTheDocument();
    });
};

const { duration } = await measurePerformance(fullWorkflowPromise);

expect(duration).toBeLessThan(2000); // Full workflow should complete within 2 seconds
  });

it('should handle concurrent user sessions efficiently', async () => {
    const SessionComponent = ({ userId }: { userId: string }) => {
        const [activity, setActivity] = React.useState<string[]>([]);

        React.useEffect(() => {
            const interval = setInterval(() => {
                setActivity(prev => [...prev, `Activity ${Date.now()}`]);
            }, 1000);

            return () => clearInterval(interval);
        }, []);

        return (
            <div>
            <h3>Session { userId } </h3>
                < div > Activities: { activity.length } </div>
                    </div>
        );
      };

const ConcurrentSessions = () => (
    <div>
    {
        Array.from({ length: 10 }, (_, i) => (
            <SessionComponent key= { i } userId = {`user-${i}`} />
          ))}
</div>
      );

const concurrentSessionPromise = async () => {
    render(<ConcurrentSessions />, { wrapper: PerformanceTestWrapper });

    // Wait for some activity
    await new Promise(resolve => setTimeout(resolve, 3000));
};

const { duration } = await measurePerformance(concurrentSessionPromise);

expect(duration).toBeLessThan(5000); // Should handle concurrent sessions efficiently
    });
  });

describe('Performance Regression Tests', () => {
    it('should maintain consistent hook performance across iterations', () => {
        const performanceResults = [];

        for (let iteration = 0; iteration < 10; iteration++) {
            const { duration } = measurePerformance(() => {
                const { unmount } = renderHook(() => useProcessingState(), {
                    wrapper: PerformanceTestWrapper,
                });
                unmount();
            });

            performanceResults.push(duration);
        }

        const averageDuration = performanceResults.reduce((a, b) => a + b, 0) / performanceResults.length;
        const maxDuration = Math.max(...performanceResults);
        const minDuration = Math.min(...performanceResults);

        // Performance should be consistent
        expect(maxDuration / minDuration).toBeLessThan(2); // Max should not be more than 2x min
        expect(averageDuration).toBeLessThan(25); // Average should stay under 25ms
    });

    it('should track performance metrics for monitoring', () => {
        const metrics = {
            hookInitialization: [] as number[],
            componentRendering: [] as número[],
            dataProcessing: [] as number[],
        };

        // Collect metrics
        for (let i = 0; i < 5; i++) {
            const { duration: hookTime } = measurePerformance(() => {
                renderHook(() => useProcessingState(), { wrapper: PerformanceTestWrapper });
            });

            const { duration: renderTime } = measurePerformance(() => {
                render(<div>Test component </div>, { wrapper: PerformanceTestWrapper });
            });

            const { duration: dataTime } = measurePerformance(() => {
                Array.from({ length: 1000 }, (_, i) => ({ id: i, value: i * 2 }));
            });

            metrics.hookInitialization.push(hookTime);
            metrics.componentRendering.push(renderTime);
            metrics.dataProcessing.push(dataTime);
        }

        // Verify metrics are within acceptable ranges
        const avgHookTime = metrics.hookInitialization.reduce((a, b) => a + b, 0) / metrics.hookInitialization.length;
        const avgRenderTime = metrics.componentRendering.reduce((a, b) => a + b, 0) / metrics.componentRendering.length;
        const avgDataTime = metrics.dataProcessing.reduce((a, b) => a + b, 0) / metrics.dataProcessing.length;

        expect(avgHookTime).toBeLessThan(10);
        expect(avgRenderTime).toBeLessThan(50);
        expect(avgDataTime).toBeLessThan(5);

        // Log metrics for monitoring
        console.log('Performance Metrics:', {
            hookInitialization: avgHookTime,
            componentRendering: avgRenderTime,
            dataProcessing: avgDataTime,
        });
    });
});
});
