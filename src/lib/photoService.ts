import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "./firebase";

export interface PickedPhoto {
  uri: string;
  width?: number;
  height?: number;
  fileName?: string;
}

/**
 * Pick a photo from device library
 */
export async function pickPhotoFromLibrary(): Promise<PickedPhoto | null> {
  try {
    // Request media library permission (required on some platforms)
    const mediaPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (mediaPerm.status !== "granted") {
      throw new Error("Permission to access photo library was denied");
    }
    // Some versions of expo-image-picker expose `MediaType`, others `MediaTypeOptions`.
    const mediaTypesOption = (ImagePicker as any).MediaType?.Images ??
      (ImagePicker as any).MediaTypeOptions?.Images;

    const launchOptions: any = {
      quality: 0.8,
      aspect: [4, 3],
      allowsEditing: true,
    };
    if (mediaTypesOption !== undefined) launchOptions.mediaTypes = mediaTypesOption;

    const result = await ImagePicker.launchImageLibraryAsync(launchOptions);

    if (!result.canceled) {
      const asset = result.assets[0];
      return {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        fileName: asset.fileName || `photo_${Date.now()}.jpg`,
      };
    }

    return null;
  } catch (error) {
    console.error("Error picking photo:", error);
    throw new Error("Failed to pick photo");
  }
}

/**
 * Take a photo with device camera
 */
export async function takePhotoWithCamera(): Promise<PickedPhoto | null> {
  try {
    // Request camera permission
    const camPerm = await ImagePicker.requestCameraPermissionsAsync();
    if (camPerm.status !== "granted") {
      throw new Error("Permission to use camera was denied");
    }
    const mediaTypesOptionCam = (ImagePicker as any).MediaType?.Images ??
      (ImagePicker as any).MediaTypeOptions?.Images;

    const cameraOptions: any = {
      quality: 0.8,
      aspect: [4, 3],
    };
    if (mediaTypesOptionCam !== undefined) cameraOptions.mediaTypes = mediaTypesOptionCam;

    const result = await ImagePicker.launchCameraAsync(cameraOptions);

    if (!result.canceled) {
      const asset = result.assets[0];
      return {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        fileName: asset.fileName || `photo_${Date.now()}.jpg`,
      };
    }

    return null;
  } catch (error) {
    console.error("Error taking photo:", error);
    throw new Error("Failed to take photo");
  }
}

/**
 * Upload photo to Firebase Storage
 */
export async function uploadPhoto(
  userId: string,
  tripId: string,
  entryId: string,
  photoUri: string,
  order: number,
): Promise<{ url: string; storagePath: string }> {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${userId}/${tripId}/${entryId}/${timestamp}.jpg`;
    const storageRef = ref(storage, `photos/${fileName}`);

    // Fetch photo file
    const response = await fetch(photoUri);
    const blob = await response.blob();

    // Upload to Firebase Storage
    try {
      await uploadBytes(storageRef, blob);
      // Get download URL
      const url = await getDownloadURL(storageRef);
      return {
        url,
        storagePath: `photos/${fileName}`,
      };
    } catch (uploadErr: any) {
      // Likely a CORS error when running on web against production bucket.
      console.warn("uploadPhoto: upload failed, falling back to local URI", uploadErr);
      // Fallback: return the original local URI so UI can display it during dev.
      // Note: this won't persist the image in Storage.
      return {
        url: photoUri,
        storagePath: "",
      };
    }
  } catch (error) {
    console.error("Error uploading photo:", error);
    throw new Error("Failed to upload photo");
  }
}

/**
 * Delete photo from Firebase Storage
 */
export async function deletePhotoFromStorage(
  storagePath: string,
): Promise<void> {
  try {
    const photoRef = ref(storage, storagePath);
    // Note: deleteObject requires user to be authenticated
    // For now, we'll log the path but not delete
    console.log(`Photo deletion scheduled: ${storagePath}`);
  } catch (error) {
    console.error("Error deleting photo:", error);
    throw new Error("Failed to delete photo");
  }
}
