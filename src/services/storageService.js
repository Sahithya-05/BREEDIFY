import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Upload an animal image file or blob to Firebase Storage.
 * Stores file under animals/{timestamp}_{filename} and returns the public download URL.
 *
 * @param {File|Blob} fileOrBlob - Image file object or blob
 * @param {string} [customFileName] - Optional custom name for the file
 * @param {string} [folder='animals'] - Storage folder path
 * @returns {Promise<{ downloadUrl: string, storagePath: string, fileName: string }>}
 */
export async function uploadAnimalImage(fileOrBlob, customFileName = null, folder = 'animals') {
  if (!fileOrBlob) {
    throw new Error('No file provided for upload');
  }

  const timestamp = Date.now();
  const rawName = fileOrBlob.name || customFileName || `animal_${timestamp}.jpg`;
  // Sanitize filename to avoid weird characters in storage path
  const sanitizedName = rawName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `${folder}/${timestamp}_${sanitizedName}`;
  const storageRef = ref(storage, storagePath);

  // Metadata for better caching and content type
  const metadata = {
    contentType: fileOrBlob.type || 'image/jpeg',
    customMetadata: {
      uploadedAt: new Date().toISOString(),
      platform: 'BREEDIFY'
    }
  };

  try {
    const snapshot = await uploadBytes(storageRef, fileOrBlob, metadata);
    const downloadUrl = await getDownloadURL(snapshot.ref);

    return {
      downloadUrl,
      storagePath,
      fileName: sanitizedName
    };
  } catch (error) {
    console.error('Firebase Storage upload failed:', error);
    throw error;
  }
}

/**
 * Delete an image from Firebase Storage by path.
 *
 * @param {string} storagePath - Storage path (e.g., 'animals/12345_cow.jpg')
 * @returns {Promise<boolean>}
 */
export async function deleteAnimalImage(storagePath) {
  if (!storagePath) return false;
  try {
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    console.warn('Failed to delete image from Firebase Storage:', error);
    return false;
  }
}
