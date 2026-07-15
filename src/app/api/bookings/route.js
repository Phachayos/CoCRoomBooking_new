import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { sendBookingConfirmation } from '@/lib/email';
import { Timestamp } from 'firebase-admin/firestore';

export async function GET(request) {
  try {
    const snapshot = await adminDb.collection('access_logs')
      .where('status', '==', 'ACTIVE')
      .get();
      
    let bookings = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        startTime: data.startTime?.toDate().toISOString() || data.startTime,
        endTime: data.endTime?.toDate().toISOString() || data.endTime,
        createdAt: data.createdAt?.toDate().toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate().toISOString() || data.updatedAt,
      };
    });

    // Sort in memory to avoid needing a composite index immediately
    bookings.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    return NextResponse.json(bookings);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { studentId, firstName, lastName, email, phone, reason, room, startTime, endTime } = body;

    // Validation
    if (!studentId || studentId.length !== 10) {
      return NextResponse.json({ error: 'Invalid Student ID. Must be exactly 10 digits.' }, { status: 400 });
    }

    if (!room) {
      return NextResponse.json({ error: 'Please select a room.' }, { status: 400 });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end - start;
    const durationHours = durationMs / (1000 * 60 * 60);

    if (durationHours < 0.5) {
      return NextResponse.json({ error: 'Minimum booking duration is 30 minutes.' }, { status: 400 });
    }

    if (durationHours > 3) {
      return NextResponse.json({ error: 'Maximum booking duration per session is 3 hours.' }, { status: 400 });
    }

    // Ensure booking is within operating hours (08:00 - 23:00)
    const startH = start.getHours();
    const endH = end.getHours();
    const endM = end.getMinutes();

    if (startH < 8 || endH > 23 || (endH === 23 && endM > 0) || (endH < startH)) {
      return NextResponse.json({ error: 'Bookings must be between 08:00 and 23:00.' }, { status: 400 });
    }

    // Overlap check (fetch all active for the room and check in memory)
    const activeBookingsSnapshot = await adminDb.collection('access_logs')
      .where('status', '==', 'ACTIVE')
      .where('room', '==', room)
      .get();
      
    let overlap = false;
    activeBookingsSnapshot.forEach(doc => {
      const b = doc.data();
      const bStart = b.startTime.toDate();
      const bEnd = b.endTime.toDate();
      
      if (start < bEnd && end > bStart) {
        overlap = true;
      }
    });

    if (overlap) {
      return NextResponse.json({ error: `This time slot overlaps with an existing booking in ${room}.` }, { status: 409 });
    }

    // Create booking
    const newBookingRef = adminDb.collection('access_logs').doc();
    const bookingData = {
      studentId,
      firstName,
      lastName,
      email,
      phone,
      reason,
      room,
      startTime: Timestamp.fromDate(start),
      endTime: Timestamp.fromDate(end),
      status: 'ACTIVE',
      postUsageImage: null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    await newBookingRef.set(bookingData);

    const bookingResponse = {
      id: newBookingRef.id,
      ...bookingData,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Send email (await it but don't fail booking if email fails)
    await sendBookingConfirmation(bookingResponse).catch(err => console.error("Email failed", err));

    return NextResponse.json(bookingResponse, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
