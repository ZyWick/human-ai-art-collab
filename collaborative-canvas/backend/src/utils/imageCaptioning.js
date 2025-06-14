import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const GEMINI_GEN_CAP_API_KEY = process.env.GEMINI_GEN_CAP_API_KEY;
const GEMINI_GEN_CAP_MODEL = process.env.GEMINI_GEN_CAP_MODEL;
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
        model: GEMINI_GEN_CAP_MODEL,
        contents: contents,
    });

    return response.text
}


/**
 * Convert a Buffer to a Base64 string.
 * @param {Buffer} buffer - The image buffer.
 * @returns {string} - Base64 string.
 */
function bufferToBase64(buffer) {
    return buffer.toString("base64");
}
