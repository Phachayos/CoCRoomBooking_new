import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request) {
  try {
    const body = await request.json();
    const { studentId, bookingId } = body;

    if (!studentId || !bookingId) {
      return NextResponse.json({ error: 'Student ID and Booking ID are required.' }, { status: 400 });
    }

    // Find the booking
    const bookingRef = adminDb.collection('access_logs').doc(bookingId);
    const bookingSnap = await bookingRef.get();

    if (!bookingSnap.exists) {
      return NextResponse.json({ error: 'Booking not found. Please check your Booking ID.' }, { status: 404 });
    }

    const booking = bookingSnap.data();

    if (booking.studentId !== studentId) {
      return NextResponse.json({ error: 'Student ID does not match this booking.' }, { status: 403 });
    }

    if (booking.status === 'CANCELLED') {
      return NextResponse.json({ error: 'This booking is already cancelled.' }, { status: 400 });
    }

    // Update status to CANCELLED
    await bookingRef.update({ 
      status: 'CANCELLED',
      updatedAt: adminDb.firestore.FieldValue.serverTimestamp() || new Date()
    });

    return NextResponse.json({ success: true, message: 'Booking cancelled successfully.' }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
