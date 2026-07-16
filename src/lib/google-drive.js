import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';
import { Readable } from 'stream';

// Load the Firebase service account key (same one used for Firebase Admin)
const serviceAccountPath = path.join(process.cwd(), 'coc-roombooking-firebase-adminsdk-fbsvc-d2518d9cd9.json');
let serviceAccount = null;

try {
  if (fs.existsSync(serviceAccountPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  }
} catch (error) {
  console.error("Error reading Service Account for Google Drive:", error);
}

// Create a Google Auth client using the service account
function getAuthClient() {
  if (!serviceAccount) {
    throw new Error("Service Account not found. Cannot authenticate with Google Drive.");
  }

  const auth = new google.auth.GoogleAuth({
    credentials: serviceAccount,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  return auth;
}

// Get or create the shared upload folder in Google Drive
let _folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || null;

async function getUploadFolderId(drive) {
  if (_folderId) return _folderId;

  throw new Error("GOOGLE_DRIVE_FOLDER_ID is not set in .env. Service Accounts cannot create files in their own root directory due to zero quota. Please create a folder in your personal Google Drive, share it with the Service Account email, and put the Folder ID in .env as GOOGLE_DRIVE_FOLDER_ID.");
}


/**
 * Upload a file buffer to Google Drive.
 * Returns the public URL of the uploaded file.
 */
export async function uploadToGoogleDrive(buffer, filename, mimeType = 'image/jpeg') {
  const auth = getAuthClient();
  const drive = google.drive({ version: 'v3', auth });

  const folderId = await getUploadFolderId(drive);

  // Convert buffer to readable stream
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);

  // Upload file
  const fileRes = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [folderId],
    },
    media: {
      mimeType: mimeType,
      body: stream,
    },
    fields: 'id, webViewLink, webContentLink',
  });

  const fileId = fileRes.data.id;

  // Make file publicly readable
  await drive.permissions.create({
    fileId: fileId,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });

  // Return a direct-viewable URL
  const publicUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;

  return {
    fileId,
    publicUrl,
    webViewLink: fileRes.data.webViewLink,
    directLink: `https://drive.google.com/uc?export=view&id=${fileId}`,
  };
}
