import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
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

export default function EntryFormScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { createEntry } = useEntriesStore();
  const { selectedTags, toggleTag } = useHighlightsStore();
  const params = useLocalSearchParams<{ tripId: string }>();

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
      if (!user?.id || !params.tripId) throw new Error("Missing user or trip");

      await createEntry(user.id, params.tripId, {
        placeName,
        description,
        latitude,
        longitude,
        locationName,
        date,
        highlightTags: selectedTags,
        isFavorite,
        photos: [],
      });

      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create entry");
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

        {/* Add Photos Button */}
        <TouchableOpacity
          onPress={() => {
            if (!params.tripId) {
              Alert.alert("Error", "Trip ID required");
              return;
            }
            router.navigate({
              pathname: "../photo-upload",
              params: { tripId: params.tripId, entryId: "temp" },
            });
          }}
          disabled={isLoading}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#FFF",
            borderRadius: 12,
            paddingVertical: 12,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: "#E0DDD9",
            gap: 8,
          }}
        >
          <MaterialCommunityIcons name="image-plus" size={20} color="#C85A3E" />
          <Text style={{ color: "#C85A3E", fontSize: 14, fontWeight: "600" }}>
            Add Photos (Optional)
          </Text>
        </TouchableOpacity>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isLoading}
          style={{
            backgroundColor: "#C85A3E",
            borderRadius: 12,
            paddingVertical: 12,
            alignItems: "center",
            marginBottom: 16,
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "600" }}>
              Create Entry
            </Text>
          )}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          disabled={isLoading}
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
