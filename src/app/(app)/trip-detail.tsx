import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { getTrip } from "../../lib/firestoreService";
import { useAuthStore } from "../../stores/authStore";
import { useEntriesStore } from "../../stores/entriesStore";
import { useTripsStore } from "../../stores/tripsStore";

export default function TripDetailScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { deleteTrip } = useTripsStore();
  const {
    entries,
    subscribeToEntriesForTrip,
    unsubscribeFromEntriesForTrip,
    deleteEntry,
  } = useEntriesStore();
  const params = useLocalSearchParams<{ tripId: string }>();
  const [tripData, setTripData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!user?.id || !params.tripId) return;

    const loadTrip = async () => {
      try {
        const trip = await getTrip(user.id, params.tripId);
        if (trip) {
          setTripData(trip);
        }
      } catch (error) {
        console.error("Failed to load trip:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTrip();
    // Subscribe to real-time entries for this trip
    subscribeToEntriesForTrip(user.id, params.tripId);

    return () => {
      unsubscribeFromEntriesForTrip();
    };
  }, [
    user?.id,
    params.tripId,
    subscribeToEntriesForTrip,
    unsubscribeFromEntriesForTrip,
  ]);

  const handleEditTrip = () => {
    router.push({
      pathname: "/trip-form" as any,
      params: { tripId: params.tripId },
    });
  };

  const handleDeleteTrip = () => {
    Alert.alert(
      "Delete Trip",
      "This will delete the trip and all entries. Continue?",
      [
        { text: "Cancel", onPress: () => {} },
        {
          text: "Delete",
          onPress: async () => {
            if (!user?.id) return;
            setIsDeleting(true);
            try {
              await deleteTrip(user.id, params.tripId);
              router.back();
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to delete trip");
            } finally {
              setIsDeleting(false);
            }
          },
          style: "destructive",
        },
      ],
    );
  };

  const handleDeleteEntry = (entryId: string) => {
    Alert.alert(
      "Delete Entry",
      "This will delete the entry and all its photos. Continue?",
      [
        { text: "Cancel", onPress: () => {} },
        {
          text: "Delete",
          onPress: async () => {
            if (!user?.id) return;
            try {
              await deleteEntry(user.id, params.tripId, entryId);
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to delete entry");
            }
          },
          style: "destructive",
        },
      ],
    );
  };

  const handleAddEntry = () => {
    router.push({
      pathname: "/entry-form" as any,
      params: { tripId: params.tripId },
    });
  };

  if (isLoading || !tripData) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#FAF8F5",
        }}
      >
        <ActivityIndicator size="large" color="#C85A3E" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FAF8F5" }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 20, paddingTop: 40 }}>
          {/* Trip Header */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "bold",
                color: "#1A1A1A",
                marginBottom: 8,
              }}
            >
              {tripData.name}
            </Text>
            <Text style={{ fontSize: 16, color: "#7A9B76", marginBottom: 4 }}>
              📍 {tripData.destination}
            </Text>
            <Text style={{ fontSize: 14, color: "#999" }}>
              {format(
                tripData.startDate instanceof Date
                  ? tripData.startDate
                  : tripData.startDate?.toDate?.() || new Date(),
                "MMM dd",
              )}{" "}
              -{" "}
              {format(
                tripData.endDate instanceof Date
                  ? tripData.endDate
                  : tripData.endDate?.toDate?.() || new Date(),
                "MMM dd, yyyy",
              )}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
            <TouchableOpacity
              onPress={handleEditTrip}
              disabled={isDeleting}
              style={{
                flex: 1,
                backgroundColor: "#C85A3E",
                borderRadius: 12,
                paddingVertical: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#FFF", fontWeight: "600" }}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDeleteTrip}
              disabled={isDeleting}
              style={{
                flex: 1,
                backgroundColor: "#E8CCCC",
                borderRadius: 12,
                paddingVertical: 12,
                alignItems: "center",
              }}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#C85A3E" />
              ) : (
                <Text style={{ color: "#C85A3E", fontWeight: "600" }}>
                  Delete
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View
            style={{
              backgroundColor: "#FFF",
              borderRadius: 16,
              padding: 16,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: "#E0DDD9",
            }}
          >
            <View
              style={{ flexDirection: "row", justifyContent: "space-around" }}
            >
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{ fontSize: 20, fontWeight: "bold", color: "#C85A3E" }}
                >
                  {tripData.entryCount || 0}
                </Text>
                <Text style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
                  Entries
                </Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{ fontSize: 20, fontWeight: "bold", color: "#7A9B76" }}
                >
                  {Math.ceil(
                    (Number(
                      tripData.endDate instanceof Date
                        ? tripData.endDate
                        : tripData.endDate?.toDate?.(),
                    ) ||
                      Number(new Date()) -
                        Number(
                          tripData.startDate instanceof Date
                            ? tripData.startDate
                            : tripData.startDate?.toDate?.() || new Date(),
                        )) /
                      (1000 * 60 * 60 * 24),
                  )}
                </Text>
                <Text style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
                  Days
                </Text>
              </View>
            </View>
          </View>

          {/* Entries Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text
              style={{ fontSize: 18, fontWeight: "bold", color: "#1A1A1A" }}
            >
              Entries
            </Text>
            <TouchableOpacity onPress={handleAddEntry}>
              <MaterialCommunityIcons
                name="plus-circle"
                size={28}
                color="#C85A3E"
              />
            </TouchableOpacity>
          </View>

          {/* Entries List */}
          {entries.length === 0 ? (
            <View
              style={{
                backgroundColor: "#FFF",
                borderRadius: 12,
                padding: 20,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#E0DDD9",
              }}
            >
              <Text style={{ color: "#999", fontSize: 14 }}>
                No entries yet. Add one to get started!
              </Text>
            </View>
          ) : (
            <FlatList
              scrollEnabled={false}
              data={entries}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: "/(app)/(modals)/entry-detail",
                      params: { entryId: item.id, tripId: params.tripId },
                    })
                  }
                  style={{
                    backgroundColor: "#FFF",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: "#E0DDD9",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: "#1A1A1A",
                        marginBottom: 4,
                      }}
                    >
                      {item.placeName}
                    </Text>
                    <Text
                      style={{ fontSize: 12, color: "#999", marginBottom: 8 }}
                    >
                      {format(
                        item.date instanceof Date
                          ? item.date
                          : item.date?.toDate?.() || new Date(),
                        "MMM dd, yyyy",
                      )}
                    </Text>
                    {item.highlightTags.length > 0 && (
                      <View
                        style={{
                          flexDirection: "row",
                          gap: 4,
                          flexWrap: "wrap",
                        }}
                      >
                        {item.highlightTags.slice(0, 2).map((tag) => (
                          <View
                            key={tag}
                            style={{
                              backgroundColor: "#F0EFED",
                              borderRadius: 8,
                              paddingHorizontal: 8,
                              paddingVertical: 4,
                            }}
                          >
                            <Text style={{ fontSize: 10, color: "#666" }}>
                              {tag}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteEntry(item.id)}
                    style={{ padding: 8 }}
                  >
                    <MaterialCommunityIcons
                      name="delete"
                      size={20}
                      color="#C85A3E"
                    />
                  </TouchableOpacity>
                </Pressable>
              )}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}
