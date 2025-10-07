import { NextRequest, NextResponse } from 'next/server';

interface WebVitalsData {
    name: string;
    value: number;
    delta: number;
    id: string;
    navigationType: string;
    timestamp: number;
    url: string;
    userAgent: string;
}

interface BundleSizeData {
    totalJSSize: number;
    jsResourcesCount: number;
    timestamp: number;
    url: string;
}

export async function POST(request: NextRequest) {
    try {
        const data: WebVitalsData = await request.json();

        // Log Web Vitals data (in production, you might want to send this to a database or analytics service)
        console.log('Web Vitals received:', {
            name: data.name,
            value: data.value,
            url: data.url,
            timestamp: new Date(data.timestamp).toISOString(),
        });

        // Here you could send the data to:
        // - Google Analytics
        // - Firebase Analytics
        // - Custom database
        // - Third-party analytics service

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error processing Web Vitals data:', error);
        return NextResponse.json(
            { error: 'Failed to process Web Vitals data' },
            { status: 500 }
        );
    }
}
