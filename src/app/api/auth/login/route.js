import { NextResponse } from 'next/server';

// Legacy route — authentication is now handled via Firebase Auth on the client side.
// This route is kept as a stub to prevent build errors.

export async function POST() {
  return NextResponse.json(
    { error: "This login endpoint is deprecated. Please use Firebase Auth." },
    { status: 410 }
  );
}
