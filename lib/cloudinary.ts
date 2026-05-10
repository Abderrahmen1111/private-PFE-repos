/**
 * Cloudinary Upload Utility
 * Handles uploading images and videos to Cloudinary for all product media.
 * Uses the unsigned upload preset 'ro2ya_reels' (same as Reels/Stories).
 */

const UPLOAD_PRESET = 'ro2ya_reels';

function getCloudName(): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set in .env.local');
  }
  return cloudName;
}

/**
 * Upload a single file (image or video) to Cloudinary.
 * @param file - The File object to upload
 * @param folder - Optional folder path in Cloudinary (e.g. 'products/123')
 * @returns The secure URL of the uploaded file, or null on failure
 */
export async function uploadToCloudinary(
  file: File,
  folder?: string
): Promise<string | null> {
  const cloudName = getCloudName();

  const isVideo = file.type.startsWith('video/');
  const endpoint = isVideo
    ? `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`
    : `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  if (folder) {
    // Replace slashes with hyphens as a workaround for the "Display name cannot contain slashes" error
    const safeFolder = folder.replace(/\//g, '-');
    formData.append('folder', safeFolder);
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('❌ Cloudinary upload error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      return null;
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('❌ Error uploading to Cloudinary:', error);
    return null;
  }
}

/**
 * Upload multiple files to Cloudinary in parallel.
 * @param files - Array of File objects
 * @param folder - Optional folder path
 * @returns Array of secure URLs (nulls filtered out)
 */
export async function uploadMultipleToCloudinary(
  files: File[],
  folder?: string
): Promise<string[]> {
  const results = await Promise.all(
    files.map((file) => uploadToCloudinary(file, folder))
  );
  return results.filter((url): url is string => url !== null);
}
