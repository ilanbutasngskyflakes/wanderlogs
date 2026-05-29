import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import {
    pickPhotoFromLibrary,
    takePhotoWithCamera,
    uploadPhoto,
} from "../../lib/photoService";
import { useAuthStore } from "../../stores/authStore";
import { updateEntry } from "../../lib/firestoreService";

interface SelectedPhoto {
  uri: string;
  width?: number;
  height?: number;
  tempId: string;
  uploading?: boolean;
}

export default function PhotoUploadScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { user } = useAuthStore();
  const params = route.params as {
    tripId: string;
    entryId: string;
    returnScreen?: string;
  };
  
  // Add logging to debug
  console.log("photo-upload params:", params);
  console.log("photo-upload tripId:", params?.tripId);
  console.log("photo-upload entryId:", params?.entryId);

  const [selectedPhotos, setSelectedPhotos] = useState<SelectedPhoto[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handlePickPhoto = async () => {
    try {
      const photo = await pickPhotoFromLibrary();
      if (photo) {
        setSelectedPhotos([
          ...selectedPhotos,
          {
            ...photo,
            tempId: `${Date.now()}-${Math.random()}`,
          },
        ]);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const photo = await takePhotoWithCamera();
      if (photo) {
        setSelectedPhotos([
          ...selectedPhotos,
          {
            ...photo,
            tempId: `${Date.now()}-${Math.random()}`,
          },
        ]);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleRemovePhoto = (tempId: string) => {
    setSelectedPhotos(selectedPhotos.filter((p) => p.tempId !== tempId));
  };

  const handleUploadPhotos = async () => {
    if (selectedPhotos.length === 0) {
      navigation.goBack();
      return;
    }

    if (!user?.id || !params.tripId || !params.entryId) {
      Alert.alert("Error", "Missing required information");
      return;
    }

    console.log("Selected photos to upload:", selectedPhotos.length);
    console.log("Entry IDs - tripId:", params.tripId, "entryId:", params.entryId);

    setIsUploading(true);
    try {
      const uploadedPhotos = [];
      for (let i = 0; i < selectedPhotos.length; i++) {
        const photo = selectedPhotos[i];
        console.log("Uploading photo", i, ":", photo.uri);
        const { url, storagePath } = await uploadPhoto(
          user.id,
          params.tripId,
          params.entryId,
          photo.uri,
          i,
        );
        console.log("Photo uploaded - URL:", url, "StoragePath:", storagePath);
        
        uploadedPhotos.push({
          id: `photo-${Date.now()}-${i}`,
          url,
          storagePath,
          width: photo.width,
          height: photo.height,
          order: i,
        });
      }

      console.log("Final uploadedPhotos array to save:", uploadedPhotos);
      await updateEntry(user.id, params.tripId, params.entryId, {
        photos: uploadedPhotos,
      });
      console.log("Entry updated with photos");

      navigation.goBack();
    } catch (error: any) {
      console.error("DEBUG: updateEntry error", error);
      Alert.alert("Error", error.message);
    } finally {
      setIsUploading(false);
    }
  };


  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#FAF8F5" }}>
      <View style={{ padding: 20, paddingTop: 60, paddingBottom: 40 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: "bold", color: "#1A1A1A" }}>
            Add Photos
          </Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: "#F0EFED",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <MaterialCommunityIcons name="close" size={20} color="#1A1A1A" />
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={{ gap: 12, marginBottom: 24 }}>
          <TouchableOpacity
            onPress={handlePickPhoto}
            disabled={isUploading}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#FFF",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#E0DDD9",
              paddingVertical: 14,
              gap: 8,
            }}
          >
            <MaterialCommunityIcons
              name="image-plus"
              size={20}
              color="#C85A3E"
            />
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#1A1A1A" }}>
              Pick from Library
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleTakePhoto}
            disabled={isUploading}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#FFF",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#E0DDD9",
              paddingVertical: 14,
              gap: 8,
            }}
          >
            <MaterialCommunityIcons
              name="camera-plus"
              size={20}
              color="#C85A3E"
            />
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#1A1A1A" }}>
              Take Photo
            </Text>
          </TouchableOpacity>
        </View>

        {/* Selected Photos */}
        {selectedPhotos.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#1A1A1A",
                marginBottom: 12,
              }}
            >
              Selected Photos ({selectedPhotos.length})
            </Text>
            <View style={{ gap: 12 }}>
              {selectedPhotos.map((photo) => (
                <View
                  key={photo.tempId}
                  style={{
                    backgroundColor: "#FFF",
                    borderRadius: 12,
                    overflow: "hidden",
                    borderWidth: 1,
                    borderColor: "#E0DDD9",
                  }}
                >
                  <Image
                    source={{ uri: photo.uri }}
                    style={{
                      width: "100%",
                      height: 200,
                      backgroundColor: "#E0DDD9",
                    }}
                  />
                  <View
                    style={{
                      padding: 12,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: 12, color: "#999" }}>
                      {photo.width} x {photo.height}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleRemovePhoto(photo.tempId)}
                      disabled={isUploading}
                    >
                      <MaterialCommunityIcons
                        name="delete"
                        size={20}
                        color="#C85A3E"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Upload Button */}
        <TouchableOpacity
          onPress={handleUploadPhotos}
          disabled={isUploading}
          style={{
            backgroundColor: "#C85A3E",
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: "center",
            opacity: isUploading ? 0.6 : 1,
          }}
        >
          {isUploading ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "600" }}>
              {selectedPhotos.length > 0 ? "Upload Photos" : "Done"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
