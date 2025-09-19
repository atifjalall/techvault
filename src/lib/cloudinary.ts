// src/lib/cloudinary.ts - Debug version with detailed error handling

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  error?: {
    message: string;
  };
}

export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  console.log("Starting Cloudinary upload for file:", file.name);

  try {
    // Check environment variables
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      console.error("Missing environment variables:");
      console.error("CLOUD_NAME:", cloudName);
      console.error("UPLOAD_PRESET:", uploadPreset);
      throw new Error(
        "Cloudinary configuration missing. Please check your environment variables."
      );
    }

    console.log("Using Cloudinary config:", { cloudName, uploadPreset });

    // Process the image first
    const processedFile = await processImageFile(file);
    console.log("Image processed successfully, size:", processedFile.size);

    const formData = new FormData();
    formData.append("file", processedFile);
    formData.append("upload_preset", uploadPreset);


    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    console.log("Making request to:", uploadUrl);

    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    console.log("Response status:", response.status);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    const responseText = await response.text();
    console.log("Raw response:", responseText);

    if (!response.ok) {
      console.error("Cloudinary API error:", response.status, responseText);

      try {
        const errorData = JSON.parse(responseText);
        throw new Error(
          `Cloudinary upload failed: ${errorData.error?.message || "Unknown error"}`
        );
      } catch (parseError) {
        throw new Error(
          `Cloudinary upload failed with status ${response.status}: ${responseText}`
        );
      }
    }

    const data: CloudinaryUploadResponse = JSON.parse(responseText);

    if (data.error) {
      throw new Error(`Cloudinary error: ${data.error.message}`);
    }

    console.log("Upload successful:", data.secure_url);
    return data.secure_url;
  } catch (error) {
    console.error("Detailed Cloudinary upload error:", error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("Unknown error during image upload");
    }
  }
};

// Simplified image processing without complex transformations
const processImageFile = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    // For debugging, let's first try without processing
    if (file.type.startsWith("image/") && file.size < 10 * 1024 * 1024) {
      // 10MB limit
      console.log("File is valid, proceeding with processing");

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        try {
          console.log("Original image dimensions:", img.width, "x", img.height);

          // Simple processing: just resize and add padding
          const maxSize = 800;
          const padding = 40;
          const availableSize = maxSize - padding * 2;

          let { width, height } = img;

          // Scale image to fit
          if (width > availableSize || height > availableSize) {
            const scale = Math.min(
              availableSize / width,
              availableSize / height
            );
            width *= scale;
            height *= scale;
          }

          console.log("Processed dimensions:", width, "x", height);

          // Set canvas size
          canvas.width = maxSize;
          canvas.height = maxSize;

          // Fill with white background
          if (ctx) {
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, maxSize, maxSize);

            // Center the image
            const x = (maxSize - width) / 2;
            const y = (maxSize - height) / 2;

            ctx.drawImage(img, x, y, width, height);

            // Convert to blob
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const processedFile = new File(
                    [blob],
                    `processed_${file.name}.png`,
                    {
                      type: "image/png",
                      lastModified: Date.now(),
                    }
                  );
                  console.log(
                    "Image processing complete, final size:",
                    processedFile.size
                  );
                  resolve(processedFile);
                } else {
                  reject(new Error("Failed to create image blob"));
                }
              },
              "image/png",
              0.9
            );
          } else {
            reject(new Error("Could not get canvas context"));
          }
        } catch (error) {
          console.error("Image processing error:", error);
          reject(error);
        }
      };

      img.onerror = (error) => {
        console.error("Image load error:", error);
        reject(new Error("Failed to load image for processing"));
      };

      img.src = URL.createObjectURL(file);
    } else {
      reject(new Error(`Invalid file: type=${file.type}, size=${file.size}`));
    }
  });
};

// Simple version that uploads original file for testing
export const uploadOriginalToCloudinary = async (
  file: File
): Promise<string> => {
  console.log("Uploading original file without processing");

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Missing Cloudinary configuration");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const responseText = await response.text();
  console.log("Original upload response:", responseText);

  if (!response.ok) {
    throw new Error(`Upload failed: ${responseText}`);
  }

  const data = JSON.parse(responseText);
  return data.secure_url;
};

export const uploadMultipleImages = async (
  files: File[]
): Promise<string[]> => {
  console.log(`Starting batch upload of ${files.length} files`);

  const uploadPromises = files.map(async (file, index) => {
    try {
      console.log(`Uploading file ${index + 1}/${files.length}:`, file.name);
      return await uploadImageToCloudinary(file);
    } catch (error) {
      console.error(`Failed to upload file ${index + 1}:`, error);
      throw error;
    }
  });

  return Promise.all(uploadPromises);
};
