import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuthStore } from "../../stores/authStore";
import { useTripsStore } from "../../stores/tripsStore";
import {
  pickPhotoFromLibrary,
  PickedPhoto,
  uploadPhoto,
} from "../../lib/photoService";

export default function TripFormScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { user } = useAuthStore();
  const { createTrip, updateTrip } = useTripsStore();
  const params = route.params as { tripId?: string };
  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  );
  const [pickedCover, setPickedCover] = useState<PickedPhoto | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Allow saving a trip without a cover photo; cover is optional
  const isSaveEnabled = Boolean(
    !isLoading &&
      !isUploadingCover &&
      name.trim() &&
      destination.trim() &&
      startDate < endDate,
  );

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowStartPicker(false);
    }
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const openStartPicker = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: startDate,
        onChange: handleStartDateChange,
        mode: "date",
        is24Hour: true,
      });
    } else {
      setShowStartPicker(true);
    }
  };

  const openEndPicker = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: endDate,
        onChange: handleEndDateChange,
        mode: "date",
        is24Hour: true,
      });
    } else {
      setShowEndPicker(true);
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowEndPicker(false);
    }
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !destination.trim()) {
      Alert.alert("Missing Fields", "Please enter trip name and destination");
      return;
    }

    if (startDate >= endDate) {
      Alert.alert("Invalid Dates", "End date must be after start date");
      return;
    }

    console.log("TripForm: submit", { name, destination, startDate, endDate, pickedCover, user });
    setIsLoading(true);
    try {
      if (!user?.id) {
        // If the user isn't signed in, send them to login instead of throwing
        navigation.navigate("login");
        return;
      }

      if (params.tripId) {
        // If editing existing trip and user picked a new cover, upload it first
        let updates: any = { name, destination, startDate, endDate };
        if (pickedCover) {
          setIsUploadingCover(true);
          const uploaded = await uploadPhoto(
            user.id,
            params.tripId,
            "cover",
            pickedCover.uri,
            0,
          );
          updates.coverPhotoUrl = uploaded.url;
          setIsUploadingCover(false);
        }

        await updateTrip(user.id, params.tripId, updates);
      } else {
        // Create trip first so we have a tripId to upload cover into
        const newTrip = await createTrip(user.id, {
          name,
          destination,
          startDate,
          endDate,
          coverPhotoUrl: undefined,
        });

        if (pickedCover) {
          setIsUploadingCover(true);
          const uploaded = await uploadPhoto(
            user.id,
            newTrip.id,
            "cover",
            pickedCover.uri,
            0,
          );
          await updateTrip(user.id, newTrip.id, { coverPhotoUrl: uploaded.url });
          setIsUploadingCover(false);
        }
      }

      // Success - show a toast/alert and navigate to journal
      try {
        Alert.alert("Saved", "Trip saved successfully.", [
          { text: "OK", onPress: () => navigation.navigate("(tabs)", { screen: "journal" }) },
        ]);
      } catch (e) {
        // Fallback to direct navigation if Alert fails
        console.log("TripForm: navigation fallback", e);
        navigation.navigate("(tabs)", { screen: "journal" });
      }
    } catch (error: any) {
      console.error("TripForm: save error", error);
      Alert.alert("Error", error.message || "Failed to save trip");
    } finally {
      setIsLoading(false);
      setIsUploadingCover(false);
    }
  };

  // Debug: log auth user and show visible alert when unauthenticated
  useEffect(() => {
    console.log("Auth user:", user);
    if (!user?.id) {
      if (Platform.OS === "web") {
        try {
          window.alert("User not authenticated — please sign in to save trips.");
        } catch (e) {
          console.warn("Unable to show window.alert", e);
        }
      } else {
        Alert.alert("Not signed in", "Please sign in to save trips.");
      }
    }
  }, [user]);

  const handlePickCover = async () => {
    try {
      const photo = await pickPhotoFromLibrary();
      if (photo) setPickedCover(photo);
    } catch (error: any) {
      Alert.alert("Photo Error", error.message || "Failed to pick photo");
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#FAF8F5" }}>
      <View style={{ padding: 20, paddingTop: 24 }}>
        {/* Header with back + title + save */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 18,
          }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ fontSize: 18, color: "#1A1A1A" }}>{"←"}</Text>
          </TouchableOpacity>

          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: "#1A1A1A",
            }}
          >
            {params.tripId ? "Edit Trip" : "New Trip"}
          </Text>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!isSaveEnabled}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
              backgroundColor: isSaveEnabled ? "#7A9B76" : "#EDEBE9",
              ...Platform.select({
                web: {
                  boxShadow: isSaveEnabled ? "0 2px 4px rgba(0,0,0,0.15)" : undefined,
                },
                default: {
                  elevation: isSaveEnabled ? 3 : 0,
                  shadowColor: isSaveEnabled ? "#000" : undefined,
                  shadowOffset: isSaveEnabled ? { width: 0, height: 2 } : undefined,
                  shadowOpacity: isSaveEnabled ? 0.15 : undefined,
                  shadowRadius: isSaveEnabled ? 4 : undefined,
                },
              }),
            }}
          >
            <Text
              style={{
                color: isSaveEnabled ? "#FFF" : "#9E9A98",
                fontWeight: "600",
              }}
            >
              Save
            </Text>
          </TouchableOpacity>
        </View>

        {/* Cover Photo */}
        <TouchableOpacity
          onPress={handlePickCover}
          disabled={isLoading || isUploadingCover}
          style={{
            height: 160,
            borderWidth: 1,
            borderColor: "#E6E1DE",
            borderRadius: 12,
            backgroundColor: "#FFF",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 24,
            overflow: "hidden",
          }}
        >
          {pickedCover ? (
            <Image
              source={{ uri: pickedCover.uri }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          ) : isUploadingCover ? (
            <ActivityIndicator />
          ) : (
            <Text style={{ color: "#B7B0A9" }}>🖼️ Upload Cover Photo</Text>
          )}
        </TouchableOpacity>

        {/* Trip Name */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#1A1A1A",
              marginBottom: 8,
            }}
          >
            Trip Name *
          </Text>
          <TextInput
            placeholder="e.g., Summer Europe 2026"
            value={name}
            onChangeText={setName}
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

        {/* Destination */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#1A1A1A",
              marginBottom: 8,
            }}
          >
            Destination *
          </Text>
          <TextInput
            placeholder="e.g., Paris, France"
            value={destination}
            onChangeText={setDestination}
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

        {/* Dates row (two columns) */}
        <View style={{ marginBottom: 24, flexDirection: "row" }}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#1A1A1A",
                marginBottom: 8,
              }}
            >
              Start Date *
            </Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: "#D0CCC8",
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 12,
                backgroundColor: "#FFF",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <TouchableOpacity onPress={openStartPicker} disabled={isLoading} style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, color: "#1A1A1A" }}>
                    {format(startDate, "MMM dd, yyyy")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={openStartPicker} disabled={isLoading} style={{ paddingLeft: 8 }}>
                  <Text style={{ fontSize: 18, color: "#C85A3E" }}>📅</Text>
                </TouchableOpacity>
              </View>
            </View>
            {showStartPicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display={Platform.OS === "android" ? "calendar" : "spinner"}
                onChange={handleStartDateChange}
              />
            )}
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#1A1A1A",
                marginBottom: 8,
              }}
            >
              End Date *
            </Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: "#D0CCC8",
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 12,
                backgroundColor: "#FFF",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <TouchableOpacity onPress={openEndPicker} disabled={isLoading} style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, color: "#1A1A1A" }}>
                    {format(endDate, "MMM dd, yyyy")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={openEndPicker} disabled={isLoading} style={{ paddingLeft: 8 }}>
                  <Text style={{ fontSize: 18, color: "#C85A3E" }}>📅</Text>
                </TouchableOpacity>
              </View>
            </View>
            {showEndPicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display={Platform.OS === "android" ? "calendar" : "spinner"}
                onChange={handleEndDateChange}
              />
            )}
          </View>
        </View>

        {/* spacing at bottom so content sits above tab bar */}
        <View style={{ height: 96 }} />
      </View>
    </ScrollView>
  );
}
