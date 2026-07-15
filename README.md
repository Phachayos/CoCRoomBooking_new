# 🏫 COC Room Booking System

ระบบจองห้องเรียนและห้องประชุมสำหรับ College of Computing พัฒนาด้วย **Next.js** และเทคโนโลยีที่ทันสมัย เพื่อให้ผู้ใช้งานที่เป็นนักศึกษาและบุคลากรสามารถตรวจสอบตารางการใช้ห้อง และทำการจองห้องได้อย่างสะดวกและรวดเร็ว

---

## 📖 รูปแบบการใช้งาน (Workflow)

ระบบถูกออกแบบมาให้ใช้งานง่าย โดยแบ่งออกเป็น 2 ส่วนหลักคือ **ส่วนของผู้ใช้งานทั่วไป** และ **ส่วนของผู้ดูแลระบบ (Admin)**

### 👤 สำหรับผู้ใช้งานทั่วไป (Students / Staff)
1. **ตรวจสอบตารางห้อง (Timetable):** ผู้ใช้สามารถดูตารางการใช้ห้องแต่ละห้องในรูปแบบปฏิทินหรือตารางเวลาได้ว่าช่วงเวลาไหนห้องว่างหรือมีผู้จองแล้ว
2. **ทำรายการจอง (Booking):** ผู้ใช้สามารถกดปุ่มจองห้องและกรอกแบบฟอร์มข้อมูล ได้แก่:
   - ห้องที่ต้องการจอง (เช่น Room 1, Room 2)
   - รหัสนักศึกษา (10 หลัก)
   - ชื่อ-นามสกุล
   - อีเมลและเบอร์โทรศัพท์
   - เหตุผลในการจอง และ วันเวลาที่ต้องการใช้งาน
3. **การยกเลิกการจอง:** ผู้ใช้สามารถยกเลิกการจองได้หากไม่สามารถมาใช้งานตามเวลาที่กำหนด

### 🛠️ สำหรับผู้ดูแลระบบ (Admin)
1. **การเข้าสู่ระบบ:** แอดมินต้องทำการ Login ด้วย Username/Password (ใช้การเข้ารหัสผ่านแบบ JWT และ bcrypt)
2. **จัดการการจอง:** สามารถดูรายการจองทั้งหมดที่เกิดขึ้น อนุมัติหรือปฏิเสธ หรือลบการจองได้
3. **ส่งออกรายงาน (Export Report):** สามารถดาวน์โหลดข้อมูลการจองทั้งหมดออกมาเป็นไฟล์ Excel `.xlsx` ได้เพื่อนำไปทำรายงานสรุปต่อไป

---

## ⚙️ เครื่องมือและเทคโนโลยีที่ใช้ (Tech Stack)

ระบบนี้ใช้ Stack แบบ Full-stack โดยฝั่ง Frontend และ Backend ถูกพัฒนาไว้ใน **Next.js (App Router)**

**Frontend (ส่วนแสดงผล):**
- **[Next.js 16](https://nextjs.org/) & React 19:** เฟรมเวิร์กหลักในการทำ UI และ Routing
- **CSS Modules:** จัดการความสวยงามของเว็บ (UI/UX) ด้วย Vanilla CSS + CSS Modules
- **React Hot Toast:** แจ้งเตือนสถานะต่างๆ (Success, Error) ให้ผู้ใช้ทราบแบบ Popup ที่สวยงาม

**Backend & Database (ส่วนจัดการข้อมูล):**
- **Next.js API Routes:** ใช้สำหรับสร้าง API endpoints (เช่น `/api/bookings`, `/api/admin/users`) เพื่อรับส่งข้อมูล
- **[Prisma ORM](https://www.prisma.io/):** ตัวจัดการฐานข้อมูล (Database ORM) ทำให้ดึงข้อมูลและจัดการตารางต่างๆ ได้ง่ายและปลอดภัย
- **SQLite / PostgreSQL:** ระบบจัดการฐานข้อมูลหลัก (ผ่าน Prisma)

**Authentication & Security (ระบบรักษาความปลอดภัย):**
- **[Jose (JWT)](https://github.com/panva/jose):** สร้างและตรวจสอบ JSON Web Token สำหรับเซสชั่นการล็อกอินของ Admin
- **Bcrypt.js:** ใช้เข้ารหัสและถอดรหัสผ่าน (Password Hashing)
- **Firebase & Firebase Admin SDK:** ใช้เชื่อมต่อกับบริการของ Google Firebase (ใช้ในการทำงานเบื้องหลังเพิ่มเติม)

**Utilities (เครื่องมือเสริมอื่นๆ):**
- **[ExcelJS](https://github.com/exceljs/exceljs) & File-Saver:** ใช้สำหรับสร้างไฟล์ Excel และให้ผู้ใช้ดาวน์โหลดลงเครื่องได้ทันที
- **Nodemailer:** ใช้สำหรับส่งอีเมลแจ้งเตือนการจองให้ผู้ใช้โดยอัตโนมัติ

---

## 🚀 วิธีการติดตั้งและรันโปรเจกต์ (Installation Guide)

หากต้องการนำโปรเจกต์นี้ไปรันบนเครื่องของตัวเอง (Local Development) ให้ทำตามขั้นตอนดังนี้:

### 1. สิ่งที่ต้องมีเบื้องต้น (Prerequisites)
- [Node.js](https://nodejs.org/) (แนะนำเวอร์ชัน 18 ขึ้นไป)
- ไฟล์ `.env` ที่กำหนดค่าตัวแปรสภาพแวดล้อม (Environment Variables) เช่น `DATABASE_URL`, ค่าคอนฟิกของ Firebase และรหัสผ่านอีเมลสำหรับ SMTP

### 2. โคลนโปรเจกต์และติดตั้ง Packages
เปิด Terminal แล้วรันคำสั่ง:

```bash
# โคลนโปรเจกต์จาก GitHub
git clone https://github.com/Phachayos/CoCRoomBooking_new.git
cd CoCRoomBooking_new

# ติดตั้ง Dependencies ทั้งหมด
npm install
```

### 3. ตั้งค่าฐานข้อมูล (Database Setup)
โปรเจกต์นี้ใช้ Prisma ดังนั้นต้องสร้างฐานข้อมูลให้เรียบร้อยก่อน:

```bash
# อัปเดตโครงสร้าง Database ตาม Prisma Schema
npx prisma db push

# (ทางเลือก) สร้าง Prisma Client ใหม่
npx prisma generate
```

### 4. รันเซิร์ฟเวอร์จำลอง (Development Server)
```bash
npm run dev
```

เมื่อเซิร์ฟเวอร์ทำงานสำเร็จ สามารถเปิดดูหน้าเว็บได้ที่เบราว์เซอร์ผ่านลิงก์ [http://localhost:3000](http://localhost:3000)

---
*Developed by Phachayos Badklang*
