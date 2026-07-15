import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const studentId = formData.get('studentId');
    const bookingId = formData.get('bookingId');
    const file = formData.get('image');

    if (!studentId || !bookingId || !file) {
      return NextResponse.json({ error: 'Missing required fields (Student ID, Booking ID, or Image).' }, { status: 400 });
    }

    // Verify booking
    const bookingRef = adminDb.collection('access_logs').doc(bookingId);
    const bookingSnap = await bookingRef.get();

    if (!bookingSnap.exists) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }

    const booking = bookingSnap.data();

    if (booking.studentId !== studentId) {
      return NextResponse.json({ error: 'Student ID does not match this booking.' }, { status: 403 });
    }

    // Save file locally (since user preferred not to use Firebase Storage due to CC requirements)
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split('.').pop() || 'jpg';
    // Sanitize ext
    const cleanExt = ext.replace(/[^a-zA-Z0-9]/g, '');
    const filename = `${bookingId}-${Date.now()}.${cleanExt}`;
    
    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, buffer);

    // Update database
    await bookingRef.update({
      postUsageImage: `/uploads/${filename}`,
      status: 'COMPLETED',
      updatedAt: adminDb.firestore.FieldValue.serverTimestamp() || new Date()
    });

    return NextResponse.json({ success: true, message: 'Report submitted successfully.' }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
