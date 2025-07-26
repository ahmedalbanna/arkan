// This file is now deprecated and replaced by /api/transactions/route.ts
// It can be deleted. For safety, we will just empty it.
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    return NextResponse.json({ message: 'This endpoint is deprecated. Use /api/transactions instead.' }, { status: 410 });
}
