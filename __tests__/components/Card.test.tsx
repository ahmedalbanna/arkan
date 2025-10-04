import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { render, screen } from '@testing-library/react';

describe('Card Components', () => {
    describe('Card', () => {
        it('should render with default props', () => {
            render(<Card>Card content</Card>);
            const card = screen.getByText('Card content');
            expect(card).toBeInTheDocument();
            expect(card).toHaveClass('rounded-lg', 'border', 'bg-card');
        });

        it('should render with custom className', () => {
            render(<Card className="custom-card">Custom card</Card>);
            const card = screen.getByText('Custom card');
            expect(card).toHaveClass('custom-card');
        });

        it('should render as different HTML elements', () => {
            const { rerender } = render(<Card asChild><div>Div card</div></Card>);
            expect(screen.getByText('Div card')).toBeInTheDocument();

            rerender(<Card asChild><section>Section card</section></Card>);
            expect(screen.getByText('Section card')).toBeInTheDocument();
        });
    });

    describe('CardHeader', () => {
        it('should render with default styling', () => {
            render(
                <Card>
                    <CardHeader>Header content</CardHeader>
                </Card>
            );
            const header = screen.getByText('Header content');
            expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6');
        });

        it('should render with custom className', () => {
            render(
                <Card>
                    <CardHeader className="custom-header">Custom header</CardHeader>
                </Card>
            );
            const header = screen.getByText('Custom header');
            expect(header).toHaveClass('custom-header');
        });
    });

    describe('CardTitle', () => {
        it('should render with default styling', () => {
            render(
                <Card>
                    <CardHeader>
                        <CardTitle>Card Title</CardTitle>
                    </CardHeader>
                </Card>
            );
            const title = screen.getByText('Card Title');
            expect(title).toHaveClass('text-2xl', 'font-semibold', 'leading-none', 'tracking-tight');
        });

        it('should render as different heading levels', () => {
            const { rerender } = render(
                <Card>
                    <CardHeader>
                        <CardTitle asChild><h1>H1 Title</h1></CardTitle>
                    </CardHeader>
                </Card>
            );
            expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();

            rerender(
                <Card>
                    <CardHeader>
                        <CardTitle asChild><h2>H2 Title</h2></CardTitle>
                    </CardHeader>
                </Card>
            );
            expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
        });
    });

    describe('CardDescription', () => {
        it('should render with default styling', () => {
            render(
                <Card>
                    <CardHeader>
                        <CardDescription>Card description</CardDescription>
                    </CardHeader>
                </Card>
            );
            const description = screen.getByText('Card description');
            expect(description).toHaveClass('text-sm', 'text-muted-foreground');
        });

        it('should render with custom className', () => {
            render(
                <Card>
                    <CardHeader>
                        <CardDescription className="custom-desc">Custom description</CardDescription>
                    </CardHeader>
                </Card>
            );
            const description = screen.getByText('Custom description');
            expect(description).toHaveClass('custom-desc');
        });
    });

    describe('CardContent', () => {
        it('should render with default styling', () => {
            render(
                <Card>
                    <CardContent>Card content</CardContent>
                </Card>
            );
            const content = screen.getByText('Card content');
            expect(content).toHaveClass('p-6', 'pt-0');
        });

        it('should render with custom className', () => {
            render(
                <Card>
                    <CardContent className="custom-content">Custom content</CardContent>
                </Card>
            );
            const content = screen.getByText('Custom content');
            expect(content).toHaveClass('custom-content');
        });
    });

    describe('CardFooter', () => {
        it('should render with default styling', () => {
            render(
                <Card>
                    <CardFooter>Footer content</CardFooter>
                </Card>
            );
            const footer = screen.getByText('Footer content');
            expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0');
        });

        it('should render with custom className', () => {
            render(
                <Card>
                    <CardFooter className="custom-footer">Custom footer</CardFooter>
                </Card>
            );
            const footer = screen.getByText('Custom footer');
            expect(footer).toHaveClass('custom-footer');
        });
    });

    describe('Complete Card Structure', () => {
        it('should render a complete card with all components', () => {
            render(
                <Card>
                    <CardHeader>
                        <CardTitle>Test Card</CardTitle>
                        <CardDescription>This is a test card description</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>This is the main content of the card.</p>
                    </CardContent>
                    <CardFooter>
                        <button>Action Button</button>
                    </CardFooter>
                </Card>
            );

            expect(screen.getByText('Test Card')).toBeInTheDocument();
            expect(screen.getByText('This is a test card description')).toBeInTheDocument();
            expect(screen.getByText('This is the main content of the card.')).toBeInTheDocument();
            expect(screen.getByText('Action Button')).toBeInTheDocument();
        });

        it('should handle nested content correctly', () => {
            render(
                <Card>
                    <CardHeader>
                        <CardTitle>Nested Card</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div>
                            <h3>Nested Heading</h3>
                            <ul>
                                <li>Item 1</li>
                                <li>Item 2</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            );

            expect(screen.getByText('Nested Card')).toBeInTheDocument();
            expect(screen.getByText('Nested Heading')).toBeInTheDocument();
            expect(screen.getByText('Item 1')).toBeInTheDocument();
            expect(screen.getByText('Item 2')).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should have proper heading hierarchy', () => {
            render(
                <Card>
                    <CardHeader>
                        <CardTitle asChild><h1>Main Title</h1></CardTitle>
                        <CardDescription>Description</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <h2>Content Heading</h2>
                    </CardContent>
                </Card>
            );

            const mainTitle = screen.getByRole('heading', { level: 1 });
            const contentHeading = screen.getByRole('heading', { level: 2 });

            expect(mainTitle).toBeInTheDocument();
            expect(contentHeading).toBeInTheDocument();
        });

        it('should support ARIA attributes', () => {
            render(
                <Card aria-label="Test card" role="article">
                    <CardHeader>
                        <CardTitle>ARIA Card</CardTitle>
                    </CardHeader>
                </Card>
            );

            const card = screen.getByRole('article');
            expect(card).toHaveAttribute('aria-label', 'Test card');
        });
    });

    describe('Performance', () => {
        it('should not re-render unnecessarily', () => {
            const renderSpy = jest.fn();
            const TestComponent = () => {
                renderSpy();
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Test</CardTitle>
                        </CardHeader>
                    </Card>
                );
            };

            const { rerender } = render(<TestComponent />);
            expect(renderSpy).toHaveBeenCalledTimes(1);

            rerender(<TestComponent />);
            expect(renderSpy).toHaveBeenCalledTimes(2);
        });

        it('should handle many cards efficiently', () => {
            const startTime = performance.now();

            render(
                <div>
                    {Array.from({ length: 100 }, (_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <CardTitle>Card {i}</CardTitle>
                            </CardHeader>
                            <CardContent>Content {i}</CardContent>
                        </Card>
                    ))}
                </div>
            );

            const endTime = performance.now();
            const duration = endTime - startTime;

            expect(duration).toBeLessThan(1000); // Should complete within 1 second
            expect(screen.getByText('Card 0')).toBeInTheDocument();
            expect(screen.getByText('Card 99')).toBeInTheDocument();
        });
    });
});
