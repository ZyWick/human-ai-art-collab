import http from 'http';
import FormData from 'form-data';

export async function sendBufferImageToSAM(imageBuffer, filename, mimetype) {
  const form = new FormData();
  // Append the buffer as if it was a file upload
  form.append('file', imageBuffer, {
    filename: filename,
    contentType: mimetype
  });

  const options = {
    method: 'POST',
    hostname: 'ccscloud1.dlsu.edu.ph',   // change if needed
    port: 8000,              // your FastAPI port
    path: '/segment',        // your FastAPI endpoint
    headers: form.getHeaders(),
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        console.log('Bounding boxes from SAM:', json.bounding_boxes);
      } catch (e) {
        console.error('Failed to parse response:', e);
      }
    });
  });

  req.on('error', e => {
    console.error('Request error:', e);
  });

  form.pipe(req);
}

// // Usage example with your image buffer object:
// const fullImage = {
//   fieldname: 'images',
//   originalname: 'J43104.jpg',
//   encoding: '7bit',
//   mimetype: 'image/webp',
//   buffer: Buffer.from([/* your image bytes here or from upload */]),
//   size: 10021
// };

// sendBufferImageToSAM(fullImage.buffer, fullImage.originalname, fullImage.mimetype);
