'use client';

import { useEffect, useState } from 'react';

interface FontLoaderProps {
    onFontsLoaded?: () => void;
    onFontsError?: (error: Error) => void;
}

export function FontLoader({ onFontsLoaded, onFontsError }: FontLoaderProps) {
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [fontErrors, setFontErrors] = useState<string[]>([]);

    useEffect(() => {
        const checkFonts = async () => {
            const fontsToCheck = [
                '400 16px Poppins',
                '600 16px Poppins',
                '700 16px Poppins',
                '400 16px PT Sans',
                '700 16px PT Sans',
                '400 16px Cairo',
                '700 16px Cairo',
                '400 16px Almarai',
                '700 16px Almarai',
            ];

            const errors: string[] = [];
            let loadedCount = 0;

            for (const font of fontsToCheck) {
                try {
                    const isLoaded = document.fonts.check(font);
                    if (isLoaded) {
                        loadedCount++;
                    } else {
                        // Try to load the font
                        await document.fonts.load(font);
                        loadedCount++;
                    }
                } catch (error) {
                    const errorMessage = `Failed to load font: ${font}`;
                    errors.push(errorMessage);
                    console.warn(errorMessage, error);
                }
            }

            setFontErrors(errors);

            if (errors.length > 0) {
                onFontsError?.(new Error(`Failed to load ${errors.length} fonts: ${errors.join(', ')}`));
            }

            // Mark as loaded regardless of errors to prevent blocking
            setFontsLoaded(true);
            onFontsLoaded?.();
        };

        // Add a small delay to ensure DOM is ready
        const timeoutId = setTimeout(checkFonts, 100);

        return () => clearTimeout(timeoutId);
    }, [onFontsLoaded, onFontsError]);

    // Optional: Show font loading status in development
    if (process.env.NODE_ENV === 'development' && fontErrors.length > 0) {
        return (
            <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded text-sm z-50">
                <div className="font-bold">Font Loading Issues:</div>
                <div className="text-xs">
                    {fontErrors.length} fonts failed to load. Using fallback fonts.
                </div>
            </div>
        );
    }

    return null;
}

// Hook for checking font availability
export function useFontStatus() {
    const [fontStatus, setFontStatus] = useState<{
        loaded: boolean;
        errors: string[];
        fallbackActive: boolean;
    }>({
        loaded: false,
        errors: [],
        fallbackActive: false,
    });

    useEffect(() => {
        const checkStatus = () => {
            const fonts = [
                'Poppins',
                'PT Sans',
                'Cairo',
                'Almarai',
            ];

            const errors: string[] = [];
            let fallbackActive = false;

            fonts.forEach(font => {
                const isLoaded = document.fonts.check(`400 16px ${font}`);
                if (!isLoaded) {
                    errors.push(font);
                    fallbackActive = true;
                }
            });

            setFontStatus({
                loaded: errors.length === 0,
                errors,
                fallbackActive,
            });
        };

        // Check immediately and after fonts load
        checkStatus();

        const handleFontLoad = () => {
            setTimeout(checkStatus, 100);
        };

        document.fonts.addEventListener('loadingdone', handleFontLoad);
        document.fonts.addEventListener('loadingerror', handleFontLoad);

        return () => {
            document.fonts.removeEventListener('loadingdone', handleFontLoad);
            document.fonts.removeEventListener('loadingerror', handleFontLoad);
        };
    }, []);

    return fontStatus;
}
