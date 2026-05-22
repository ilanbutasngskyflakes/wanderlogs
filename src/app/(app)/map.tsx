import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Platform,
    ScrollView,
    Text,
    View,
} from "react-native";
import { useAuthStore } from "../../stores/authStore";
import { useEntriesStore } from "../../stores/entriesStore";
import { useHighlightsStore } from "../../stores/highlightsStore";

// Conditionally import MapView only for native platforms
const MapView =
  Platform.OS !== "web" ? require("react-native-maps").default : null;
const Marker =
  Platform.OS !== "web" ? require("react-native-maps").Marker : null;
const PROVIDER_GOOGLE =
  Platform.OS !== "web" ? require("react-native-maps").PROVIDER_GOOGLE : null;

export default function MapScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { allEntries, isLoading } = useEntriesStore();
  const { selectedTags } = useHighlightsStore();
  const [mapReady, setMapReady] = useState(false);

  const filteredEntries =
    selectedTags.length > 0
      ? allEntries.filter((entry) =>
          entry.highlightTags.some((tag: string) =>
            (selectedTags as string[]).includes(tag),
          ),
        )
      : allEntries;

  const initialRegion = {
    latitude: 20,
    longitude: 0,
    latitudeDelta: 100,
    longitudeDelta: 100,
  };

  const handleMarkerPress = (entryId: string, tripId: string) => {
    router.push({
      pathname: "/(app)/entry-detail",
      params: { entryId, tripId },
    });
  };

  if (isLoading && allEntries.length === 0) {
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
      {Platform.OS === "web" ? (
        // Web fallback: List view
        <ScrollView style={{ flex: 1 }}>
          <View style={{ padding: 20, paddingTop: 40 }}>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "bold",
                color: "#1A1A1A",
                marginBottom: 16,
              }}
            >
              Map View
            </Text>
            <Text style={{ fontSize: 14, color: "#666", marginBottom: 20 }}>
              Map is not available on web. Viewing {filteredEntries.length}{" "}
              location
              {filteredEntries.length !== 1 ? "s" : ""}:
            </Text>

            {filteredEntries.length === 0 ? (
              <View style={{ padding: 20, alignItems: "center" }}>
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
                  {selectedTags.length > 0
                    ? "No entries with selected highlights"
                    : "No entries yet. Create one to see it on the map!"}
                </Text>
              </View>
            ) : (
              filteredEntries.map((entry) => (
                <View
                  key={`${entry.tripId}-${entry.id}`}
                  style={{
                    backgroundColor: "#FFF",
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 12,
                    borderLeftWidth: 4,
                    borderLeftColor: entry.isFavorite ? "#FFD700" : "#C85A3E",
                  }}
                >
                  <View
                    style={{
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
                        }}
                      >
                        {entry.placeName}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#999",
                          marginTop: 4,
                        }}
                      >
                        📍 {entry.locationName || "No location"}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#666",
                          marginTop: 4,
                        }}
                      >
                        ({entry.latitude.toFixed(4)},{" "}
                        {entry.longitude.toFixed(4)})
                      </Text>
                    </View>
                    {entry.isFavorite && (
                      <Text style={{ fontSize: 20, marginLeft: 12 }}>⭐</Text>
                    )}
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      marginTop: 12,
                    }}
                  >
                    {entry.highlightTags.map((tag) => (
                      <View
                        key={tag}
                        style={{
                          backgroundColor: "#F0E6D8",
                          borderRadius: 4,
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          marginRight: 8,
                          marginBottom: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            color: "#C85A3E",
                            fontWeight: "500",
                          }}
                        >
                          {tag}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      ) : (
        // Native: Map view
        <>
          {mapReady && filteredEntries.length === 0 ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
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
                {selectedTags.length > 0
                  ? "No entries with selected highlights"
                  : "No entries yet. Create one to see it on the map!"}
              </Text>
            </View>
          ) : (
            <>
              <MapView
                provider={PROVIDER_GOOGLE}
                style={{ flex: 1 }}
                initialRegion={initialRegion}
                onMapReady={() => setMapReady(true)}
                showsUserLocation={true}
                showsMyLocationButton={true}
              >
                {filteredEntries.map((entry) => (
                  <Marker
                    key={`${entry.tripId}-${entry.id}`}
                    coordinate={{
                      latitude: entry.latitude,
                      longitude: entry.longitude,
                    }}
                    title={entry.placeName}
                    description={entry.locationName || "No location"}
                    onPress={() => handleMarkerPress(entry.id, entry.tripId)}
                  >
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: entry.isFavorite
                          ? "#FFE6CC"
                          : "#C85A3E",
                        justifyContent: "center",
                        alignItems: "center",
                        borderWidth: 2,
                        borderColor: "#FFF",
                      }}
                    >
                      <Text style={{ fontSize: 16 }}>
                        {entry.isFavorite ? "⭐" : "📍"}
                      </Text>
                    </View>
                  </Marker>
                ))}
              </MapView>

              {/* Filter Info */}
              {selectedTags.length > 0 && mapReady && (
                <View
                  style={{
                    position: "absolute",
                    top: 20,
                    left: 20,
                    right: 20,
                    backgroundColor: "#FFF",
                    borderRadius: 8,
                    padding: 12,
                    ...Platform.select({
                      web: {
                        boxShadow: "0 2px 3px rgba(0, 0, 0, 0.1)",
                      },
                      default: {
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 3,
                        elevation: 3,
                      },
                    }),
                  }}
                >
                  <Text
                    style={{ fontSize: 12, color: "#999", marginBottom: 4 }}
                  >
                    Filtering by: {selectedTags.join(", ")}
                  </Text>
                  <Text
                    style={{ fontSize: 12, color: "#666", fontWeight: "600" }}
                  >
                    {filteredEntries.length} entries
                  </Text>
                </View>
              )}
            </>
          )}
        </>
      )}
    </View>
  );
}
