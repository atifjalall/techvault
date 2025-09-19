// src/lib/cloudinary.ts
interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
}

export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();

    // Convert to PNG and add white padding
    const processedFile = await processImageFile(file);

    formData.append("file", processedFile);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    );
    formData.append(
      "cloud_name",
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!
    );

    // Cloudinary transformations for consistent product images
    formData.append(
      "transformation",
      JSON.stringify([
        {
          width: 800,
          height: 800,
          crop: "pad",
          background: "white",
          format: "png",
          quality: "auto:best",
        },
      ])
    );

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to upload image to Cloudinary");
    }

    const data: CloudinaryUploadResponse = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Image upload failed");
  }
};

// Process image: convert to PNG and add white padding
const processImageFile = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      try {
        // Calculate dimensions with padding
        const maxSize = 800;
        const padding = 40; // 40px white padding on all sides
        const availableSize = maxSize - padding * 2;

        let { width, height } = img;

        // Scale image to fit within available space
        if (width > availableSize || height > availableSize) {
          const scale = Math.min(availableSize / width, availableSize / height);
          width *= scale;
          height *= scale;
        }

        // Set canvas size
        canvas.width = maxSize;
        canvas.height = maxSize;

        // Fill with white background
        ctx!.fillStyle = "white";
        ctx!.fillRect(0, 0, maxSize, maxSize);

        // Center the image with padding
        const x = (maxSize - width) / 2;
        const y = (maxSize - height) / 2;

        ctx!.drawImage(img, x, y, width, height);

        // Convert to PNG blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const processedFile = new File(
                [blob],
                `${file.name.split(".")[0]}.png`,
                {
                  type: "image/png",
                  lastModified: Date.now(),
                }
              );
              resolve(processedFile);
            } else {
              reject(new Error("Failed to process image"));
            }
          },
          "image/png",
          0.95
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
};

// Batch upload multiple images
export const uploadMultipleImages = async (
  files: File[]
): Promise<string[]> => {
  const uploadPromises = files.map((file) => uploadImageToCloudinary(file));
  return Promise.all(uploadPromises);
};
