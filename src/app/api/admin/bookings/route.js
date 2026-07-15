import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

// Middleware-like check for admin routes using Firebase Auth token
async function requireAuth(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }
  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    throw new Error('Unauthorized');
  }
}

export async function GET(request) {
  try {
    await requireAuth(request);

    const snapshot = await adminDb.collection('access_logs')
      .orderBy('createdAt', 'desc')
      .get();
      
    const bookings = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convert Firestore Timestamps back to ISO strings for the frontend
        startTime: data.startTime?.toDate().toISOString() || data.startTime,
        endTime: data.endTime?.toDate().toISOString() || data.endTime,
        createdAt: data.createdAt?.toDate().toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate().toISOString() || data.updatedAt,
      };
    });
    
    return NextResponse.json(bookings);
  } catch (error) {
    console.error("API Error:", error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: "Missing booking ID" }, { status: 400 });
    }

    await adminDb.collection('access_logs').doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
