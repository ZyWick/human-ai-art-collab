import fetch from 'node-fetch';

const RUN_POD_URL_INSTDIFF = process.env.RUN_POD_URL_INSTDIFF
const RUN_POD_API_KEY = process.env.RUN_POD_API_KEY

export async function generateImage(data) {
  try {
    const response = await fetch(RUN_POD_URL_INSTDIFF, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RUN_POD_API_KEY}`,
      },
      body: data
    });

    const result = await response.json();
    console.log("here" + result)
    console.log(result)
     console.log(result.image_base64)
        if (result.image_base64) {
            return result.image_base64;
        } else {
            throw new Error(result.error || "Image generation failed");
        }

  } catch (err) {
    console.error("Request failed:", err);
  }
}