import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { useAuthStore } from "../../stores/authStore";
import { useEntriesStore } from "../../stores/entriesStore";
import {
    HIGHLIGHT_TAGS,
    useHighlightsStore,
} from "../../stores/highlightsStore";

export default function HighlightsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { allEntries, isLoading, subscribeToAllEntries } = useEntriesStore();
  const { selectedTags, toggleTag, clearSelectedTags } = useHighlightsStore();

  const screenWidth = Dimensions.get("window").width;
  const columnCount = 2;
  const gap = 8;
  const itemSize = (screenWidth - 40 - gap) / columnCount; // Account for gap in calculation

  // Group entries by tag
  const entriesByTag = HIGHLIGHT_TAGS.reduce(
    (acc, tag) => {
      acc[tag] = allEntries.filter((entry) =>
        entry.highlightTags.includes(tag),
      );
      return acc;
    },
    {} as Record<string, typeof allEntries>,
  );

  const filteredTags =
    selectedTags.length > 0
      ? HIGHLIGHT_TAGS.filter((tag) => selectedTags.includes(tag))
      : HIGHLIGHT_TAGS.filter((tag) => entriesByTag[tag].length > 0);

  const handleEntryPress = (entryId: string, tripId: string) => {
    router.push({
      pathname: "/(app)/(modals)/entry-detail",
      params: { entryId, tripId },
    });
  };

  useEffect(() => {
    if (user?.id) {
      console.log("Highlights: Subscribing to entries for user:", user.id);
      subscribeToAllEntries(user.id);
    } else {
      console.log("Highlights: No user ID!");
    }
  }, [user?.id]);

  if (isLoading) {
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
    <ScrollView style={{ flex: 1, backgroundColor: "#FAF8F5" }}>
      <View style={{ padding: 20, paddingTop: 40 }}>
        {/* Header */}
        <View
          style={{
            marginBottom: 24,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 28, fontWeight: "bold", color: "#1A1A1A" }}>
            Highlights
          </Text>
          {selectedTags.length > 0 && (
            <Pressable
              onPress={clearSelectedTags}
              style={{
                backgroundColor: "#F0EFED",
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 6,
              }}
            >
              <Text style={{ fontSize: 12, color: "#666", fontWeight: "600" }}>
                Clear filters
              </Text>
            </Pressable>
          )}
        </View>

        {/* Tag Filters */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#1A1A1A",
              marginBottom: 12,
            }}
          >
            Filter by tag
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {HIGHLIGHT_TAGS.map((tag, i) => {
              const count = entriesByTag[tag].length;
              const isSelected = selectedTags.includes(tag);
              if (count === 0) return null;
              return (
                <Pressable
                  key={`${tag}-${i}`}
                  onPress={() => toggleTag(tag)}
                  style={{
                    backgroundColor: isSelected ? "#C85A3E" : "#FFF",
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderWidth: 1,
                    borderColor: isSelected ? "#C85A3E" : "#E0DDD9",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: isSelected ? "#FFF" : "#1A1A1A",
                    }}
                  >
                    {tag} ({count})
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Entries by Tag */}
        {filteredTags.length === 0 ? (
          <View style={{ padding: 40, alignItems: "center" }}>
            <MaterialCommunityIcons
              name="star-outline"
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
              No entries yet
            </Text>
          </View>
        ) : (
          filteredTags.map((tag, idx) => {
            const entries = entriesByTag[tag];
            if (entries.length === 0) return null;
            return (
              <View key={`${tag}-${idx}`} style={{ marginBottom: 32 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: "#1A1A1A",
                    marginBottom: 12,
                    textTransform: "capitalize",
                  }}
                >
                  {tag} ({entries.length})
                </Text>
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                >
                  {entries.map((entry) => (
                    <Pressable
                      key={`${entry.tripId}-${entry.id}`}
                      onPress={() => handleEntryPress(entry.id, entry.tripId)}
                      style={{
                        width: itemSize,
                        aspectRatio: 1,
                        borderRadius: 12,
                        overflow: "hidden",
                        justifyContent: "flex-end",
                      }}
                    >
                      {/* Show the first photo if available */}
                      {entry.photos && entry.photos.length > 0 ? (
                        <Image
                          source={{ uri: entry.photos[0].url }}
                          style={{ position: "absolute", width: "100%", height: "100%" }}
                        />
                      ) : (
                        <View style={{ backgroundColor: "#E0DDD9", flex: 1 }} />
                      )}
                      
                      {/* Text overlay */}
                      <View style={{ padding: 8, backgroundColor: "rgba(0,0,0,0.4)" }}>
                        <Text style={{ fontSize: 12, fontWeight: "600", color: "#FFF", marginBottom: 2 }}>
                          {entry.placeName.substring(0, 20)}
                        </Text>
                        <Text style={{ fontSize: 10, color: "#EEE" }}>
                          {entry.locationName?.substring(0, 20) || "No location"}
                        </Text>
                      </View>
                      
                      {entry.isFavorite && (
                        <View style={{ position: "absolute", top: 8, right: 8, backgroundColor: "#FFE6CC", borderRadius: 12, width: 24, height: 24, justifyContent: "center", alignItems: "center" }}>
                          <Text style={{ fontSize: 12 }}>⭐</Text>
                        </View>
                      )}
                    </Pressable>
                  ))}
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}
