import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const GEMINI_GEN_CAP_API_KEY = process.env.GEMINI_GEN_CAP_API_KEY;

  const ai = new GoogleGenAI({ apiKey: GEMINI_GEN_CAP_API_KEY });

  export async function getCaption(imageBlob) {
  
    const contents = [
        {
        inlineData: {
            mimeType: "image/jpeg",
            data: bufferToBase64(imageBlob),
        },
        },
        { text: "Describe this image in one sentence only. Do not add any introduction or extra text." },
    ];
    
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: contents,
    });

    return response.text
}

  
// const HF_TOKEN = process.env.HF_TOKEN;
// const MODEL = "Salesforce/blip-image-captioning-base";


// if (!HF_TOKEN) {
//     throw new Error("Missing Hugging Face API token! Set HF_TOKEN in .env file.");
// }


// export async function getCaption(imageBlob) {
//     try {      
//         const base64Image = bufferToBase64(imageBlob);
//         const response = await fetch(`https://api-inference.huggingface.co/models/${MODEL}`, {
//             method: "POST",
//             headers: {
//                 Authorization: `Bearer ${HF_TOKEN}`,
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify({ inputs: base64Image }),
//         });

//         if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//         }

//         const data = await response.json();
//         const captionText = data[0]?.generated_text || "No caption generated";

//         return captionText;
//     } catch (error) {
//         console.error("Error:", error.message);
//     }
// }

/**
 * Convert a Buffer to a Base64 string.
 * @param {Buffer} buffer - The image buffer.
 * @returns {string} - Base64 string.
 */
function bufferToBase64(buffer) {
    return buffer.toString("base64");
}