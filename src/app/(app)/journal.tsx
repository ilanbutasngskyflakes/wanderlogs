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
    router.push("/trip-form");
  };

  const handleTripPress = (tripId: string) => {
    router.push({
      pathname: "/trip-detail" as any,
      params: { tripId },
    });
  };

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
          data={trips}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }
          ListHeaderComponent={
            <View style={{ padding: 20, paddingTop: 40, paddingBottom: 16 }}>
              <Text
                style={{ fontSize: 28, fontWeight: "bold", color: "#1A1A1A" }}
              >
                My Trips
              </Text>
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
                marginBottom: 16,
                backgroundColor: "#FFF",
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: "#E0DDD9",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 8,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: "#1A1A1A",
                      marginBottom: 4,
                    }}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={{ fontSize: 14, color: "#7A9B76", marginBottom: 8 }}
                  >
                    📍 {item.destination}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: "#F0EFED",
                    borderRadius: 12,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                  }}
                >
                  <Text
                    style={{ fontSize: 11, fontWeight: "600", color: "#666" }}
                  >
                    {item.entryCount} entries
                  </Text>
                </View>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 12, color: "#999" }}>
                  {format(
                    item.startDate instanceof Date
                      ? item.startDate
                      : item.startDate?.toDate?.() || new Date(),
                    "MMM dd",
                  )}{" "}
                  -{" "}
                  {format(
                    item.endDate instanceof Date
                      ? item.endDate
                      : item.endDate?.toDate?.() || new Date(),
                    "MMM dd, yyyy",
                  )}
                </Text>
                <Text style={{ fontSize: 11, color: "#999" }}>
                  {differenceInDays(
                    item.endDate instanceof Date
                      ? item.endDate
                      : item.endDate?.toDate?.() || new Date(),
                    item.startDate instanceof Date
                      ? item.startDate
                      : item.startDate?.toDate?.() || new Date(),
                  )}{" "}
                  days
                </Text>
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
