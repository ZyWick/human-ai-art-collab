import fetch from 'node-fetch';
import { Client } from "@gradio/client";
					
const RUN_POD_API_KEY = process.env.RUN_POD_API_KEY

const RUNPOD_BASE_URL_INSTDIFF = process.env.RUNPOD_BASE_URL_INSTDIFF;
const RUNPOD_RUN_URL_INSTDIFF = `${RUNPOD_BASE_URL_INSTDIFF}/run`;

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

export async function generateImage(data) {
  const requestConfig = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${RUN_POD_API_KEY}`,
    },
    body: JSON.stringify({
      input: data})
  };

  try {
    const response = await fetch(RUNPOD_RUN_URL_INSTDIFF, requestConfig);
    if (!response.ok) {
      throw new Error(`RunPod error! status: ${response.status}`);
    }

    const result = await response.json();
    const jobId = result.id;

    if (!jobId) {
      throw new Error("No job ID returned from RunPod.");
    }

    // Poll for completion
    const output = await pollJobStatus(jobId, RUNPOD_BASE_URL_INSTDIFF); // Use base URL or polling URL
    const base64Image = output?.image_base64;

    if (!base64Image) {
      throw new Error("No image_base64 returned after polling.");
    }

    const client = await Client.connect("awacke1/Image-to-Line-Drawings");
    const sketchResult = await client.predict("/predict", { 
            input_img: base64ToBlob(base64Image), 		
    });
    if (!sketchResult) {
      throw new Error("No sketchResult returned after polling.");
    }

    return await fetchImageAsBase64(sketchResult.data[0].url);
  } catch (error) {
    console.error("RunPod image generation failed:", error);
    throw error;
  }
}

function base64ToBlob(base64, contentType = 'image/jpeg') {
  const byteCharacters = atob(base64);
  const byteArrays = [];

  for (let i = 0; i < byteCharacters.length; i += 512) {
    const slice = byteCharacters.slice(i, i + 512);
    const byteNumbers = new Array(slice.length);
    for (let j = 0; j < slice.length; j++) {
      byteNumbers[j] = slice.charCodeAt(j);
    }
    byteArrays.push(new Uint8Array(byteNumbers));
  }

  return new Blob(byteArrays, { type: contentType });
}

async function fetchImageAsBase64(imageUrl) {
  const response = await fetch(imageUrl);
  const arrayBuffer = await response.arrayBuffer(); // modern replacement for response.buffer()
  const buffer = Buffer.from(arrayBuffer)
  return buffer.toString("base64");
}