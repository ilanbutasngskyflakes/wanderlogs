import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import * as Location from "expo-location";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuthStore } from "../../stores/authStore";
import { useEntriesStore } from "../../stores/entriesStore";
import {
    HIGHLIGHT_TAGS,
    useHighlightsStore,
} from "../../stores/highlightsStore";
import { pickPhotoFromLibrary, takePhotoWithCamera, uploadPhoto, PickedPhoto } from "../../lib/photoService";

export default function EntryFormScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = route.params as { tripId: string };
  console.log("entry-form params:", params);
  console.log("entry-form tripId:", params?.tripId);
  const { user } = useAuthStore();
  const { createEntry } = useEntriesStore();
  const { selectedTags, toggleTag } = useHighlightsStore();
  const [placeName, setPlaceName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationName, setLocationName] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<PickedPhoto[]>([]);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);

  // Request location permission on mount
  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        await getLocation();
      }
    } catch (error) {
      console.error("Location permission error:", error);
    }
  };

  const getLocation = async () => {
    setIsGettingLocation(true);
    try {
      const location = await Location.getCurrentPositionAsync({});
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);

      // Try to get place name from reverse geocoding
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const place = reverseGeocode[0];
        const name = [place.city, place.region, place.country]
          .filter(Boolean)
          .join(", ");
        setLocationName(name);
      }
    } catch (error) {
      console.error("Location error:", error);
      Alert.alert("Location", "Could not get your location");
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handlePickPhoto = async () => {
    try {
      const photo = await pickPhotoFromLibrary();
      if (photo) {
        setSelectedPhotos([...selectedPhotos, photo]);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to pick photo");
    }
  };

  const handleTakePhoto = async () => {
    try {
      const photo = await takePhotoWithCamera();
      if (photo) {
        setSelectedPhotos([...selectedPhotos, photo]);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to take photo");
    }
  };

  const handleRemovePhoto = (index: number) => {
    setSelectedPhotos(selectedPhotos.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!placeName.trim()) {
      Alert.alert("Missing Fields", "Please enter a place name");
      return;
    }

    if (latitude === null || longitude === null) {
      Alert.alert("Location Required", "Please provide location information");
      return;
    }

    setIsLoading(true);

    try {
      if (!user?.id) {
        navigation.navigate("login");
        return;
      }

      if (!params.tripId) {
        Alert.alert("Error", "Trip ID required");
        return;
      }

      let uploadedPhotoUrls: any[] = [];

      // Upload photos first
      if (selectedPhotos.length > 0) {
        setIsUploadingPhotos(true);

        uploadedPhotoUrls = await Promise.all(
          selectedPhotos.map(async (photo) => {
            const photoData = await uploadPhoto(
              user.id,
              params.tripId,
              "temp",
              photo.uri,
              0
            );
            return photoData;
          })
        );

        setIsUploadingPhotos(false);
      }

      // Create ONLY ONE entry with photos
      await createEntry(user.id, params.tripId, {
        placeName,
        description,
        latitude,
        longitude,
        locationName,
        date,
        highlightTags: selectedTags,
        isFavorite,
        photos: uploadedPhotoUrls,
      });

      Alert.alert("Success", "Entry created successfully!");

      navigation.goBack();
    } catch (error: any) {
      console.error(error);

      Alert.alert(
        "Error",
        error.message || "Failed to create entry"
      );

      setIsUploadingPhotos(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#FAF8F5" }}>
      <View style={{ padding: 20, paddingTop: 40 }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: "#1A1A1A",
            marginBottom: 24,
          }}
        >
          New Entry
        </Text>

        {/* Place Name */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#1A1A1A",
              marginBottom: 8,
            }}
          >
            Place Name *
          </Text>
          <TextInput
            placeholder="e.g., Eiffel Tower"
            value={placeName}
            onChangeText={setPlaceName}
            editable={!isLoading}
            style={{
              borderWidth: 1,
              borderColor: "#D0CCC8",
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 12,
              fontSize: 16,
              color: "#1A1A1A",
            }}
          />
        </View>

        {/* Description */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#1A1A1A",
              marginBottom: 8,
            }}
          >
            Description
          </Text>
          <TextInput
            placeholder="What happened here?"
            value={description}
            onChangeText={setDescription}
            editable={!isLoading}
            multiline
            numberOfLines={4}
            style={{
              borderWidth: 1,
              borderColor: "#D0CCC8",
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 12,
              fontSize: 16,
              color: "#1A1A1A",
              textAlignVertical: "top",
            }}
          />
        </View>

        {/* Date */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#1A1A1A",
              marginBottom: 8,
            }}
          >
            Date *
          </Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            disabled={isLoading}
            style={{
              borderWidth: 1,
              borderColor: "#D0CCC8",
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 12,
              backgroundColor: "#FFF",
            }}
          >
            <Text style={{ fontSize: 16, color: "#1A1A1A" }}>
              {format(date, "MMM dd, yyyy")}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </View>

        {/* Location */}
        <View style={{ marginBottom: 24 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#1A1A1A" }}>
              Location *
            </Text>
            <TouchableOpacity
              onPress={getLocation}
              disabled={isGettingLocation}
            >
              {isGettingLocation ? (
                <ActivityIndicator size="small" color="#C85A3E" />
              ) : (
                <MaterialCommunityIcons
                  name="crosshairs-gps"
                  size={20}
                  color="#C85A3E"
                />
              )}
            </TouchableOpacity>
          </View>
          <TextInput
            placeholder="Location name"
            value={locationName}
            onChangeText={setLocationName}
            editable={!isLoading}
            style={{
              borderWidth: 1,
              borderColor: "#D0CCC8",
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 12,
              fontSize: 16,
              color: "#1A1A1A",
              marginBottom: 8,
            }}
          />
          <Text style={{ fontSize: 12, color: "#999" }}>
            {latitude && longitude
              ? `📍 ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
              : "No location"}
          </Text>
        </View>

        {/* Highlights */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#1A1A1A",
              marginBottom: 8,
            }}
          >
            Highlights
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {HIGHLIGHT_TAGS.map((tag) => (
              <TouchableOpacity
                key={tag}
                onPress={() => toggleTag(tag)}
                style={{
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderWidth: 2,
                  borderColor: selectedTags.includes(tag)
                    ? "#C85A3E"
                    : "#D0CCC8",
                  backgroundColor: selectedTags.includes(tag)
                    ? "#FFF5F2"
                    : "#FFF",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: selectedTags.includes(tag) ? "#C85A3E" : "#999",
                  }}
                >
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Favorite Toggle */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
            backgroundColor: "#FFF",
            borderRadius: 12,
            padding: 12,
            borderWidth: 1,
            borderColor: "#E0DDD9",
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: "600", color: "#1A1A1A" }}>
            Mark as Favorite
          </Text>
          <Switch value={isFavorite} onValueChange={setIsFavorite} />
        </View>

        {/* Photos Section */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#1A1A1A",
              marginBottom: 8,
            }}
          >
            Photos ({selectedPhotos.length})
          </Text>
          
          {/* Photo Buttons */}
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
            <TouchableOpacity
              onPress={handlePickPhoto}
              disabled={isLoading || isUploadingPhotos}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#FFF",
                borderRadius: 12,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: "#E0DDD9",
                gap: 6,
              }}
            >
              <MaterialCommunityIcons name="image-plus" size={18} color="#C85A3E" />
              <Text style={{ color: "#C85A3E", fontSize: 12, fontWeight: "600" }}>
                Pick
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleTakePhoto}
              disabled={isLoading || isUploadingPhotos}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#FFF",
                borderRadius: 12,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: "#E0DDD9",
                gap: 6,
              }}
            >
              <MaterialCommunityIcons name="camera-plus" size={18} color="#C85A3E" />
              <Text style={{ color: "#C85A3E", fontSize: 12, fontWeight: "600" }}>
                Take
              </Text>
            </TouchableOpacity>
          </View>

          {/* Photo Previews */}
          {selectedPhotos.length > 0 && (
            <View style={{ gap: 8 }}>
              {selectedPhotos.map((photo, index) => (
                <View key={index} style={{ position: "relative" }}>
                  <Image
                    source={{ uri: photo.uri }}
                    style={{
                      width: "100%",
                      height: 120,
                      borderRadius: 12,
                      backgroundColor: "#E0DDD9",
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => handleRemovePhoto(index)}
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      backgroundColor: "rgba(0,0,0,0.6)",
                      borderRadius: 20,
                      width: 28,
                      height: 28,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <MaterialCommunityIcons name="close" size={16} color="#FFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          onPress={handleSubmit}
          disabled={isLoading || isUploadingPhotos}
          style={{
            backgroundColor: "#C85A3E",
            borderRadius: 12,
            paddingVertical: 12,
            alignItems: "center",
            marginBottom: 16,
            opacity: isLoading || isUploadingPhotos ? 0.6 : 1,
          }}
        >
          {isLoading || isUploadingPhotos ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "600" }}>
              Create Entry
            </Text>
          )}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          disabled={isLoading || isUploadingPhotos}
          style={{
            backgroundColor: "#E0DDD9",
            borderRadius: 12,
            paddingVertical: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#1A1A1A", fontSize: 16, fontWeight: "600" }}>
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
