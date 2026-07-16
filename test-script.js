import fetch from 'node-fetch';

async function test() {
  const scriptUrl = 'https://script.google.com/macros/s/AKfycbz5nEW4U9q06p8J8UCLmnAmdR7QiqdaOG0BWf9Diw7aVJ5k5FnQ_8bdfvw-0jhC6H7b/exec';
  const formData = new URLSearchParams();
  formData.append('filename', 'test.jpg');
  formData.append('mimeType', 'image/jpeg');
  formData.append('fileData', '12345');

  console.log('Sending POST to', scriptUrl);
  const response = await fetch(scriptUrl, {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow'
  });

  console.log('Status:', response.status);
  const text = await response.text();
  console.log('Response:', text.substring(0, 100));
}

test().catch(console.error);
