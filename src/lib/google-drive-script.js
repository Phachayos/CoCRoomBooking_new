export async function uploadToGoogleDriveScript(buffer, filename, mimeType, scriptUrl) {
  const base64Data = buffer.toString('base64');
  
  const formData = new URLSearchParams();
  formData.append('filename', filename);
  formData.append('mimeType', mimeType);
  formData.append('fileData', base64Data);

  const response = await fetch(scriptUrl, {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to upload via Apps Script');
  }

  return {
    fileId: result.fileId,
    publicUrl: `https://drive.google.com/thumbnail?id=${result.fileId}&sz=w1000`,
    directLink: `https://drive.google.com/uc?export=view&id=${result.fileId}`
  };
}
