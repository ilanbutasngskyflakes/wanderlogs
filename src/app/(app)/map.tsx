import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuthStore } from "../../stores/authStore";
import { useTripsStore } from "../../stores/tripsStore";
import { format } from "date-fns";

export default function MapScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const { trips, isLoading, fetchTrips } = useTripsStore();
  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    if (!user?.id) return;
    fetchTrips(user.id);
  }, [user?.id]);

  // Sort trips by start date
  const sortedTrips = [...trips].sort((a, b) => {
    const dateA = a.startDate instanceof Date ? a.startDate : a.startDate?.toDate?.() || new Date();
    const dateB = b.startDate instanceof Date ? b.startDate : b.startDate?.toDate?.() || new Date();
    return new Date(dateA).getTime() - new Date(dateB).getTime();
  });

  const handleTripPress = (tripId: string) => {
    navigation.navigate("trip-detail" as never, { tripId } as never);
  };

  if (isLoading && trips.length === 0) {
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
          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: "#1A1A1A",
              marginBottom: 8,
            }}
          >
            Journey Timeline
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#666",
              marginBottom: 24,
            }}
          >
            Your travel adventures in chronological order
          </Text>

          {sortedTrips.length === 0 ? (
            <View
              style={{
                padding: 20,
                alignItems: "center",
                marginTop: 40,
              }}
            >
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
                No trips yet. Start your adventure!
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 20 }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 10,
                }}
              >
                {/* Connecting Line */}
                <View
                  style={{
                    position: "absolute",
                    height: 4,
                    backgroundColor: "#D0CCC8",
                    top: "50%",
                    left: 0,
                    right: 0,
                    zIndex: 0,
                  }}
                />

                {/* Timeline Milestones */}
                {sortedTrips.map((trip, index) => {
                  const startDate = trip.startDate instanceof Date
                    ? trip.startDate
                    : trip.startDate?.toDate?.() || new Date();

                  return (
                    <View key={trip.id} style={{ alignItems: "center", marginHorizontal: 16, zIndex: 1 }}>
                      {/* Milestone Circle */}
                      <TouchableOpacity
                        onPress={() => handleTripPress(trip.id)}
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 30,
                          backgroundColor: "#C85A3E",
                          justifyContent: "center",
                          alignItems: "center",
                          borderWidth: 4,
                          borderColor: "#FAF8F5",
                          marginBottom: 12,
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.15,
                          shadowRadius: 3,
                        }}
                      >
                        <Text style={{ fontSize: 24 }}>
                          {index === 0 ? "🚀" : index === sortedTrips.length - 1 ? "🏁" : "📍"}
                        </Text>
                      </TouchableOpacity>

                      {/* Trip Info */}
                      <View style={{ alignItems: "center", width: 100 }}>
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: "700",
                            color: "#1A1A1A",
                            marginBottom: 4,
                            textAlign: "center",
                          }}
                          numberOfLines={2}
                        >
                          {trip.name}
                        </Text>
                        <Text style={{ fontSize: 11, color: "#999", textAlign: "center" }}>
                          {format(startDate, "MMM yyyy")}
                        </Text>
                        <Text style={{ fontSize: 10, color: "#666", marginTop: 2 }}>
                          {trip.entryCount} {trip.entryCount === 1 ? "entry" : "entries"}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          )}

          {/* Trip Details List */}
          <View style={{ marginTop: 20 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#1A1A1A",
                marginBottom: 12,
              }}
            >
              Trip Details
            </Text>
            {sortedTrips.map((trip) => {
              const startDate = trip.startDate instanceof Date
                ? trip.startDate
                : trip.startDate?.toDate?.() || new Date();

              return (
                <TouchableOpacity
                  key={trip.id}
                  onPress={() => handleTripPress(trip.id)}
                  style={{
                    backgroundColor: "#FFF",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: "#E0DDD9",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "700",
                        color: "#1A1A1A",
                        flex: 1,
                      }}
                    >
                      {trip.name}
                    </Text>
                    <Text style={{ fontSize: 12, color: "#999" }}>
                      {format(startDate, "MMM dd, yyyy")}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="map-marker"
                      size={14}
                      color="#7A9B76"
                      style={{ marginRight: 6 }}
                    />
                    <Text style={{ fontSize: 13, color: "#7A9B76" }}>
                      {trip.destination}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <View
                      style={{
                        backgroundColor: "#F0EFED",
                        borderRadius: 8,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          color: "#666",
                          fontWeight: "600",
                        }}
                      >
                        {trip.entryCount} entries
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
