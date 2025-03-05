import fetch from "node-fetch";
import sharp from "sharp";

const MAX_WIDTH = 270;
const MAX_HEIGHT = 1000;

export async function getImageDimensions(imageUrl) {
    try {
        // Fetch the image from the external URL
        const response = await fetch(imageUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
        if (!response.ok) throw new Error("Failed to fetch image");

        // Convert response to buffer
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Get image metadata
        const metadata = await sharp(buffer).metadata();
        let { width, height } = metadata;

        // Scale down if needed
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
            const scale = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
            width = Math.round(width * scale);
            height = Math.round(height * scale);
        }

        return { width, height };
    } catch (error) {
        console.error("Error processing image:", error);
        throw error;
    }
}
