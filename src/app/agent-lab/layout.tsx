import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/shared/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import { AppProviders } from '@/components/shared/AppProviders';

export const metadata: Metadata = {
    title: 'AgentLab - Create and Test AI Agents',
    description: 'A local-first tool to build, manage, and test custom AI agents.',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
            <AppProviders>
                {children}
                <Toaster />
            </AppProviders>
        </ThemeProvider>
    );
}
