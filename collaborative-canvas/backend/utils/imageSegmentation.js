import http from 'http';
import FormData from 'form-data';
import sharp from 'sharp';

export async function sendBufferImageToSAM(imageBuffer, filename, mimetype) {
  const { width, height } = await sharp(imageBuffer).metadata();

  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('file', imageBuffer, {
      filename: filename,
      contentType: mimetype
    });

    const options = {
      method: 'POST',
      hostname: '192.168.55.102',
      port: 8000,
      path: '/segment/',
      headers: form.getHeaders(),
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(normalizeBboxes(json.bounding_boxes, width, height));
        } catch (e) {
          reject(new Error('Failed to parse response: ' + e.message));
        }
      });
    });

    req.on('error', e => {
      reject(new Error('Request error: ' + e.message));
    });

    form.pipe(req);
  });
}

function normalizeBboxes(bboxes, imageWidth, imageHeight) {
  return bboxes.map(bbox => {
    const [xMin, yMin, xMax, yMax] = bbox;
    return [
      xMin / imageWidth,
      yMin / imageHeight,
      xMax / imageWidth,
      yMax / imageHeight,
    ];
  });
}

