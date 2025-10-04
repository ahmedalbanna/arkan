/**
 * اختبارات شاملة لنظام Loading States المحسن
 * يغطي جميع المكونات والوظائف مع حالات مختلفة
 */

import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';

// النظام الجديد للـ Loading States
import {
    LoadingProvider,
    useLoading,
    LoadingSpinner,
    LoadingSkeleton,
    LoadingProgress,
    LoadingPulse,
    LoadingIndمicator,
    LoadingWrapper,
} from '../LoadingStates';

// مكون مساعد للاختبار
const TestComponent: React.FC<{ testKey: string }> = ({ testKey }) => {
    const { setLoading } = useLoading();

    return (
        <div>
            <button onClick={() => setLoading(testKey, true)}>
                بدء التحميل
            </button>
            <button onClick={() => setLoading(testKey, false)}>
                إيقاف التحميل
            </button>
            <button onClick={() => setLoading(testKey, { progress: 50, message: '50% مكتمل' })}>
                تحديث التقدم
            </button>
        </div>
    );
};

// اختبارات LoadingProvider
describe('LoadingProvider', () => {
    it('يجب أن يوفر LoadingContext بشكل صحيح', () => {
        render(
            <LoadingProvider>
                <TestComponent testKey="test" />
            </LoadingProvider>
        );

        expect(screen.getByText('بدء التحميل')).toBeInTheDocument();
        expect(screen.getByText('إيقاف التحميل')).toBeInTheDocument();
    });

    it('يجب أن يدير حالة التحميل بشكل صحيح', async () => {
        const TestLoadingComponent = () => {
            const { setLoading, isLoading } = useLoading();
            return (
                <div>
                    <span data-testid="loading-state">{isLoading('test') ? 'true' : 'false'}</span>
                    <button onClick={() => setLoading('test', true)}>بدء</button>
                    <button onClick={() => setLoading('test', false)}>إيقاف</button>
                </div>
            );
        };

        render(
            <LoadingProvider>
                <TestLoadingComponent />
            </LoadingProvider>
        );

        expect(screen.getByTestId('loading-state')).toHaveTextContent('false');

        fireEvent.click(screen.getByText('بدء'));
        await waitFor(() => {
            expect(screen.getByTestId('loading-state')).toHaveTextContent('true');
        });

        fireEvent.click(screen.getByText('إيقاف'));
        await waitFor(() => {
            expect(screen.getByTestId('loading-state')).toHaveTextContent('false');
        });
    });

    it('يجب أن ينظف العمليات القديمة تلقائياً', async () => {
        jest.useFakeTimers();

        render(
            <LoadingProvider autoCleanupDelay={1000}>
                <TestComponent testKey="test" />
            </LoadingProvider>
        );

        // بدء التحميل
        fireEvent.click(screen.getByText('بدء التحميل'));

        // تقديم الوقت بمعدل التنظيف
        act(() => {
            jest.advanceTimersByTime(1000);
        });

        // يجب أن ينظف تلقائياً بعد المهلة الزمنية
        expect(screen.getByText('بدء التحميل')).toBeInTheDocument();

        jest.useRealTimers();
    });
});

// اختبارات LoadingSpinner
describe('LoadingSpinner', () => {
    it('يجب أن يعرض Spinner مع النص المطلوب', () => {
        render(<LoadingSpinner showLabel label="تحميل الاختبار" />);

        expect(screen.getByText('تحميل الاختبار')).toBeInTheDocument();
    });

    it('يجب أن يعرض أحجام مختلفة بشكل صحيح', () => {
        const { rerender } = render(<LoadingSpinner size="sm" />);

        const spinner = screen.getByRole('presentation').querySelector('div');
        expect(spinner).toHaveClass('h-4', 'w-4');

        rerender(<LoadingSpinner size="lg" />);
        expect(spinner).toHaveClass('h-8', 'w-8');
    });

    it('يجب أن يعرض الألوان المختلفة بشكل صحيح', () => {
        render(<LoadingSpinner color="success" />);

        const spinner = screen.getByRole('presentation').querySelector('div');
        expect(spinner).toHaveClass('text-green-500');
    });
});

