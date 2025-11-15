import type { Metadata } from 'next';
import '../globals.css';
import { ThemeProvider } from '@/components/shared/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils/cn';
import localFont from 'next/font/local';
import { AppProviders } from '@/components/shared/AppProviders';

export const metadata: Metadata = {
    title: 'AgentLab - Create and Test AI Agents',
    description: 'A local-first tool to build, manage, and test custom AI agents.',
};

const fontBody = localFont({
    src: [
        {
            path: '../../../public/fonts/pt-sans-v18-cyrillic_cyrillic-ext_latin_latin-ext-regular.woff2',
            weight: '400',
            style: 'normal',
        },
        {
            path: '../../../public/fonts/pt-sans-v18-cyrillic_cyrillic-ext_latin_latin-ext-700.woff2',
            weight: '700',
            style: 'normal',
        },
    ],
    variable: '--font-body',
});

const fontHeadline = localFont({
    src: [
        {
            path: '../../../public/fonts/poppins-v23-devanagari_latin_latin-ext-regular.woff2',
            weight: '400',
            style: 'normal',
        },
        {
            path: '../../../public/fonts/poppins-v23-devanagari_latin_latin-ext-600.woff2',
            weight: '600',
            style: 'normal',
        },
        {
            path: '../../../public/fonts/poppins-v23-devanagari_latin_latin-ext-700.woff2',
            weight: '700',
            style: 'normal',
        },
    ],
    variable: '--font-headline',
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning >
            <body className={cn('font-body antialiased', fontBody.variable, fontHeadline.variable)}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <AppProviders>
                        {children}
                        < Toaster />
                    </AppProviders>
                </ThemeProvider>
            </body>
        </html>
    );
}
