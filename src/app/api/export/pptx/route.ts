
// This file is now obsolete and can be safely deleted.
// The PPTX generation logic has been moved back to the client-side
// in `src/hooks/util/useExport.ts` due to browser-specific API dependencies.

import { NextResponse } from 'next/server';

export async function POST() {
    return new NextResponse(
        JSON.stringify({ message: 'This endpoint is deprecated. PPTX generation is now client-side.' }),
        { status: 410 } // 410 Gone
    );
}
