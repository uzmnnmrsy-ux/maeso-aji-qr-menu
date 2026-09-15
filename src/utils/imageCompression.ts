/**
 * Client-side image resizing and compression utility.
 * - Resizes images to a maximum width (default: 1000px) maintaining aspect ratio.
 * - Compresses output to JPEG format with specified quality (default: 0.8 / 80%).
 * - Preserves transparent areas by flattening onto a clean white background.
 */
export async function compressAndResizeImage(
  file: File,
  maxWidth = 1000,
  quality = 0.8
): Promise<File> {
  // If not an image file, return original
  if (!file.type.startsWith('image/')) {
    return file;
  }

  // SVG files are vectors and shouldn't be rasterized through canvas compression
  if (file.type === 'image/svg+xml') {
    return file;
  }

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      try {
        let { width, height } = img;

        // If larger than maxWidth, scale down proportionally
        if (width > maxWidth) {
          const ratio = maxWidth / width;
          width = maxWidth;
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // If canvas context fails, fallback to original file
          resolve(file);
          return;
        }

        // Fill background with white (handles PNG transparency without black artifact)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }

            // Generate clean JPEG filename
            const originalBaseName = file.name.replace(/\.[^/.]+$/, '') || 'menu-item';
            const compressedFile = new File([blob], `${originalBaseName}.jpg`, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });

            console.log(
              `[ImageCompression] Original: ${(file.size / 1024).toFixed(1)} KB (${img.naturalWidth}x${img.naturalHeight}) -> Compressed: ${(compressedFile.size / 1024).toFixed(1)} KB (${width}x${height})`
            );

            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      } catch (err) {
        console.warn('[ImageCompression] Error during compression, using original file:', err);
        resolve(file);
      }
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      console.warn('[ImageCompression] Failed to load image for compression, using original:', err);
      resolve(file);
    };

    img.src = objectUrl;
  });
}
