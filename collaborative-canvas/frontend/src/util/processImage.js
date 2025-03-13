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
      canvas.toBlob(
        (blob) => {
          resolve({
            file: new File([blob], file.name, { type: file.type }),
            width,
            height,
          });
        },
        file.type,
        COMPRESSION_QUALITY
      );
    };
    img.onerror = reject;
  });
}

export async function segmentImage(file) {
  return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = async () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // Get original file name without extension
          const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, ""); // Removes extension
          const fileExt = file.name.split('.').pop(); // Extracts extension (e.g., jpg, png)

          // Set canvas size to match image
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0, img.width, img.height);

          const segmentWidth = img.width / 3;
          const segmentHeight = img.height / 3;

          let segments = [];

          // Get full image as a blob (Preserve original name)
          const fullBlob = await new Promise((resolve) => canvas.toBlob(resolve, file.type));
          segments.push({ name: `${fileNameWithoutExt}.${fileExt}`, blob: fullBlob });

          // Get 3×3 segments
          for (let row = 0; row < 3; row++) {
              for (let col = 0; col < 3; col++) {
                  // Create a temporary canvas for each segment
                  const segmentCanvas = document.createElement("canvas");
                  segmentCanvas.width = segmentWidth;
                  segmentCanvas.height = segmentHeight;
                  const segmentCtx = segmentCanvas.getContext("2d");

                  segmentCtx.drawImage(
                      canvas,
                      col * segmentWidth, row * segmentHeight, segmentWidth, segmentHeight, // Source
                      0, 0, segmentWidth, segmentHeight // Destination
                  );

                  // Convert segment to Blob
                  const blob = await new Promise((resolve) => segmentCanvas.toBlob(resolve, file.type));

                  // Store segment blob in array with original filename
                  segments.push({
                      name: `${fileNameWithoutExt}_segment_${row}_${col}.${fileExt}`,
                      blob: blob
                  });
              }
          }

          resolve(segments);
      };

      img.onerror = () => reject(new Error("Failed to load image"));
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
