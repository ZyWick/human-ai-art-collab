import sharp from 'sharp';

import fetch from 'node-fetch'; // Ensure this is installed
import { Buffer } from 'buffer';
const RUN_POD_API_KEY = process.env.RUN_POD_API_KEY
const RUN_POD_URL_SAM2 = process.env.RUN_POD_URL_SAM2

export async function sendBufferImageToSAM(imageBuffer, filename, mimetype) {
  const { width, height } = await sharp(imageBuffer).metadata();

  const base64Image = imageBuffer.toString('base64');

  const requestConfig = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization":  `Bearer ${RUN_POD_API_KEY}`,
    },
    body: JSON.stringify({
      input: {
        image: base64Image,
        filename: filename,
        mimetype: mimetype
      }
    })
  };

  try {
    const response = await fetch(RUN_POD_URL_SAM2, requestConfig);

    if (!response.ok) {
      throw new Error(`RunPod error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result)
    // Make sure result has bounding_boxes key
    const boundingBoxes = result.output?.bounding_boxes;
    if (!boundingBoxes) {
      throw new Error("No bounding boxes returned from RunPod.");
    }

    return normalizeBboxes(boundingBoxes, width, height);
  } catch (error) {
    console.error("RunPod request failed:", error);
    throw error;
  }
}

// export async function sendBufferImageToSAM(imageBuffer, filename, mimetype) {
//   const { width, height } = await sharp(imageBuffer).metadata();

//   return new Promise((resolve, reject) => {
//     const form = new FormData();
//     form.append('file', imageBuffer, {
//       filename: filename,
//       contentType: mimetype
//     });

//     const options = {
//       method: 'POST',
//       hostname: '192.168.55.102',
//       port: 8000,
//       path: '/segment/',
//       headers: form.getHeaders(),
//     };

//     const req = http.request(options, (res) => {
//       let data = '';
//       res.on('data', chunk => data += chunk);
//       res.on('end', () => {
//         try {
//           const json = JSON.parse(data);
//           resolve(normalizeBboxes(json.bounding_boxes, width, height));
//         } catch (e) {
//           reject(new Error('Failed to parse response: ' + e.message));
//         }
//       });
//     });

//     req.on('error', e => {
//       reject(new Error('Request error: ' + e.message));
//     });

//     form.pipe(req);
//   });
// }

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

