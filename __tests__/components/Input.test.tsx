import { Input } from '@/components/ui/input';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

describe('Input Component', () => {
    describe('Basic Rendering', () => {
        it('should render with default props', () => {
            render(<Input />);
            const input = screen.getByRole('textbox');
            expect(input).toBeInTheDocument();
            expect(input).toHaveClass('flex', 'h-10', 'w-full');
        });

        it('should render with placeholder', () => {
            render(<Input placeholder="Enter your name" />);
            const input = screen.getByPlaceholderText('Enter your name');
            expect(input).toBeInTheDocument();
        });

        it('should render with value', () => {
            render(<Input value="John Doe" readOnly />);
            const input = screen.getByDisplayValue('John Doe');
            expect(input).toBeInTheDocument();
        });

        it('should render with custom className', () => {
            render(<Input className="custom-input" />);
            const input = screen.getByRole('textbox');
            expect(input).toHaveClass('custom-input');
        });
    });

    describe('Input Types', () => {
        it('should render as text input by default', () => {
            render(<Input />);
            const input = screen.getByRole('textbox');
            expect(input).toHaveAttribute('type', 'text');
        });

        it('should render as email input', () => {
            render(<Input type="email" />);
            const input = screen.getByRole('textbox');
            expect(input).toHaveAttribute('type', 'email');
        });

        it('should render as password input', () => {
            render(<Input type="password" />);
            const input = screen.getByRole('textbox');
            expect(input).toHaveAttribute('type', 'password');
        });

        it('should render as number input', () => {
            render(<Input type="number" />);
            const input = screen.getByRole('spinbutton');
            expect(input).toHaveAttribute('type', 'number');
        });

        it('should render as search input', () => {
            render(<Input type="search" />);
            const input = screen.getByRole('searchbox');
            expect(input).toHaveAttribute('type', 'search');
        });
    });

    describe('User Interactions', () => {
        it('should handle text input', async () => {
            const handleChange = jest.fn();
            render(<Input onChange={handleChange} />);

            const input = screen.getByRole('textbox');
            await userEvent.type(input, 'Hello World');

            expect(handleChange).toHaveBeenCalledTimes(11); // One for each character
            expect(input).toHaveValue('Hello World');
        });

        it('should handle focus and blur events', async () => {
            const handleFocus = jest.fn();
            const handleBlur = jest.fn();
            render(<Input onFocus={handleFocus} onBlur={handleBlur} />);

            const input = screen.getByRole('textbox');

            await userEvent.click(input);
            expect(handleFocus).toHaveBeenCalledTimes(1);
            expect(input).toHaveFocus();

            await userEvent.tab();
            expect(handleBlur).toHaveBeenCalledTimes(1);
        });

        it('should handle keyboard events', async () => {
            const handleKeyDown = jest.fn();
            const handleKeyUp = jest.fn();
            render(<Input onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} />);

            const input = screen.getByRole('textbox');
            await userEvent.click(input);

            await userEvent.keyboard('a');
            expect(handleKeyDown).toHaveBeenCalledTimes(1);
            expect(handleKeyUp).toHaveBeenCalledTimes(1);
        });

        it('should handle Enter key submission', async () => {
            const handleKeyDown = jest.fn();
            render(<Input onKeyDown={handleKeyDown} />);

            const input = screen.getByRole('textbox');
            await userEvent.click(input);
            await userEvent.keyboard('{Enter}');

            expect(handleKeyDown).toHaveBeenCalledWith(
                expect.objectContaining({ key: 'Enter' })
            );
        });
    });

    describe('Form Integration', () => {
        it('should work with form submission', async () => {
            const handleSubmit = jest.fn((e) => e.preventDefault());
            render(
                <form onSubmit={handleSubmit}>
                    <Input name="username" defaultValue="testuser" />
                    <button type="submit">Submit</button>
                </form>
            );

            await userEvent.click(screen.getByRole('button'));
            expect(handleSubmit).toHaveBeenCalledTimes(1);
        });

        it('should be required when required prop is set', () => {
            render(<Input required />);
            const input = screen.getByRole('textbox');
            expect(input).toBeRequired();
        });

        it('should have proper form validation', async () => {
            render(<Input required minLength={3} />);
            const input = screen.getByRole('textbox');

            await userEvent.type(input, 'ab');
            await userEvent.tab();

            expect(input).toBeInvalid();
        });
    });

    describe('Disabled State', () => {
        it('should be disabled when disabled prop is true', () => {
            render(<Input disabled />);
            const input = screen.getByRole('textbox');
            expect(input).toBeDisabled();
        });

        it('should not accept input when disabled', async () => {
            const handleChange = jest.fn();
            render(<Input disabled onChange={handleChange} />);

            const input = screen.getByRole('textbox');
            await userEvent.type(input, 'test');

            expect(handleChange).not.toHaveBeenCalled();
            expect(input).toHaveValue('');
        });

        it('should not be focusable when disabled', async () => {
            render(<Input disabled />);
            const input = screen.getByRole('textbox');

            await userEvent.tab();
            expect(input).not.toHaveFocus();
        });
    });

    describe('Read-only State', () => {
        it('should be read-only when readOnly prop is true', () => {
            render(<Input readOnly />);
            const input = screen.getByRole('textbox');
            expect(input).toHaveAttribute('readonly');
        });

        it('should accept focus when read-only', async () => {
            render(<Input readOnly />);
            const input = screen.getByRole('textbox');

            await userEvent.click(input);
            expect(input).toHaveFocus();
        });

        it('should not accept text input when read-only', async () => {
            const handleChange = jest.fn();
            render(<Input readOnly onChange={handleChange} />);

            const input = screen.getByRole('textbox');
            await userEvent.type(input, 'test');

            expect(handleChange).not.toHaveBeenCalled();
        });
    });

    describe('Error States', () => {
        it('should show error styling when error prop is provided', () => {
            render(<Input error="This field is required" />);
            const input = screen.getByRole('textbox');
            expect(input).toHaveClass('border-destructive');
        });

        it('should display error message', () => {
            render(<Input error="This field is required" />);
            expect(screen.getByText('This field is required')).toBeInTheDocument();
        });

        it('should have proper ARIA attributes for errors', () => {
            render(<Input error="This field is required" />);
            const input = screen.getByRole('textbox');
            expect(input).toHaveAttribute('aria-invalid', 'true');
            expect(input).toHaveAttribute('aria-describedby');
        });
    });

    describe('Accessibility', () => {
        it('should have proper ARIA labels', () => {
            render(<Input aria-label="Username input" />);
            const input = screen.getByLabelText('Username input');
            expect(input).toBeInTheDocument();
        });

        it('should support aria-describedby', () => {
            render(
                <div>
                    <Input aria-describedby="help-text" />
                    <div id="help-text">This is help text</div>
                </div>
            );
            const input = screen.getByRole('textbox');
            expect(input).toHaveAttribute('aria-describedby', 'help-text');
        });

        it('should support aria-required', () => {
            render(<Input aria-required="true" />);
            const input = screen.getByRole('textbox');
            expect(input).toHaveAttribute('aria-required', 'true');
        });

        it('should support aria-invalid', () => {
            render(<Input aria-invalid="true" />);
            const input = screen.getByRole('textbox');
            expect(input).toHaveAttribute('aria-invalid', 'true');
        });
    });

    describe('Performance', () => {
        it('should not re-render unnecessarily', () => {
            const renderSpy = jest.fn();
            const TestComponent = () => {
                renderSpy();
                return <Input defaultValue="test" />;
            };

            const { rerender } = render(<TestComponent />);
            expect(renderSpy).toHaveBeenCalledTimes(1);

            rerender(<TestComponent />);
            expect(renderSpy).toHaveBeenCalledTimes(2);
        });

        it('should handle rapid input changes efficiently', async () => {
            const handleChange = jest.fn();
            render(<Input onChange={handleChange} />);

            const input = screen.getByRole('textbox');
            const startTime = performance.now();

            // Simulate rapid typing
            for (let i = 0; i < 100; i++) {
                await userEvent.type(input, 'a');
            }

            const endTime = performance.now();
            const duration = endTime - startTime;

            expect(duration).toBeLessThan(1000); // Should complete within 1 second
            expect(handleChange).toHaveBeenCalledTimes(100);
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty string values', () => {
            render(<Input value="" />);
            const input = screen.getByRole('textbox');
            expect(input).toHaveValue('');
        });

        it('should handle null values gracefully', () => {
            render(<Input value={null as any} />);
            const input = screen.getByRole('textbox');
            expect(input).toHaveValue('');
        });

        it('should handle undefined values gracefully', () => {
            render(<Input value={undefined as any} />);
            const input = screen.getByRole('textbox');
            expect(input).toHaveValue('');
        });

        it('should handle very long input values', async () => {
            const longText = 'a'.repeat(10000);
            render(<Input />);

            const input = screen.getByRole('textbox');
            await userEvent.type(input, longText);

            expect(input).toHaveValue(longText);
        });

        it('should handle special characters', async () => {
            const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
            render(<Input />);

            const input = screen.getByRole('textbox');
            await userEvent.type(input, specialChars);

            expect(input).toHaveValue(specialChars);
        });

        it('should handle unicode characters', async () => {
            const unicodeText = 'Hello 世界 🌍 مرحبا';
            render(<Input />);

            const input = screen.getByRole('textbox');
            await userEvent.type(input, unicodeText);

            expect(input).toHaveValue(unicodeText);
        });
    });

    describe('Controlled vs Uncontrolled', () => {
        it('should work as controlled component', async () => {
            const TestComponent = () => {
                const [value, setValue] = React.useState('');
                return <Input value={value} onChange={(e) => setValue(e.target.value)} />;
            };

            render(<TestComponent />);
            const input = screen.getByRole('textbox');

            await userEvent.type(input, 'test');
            expect(input).toHaveValue('test');
        });

        it('should work as uncontrolled component', async () => {
            render(<Input defaultValue="initial" />);
            const input = screen.getByRole('textbox');

            expect(input).toHaveValue('initial');

            await userEvent.clear(input);
            await userEvent.type(input, 'new value');
            expect(input).toHaveValue('new value');
        });
    });
});
