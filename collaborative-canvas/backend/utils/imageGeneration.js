import fetch from 'node-fetch';

export async function generateImage(data) {
  try {
    const res = await fetch('http://192.168.55.102:8001/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'image/jpeg'
      },
      body: data
    });

    if (!res.ok) {
      throw new Error(`Failed to generate image: Server responded with status ${res.status}`);
    }

    const arrayBuffer = await res.arrayBuffer(); // ✅ safe
    const buffer = Buffer.from(arrayBuffer);
    return buffer

    console.log("Image generated, size:", buffer.length);
    // Save the buffer or pass it to uploadS3Image()
  } catch (err) {
    console.error("Error:", err.message);
  }
}
