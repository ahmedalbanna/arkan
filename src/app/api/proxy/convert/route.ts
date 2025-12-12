import { NextRequest, NextResponse } from 'next/server';

const EXTERNAL_API_ENDPOINT = 'http://185.190.140.93:9003/api/convert';

export async function POST(request: NextRequest) {
    try {
        let formData = await request.formData();

        let response = await fetch(EXTERNAL_API_ENDPOINT, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            let errorText = await response.text();
            // Forward the error from the external API to the client
            return new NextResponse(errorText || 'An error occurred during conversion.', {
                status: response.status,
                statusText: response.statusText,
            });
        }

        let svg = await response.text();

        // Return the successful SVG response
        return new NextResponse(svg, {
            status: 200,
            headers: {
                'Content-Type': 'image/svg+xml; charset=utf-8',
            },
        });
    } catch (error) {
        console.error('Proxy API error:', error);
        if (error instanceof TypeError && error.message === 'fetch failed') {
             return new NextResponse('The conversion service is currently unreachable. Please try again later.', { status: 503 }); // Service Unavailable
        }
        return new NextResponse('An internal server error occurred.', { status: 500 });
    }
}
