import { NextRequest, NextResponse } from 'next/server';

interface BundleSizeData {
    totalJSSize: number;
    jsResourcesCount: number;
    timestamp: number;
    url: string;
}

export async function POST(request: NextRequest) {
    try {
        const data: BundleSizeData = await request.json();

        // Log bundle size data
        console.log('Bundle Size Analysis:', {
            totalJSSize: `${(data.totalJSSize / 1024).toFixed(2)} KB`,
            jsResourcesCount: data.jsResourcesCount,
            url: data.url,
            timestamp: new Date(data.timestamp).toISOString(),
        });

        // Here you could send the data to:
        // - Performance monitoring service
        // - Custom database
        // - Analytics service

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error processing bundle size data:', error);
        return NextResponse.json(
            { error: 'Failed to process bundle size data' },
            { status: 500 }
        );
    }
}
