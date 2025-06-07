import sharp from 'sharp';
import fetch from 'node-fetch';

const RUN_POD_API_KEY = process.env.RUN_POD_API_KEY;

const RUNPOD_BASE_URL_SAM2 = process.env.RUNPOD_BASE_URL_SAM2;
const RUNPOD_RUN_URL_SAM2 = `${RUNPOD_BASE_URL_SAM2}/run`;

const POLL_INTERVAL = 5000; // 5 seconds
const MAX_ATTEMPTS = 60;    // ~5 minutes

async function pollJobStatus(jobId, endpoint) {
  const statusUrl = `${endpoint}/status/${jobId}`;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const res = await fetch(statusUrl, {
      headers: {
        "Authorization": `Bearer ${RUN_POD_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to get job status: ${res.status}`);
    }

    const jobStatus = await res.json();
    const status = jobStatus.status;
    // console.log(`Polling attempt ${attempt + 1}: ${status}`);

    if (status === "COMPLETED") return jobStatus.output;
    if (status === "FAILED" || status === "CANCELLED") throw new Error(`Job ${status}`);

    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
  }

  throw new Error("Timeout waiting for RunPod job completion.");
}

export async function sendBufferImageToSAM(imageBuffer, filename, mimetype) {
  const { width, height } = await sharp(imageBuffer).metadata();
  const base64Image = imageBuffer.toString('base64');

  const requestConfig = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${RUN_POD_API_KEY}`,
    },
    body: JSON.stringify({
      input: {
        image_bytes: base64Image,
      }
    })
  };

  try {
    const response = await fetch(RUNPOD_RUN_URL_SAM2, requestConfig);
    if (!response.ok) throw new Error(`RunPod error! status: ${response.status}`);

    const result = await response.json();
    const jobId = result.id;
    if (!jobId) throw new Error("No job ID returned from RunPod.");

    const output = await pollJobStatus(jobId, RUNPOD_BASE_URL_SAM2);

    const boundingBoxes = output?.bounding_boxes;
    if (!boundingBoxes) throw new Error("No bounding boxes returned from RunPod.");

    return normalizeBboxes(boundingBoxes, width, height);
  } catch (error) {
    console.error("RunPod request failed:", error);
    throw error;
  }
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

