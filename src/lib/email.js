import nodemailer from 'nodemailer';

// Need to configure these in .env
// SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true' || false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendBookingConfirmation(booking) {
  // If SMTP is not fully configured, log to console instead of failing
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("=== MOCK EMAIL SENT ===");
    console.log(`To: ${booking.email}`);
    console.log(`Subject: Booking Confirmation - COC Room`);
    console.log(`Body: Your booking is confirmed. Booking ID: ${booking.id}. Please save this ID to cancel or report usage.`);
    console.log("=======================");
    return true;
  }

  try {
    await transporter.sendMail({
      from: `"COC Meeting Room" <${process.env.SMTP_USER}>`,
      to: booking.email,
      subject: 'CoC Room Booking Confirmation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
          
          <!-- THAI VERSION -->
          <h2 style="color: #0052cc;">ยืนยันการจองห้องประชุม CoC</h2>
          <p>เรียน ผู้จองคุณ ${booking.firstName} ${booking.lastName},</p>
          <p><strong>รหัสนักศึกษา:</strong> ${booking.studentId}</p>
          <p><strong>ห้องที่จอง:</strong> ${booking.room}</p>
          <p><strong>วันและเวลา:</strong> ${new Date(booking.startTime).toLocaleDateString()} | ${new Date(booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${new Date(booking.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
          
          <div style="background-color: #f0f4f8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0052cc;">
            <p style="margin: 0;"><strong>รหัส Booking ID ของคุณ:</strong></p>
            <p style="font-size: 1.1rem; font-weight: bold; font-family: monospace; letter-spacing: 1px; color: #0052cc; margin-top: 5px;">${booking.id}</p>
          </div>

          <p><strong>ลิ้งก์สำหรับรายงานหลังการใช้งานห้องเสร็จ:</strong><br>
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/report" style="color: #0052cc;">คลิกที่นี่เพื่อรายงานการใช้งาน (Report Usage)</a></p>
          
          <p style="color: #c53030; font-weight: bold;">* หมายเหตุ: หากไม่ได้รายงานการใช้งานหลังจากใช้ห้องเสร็จสิ้น ผู้ใช้อาจถูกพิจารณาระงับสิทธิ์การใช้งานห้องประชุมในครั้งต่อไป</p>

          <hr style="border: 0; border-top: 1px solid #ddd; margin: 40px 0;">

          <!-- ENGLISH VERSION -->
          <h2 style="color: #0052cc;">CoC Room Booking Confirmation</h2>
          <p>Dear ${booking.firstName} ${booking.lastName},</p>
          <p><strong>Student ID:</strong> ${booking.studentId}</p>
          <p><strong>Room:</strong> ${booking.room}</p>
          <p><strong>Date & Time:</strong> ${new Date(booking.startTime).toLocaleDateString()} | ${new Date(booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${new Date(booking.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
          
          <div style="background-color: #f0f4f8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0052cc;">
            <p style="margin: 0;"><strong>Your Booking ID:</strong></p>
            <p style="font-size: 1.1rem; font-weight: bold; font-family: monospace; letter-spacing: 1px; color: #0052cc; margin-top: 5px;">${booking.id}</p>
          </div>

          <p><strong>Link to report usage after finish:</strong><br>
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/report" style="color: #0052cc;">Click here to report usage</a></p>
          
          <p style="color: #c53030; font-weight: bold;">* Note: Failure to submit a post-usage report may result in the suspension of your meeting room privileges.</p>

        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    // We don't want to throw error if email fails, just log it, booking still successful
    return false;
  }
}
