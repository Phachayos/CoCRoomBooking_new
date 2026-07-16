import { NextResponse } from 'next/server';
import { adminDb, adminStorage } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { uploadToGoogleDriveScript } from '@/lib/google-drive-script';

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

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = (file.name.split('.').pop() || 'jpg').replace(/[^a-zA-Z0-9]/g, '');
    const filename = `${bookingId}-${Date.now()}.${ext}`;
    
    let publicUrl = '';
    
    // Check if we have an Apps Script Webhook configured for Google Drive
    if (process.env.GOOGLE_APPS_SCRIPT_URL) {
      const mimeType = file.type || 'image/jpeg';
      const driveResult = await uploadToGoogleDriveScript(buffer, filename, mimeType, process.env.GOOGLE_APPS_SCRIPT_URL);
      publicUrl = driveResult.directLink;
    } else {
      // Fallback to Firebase Storage
      const fileRef = adminStorage.bucket().file(`reports/${filename}`);
      await fileRef.save(buffer, {
        metadata: { contentType: file.type || 'image/jpeg' },
      });
      await fileRef.makePublic();
      publicUrl = `https://storage.googleapis.com/${adminStorage.bucket().name}/reports/${filename}`;
    }

    // Update database
    await bookingRef.update({
      postUsageImage: publicUrl,
      status: 'COMPLETED',
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      message: 'Report submitted successfully.',
      imageUrl: publicUrl,
    }, { status: 200 });

  } catch (error) {
    console.error('Report upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
