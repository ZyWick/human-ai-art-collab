const MAX_WIDTH = 270;
const MAX_HEIGHT = 1000;
const COMPRESSION_QUALITY = 0.75; // 0.0 (worst) to 1.0 (best)

export async function processImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            let { width, height } = img;

            // Scale down if necessary
            if (width > MAX_WIDTH || height > MAX_HEIGHT) {
                const scale = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
                width = Math.round(width * scale);
                height = Math.round(height * scale);
            }

            // Draw image on canvas
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);

            // Convert canvas to compressed Blob
            canvas.toBlob((blob) => {
                resolve({
                    file: new File([blob], file.name, { type: file.type }),
                    width,
                    height,
                });
            }, file.type, COMPRESSION_QUALITY);
        };
        img.onerror = reject;
    });
}


//  CORS ISSUE
// export async function processImageUrl(imageUrl) {
//     return new Promise((resolve, reject) => {
//         const img = new Image();
//         img.src = imageUrl;
//         img.crossOrigin = "anonymous"; // Prevents CORS issues for external images

//         img.onload = () => {
//             let { width, height } = img;

//             // Scale down if necessary
//             if (width > MAX_WIDTH || height > MAX_HEIGHT) {
//                 const scale = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
//                 width = Math.round(width * scale);
//                 height = Math.round(height * scale);
//             }

//             resolve({ width, height });
//         };

//         img.onerror = () => {
//             reject(new Error("Failed to load image"));
//         };
//     });
// }