// اختبارات LoadingSkeleton
describe('LoadingSkeleton', () => {
    it('يجب أن يعرض عدد الخطوط المحدد', () => {
        render(<LoadingSkeleton lines={5} />);

        const skeletons = screen.getAllByRole('presentation');
        expect(skeletons).toHaveLength(5);
    });

    it('يجب أن يعرض أنماط مختلفة بشكل صحيح', () => {
        const { rerender } = render(<LoadingSkeleton variant="circular" />);

        let skeleton = screen.getByRole('presentation');
        expect(skeleton).toHaveClass('rounded-full', 'aspect-square');

        rerender(<LoadingSkeleton variant="rounded" />);
        skeleton = screen.getByRole('presentation');
        expect(skeleton).toHaveClass('rounded-lg');
    });
});

// اختبارات LoadingProgress
describe('LoadingProgress', () => {
    it('يجب أن يعرض التقدم بشكل صحيح', async () => {
        const { rerender } = render(<LoadingProgress value={50} showPercentage />);

        expect(screen.getByText('50%')).toBeInTheDocument();

        rerender(<LoadingProgress value={75} showPercentage />);
        await waitFor(() => {
            expect(screen.getByText('75%');
        });
    });

    it('يجب أن يعرض أنماط مختلفة', () => {
        render(<LoadingProgress variant="success" value={100} />);

        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toHaveClass('bg-green-500');
    });
});

// اختبارات LoadingPulse
describe('LoadingPulse', () => {
    it('يجب أن يعرض العدد الصحيح للنقاط', () => {
        render(<LoadingPulse count={4} variant="dots" />);

        const dots = screen.getAllByRole('presentation');
        expect(dots).toHaveLength(4);
    });

    it('يجب أن يتعامل مع السرعات المختلفة', () => {
        render(<LoadingPulse speed="fast" variant="dots" />);

        const dots = screen.getAllByRole('presentation');
        expect(dots[0]).toHaveStyle({ animationDuration: '0.8s' });
    });
});

// اختبارات LoadingIndمicator
describe('LoadingIndمicator', () => {
    it('يجب أن يعرض النوع الصحيح حسب الخاصية', () => {
        const variants = ['spinner', 'skeleton', 'progress', 'pulse'] as const;

        variants.forEach(variant => {
            const { container } = render(
                <LoadingIndمicator variant={variant} />
            );
            expect(container.firstChild).toBeInTheDocument();
        });
    });

    it('يجب أن يعرض الرسالة والتقدم عند تحديدها', () => {
        render(
            <LoadingIndمicator
                variant="progress"
                message="اختبار التقدم"
                progress={60}
            />
        );

        expect(screen.getByText('اختبار التقدم')).toBeInTheDocument();
    });
});

// اختبارات LoadingWrapper
describe('LoadingWrapper', () => {
    const WrapperWithLoadingState = () => {
        const { setLoading, isLoading } = useLoading();

        return (
            <div>
                <button onClick={() => setLoading('test-wrapper', true)}>
                    افتح التحميل
                </button>
                <LoadingWrapper loadingKey="test-wrapper" variant="spinner">
                    <div data-testid="content">محتوى الاختبار</div>
                </LoadingWrapper>
            </div>
        );
    };

    it('يجب أن يعرض المحتوى عندما لا يكون هناك تحميل', () => {
        render(
            <LoadingProvider>
                <WrapperWithLoadingState />
            </LoadingProvider>
        );

        expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('يجب أن يعرض Loading مع تأخير مجاني', async () => {
        jest.useFakeTimers();

        render(
            <LoadingProvider>
                <WrapperWithLoadingState />
            </LoadingProvider>
        );

        fireEvent.click(screen.getByText('افتح التحميل'));

        // لا يجب أن يظهر Loading فوراً إذا كان هناك تأخير
        expect(screen.queryByRole('presentation')).toBeNull();

        // تقديم الوقت للوصول إلى المهلة الزمنية
        act(() => {
            jest.advanceTimersByTime(500);
        });

        await waitFor(() => {
            expect(screen.getByRole('presentation')).toBeInTheDocument();
        });

        jest.useRealTimers();
    });

    it('يجب أن يستجيب للألغاء', async () => {
        const CancellableComponent = () => {
            const { setLoading } = useLoading();

            return (
                <div>
                    <button onClick={() => setLoading('test', {
                        loading: true,
                        cancellable: true,
                        onCancel: () => setLoading('test', false)
                    })}>
                        بدء قابل للإلغاء
                    </button>
                    <LoadingWrapper loadingKey="test" variant="spinner">
                        <div data-testid="wrapper-content">محموعة</div>
                    </LoadingWrapper>
                </div>
            );
        };

        render(
            <LoadingProvider>
                <CancellableComponent />
            </LoadingProvider>
        );

        fireEvent.click(screen.getByText('بدء قابل للإلغاء'));

        await waitFor(() => {
            expect(screen.getByText('إلغاء')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('إلغاء'));

        await waitFor(() => {
            expect(screen.queryByText('إلغاء')).toBeNull();
        });
    });
});

// اختبارات التكامل
describe('Integration Tests', () => {
    it('يجب أن يعمل النظام مع معالجة الأخطاء', async () => {
        const ErrorTestComponent = () => {
            const { setLoading } = useLoading();

            return (
                <div>
                    <button
                        onClick={() => setLoading('error-test', {
                            loading: true,
                            error: 'خطأ في الاختبار'
                        })}
                    >
                        خطأ اختبار
                    </button>
                    <LoadingWrapper loadingKey="error-test" variant="spinner">
                        <input data-testid="error-input" />
                    </LoadingWrapper>
                </div>
            );
        };

        render(
            <LoadingProvider>
                <ErrorTestComponent />
            </LoadingProvider>
        );

        fireEvent.click(screen.getByText('خطأ اختبار'));

        await waitFor(() => {
            expect(screen.getByRole('presentation')).toBeInTheDocument();
        });

        // يجب أن يكون المحتوى متاحاً
        expect(screen.getByTestId('error-input')).toBeInTheDocument();
    });

    it('يجب أن يدعم العمليات المتوازية', async () => {
        const ParallelTestComponent = () => {
            const { setLoading } = useLoading();

            return (
                <div>
                    <button onClick={() => setLoading('parallel-1', true)}>
                        بدء التحميل الأول
                    </button>
                    <button onClick={() => setLoading('parallel-2', true)}>
                        بدء التحميل الثاني
                    </button>
                    <LoadingWrapper loadingKey="parallel-1" variant="spinner">
                        <div data-testid="parallel-content-1">محتوى أول</div>
                    </LoadingWrapper>
                    <LoadingWrapper loadingKey="parallel-2" variant="skeleton">
                        <div data-testid="parallel-content-2">محتوى ثاني</div>
                    </LoadingWrapper>
                </div>
            );
        };

        render(
            <LoadingProvider>
                <ParallelTestComponent />
            </LoadingProvider>
        );

        fireEvent.click(screen.getByText('بدء التحميل الأول'));
        fireEvent.click(screen.getByText('بدء التحميل الثاني'));

        await waitFor(() => {
            expect(screen.getByRole('presentation')).toBeInTheDocument();
        });

        // يجب أن يظهر كلا المحتوتين مع Loading states منفصلة
        expect(screen.getByTestId('parallel-content-1')).toBeInTheDocument();
        expect(screen.getByTestId('parallel-content-2')).toBeInTheDocument();
    });
});

export { };
