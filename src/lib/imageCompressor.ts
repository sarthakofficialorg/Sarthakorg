/**
 * Compresses a base64 image (data URL) or file to a maximum dimension and quality.
 */
export function compressImage(
  dataUrl: string,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.6
): Promise<string> {
  return new Promise((resolve) => {
    // If it's not a data URL, don't compress
    if (!dataUrl || !dataUrl.startsWith('data:image/')) {
      resolve(dataUrl);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions keeping aspect ratio
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl); // fallback if context creation fails
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      try {
        // Output as jpeg with specified quality
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      } catch (e) {
        console.error("Failed to compress image:", e);
        resolve(dataUrl); // fallback to original on error
      }
    };

    img.onerror = (err) => {
      console.error("Error loading image for compression:", err);
      resolve(dataUrl); // fallback to original on error
    };

    img.src = dataUrl;
  });
}
