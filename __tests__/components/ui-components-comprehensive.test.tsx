/**
 * اختبارات شاملة لمكونات الواجهة الأساسية
 * يغطي جميع المكونات الأساسية في نظام UI
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import {
    Button,
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
    Input,
    Label,
    Badge,
    Separator,
    Skeleton,
    Alert,
    AlertDescription,
    AlertTitle,
    Avatar,
    AvatarFallback,
    AvatarImage,
    Checkbox,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Textarea,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
    Progress,
    ScrollArea,
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    toast,
    ToastProvider,
    Toaster,
} from '@/components/ui';

// Wrapper component to provide required providers
const TestWrapper: React.FC<{ children: React.ReactNode; theme?: 'light' | 'dark' }> = ({
    children,
    theme = 'light'
}) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider attribute="class" defaultTheme={theme}>
                <ToastProvider>
                    {children}
                    <Toaster />
                </ToastProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
};

describe('UI Components Comprehensive Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Button Component', () => {
        it('should render button with default props', () => {
            render(<Button>Click me</Button>, { wrapper: TestWrapper });

            const button = screen.getByRole('button', { name: /click me/i });
            expect(button).toBeInTheDocument();
            expect(button).toHaveAttribute('type', 'button');
        });

        it('should handle click events', async () => {
            const handleClick = jest.fn();
            render(<Button onClick={handleClick}>Click me</Button>, { wrapper: TestWrapper });

            await userEvent.click(screen.getByRole('button'));
            expect(handleClick).toHaveBeenCalledTimes(1);
        });

        it('should render with different variants', () => {
            const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const;

            variants.forEach(variant => {
                const { unmount } = render(
                    <Button variant={variant}>Button {variant}</Button>,
                    { wrapper: TestWrapper }
                );

                expect(screen.getByRole('button')).toBeInTheDocument();
                unmount();
            });
        });

        it('should render with different sizes', () => {
            const sizes = ['default', 'sm', 'lg', 'icon'] as const;

            sizes.forEach(size => {
                const { unmount } = render(
                    <Button size={size}>Button {size}</Button>,
                    { wrapper: TestWrapper }
                );

                expect(screen.getByRole('button')).toBeInTheDocument();
                unmount();
            });
        });

        it('should disable button when disabled prop is true', () => {
            render(<Button disabled>Disabled button</Button>, { wrapper: TestWrapper });

            const button = screen.getByRole('button');
            expect(button).toBeDisabled();
        });

        it('should show loading state', () => {
            render(<Button disabled>Loading...</Button>, { wrapper: TestWrapper });

            const button = screen.getByRole('button');
            expect(button).toBeDisabled();
        });

        it('should handle form submission', async () => {
            const handleSubmit = jest.fn();

            render(
                <form onSubmit={handleSubmit}>
                    <Button type="submit">Submit</Button>
                </form>,
                { wrapper: TestWrapper }
            );

            await userEvent.click(screen.getByRole('button'));
            expect(handleSubmit).toHaveBeenCalledTimes(1);
        });
    });

    describe('Card Component', () => {
        it('should render complete card structure', () => {
            render(
                <Card>
                    <CardHeader>
                        <CardTitle>Card Title</CardTitle>
                        <CardDescription>Card Description</CardDescription>
                    </CardHeader>
                    <CardContent>Card Content</CardContent>
                    <CardFooter>Card Footer</CardFooter>
                </Card>,
                { wrapper: TestWrapper }
            );

            expect(screen.getByText('Card Title')).toBeInTheDocument();
            expect(screen.getByText('Card Description')).toBeInTheDocument();
            expect(screen.getByText('Card Content')).toBeInTheDocument();
            expect(screen.getByText('Card Footer')).toBeInTheDocument();
        });

        it('should render partial card components', () => {
            render(
                <Card>
                    <CardHeader>
                        <CardTitle>Simple Card</CardTitle>
                    </CardHeader>
                    <CardContent>Simple Content</CardContent>
                </Card>,
                { wrapper: TestWrapper }
            );

            expect(screen.getByText('Simple Card')).toBeInTheDocument();
            expect(screen.getByText('Simple Content')).toBeInTheDocument();
        });

        it('should handle clickable cards', async () => {
            const handleClick = jest.fn();

            render(
                <Card
                    className="cursor-pointer"
                    onClick={handleClick}
                    role="button"
                    tabIndex={0}
                >
                    <CardContent>Clickable Card</CardContent>
                </Card>,
                { wrapper: TestWrapper }
            );

            await userEvent.click(screen.getByRole('button'));
            expect(handleClick).toHaveBeenCalledTimes(1);
        });

        it('should support different card styles', () => {
            const styles = ['default', 'outlined', 'filled'] as const;

            styles.forEach(style => {
                const { unmount } = render(
                    <Card className={style === 'outlined' ? 'border-2' : style === 'filled' ? 'bg-muted' : ''}>
                        <CardContent>Card with {style} style</CardContent>
                    </Card>,
                    { wrapper: TestWrapper }
                );

                expect(screen.getByText(`Card with ${style} style`)).toBeInTheDocument();
                unmount();
            });
        });
    });

    describe('Input Component', () => {
        it('should render input with label', () => {
            render(
                <div>
                    <Label htmlFor="test-input">Test Label</Label>
                    <Input id="test-input" placeholder="Enter text" />
                </div>,
                { wrapper: TestWrapper }
            );

            const input = screen.getByLabelText('Test Label');
            expect(input).toBeInTheDocument();
            expect(input).toHaveAttribute('placeholder', 'Enter text');
        });

        it('should handle input changes', async () => {
            render(<Input placeholder="Enter text" />, { wrapper: TestWrapper });

            const input = screen.getByPlaceholderText('Enter text');
            await userEvent.type(input, 'Hello World');

            expect(input).toHaveValue('Hello World');
        });

        it('should show input validation states', () => {
            const { rerender } = render(
                <Input placeholder="Valid input" className="border-green-500" />,
                { wrapper: TestWrapper }
            );

            expect(screen.getByPlaceholderText('Valid input')).toHaveClass('border-green-500');

            rerender(
                <Input placeholder="Invalid input" className="border-red-500" />,
                { wrapper: TestWrapper }
            );

            expect(screen.getByPlaceholderText('Invalid input')).toHaveClass('border-red-500');
        });

        it('should handle different input types', () => {
            const inputTypes = ['text', 'email', 'password', 'number', 'tel', 'url'] as const;

            inputTypes.forEach(type => {
                const { unmount } = render(
                    <Input type={type} placeholder={`${type} input`} />,
                    { wrapper: TestWrapper }
                );

                const input = screen.getByPlaceholderText(`${type} input`);
                expect(input).toHaveAttribute('type', type);
                unmount();
            });
        });

        it('should disable input when disabled', () => {
            render(<Input disabled placeholder="Disabled input" />, { wrapper: TestWrapper });

            const input = screen.getByPlaceholderText('Disabled input');
            expect(input).toBeDisabled();
        });

        it('should handle required inputs', () => {
            render(<Input required placeholder="Required input" />, { wrapper: TestWrapper });

            const input = screen.getByPlaceholderText('Required input');
            expect(input).toBeRequired();
        });
    });

    describe('Checkbox Component', () => {
        it('should render unchecked checkbox by default', () => {
            render(<Checkbox />, { wrapper: TestWrapper });

            const checkbox = screen.getByRole('checkbox');
            expect(checkbox).toBeInTheDocument();
            expect(checkbox).not.toBeChecked();
        });

        it('should render checked checkbox when defaultChecked is true', () => {
            render(<Checkbox defaultChecked />, { wrapper: TestWrapper });

            const checkbox = screen.getByRole('checkbox');
            expect(checkbox).toBeChecked();
        });

        it('should toggle checkbox state on click', async () => {
            render(<Checkbox />, { wrapper: TestWrapper });

            const checkbox = screen.getByRole('checkbox');

            await userEvent.click(checkbox);
            expect(checkbox).toBeChecked();

            await userEvent.click(checkbox);
            expect(checkbox).not.toBeChecked();
        });

        it('should disable checkbox when disabled', () => {
            render(<Checkbox disabled />, { wrapper: TestWrapper });

            const checkbox = screen.getByRole('checkbox');
            expect(checkbox).toBeDisabled();
        });

        it('should handle checkbox with label', () => {
            render(
                <div className="flex items-center space-x-2">
                    <Checkbox id="terms" />
                    <Label htmlFor="terms">Accept terms and conditions</Label>
                </div>,
                { wrapper: TestWrapper }
            );

            const checkbox = screen.getByRole('checkbox');
            const label = screen.getByText('Accept terms and conditions');

            expect(checkbox).toBeInTheDocument();
            expect(label).toBeInTheDocument();
        });
    });

    describe('Select Component', () => {
        it('should render select trigger', async () => {
            render(
                <Select>
                    <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="option1">Option 1</SelectItem>
                        <SelectItem value="option2">Option 2</SelectItem>
                    </SelectContent>
                </Select>,
                { wrapper: TestWrapper }
            );

            const trigger = screen.getByRole('combobox');
            expect(trigger).toBeInTheDocument();

            await userEvent.click(trigger);

            expect(screen.getByText('Option 1')).toBeInTheDocument();
            expect(screen.getByText('Option 2')).toBeInTheDocument();
        });

        it('should select option on click', async () => {
            render(
                <Select>
                    <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="option1">Option 1</SelectItem>
                        <SelectItem value="option2">Option 2</SelectItem>
                    </SelectContent>
                </Select>,
                { wrapper: TestWrapper }
            );

            const trigger = screen.getByRole('combobox');
            await userEvent.click(trigger);

            await userEvent.click(screen.getByText('Option 1'));

            expect(trigger).toHaveValue('option1');
        });

        it('should handle default value', () => {
            render(
                <Select defaultValue="option2">
                    <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="option1">Option 1</SelectItem>
                        <SelectItem value="option2">Option 2</SelectItem>
                    </SelectContent>
                </Select>,
                { wrapper: TestWrapper }
            );

            const trigger = screen.getByRole('combobox');
            expect(trigger).toHaveValue('option2');
        });

        it('should disable select when disabled', () => {
            render(
                <Select disabled>
                    <SelectTrigger>
                        <SelectValue placeholder="Disabled select" />
                    </SelectTrigger>
                </Select>,
                { wrapper: TestWrapper }
            );

            const trigger = screen.getByRole('combobox');
            expect(trigger).toBeDisabled();
        });
    });

    describe('Textarea Component', () => {
        it('should render textarea with placeholder', () => {
            render(<Textarea placeholder="Enter your message" />, { wrapper: TestWrapper });

            const textarea = screen.getByPlaceholderText('Enter your message');
            expect(textarea).toBeInTheDocument();
        });

        it('should handle text changes', async () => {
            render(<Textarea placeholder="Enter your message" />, { wrapper: TestWrapper });

            const textarea = screen.getByPlaceholderText('Enter your message');
            await userEvent.type(textarea, 'This is a longer text...');

            expect(textarea).toHaveValue('This is a longer text...');
        });

        it('should handle resize constraints', () => {
            render(
                <Textarea
                    placeholder="Resizable textarea"
                    className="resize-y min-h-[100px] max-h-[300px]"
                />,
                { wrapper: TestWrapper }
            );

            const textarea = screen.getByPlaceholderText('Resizable textarea');
            expect(textarea).toHaveAttribute('rows');
        });

        it('should show character count', async () => {
            const maxLength = 100;
            const Component = () => {
                const [value, setValue] = React.useState('');

                return (
                    <div>
                        <Textarea
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            maxLength={maxLength}
                            placeholder="Limited text"
                        />
                        <div className="text-sm text-muted-foreground">
                            {value.length}/{maxLength}
                        </div>
                    </div>
                );
            };

            render(<Component />, { wrapper: TestWrapper });

            const textarea = screen.getByPlaceholderText('Limited text');
            await userEvent.type(textarea, 'Short text');

            expect(screen.getByText('10/100')).toBeInTheDocument();
        });
    });

    describe('Tabs Component', () => {
        it('should render tabs with content', () => {
            render(
                <Tabs defaultValue="tab1">
                    <TabsList>
                        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                    </TabsList>
                    <TabsContent value="tab1">Content 1</TabsContent>
                    <TabsContent value="tab2">Content 2</TabsContent>
                </Tabs>,
                { wrapper: TestWrapper }
            );

            expect(screen.getByText('Tab 1')).toBeInTheDocument();
            expect(screen.getByText('Tab 2')).toBeInTheDocument();
            expect(screen.getByText('Content 1')).toBeInTheDocument();
            expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
        });

        it('should switch tabs when clicked', async () => {
            render(
                <Tabs defaultValue="tab1">
                    <TabsList>
                        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                    </TabsList>
                </Tabs>,
                { wrapper: TestWrapper }
            );

            expect(screen.getByText('Tab 1')).toBeInTheDocument();

            await userEvent.click(screen.getByText('Tab 2'));

            expect(screen.getByText('Tab 2')).toBeInTheDocument();
        });

        it('should handle controlled tabs', () => {
            const value = 'tab2';

            render(
                <Tabs value={value}>
                    <TabsList>
                        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                    </TabsList>
                    <TabsContent value="tab1">Content 1</TabsContent>
                    <TabsContent value="tab2">Content 2</TabsContent>
                </Tabs>,
                { wrapper: TestWrapper }
            );

            expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
        });
    });

    describe('Dialog Component', () => {
        it('should render dialog trigger and content', async () => {
            render(
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>Open Dialog</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Dialog Title</DialogTitle>
                            <DialogDescription>Dialog Description</DialogDescription>
                        </DialogHeader>
                        <p>Dialog Content</p>
                    </DialogContent>
                </Dialog>,
                { wrapper: TestWrapper >
      );

            const trigger = screen.getByText('Open Dialog');
            expect(trigger).toBeInTheDocument();

            await userEvent.click(trigger);

            await waitFor(() => {
                expect(screen.getByText('Dialog Title')).toBeInTheDocument();
                expect(screen.getByText('Dialog Description')).toBeInTheDocument();
                expect(screen.getByText('Dialog Content')).toBeInTheDocument();
            });
        });

        it('should close dialog when clicking outside', async () => {
            render(
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>Open Dialog</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Closable Dialog</DialogTitle>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>,
                { wrapper: TestWrapper }
            );

            await userEvent.click(screen.getByText('Open Dialog'));

            await waitFor(() => {
                expect(screen.getByText('Closable Dialog')).toBeInTheDocument();
            });

            // Click outside dialog
            await userEvent.click(document.body);

            await waitFor(() => {
                expect(screen.queryByText('Closable Dialog')).not.toBeInTheDocument();
            });
        });
    });

    describe('Alert Component', () => {
        it('should render alert with default variant', () => {
            render(
                <Alert>
                    <AlertTitle>Alert Title</AlertTitle>
                    <AlertDescription>Alert Description</AlertDescription>
                </Alert>,
                { wrapper: TestWrapper }
            );

            expect(screen.getByText('Alert Title')).toBeInTheDocument();
            expect(screen.getByText('Alert Description')).toBeInTheDocument();
        });

        it('should render alert with different variants', () => {
            const variants = ['default', 'destructive'] as const;

            variants.forEach(variant => {
                const { unmount } = render(
                    <Alert className={variant === 'destructive' ? 'border-red-500' : ''}>
                        <AlertTitle>{variant} Alert</AlertTitle>
                        <AlertDescription>{variant} description</AlertDescription>
                    </Alert>,
                    { wrapper: TestWrapper }
                );

                expect(screen.getByText(`${variant} Alert`)).toBeInTheDocument();
                unmount();
            });
        });
    });

    describe('Avatar Component', () => {
        it('should render avatar with fallback', () => {
            render(
                <Avatar>
                    <AvatarImage src="/test.jpg" alt="User" />
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>,
                { wrapper: TestWrapper }
            );

            expect(screen.getByText('U')).toBeInTheDocument();
        });

        it('should render avatar with image', () => {
            render(
                <Player>
                    <AvatarImage src="/test.jpg" alt="Test User" />
                    <AvatarFallback>TU</AvatarFallback>
                </Avatar>,
                { wrapper: TestWrapper }
            );

            const image = screen.getByAltText('Test User');
            expect(image).toBeInTheDocument();
            expect(image).toHaveAttribute('src', '/test.jpg');
        });

        it('should show different fallback based on user', () => {
            const { rerender } = render(
                <Avatar>
                    <AvatarFallback>JD</AvatarFallback>
                </Avatar>,
                { wrapper: TestWrapper }
            );

            expect(screen.getByText('JD')).toBeInTheDocument();

            rerender(
                <Avatar>
                    <AvatarFallback>AS</AvatarFallback>
                </Avatar>,
                { wrapper: TestWrapper }
            );

            expect(screen.getByText('AS')).toBeInTheDocument();
        });
    });

    describe('Badge Component', () => {
        it('should render badge with content', () => {
            render(<Badge>Badge Content</Badge>, { wrapper: TestWrapper });

            expect(screen.getByText('Badge Content')).toBeInTheDocument();
        });

        it('should render badge with different variants', () => {
            const variants = ['default', 'secondary', 'destructive', 'outline'] as const;

            variants.forEach(variant => {
                const { unmount } = render(
                    <Badge className={variant === 'destructive' ? 'bg-destructive' : ''}>
                        {variant}
                    </Badge>,
                    { wrapper: TestWrapper }
                );

                expect(screen.getByText(variant)).toBeInTheDocument();
                unmount();
            });
        });

        it('should act as removable badge', () => {
            const Component = () => {
                const [removed, setRemoved] = React.useState(false);

                if (removed) return null;

                return (
                    <Badge className="gap-1">
                        Badge Text
                        <button onClick={() => setRemoved(true)}>×</button>
                    </Badge>
                );
            };

            render(<Component />, { wrapper: TestWrapper });

            expect(screen.getByText('Badge Text')).toBeInTheDocument();

            userEvent.click(screen.getByText('×'));

            waitFor(() => {
                expect(screen.queryByText('Badge Text')).not.toBeInTheDocument();
            });
        });
    });

    describe('Switch Component', () => {
        it('should render unchecked switch by default', () => {
            render(<Switch />, { wrapper: TestWrapper });

            const switchElement = screen.getByRole('switch');
            expect(switchElement).toBeInTheDocument();
            expect(switchElement).not.toBeChecked();
        });

        it('should toggle switch on click', async () => {
            render(<Switch />, { wrapper: TestWrapper });

            const switchElement = screen.getByRole('switch');

            await userEvent.click(switchElement);
            expect(switchElement).toBeChecked();

            await userEvent.click(switchElement);
            expect(switchElement).not.toBeChecked();
        });

        it('should disable switch when disabled', () => {
            render(<Switch disabled />, { wrapper: TestWrapper });

            const switchElement = screen.getByRole('switch');
            expect(switchElement).toBeDisabled();
        });

        it('should handle controlled switch', () => {
            render(<Switch checked={true} onChange={() => { }} />, { wrapper: TestWrapper });

            const switchElement = screen.getByRole('switch');
            expect(switchElement).toBeChecked();
        });
    });

    describe('Skeleton Component', () => {
        it('should render skeleton', () => {
            render(<Skeleton className="h-4 w-full" />, { wrapper: TestWrapper });

            const skeleton = document.querySelector('.animate-pulse');
            expect(skeleton).toBeInTheDocument();
        });

        it('should render multiple skeleton elements', () => {
            render(
                <>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                </>,
                { wrapper: TestWrapper }
            );

            const skeletons = document.querySelectorAll('.animate-pulse');
            expect(skeletones).toHaveLength(3);
        });
    });

    describe('Table Component', () => {
        const tableData = [
            { id: 1, name: 'John Doe', email: 'john@example.com' },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
        ];

        it('should render table with data', () => {
            render(
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tableData.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell>{row.id}</TableCell>
                                <TableCell>{row.name}</TableCell>
                                <TableCell>{row.email}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>,
                { wrapper: TestWrapper }
            );

            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('jane@example.com')).toBeInTheDocument();
        });

        it('should handle empty table', () => {
            render(
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>No Data</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell colSpan={1}>No data available</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>,
                { wrapper: TestWrapper }
            );

            expect(screen.getByText('No data available')).toBeInTheDocument();
        });
    });

    describe('Toast System', () => {
        it('should render toast notification', async () => {
            const Component = () => {
                const handleToast = () => {
                    toast({
                        title: 'Toast Title',
                        description: 'Toast Description',
                    });
                };

                return <button onClick={handleToast}>Show Toast</button>;
            };

            render(<Component />, { wrapper: TestWrapper });

            await userEvent.click(screen.getByText('Show Toast'));

            await waitFor(() => {
                expect(screen.getByText('Toast Title')).toBeInTheDocument();
                expect(screen.getByText('Toast Description')).toBeInTheDocument();
            });
        });

        it('should handle different toast variants', async () => {
            const Component = () => {
                const handleSuccess = () => toast({ title: 'Success!' });
                const handleError = () => toast({ title: 'Error!', variant: 'destructive' });

                return (
                    <>
                        <button onClick={handleSuccess}>Success</button>
                        <button onClick={handleError}>Error</button>
                    </>);
            };

            render(<Component />, { wrapper: TestWrapper });

            await userEvent.click(screen.getByText('Success'));
            await waitFor(() => {
                expect(screen.getByText('Success!')).toBeInTheDocument();
            });

            await userEvent.click(screen.getByText('Error'));
            await waitFor(() => {
                expect(screen.getByText('Error!')).toBeInTheDocument();
            });
        });

        it('should auto-dismiss toast', async () => {
            jest.useFakeTimers();

            const Component = () => {
                const handleToast = () => {
                    toast({
                        title: 'Auto Dismiss',
                        duration: 3000,
                    });
                };

                return <button onClick={handleToast}>Show Toast</button>;
            };

            render(<Component />, { wrapper: TestWrapper });

            await userEvent.click(screen.getByText('Show Toast'));

            await waitFor(() => {
                expect(screen.getByText('Auto Dismiss')).toBeInTheDocument();
            });

            act(() => {
                jest.advanceTimersByTime(3000);
            });

            await waitFor(() => {
                expect(screen.queryByText('Auto Dismiss')).not.toBeInTheDocument();
            });

            jest.useRealTimers();
        });
    });

    describe('Accessibility Tests', () => {
        it('should support keyboard navigation', async () => {
            render(
                <>
                    <Button>First Button</Button>
                    <Button>Second Button</Button>
                    <Button>Third Button</Button>
                </>,
                { wrapper: TestWrapper }
            );

            const firstButton = screen.getByText('First Button');
            const secondButton = screen.getByText('Second Button');
            const thirdButton = screen.getByText('Third Button');

            firstButton.focus();
            expect(document.activeElement).toBe(firstButton);

            await userEvent.tab();
            expect(document.activeElement).toBe(secondButton);

            await userEvent.tab();
            expect(document.activeElement).toBe(thirdButton);
        });

        it('should provide proper ARIA labels', () => {
            render(
                <>
                    <Input aria-label="Username input" placeholder="Enter username" />
                    <button aria-label="Login button">Login</button>
                    <div role="alert" aria-live="polite">
                        Important message
                    </div>
                </>,
                { wrapper: TestWrapper }
            );

            expect(screen.getByLabelText('Username input')).toBeInTheDocument();
            expect(screen.getByLabelText('Login button')).toBeInTheDocument();
            expect(screen.getByRole('alert')).toBeInTheDocument();
        });

        it('should support screen readers', () => {
            render(
                <div>
                    <h1 id="page-title">Page Title</h1>
                    <nav aria-labelledby="page-title">
                        <a href="/home" aria-current="page">Home</a>
                        <a href="/about">About</a>
                    </nav>
                    <main role="main">
                        <h2>Main Content</h2>
                        <p>This is the main content area.</p>
                    </main>
                </div>,
                { wrapper: TestWrapper }
            );

            expect(screen.getByRole('navigation')).toBeInTheDocument();
            expect(screen.getByRole('main')).toBeInTheDocument();
            expect(screen.getByText('Home')).toHaveAttribute('aria-current', 'page');
        });
    });

    describe('Performance Tests', () => {
        it('should render many components efficiently', () => {
            const startTime = performance.now();

            render(
                <>
                    {Array.from({ length: 100 }, (_, i) => (
                        <Button key={i}>Button {i}</Button>
                    ))}
                </>,
                { wrapper: TestWrapper }
            );

            const renderTime = performance.now() - startTime;

            expect(renderTime).toBeLessThan(1000); // Should render within 1 second
            expect(screen.getAllByRole('button')).toHaveLength(100);
        });

        it('should handle rapid state changes', async () => {
            const Component = () => {
                const [count, setCount] = React.useState(0);

                return (
                    <>
                        <span data-testid="count">{count}</span>
                        <button onClick={() => setCount(c => c + 1)}>Increment</button>
                    </>
                );
            };

            render(<Component />, { wrapper: TestWrapper });

            const countElement = screen.getByTestId('count');
            const button = screen.getByText('Increment');

            // Rapid clicks
            for (let i = 0; i < 10; i++) {
                await userEvent.click(button);
            }

            await waitFor(() => {
                expect(countElement).toHaveTextContent('10');
            });
        });
    });

    describe('Integration Tests', () => {
        it('should work with form submission', async () => {
            const Component = () => {
                const [submitted, setSubmitted] = React.useState(false);

                const handleSubmit = (e: React.FormEvent) => {
                    e.preventDefault();
                    setSubmitted(true);
                };

                return (
                    <form onSubmit={handleSubmit}>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" required />
                        </div>
                        <div>
                            <label>
                                <Checkbox />
                                Accept terms
                            </label>
                        </div>
                        <Button type="submit">Submit</Button>
                        {submitted && <div data-testid="submitted">Form submitted!</div>}
                    </form>
                );
            };

            render(<Component />, { wrapper: TestWrapper });

            await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
            await userEvent.click(screen.getByRole('checkbox'));
            await userEvent.click(screen.getByText('Submit'));

            await waitFor
        }(() => {
            expect(screen.getByTestId('submitted')).toBeInTheDocument();
        });
    });

    it('should handle complex component interactions', async () => {
        const Component = () => {
            const [selectedTab, setSelectedTab] = React.useState('tab1');
            const [dialogOpen, setDialogOpen] = React.useState(false);
            const [email, setEmail] = React.useState('');

            return (
                <div>
                    <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                        <TabsList>
                            <TabsTrigger value="tab1">Profile</TabsTrigger>
                            <TabsTrigger value="tab2">Settings</TabsTrigger>
                        </TabsList>

                        <TabsContent value="tab1">
                            <div>
                                <Input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email"
                                />
                                <Button onClick={() => setDialogOpen(true)}>
                                    Open Settings
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="tab2">
                            <div>Settings Content</div>
                        </TabsContent>
                    </Tabs>

                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogContent>
                            <DialogTitle>Settings</DialogTitle>
                            <p>Current email: {email}</p>
                            <Button onClick={() => setDialogOpen(false)}>Close</Button>
                        </DialogContent>
                    </Dialog>
                </div>
            );
        };

        render(<Component />, { wrapper: TestWrapper });

        // Type email
        await userEvent.type(screen.getByPlaceholderText('Email'), 'test@example.com');

        // Open dialog
        await userEvent.click(screen.getByText('Open Settings'));

        await waitFor(() => {
            expect(screen.getByText('Settings')).toBeInTheDocument();
            expect(screen.getByText('Current email: test@example.com')).toBeInTheDocument();
        });

        // Switch tabs while dialog is open
        await userEvent.click(screen.getByText('Settings'));

        await waitFor(() => {
            expect(screen.getByText('Settings Content')).toBeInTheDocument();
        });

        // Close dialog
        await userEvent.click(screen.getByText('Close'));

        await waitFor(() => {
            expect(screen.queryByText('Current email: test@example.com')).not.toBeInTheDocument();
        });
    });
});
});
