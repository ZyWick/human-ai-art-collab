import dotenv from "dotenv";

dotenv.config();

const HF_TOKEN = process.env.HF_TOKEN;
const MODEL = "Salesforce/blip-image-captioning-base";


if (!HF_TOKEN) {
    throw new Error("Missing Hugging Face API token! Set HF_TOKEN in .env file.");
}

export async function getCaption(imageBlob) {
    try {      
        const base64Image = bufferToBase64(imageBlob);
        const response = await fetch(`https://api-inference.huggingface.co/models/${MODEL}`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${HF_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ inputs: base64Image }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const captionText = data[0]?.generated_text || "No caption generated";

        return captionText;
    } catch (error) {
        console.error("Error:", error.message);
    }
}

/**
 * Convert a Buffer to a Base64 string.
 * @param {Buffer} buffer - The image buffer.
 * @returns {string} - Base64 string.
 */
function bufferToBase64(buffer) {
    return buffer.toString("base64");
}