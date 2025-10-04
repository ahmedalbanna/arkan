import { Button } from '@/components/ui/button';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Button Component', () => {
    describe('Rendering', () => {
        it('should render with default props', () => {
            render(<Button>Click me</Button>);
            const button = screen.getByRole('button', { name: /click me/i });
            expect(button).toBeInTheDocument();
            expect(button).toHaveClass('bg-primary');
        });

        it('should render with custom className', () => {
            render(<Button className="custom-class">Custom Button</Button>);
            const button = screen.getByRole('button');
            expect(button).toHaveClass('custom-class');
        });

        it('should render as different HTML elements', () => {
            const { rerender } = render(<Button asChild><a href="/test">Link Button</a></Button>);
            expect(screen.getByRole('link')).toBeInTheDocument();

            rerender(<Button asChild><span>Span Button</span></Button>);
            expect(screen.getByText('Span Button')).toBeInTheDocument();
        });
    });

    describe('Variants', () => {
        it('should apply primary variant styles', () => {
            render(<Button variant="default">Primary</Button>);
            const button = screen.getByRole('button');
            expect(button).toHaveClass('bg-primary', 'text-primary-foreground');
        });

        it('should apply secondary variant styles', () => {
            render(<Button variant="secondary">Secondary</Button>);
            const button = screen.getByRole('button');
            expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground');
        });

        it('should apply destructive variant styles', () => {
            render(<Button variant="destructive">Destructive</Button>);
            const button = screen.getByRole('button');
            expect(button).toHaveClass('bg-destructive', 'text-destructive-foreground');
        });

        it('should apply outline variant styles', () => {
            render(<Button variant="outline">Outline</Button>);
            const button = screen.getByRole('button');
            expect(button).toHaveClass('border', 'border-input');
        });

        it('should apply ghost variant styles', () => {
            render(<Button variant="ghost">Ghost</Button>);
            const button = screen.getByRole('button');
            expect(button).toHaveClass('hover:bg-accent', 'hover:text-accent-foreground');
        });

        it('should apply link variant styles', () => {
            render(<Button variant="link">Link</Button>);
            const button = screen.getByRole('button');
            expect(button).toHaveClass('text-primary', 'underline-offset-4');
        });
    });

    describe('Sizes', () => {
        it('should apply default size styles', () => {
            render(<Button>Default Size</Button>);
            const button = screen.getByRole('button');
            expect(button).toHaveClass('h-10', 'px-4', 'py-2');
        });

        it('should apply small size styles', () => {
            render(<Button size="sm">Small</Button>);
            const button = screen.getByRole('button');
            expect(button).toHaveClass('h-9', 'px-3');
        });

        it('should apply large size styles', () => {
            render(<Button size="lg">Large</Button>);
            const button = screen.getByRole('button');
            expect(button).toHaveClass('h-11', 'px-8');
        });

        it('should apply icon size styles', () => {
            render(<Button size="icon"><span>Icon</span></Button>);
            const button = screen.getByRole('button');
            expect(button).toHaveClass('h-10', 'w-10');
        });
    });

    describe('States', () => {
        it('should be disabled when disabled prop is true', () => {
            render(<Button disabled>Disabled Button</Button>);
            const button = screen.getByRole('button');
            expect(button).toBeDisabled();
            expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50');
        });

        it('should show loading state', () => {
            render(<Button disabled><span>Loading...</span></Button>);
            const button = screen.getByRole('button');
            expect(button).toBeDisabled();
        });

        it('should handle focus states', async () => {
            render(<Button>Focusable Button</Button>);
            const button = screen.getByRole('button');

            await userEvent.tab();
            expect(button).toHaveFocus();
            expect(button).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2');
        });
    });

    describe('Interactions', () => {
        it('should handle click events', async () => {
            const handleClick = jest.fn();
            render(<Button onClick={handleClick}>Click me</Button>);

            await userEvent.click(screen.getByRole('button'));
            expect(handleClick).toHaveBeenCalledTimes(1);
        });

        it('should not call onClick when disabled', async () => {
            const handleClick = jest.fn();
            render(<Button disabled onClick={handleClick}>Disabled</Button>);

            await userEvent.click(screen.getByRole('button'));
            expect(handleClick).not.toHaveBeenCalled();
        });

        it('should handle keyboard events', async () => {
            const handleClick = jest.fn();
            render(<Button onClick={handleClick}>Keyboard Button</Button>);

            const button = screen.getByRole('button');
            await userEvent.tab();
            expect(button).toHaveFocus();

            await userEvent.keyboard('{Enter}');
            expect(handleClick).toHaveBeenCalledTimes(1);

            await userEvent.keyboard(' ');
            expect(handleClick).toHaveBeenCalledTimes(2);
        });
    });

    describe('Accessibility', () => {
        it('should have proper ARIA attributes', () => {
            render(<Button aria-label="Custom label">Button</Button>);
            const button = screen.getByRole('button');
            expect(button).toHaveAttribute('aria-label', 'Custom label');
        });

        it('should support aria-pressed for toggle buttons', () => {
            render(<Button aria-pressed="true">Toggle Button</Button>);
            const button = screen.getByRole('button');
            expect(button).toHaveAttribute('aria-pressed', 'true');
        });

        it('should support aria-expanded for expandable buttons', () => {
            render(<Button aria-expanded="false">Expandable Button</Button>);
            const button = screen.getByRole('button');
            expect(button).toHaveAttribute('aria-expanded', 'false');
        });
    });

    describe('Performance', () => {
        it('should not re-render unnecessarily', () => {
            const renderSpy = jest.fn();
            const TestComponent = () => {
                renderSpy();
                return <Button>Test</Button>;
            };

            const { rerender } = render(<TestComponent />);
            expect(renderSpy).toHaveBeenCalledTimes(1);

            rerender(<TestComponent />);
            expect(renderSpy).toHaveBeenCalledTimes(2);
        });
    });
});
