
// This file is obsolete and can be safely deleted.
// Its functionality has been replaced by the generic /api/ai/writing-tools/[tool] route.
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    return NextResponse.json({ error: 'This endpoint is deprecated.' }, { status: 410 });
}
