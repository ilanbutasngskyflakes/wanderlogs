import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useEntriesStore } from "../../stores/entriesStore";
import { useTripsStore } from "../../stores/tripsStore";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { trips } = useTripsStore();
  const { allEntries } = useEntriesStore();

  // Calculate stats
  const stats = useMemo(() => {
    const totalTrips = trips.length;
    const totalEntries = allEntries.length;
    const favoritedEntries = allEntries.filter((e) => e.isFavorite).length;

    // Get all unique highlight tags used
    const tagsUsed: Record<string, number> = {};
    allEntries.forEach((entry) => {
      entry.highlightTags.forEach((tag) => {
        tagsUsed[tag] = (tagsUsed[tag] || 0) + 1;
      });
    });

    // Most used tag
    let mostUsedTag = null;
    let maxCount = 0;
    Object.entries(tagsUsed).forEach(([tag, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostUsedTag = tag;
      }
    });

    // Calculate total days traveled
    const totalDays = trips.reduce((sum, trip) => {
      const start =
        trip.startDate instanceof Date
          ? trip.startDate
          : trip.startDate?.toDate?.() || new Date();
      const end =
        trip.endDate instanceof Date
          ? trip.endDate
          : trip.endDate?.toDate?.() || new Date();
      const days = Math.ceil(
        (Number(end) - Number(start)) / (1000 * 60 * 60 * 24),
      );
      return sum + Math.max(1, days);
    }, 0);

    // Get unique countries/locations
    const locations = new Set<string>();
    trips.forEach((trip) => {
      locations.add(trip.destination);
    });

    return {
      totalTrips,
      totalEntries,
      favoritedEntries,
      mostUsedTag,
      totalDays,
      countriesVisited: locations.size,
      uniqueTags: Object.keys(tagsUsed).length,
    };
  }, [trips, allEntries]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#FAF8F5" }}>
      <View style={{ padding: 20, paddingTop: 40, paddingBottom: 40 }}>
        {/* Header */}
        <Text
          style={{
            fontSize: 28,
            fontWeight: "bold",
            color: "#1A1A1A",
            marginBottom: 24,
          }}
        >
          Profile
        </Text>

        {/* User Info Card */}
        <View
          style={{
            padding: 20,
            backgroundColor: "#FFF",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#E0DDD9",
            marginBottom: 24,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: "#C85A3E",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 12,
              }}
            >
              <Text style={{ fontSize: 24 }}>👤</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#1A1A1A",
                  marginBottom: 2,
                }}
              >
                {user?.name || "Traveler"}
              </Text>
              <Text style={{ fontSize: 13, color: "#999" }}>
                {user?.email || "No email"}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: "#1A1A1A",
            marginBottom: 12,
          }}
        >
          Your Journey
        </Text>
        <View style={{ marginBottom: 24, gap: 12 }}>
          {/* Row 1 */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            <StatCard
              icon="map"
              label="Trips"
              value={stats.totalTrips}
              flex={1}
            />
            <StatCard
              icon="map-marker"
              label="Entries"
              value={stats.totalEntries}
              flex={1}
            />
          </View>

          {/* Row 2 */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            <StatCard
              icon="calendar"
              label="Days Traveled"
              value={stats.totalDays}
              flex={1}
            />
            <StatCard
              icon="star"
              label="Favorited"
              value={stats.favoritedEntries}
              flex={1}
            />
          </View>

          {/* Row 3 */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            <StatCard
              icon="tag-multiple"
              label="Tags Used"
              value={stats.uniqueTags}
              flex={1}
            />
            <StatCard
              icon="location-city"
              label="Locations"
              value={stats.countriesVisited}
              flex={1}
            />
          </View>
        </View>

        {/* Most Used Highlight */}
        {stats.mostUsedTag && (
          <View
            style={{
              padding: 16,
              backgroundColor: "#FFF5F2",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#F0D9D5",
              marginBottom: 24,
            }}
          >
            <Text style={{ fontSize: 12, color: "#999", marginBottom: 4 }}>
              Most Used Highlight
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#C85A3E",
                textTransform: "capitalize",
              }}
            >
              {stats.mostUsedTag}
            </Text>
          </View>
        )}

        {/* Sign Out Button */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            backgroundColor: "#C85A3E",
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "600" }}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function StatCard({ icon, label, value, flex }: any) {
  return (
    <View
      style={{
        flex,
        backgroundColor: "#FFF",
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: "#E0DDD9",
        alignItems: "center",
      }}
    >
      <MaterialCommunityIcons name={icon} size={24} color="#C85A3E" />
      <Text
        style={{ fontSize: 11, color: "#999", marginTop: 6, marginBottom: 4 }}
      >
        {label}
      </Text>
      <Text style={{ fontSize: 18, fontWeight: "700", color: "#1A1A1A" }}>
        {value}
      </Text>
    </View>
  );
}
