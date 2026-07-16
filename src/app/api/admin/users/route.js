import { NextResponse } from 'next/server';

// Legacy route — admin user management is now handled via Firebase Auth.
// This route is kept as a stub to prevent build errors.

export async function GET() {
  return NextResponse.json(
    { error: "This endpoint is deprecated. Admin users are managed via Firebase Auth." },
    { status: 410 }
  );
}

export async function POST() {
  return NextResponse.json(
    { error: "This endpoint is deprecated. Admin users are managed via Firebase Auth." },
    { status: 410 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: "This endpoint is deprecated. Admin users are managed via Firebase Auth." },
    { status: 410 }
  );
}
