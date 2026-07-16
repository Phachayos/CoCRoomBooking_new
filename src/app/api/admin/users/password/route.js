import { NextResponse } from 'next/server';

// Legacy route — password management is now handled via Firebase Auth.
// This route is kept as a stub to prevent build errors.

export async function PUT() {
  return NextResponse.json(
    { error: "This endpoint is deprecated. Password management is handled via Firebase Auth." },
    { status: 410 }
  );
}
