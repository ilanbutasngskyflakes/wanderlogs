import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuthStore } from "../../stores/authStore";
import { useTripsStore } from "../../stores/tripsStore";

export default function TripFormScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { createTrip, updateTrip } = useTripsStore();
  const params = useLocalSearchParams<{ tripId?: string }>();

  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  );
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowStartPicker(false);
    }
    if (selectedDate) {
      setStartDate(selectedDate);
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

    setIsLoading(true);
    try {
      if (!user?.id) throw new Error("User not authenticated");

      if (params.tripId) {
        await updateTrip(user.id, params.tripId, {
          name,
          destination,
          startDate,
          endDate,
        });
      } else {
        await createTrip(user.id, {
          name,
          destination,
          startDate,
          endDate,
          coverPhotoUrl: undefined,
        });
      }

      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save trip");
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
          {params.tripId ? "Edit Trip" : "New Trip"}
        </Text>

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

        {/* Start Date */}
        <View style={{ marginBottom: 24 }}>
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
          <TouchableOpacity
            onPress={() => setShowStartPicker(!showStartPicker)}
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
              {format(startDate, "MMM dd, yyyy")}
            </Text>
          </TouchableOpacity>
          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleStartDateChange}
            />
          )}
        </View>

        {/* End Date */}
        <View style={{ marginBottom: 24 }}>
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
          <TouchableOpacity
            onPress={() => setShowEndPicker(!showEndPicker)}
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
              {format(endDate, "MMM dd, yyyy")}
            </Text>
          </TouchableOpacity>
          {showEndPicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleEndDateChange}
            />
          )}
        </View>

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
              {params.tripId ? "Update Trip" : "Create Trip"}
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
