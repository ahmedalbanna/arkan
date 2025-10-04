import {
    arrayBufferToBase64,
    cn,
    generateRandomPassword,
} from '@/lib/utils';

describe('Utility Functions', () => {
    describe('cn (className utility)', () => {
        it('should merge class names correctly', () => {
            const result = cn('class1', 'class2');
            expect(result).toBe('class1 class2');
        });

        it('should handle conditional classes', () => {
            const result = cn('base', { 'conditional': true, 'hidden': false });
            expect(result).toContain('base');
            expect(result).toContain('conditional');
            expect(result).not.toContain('hidden');
        });

        it('should handle undefined and null values', () => {
            const result = cn('base', undefined, null, 'valid');
            expect(result).toBe('base valid');
        });

        it('should merge Tailwind classes correctly', () => {
            const result = cn('px-2 py-1', 'px-4 py-2');
            // Tailwind merge should handle conflicting classes
            expect(result).toContain('py-2'); // Last one should win
        });
    });

    describe('generateRandomPassword', () => {
        it('should generate password of specified length', () => {
            const password = generateRandomPassword(10);
            expect(password).toHaveLength(10);
        });

        it('should generate different passwords', () => {
            const password1 = generateRandomPassword(8);
            const password2 = generateRandomPassword(8);

            expect(password1).not.toBe(password2);
        });

        it('should contain only valid characters', () => {
            const password = generateRandomPassword(20);
            const validChars = /^[a-zA-Z0-9]+$/;
            expect(password).toMatch(validChars);
        });

        it('should handle zero length', () => {
            const password = generateRandomPassword(0);
            expect(password).toBe('');
        });

        it('should handle negative length gracefully', () => {
            const password = generateRandomPassword(-5);
            expect(password).toBe('');
        });

        it('should generate passwords with mixed case and numbers', () => {
            const password = generateRandomPassword(100);
            const hasLowercase = /[a-z]/.test(password);
            const hasUppercase = /[A-Z]/.test(password);
            const hasNumbers = /[0-9]/.test(password);

            expect(hasLowercase).toBe(true);
            expect(hasUppercase).toBe(true);
            expect(hasNumbers).toBe(true);
        });
    });

    describe('arrayBufferToBase64', () => {
        it('should convert ArrayBuffer to base64', () => {
            const testString = 'Hello World';
            const buffer = new TextEncoder().encode(testString);
            const base64 = arrayBufferToBase64(buffer);

            expect(typeof base64).toBe('string');
            expect(base64.length).toBeGreaterThan(0);
        });

        it('should handle empty ArrayBuffer', () => {
            const buffer = new ArrayBuffer(0);
            const base64 = arrayBufferToBase64(buffer);

            expect(base64).toBe('');
        });

        it('should produce valid base64 output', () => {
            const testData = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
            const base64 = arrayBufferToBase64(testData.buffer);

            // Valid base64 should only contain A-Z, a-z, 0-9, +, /, and =
            const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
            expect(base64).toMatch(base64Regex);
        });

        it('should handle binary data correctly', () => {
            const binaryData = new Uint8Array([0, 1, 2, 3, 255, 254, 253]);
            const base64 = arrayBufferToBase64(binaryData.buffer);

            expect(typeof base64).toBe('string');
            expect(base64.length).toBeGreaterThan(0);
        });

        it('should be reversible with atob', () => {
            const originalData = 'Test data for base64 conversion';
            const buffer = new TextEncoder().encode(originalData);
            const base64 = arrayBufferToBase64(buffer);

            // Convert back using atob
            const decoded = atob(base64);
            expect(decoded).toBe(originalData);
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should handle very long passwords', () => {
            const password = generateRandomPassword(10000);
            expect(password).toHaveLength(10000);
        });

        it('should handle large ArrayBuffer', () => {
            const largeData = new Uint8Array(10000).fill(65); // Fill with 'A'
            const base64 = arrayBufferToBase64(largeData.buffer);

            expect(typeof base64).toBe('string');
            expect(base64.length).toBeGreaterThan(0);
        });

        it('should handle special characters in class names', () => {
            const result = cn('class-with-dashes', 'class_with_underscores');
            expect(result).toContain('class-with-dashes');
            expect(result).toContain('class_with_underscores');
        });
    });

    describe('Performance', () => {
        it('should generate passwords quickly', () => {
            const startTime = performance.now();

            for (let i = 0; i < 1000; i++) {
                generateRandomPassword(16);
            }

            const endTime = performance.now();
            const duration = endTime - startTime;

            expect(duration).toBeLessThan(1000); // Should complete within 1 second
        });

        it('should convert ArrayBuffer to base64 quickly', () => {
            const testData = new Uint8Array(1000).fill(65);
            const startTime = performance.now();

            for (let i = 0; i < 100; i++) {
                arrayBufferToBase64(testData.buffer);
            }

            const endTime = performance.now();
            const duration = endTime - startTime;

            expect(duration).toBeLessThan(200); // Should complete within 200ms
        });

        it('should merge class names efficiently', () => {
            const classes = Array.from({ length: 100 }, (_, i) => `class-${i}`);
            const startTime = performance.now();

            const result = cn(...classes);

            const endTime = performance.now();
            const duration = endTime - startTime;

            expect(duration).toBeLessThan(50); // Should complete within 50ms
            expect(result).toContain('class-0');
            expect(result).toContain('class-99');
        });
    });
});
