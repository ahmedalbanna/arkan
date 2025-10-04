import { useFormHandler } from '@/core/hooks/base/use-form-handler';
import { act, renderHook } from '@testing-library/react';
import { z } from 'zod';

// Test schema
const testSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    age: z.number().min(18, 'Must be at least 18'),
});

type TestFormData = z.infer<typeof testSchema>;

describe('useFormHandler Hook', () => {
    const defaultValues: TestFormData = {
        name: '',
        email: '',
        age: 0,
    };

    describe('Initialization', () => {
        it('should initialize with default values', () => {
            const { result } = renderHook(() =>
                useFormHandler({
                    schema: testSchema,
                    defaultValues,
                    onSubmit: jest.fn(),
                })
            );

            expect(result.current.values).toEqual(defaultValues);
            expect(result.current.errors).toEqual({});
            expect(result.current.isSubmitting).toBe(false);
            expect(result.current.isValid).toBe(false);
        });

        it('should initialize with custom default values', () => {
            const customValues = { name: 'John', email: 'john@example.com', age: 25 };

            const { result } = renderHook(() =>
                useFormHandler({
                    schema: testSchema,
                    defaultValues: customValues,
                    onSubmit: jest.fn(),
                })
            );

            expect(result.current.values).toEqual(customValues);
            expect(result.current.isValid).toBe(true);
        });

        it('should handle undefined default values', () => {
            const { result } = renderHook(() =>
                useFormHandler({
                    schema: testSchema,
                    onSubmit: jest.fn(),
                })
            );

            expect(result.current.values).toEqual({});
        });
    });

    describe('Form Validation', () => {
        it('should validate form data correctly', () => {
            const { result } = renderHook(() =>
                useFormHandler({
                    schema: testSchema,
                    defaultValues,
                    onSubmit: jest.fn(),
                })
            );

            // Test valid data
            act(() => {
                result.current.setValue('name', 'John Doe');
                result.current.setValue('email', 'john@example.com');
                result.current.setValue('age', 25);
            });

            expect(result.current.isValid).toBe(true);
            expect(result.current.errors).toEqual({});
        });

        it('should show validation errors for invalid data', () => {
            const { result } = renderHook(() =>
                useFormHandler({
                    schema: testSchema,
                    defaultValues,
                    onSubmit: jest.fn(),
                })
            );

            // Test invalid data
            act(() => {
                result.current.setValue('name', '');
                result.current.setValue('email', 'invalid-email');
                result.current.setValue('age', 15);
            });

            expect(result.current.isValid).toBe(false);
            expect(result.current.errors.name).toBe('Name is required');
            expect(result.current.errors.email).toBe('Invalid email');
            expect(result.current.errors.age).toBe('Must be at least 18');
        });

        it('should validate on blur', () => {
            const { result } = renderHook(() =>
                useFormHandler({
                    schema: testSchema,
                    defaultValues,
                    onSubmit: jest.fn(),
                })
            );

            act(() => {
                result.current.setValue('name', '');
                result.current.handleBlur('name');
            });

            expect(result.current.errors.name).toBe('Name is required');
        });

        it('should clear errors when field becomes valid', () => {
            const { result } = renderHook(() =>
                useFormHandler({
                    schema: testSchema,
                    defaultValues,
                    onSubmit: jest.fn(),
                })
            );

            // Set invalid data
            act(() => {
                result.current.setValue('name', '');
                result.current.handleBlur('name');
            });

            expect(result.current.errors.name).toBe('Name is required');

            // Fix the data
            act(() => {
                result.current.setValue('name', 'John Doe');
                result.current.handleBlur('name');
            });

            expect(result.current.errors.name).toBeUndefined();
        });
    });

    describe('Form Submission', () => {
        it('should call onSubmit with valid data', async () => {
            const mockOnSubmit = jest.fn().mockResolvedValue(undefined);

            const { result } = renderHook(() =>
                useFormHandler({
                    schema: testSchema,
                    defaultValues,
                    onSubmit: mockOnSubmit,
                })
            );

            // Set valid data
            act(() => {
                result.current.setValue('name', 'John Doe');
                result.current.setValue('email', 'john@example.com');
                result.current.setValue('age', 25);
            });

            await act(async () => {
                await result.current.handleSubmit();
            });

            expect(mockOnSubmit).toHaveBeenCalledWith({
                name: 'John Doe',
                email: 'john@example.com',
                age: 25,
            });
        });

        it('should not submit invalid data', async () => {
            const mockOnSubmit = jest.fn();

            const { result } = renderHook(() =>
                useFormHandler({
                    schema: testSchema,
                    defaultValues,
                    onSubmit: mockOnSubmit,
                })
            );

            // Set invalid data
            act(() => {
                result.current.setValue('name', '');
                result.current.setValue('email', 'invalid');
                result.current.setValue('age', 15);
            });

            await act(async () => {
                await result.current.handleSubmit();
            });

            expect(mockOnSubmit).not.toHaveBeenCalled();
        });

        it('should handle submission errors', async () => {
            const mockOnSubmit = jest.fn().mockRejectedValue(new Error('Submission failed'));

            const { result } = renderHook(() =>
                useFormHandler({
                    schema: testSchema,
                    defaultValues,
                    onSubmit: mockOnSubmit,
                })
            );

            // Set valid data
            act(() => {
                result.current.setValue('name', 'John Doe');
                result.current.setValue('email', 'john@example.com');
                result.current.setValue('age', 25);
            });

            await act(async () => {
                await result.current.handleSubmit();
            });

            expect(result.current.submitError).toBe('Submission failed');
            expect(result.current.isSubmitting).toBe(false);
        });

        it('should reset form after successful submission', async () => {
            const mockOnSubmit = jest.fn().mockResolvedValue(undefined);

            const { result } = renderHook(() =>
                useFormHandler({
                    schema: testSchema,
                    defaultValues,
                    onSubmit: mockOnSubmit,
                })
            );

            // Set data and submit
            act(() => {
                result.current.setValue('name', 'John Doe');
                result.current.setValue('email', 'john@example.com');
                result.current.setValue('age', 25);
            });

            await act(async () => {
                await result.current.handleSubmit();
            });

            expect(result.current.values).toEqual(defaultValues);
            expect(result.current.errors).toEqual({});
        });
    });

    describe('Field Management', () => {
        it('should update individual field values', () => {
            const { result } = renderHook(() =>
                useFormHandler({
                    schema: testSchema,
                    defaultValues,
                    onSubmit: jest.fn(),
                })
            );

            act(() => {
                result.current.setValue('name', 'Jane Doe');
            });

            expect(result.current.values.name).toBe('Jane Doe');
            expect(result.current.values.email).toBe('');
            expect(result.current.values.age).toBe(0);
        });

        it('should update multiple field values', () => {
            const { result } = renderHook(() =>
                useFormHandler({
                    schema: testSchema,
                    defaultValues,
                    onSubmit: jest.fn(),
                })
            );

            act(() => {
                result.current.setValues({
                    name: 'Jane Doe',
                    email: 'jane@example.com',
                    age: 30,
                });
            });

            expect(result.current.values).toEqual({
                name: 'Jane Doe',
                email: 'jane@example.com',
                age: 30,
            });
        });

        it('should reset individual fields', () => {
            const { result } = renderHook(() =>
                useFormHandler({
                    schema: testSchema,
                    defaultValues,
                    onSubmit: jest.fn(),
                })
            );

            // Set some values
            act(() => {
                result.current.setValue('name', 'Jane Doe');
                result.current.setValue('email', 'jane@example.com');
            });

            // Reset one field
            act(() => {
                result.current.resetField('name');
            });

            expect(result.current.values.name).toBe('');
            expect(result.current.values.email).toBe('jane@example.com');
        });

        it('should reset all fields', () => {
            const { result } = renderHook(() =>
                useFormHandler({
                    schema: testSchema,
                    defaultValues,
                    onSubmit: jest.fn(),
                })
            );

            // Set some values
            act(() => {
                result.current.setValues({
                    name: 'Jane Doe',
                    email: 'jane@example.com',
                    age: 30,
                });
            });

            // Reset all
            act(() => {
                result.current.reset();
            });

            expect(result.current.values).toEqual(defaultValues);
            expect(result.current.errors).toEqual({});
        });
    });

    describe('Form State', () => {
        it('should track dirty state', () => {
            const { result } = renderHook(() =>
                useFormHandler({
                    schema: testSchema,
                    defaultValues,
                    onSubmit: jest.fn(),
                })
            );

            expect(result.current.isDirty).toBe(false);

            act(() => {
                result.current.setValue('name', 'John Doe');
            });

            expect(result.current.isDirty).toBe(true);
        });

        it('should track touched state', () => {
            const { result } = renderHook(() =>
                useFormHandler({
                    schema: testSchema,
                    defaultValues,
                    onSubmit: jest.fn(),
                })
            );

            expect(result.current.touched).toEqual({});

            act(() => {
                result.current.handleBlur('name');
            });

            expect(result.current.touched.name).toBe(true);
        });

        it('should track submission state', async () => {
            const mockOnSubmit = jest.fn().mockImplementation(() =>
                new Promise(resolve => setTimeout(resolve, 100))
            );

            const { result } = renderHook(() =>
                useFormHandler({
                    schema: testSchema,
                    defaultValues,
                    onSubmit: mockOnSubmit,
                })
            );

            // Set valid data
            act(() => {
                result.current.setValues({
                    name: 'John Doe',
                    email: 'john@example.com',
                    age: 25,
                });
            });

            // Start submission
            act(() => {
                result.current.handleSubmit();
            });

            expect(result.current.isSubmitting).toBe(true);

            // Wait for completion
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 150));
            });

            expect(result.current.isSubmitting).toBe(false);
        });
    });

    describe('Custom Validation', () => {
        it('should support custom validation functions', () => {
            const customSchema = z.object({
                password: z.string().min(8, 'Password too short'),
                confirmPassword: z.string(),
            }).refine(data => data.password === data.confirmPassword, {
                message: 'Passwords do not match',
                path: ['confirmPassword'],
            });

            const { result } = renderHook(() =>
                useFormHandler({
                    schema: customSchema,
                    defaultValues: { password: '', confirmPassword: '' },
                    onSubmit: jest.fn(),
                })
            );

            act(() => {
                result.current.setValues({
                    password: 'password123',
                    confirmPassword: 'different123',
                });
            });

            expect(result.current.isValid).toBe(false);
            expect(result.current.errors.confirmPassword).toBe('Passwords do not match');
        });
    });
});
