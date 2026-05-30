import { MaterialCommunityIcons } from "@expo/vector-icons";
import { differenceInDays, format } from "date-fns";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
  Image,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../../stores/authStore";
import { useTripsStore } from "../../stores/tripsStore";

export default function JournalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { trips, isLoading, fetchTrips } = useTripsStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    fetchTrips(user.id);
  }, [user?.id]);

  const handleRefresh = async () => {
    if (!user?.id) return;
    setIsRefreshing(true);
    await fetchTrips(user.id);
    setIsRefreshing(false);
  };

  const handleAddTrip = () => {
    router.push({
      pathname: "/(app)/trip-form" as any,
    });
  };

  const handleTripPress = (tripId: string) => {
    console.log("Navigating to trip:", tripId);
    router.push({
      pathname: "/(app)/trip-detail",  // Absolute path with leading slash
      params: { tripId },
    });
  };

  const handleFavoriteTripPress = (tripId: string) => {
    // Update the trip's isFavorite status
    // Then update Firestore
    console.log("Favorite trip pressed:", tripId);
  };

  const filteredTrips = trips.filter((trip) =>
    trip.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalEntries = filteredTrips.reduce((sum, trip) => sum + (trip.entryCount || 0), 0);
  const totalDays = filteredTrips.reduce((sum, trip) => {
    const days = differenceInDays(
      trip.endDate instanceof Date ? trip.endDate : trip.endDate?.toDate?.() || new Date(),
      trip.startDate instanceof Date ? trip.startDate : trip.startDate?.toDate?.() || new Date()
    );
    return sum + days;
  }, 0);
  const uniquePlaces = new Set(filteredTrips.map(trip => trip.destination)).size;

  return (
    <View style={{ flex: 1, backgroundColor: "#FAF8F5" }}>
      {isLoading && trips.length === 0 ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#C85A3E" />
        </View>
      ) : (
        <FlatList
          data={filteredTrips}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }
          ListHeaderComponent={
            <View style={{ padding: 20, paddingTop: 36, paddingBottom: 8 }}>
              <Text
                style={{ fontSize: 34, fontWeight: "700", color: "#1A1A1A", marginBottom: 12 }}
              >
                My Travels
              </Text>

              <TextInput
                placeholder="Search trips..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={{
                  backgroundColor: "#FFF",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderWidth: 1,
                  borderColor: "#E6E1DE",
                  fontSize: 14,
                  marginBottom: 20,
                }}
              />

              {/* Stats Cards */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
                <View style={{ flex: 1, backgroundColor: "#FFF", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#E0DDD9" }}>
                  <Text style={{ fontSize: 11, color: "#999", marginBottom: 4 }}>Trips</Text>
                  <Text style={{ fontSize: 24, fontWeight: "700", color: "#C85A3E" }}>{trips.length}</Text>
                </View>
                
                <View style={{ flex: 1, backgroundColor: "#FFF", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#E0DDD9" }}>
                  <Text style={{ fontSize: 11, color: "#999", marginBottom: 4 }}>Entries</Text>
                  <Text style={{ fontSize: 24, fontWeight: "700", color: "#C85A3E" }}>{totalEntries}</Text>
                </View>

                <View style={{ flex: 1, backgroundColor: "#FFF", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#E0DDD9" }}>
                  <Text style={{ fontSize: 11, color: "#999", marginBottom: 4 }}>Days</Text>
                  <Text style={{ fontSize: 24, fontWeight: "700", color: "#C85A3E" }}>{totalDays}</Text>
                </View>

                <View style={{ flex: 1, backgroundColor: "#FFF", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#E0DDD9" }}>
                  <Text style={{ fontSize: 11, color: "#999", marginBottom: 4 }}>Places</Text>
                  <Text style={{ fontSize: 24, fontWeight: "700", color: "#C85A3E" }}>{uniquePlaces}</Text>
                </View>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={{ padding: 20, alignItems: "center", marginTop: 40 }}>
              <MaterialCommunityIcons
                name="map-outline"
                size={48}
                color="#D0CCC8"
              />
              <Text
                style={{
                  fontSize: 16,
                  color: "#999",
                  marginTop: 16,
                  textAlign: "center",
                }}
              >
                No trips yet. Create your first adventure!
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleTripPress(item.id)}
              style={{
                marginHorizontal: 20,
                marginBottom: 18,
                backgroundColor: "#FFF",
                borderRadius: 16,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: "#E0DDD9",
              }}
            >
              {/* Cover image with title overlay */}
              {item.coverPhotoUrl && !failedImages[item.id] ? (
                <Image
                  source={{ uri: item.coverPhotoUrl }}
                  style={{ width: "100%", height: 160 }}
                  resizeMode="cover"
                  onError={() => setFailedImages((s) => ({ ...s, [item.id]: true }))}
                  
                />
              ) : (
                <View style={{ width: "100%", height: 160, backgroundColor: "#E6E1DE" }} />
              )}

              <View style={{ position: "absolute", left: 28, top: 120 }}>
                <Text
                  style={{
                    color: "#FFF",
                    fontSize: 26,
                    fontWeight: "800",
                    textShadowColor: "rgba(0,0,0,0.4)",
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 4,
                  }}
                >
                  {item.name}
                </Text>
              </View>

              {/* Meta row */}
              <View style={{ padding: 14, paddingTop: 12, backgroundColor: "#FFF" }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                      <MaterialCommunityIcons name="map-marker" size={16} color="#7A9B76" style={{ marginRight: 8 }} />
                      <Text style={{ fontSize: 13, color: "#7A9B76" }}>{item.destination}</Text>
                    </View>
                    <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                      <TouchableOpacity
                        onPress={() => handleFavoriteTripPress(item.id)}
                        style={{ padding: 6 }}
                      >
                       
                      </TouchableOpacity>
                      <View style={{ backgroundColor: "#F0EFED", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6 }}>
                        <Text style={{ fontSize: 12, color: "#666", fontWeight: "600" }}>{item.entryCount} entries</Text>
                      </View>
                    </View>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 12, color: "#999" }}>
                    {format(
                      item.startDate instanceof Date
                        ? item.startDate
                        : item.startDate?.toDate?.() || new Date(),
                      "MMM dd",
                    )} - {format(
                      item.endDate instanceof Date
                        ? item.endDate
                        : item.endDate?.toDate?.() || new Date(),
                      "MMM dd, yyyy",
                    )}
                  </Text>
                  <Text style={{ fontSize: 11, color: "#999" }}>{differenceInDays(
                      item.endDate instanceof Date
                        ? item.endDate
                        : item.endDate?.toDate?.() || new Date(),
                      item.startDate instanceof Date
                        ? item.startDate
                        : item.startDate?.toDate?.() || new Date(),
                    )} days</Text>
                </View>
              </View>
            </Pressable>
          )}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}

      {/* FAB Button */}
      <TouchableOpacity
        onPress={handleAddTrip}
        style={{
          position: "absolute",
          bottom: 20 + insets.bottom,
          right: 20,
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: "#C85A3E",
          justifyContent: "center",
          alignItems: "center",
          elevation: 8,
          ...Platform.select({
            web: {
              boxShadow: "0 2px 3px rgba(0, 0, 0, 0.25)",
            },
            default: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3,
            },
          }),
        }}
      >
        <MaterialCommunityIcons name="plus" size={28} color="#FFF" />
      </TouchableOpacity>

      
    </View>
  );
}
