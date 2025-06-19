const MAX_HEIGHT = 240;
const MAX_WIDTH = 500;

export async function processImage(file, maxSizeInBytes = 5 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = async () => {
      const originalWidth = img.width;
      const originalHeight = img.height;

      let finalWidth = originalWidth;
      let finalHeight = originalHeight;

      // Only scale down if needed
      if (originalWidth > MAX_WIDTH || originalHeight > MAX_HEIGHT) {
        const scale = Math.min(
          MAX_WIDTH / originalWidth,
          MAX_HEIGHT / originalHeight
        );
        finalWidth = Math.round(originalWidth * scale);
        finalHeight = Math.round(originalHeight * scale);
      }

      // If already under 5MB, skip compression
      if (file.size <= maxSizeInBytes) {
        return resolve({
          file, // original file
          width: finalWidth,
          height: finalHeight,
        });
      }

      // Resize on canvas
      const canvas = document.createElement("canvas");
      canvas.width = finalWidth;
      canvas.height = finalHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, finalWidth, finalHeight);

      // Compression function
      const compressAtQuality = (quality) =>
        new Promise((res, rej) =>
          canvas.toBlob(
            (blob) =>
              blob ? res(blob) : rej(new Error("Compression failed.")),
            file.type,
            quality
          )
        );

      // Compress iteratively
      let quality = 0.9;
      let blob = await compressAtQuality(quality);

      while (blob.size > maxSizeInBytes && quality > 0.3) {
        quality = Math.max(quality - 0.1, 0.1);
        blob = await compressAtQuality(quality);
      }

      const compressedFile = new File([blob], file.name, { type: file.type });
      resolve({ file: compressedFile, width: finalWidth, height: finalHeight });
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
      const fileExt = file.name.split(".").pop(); // Extracts extension (e.g., jpg, png)

      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);

      const segmentWidth = img.width / 3;
      const segmentHeight = img.height / 3;

      let segments = [];

      // Get full image as a blob (Preserve original name)
      const fullBlob = await new Promise((resolve) =>
        canvas.toBlob(resolve, file.type)
      );
      segments.push({
        name: `${fileNameWithoutExt}.${fileExt}`,
        blob: fullBlob,
      });

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
            col * segmentWidth,
            row * segmentHeight,
            segmentWidth,
            segmentHeight, // Source
            0,
            0,
            segmentWidth,
            segmentHeight // Destination
          );

          // Convert segment to Blob
          const blob = await new Promise((resolve) =>
            segmentCanvas.toBlob(resolve, file.type)
          );

          // Store segment blob in array with original filename
          segments.push({
            name: `${fileNameWithoutExt}_segment_${row}_${col}.${fileExt}`,
            blob: blob,
          });
        }
      }

      resolve(segments);
    };

    img.onerror = () => reject(new Error("Failed to load image"));
  });
}