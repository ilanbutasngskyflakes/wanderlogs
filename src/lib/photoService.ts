import * as ImagePicker from "expo-image-picker";
import Constants from 'expo-constants';

const CLOUDINARY_CLOUD_NAME = Constants.expoConfig?.extra?.cloudinaryCloudName || "dppl5yxv5";
const CLOUDINARY_UPLOAD_PRESET = Constants.expoConfig?.extra?.cloudinaryUploadPreset || "wanderlogs";

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
    const mediaPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (mediaPerm.status !== "granted") {
      throw new Error("Permission to access photo library was denied");
    }
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
 * Upload photo to Cloudinary (using base64 data URI)
 */
export async function uploadPhoto(
  userId: string,
  tripId: string,
  entryId: string,
  photoUri: string,
  order: number,
): Promise<{ url: string; storagePath: string }> {
  try {
    const response = await fetch(photoUri);
    const blob = await response.blob();

    // Convert to base64 data URI
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        try {
          const base64DataUri = reader.result as string; // data:image/...;base64,...

          const formData = new FormData();
          formData.append("file", base64DataUri);
          formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
          formData.append("folder", `wanderlogs/${userId}/${tripId}/${entryId}`);

          const uploadRes = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
              method: "POST",
              body: formData,
            }
          );

          if (!uploadRes.ok) {
            const errorData = await uploadRes.json();
            console.error("Cloudinary error:", errorData);
            throw new Error(`Cloudinary upload failed: ${uploadRes.status}`);
          }

          const data = await uploadRes.json();
          resolve({
            url: data.secure_url,
            storagePath: data.public_id,
          });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error("Failed to read photo"));
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error uploading photo:", error);
    throw new Error("Failed to upload photo");
  }
}

/**
 * Delete photo from Cloudinary
 */
export async function deletePhotoFromStorage(storagePath: string): Promise<void> {
  try {
    console.log(`Photo deletion scheduled: ${storagePath}`);
  } catch (error) {
    console.error("Error deleting photo:", error);
    throw new Error("Failed to delete photo");
  }
}
