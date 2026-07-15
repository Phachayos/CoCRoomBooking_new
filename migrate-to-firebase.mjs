import { PrismaClient } from '@prisma/client';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, 'coc-roombooking-firebase-adminsdk-fbsvc-d2518d9cd9.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

const app = initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore(app);
const prisma = new PrismaClient();

async function migrate() {
  console.log("Starting migration from SQLite to Firestore...");

  // 1. Migrate Bookings
  const bookings = await prisma.booking.findMany();
  console.log(`Found ${bookings.length} bookings to migrate.`);

  const batchSize = 500;
  let batch = db.batch();
  let count = 0;

  for (const booking of bookings) {
    const docRef = db.collection('access_logs').doc(booking.id);
    
    // Convert Prisma dates to Firestore Timestamps
    const data = {
      ...booking,
      startTime: Timestamp.fromDate(booking.startTime),
      endTime: Timestamp.fromDate(booking.endTime),
      createdAt: Timestamp.fromDate(booking.createdAt),
      updatedAt: Timestamp.fromDate(booking.updatedAt)
    };

    batch.set(docRef, data);
    count++;

    if (count % batchSize === 0) {
      await batch.commit();
      console.log(`Committed ${count} bookings...`);
      batch = db.batch();
    }
  }

  if (count % batchSize !== 0) {
    await batch.commit();
    console.log(`Committed remaining bookings. Total: ${count}`);
  }

  // 2. Migrate AdminUsers (Optional: we decided to manage via Firebase Console, 
  // but if we want to migrate existing admins as Firebase Auth users, we could.
  // Given the instruction, we'll just skip it or log them for the user to manually add).
  const admins = await prisma.adminUser.findMany();
  console.log(`\nFound ${admins.length} existing admins.`);
  if (admins.length > 0) {
    console.log("NOTE: We are no longer migrating Admin passwords. Please manually create these admins in the Firebase Console (Authentication section) using their email/password:");
    admins.forEach(a => console.log(`- ${a.name} (StudentID: ${a.studentId})`));
  }

  console.log("\nMigration completed successfully!");
  await prisma.$disconnect();
}

migrate().catch(console.error);
