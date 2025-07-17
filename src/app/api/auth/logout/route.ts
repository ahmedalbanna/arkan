
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const options = {
        name: '__session',
        value: '',
        maxAge: -1, // Expire the cookie immediately
        path: '/',
    };

    const response = NextResponse.json({ message: "Logout successful" }, { status: 200 });
    response.cookies.set(options);
    return response;
  } catch (error: any) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "An unexpected error occurred during logout." }, { status: 500 });
  }
}
