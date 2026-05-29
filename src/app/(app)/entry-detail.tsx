import { format } from "date-fns";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { onSnapshot, doc } from "firebase/firestore";
import { Entry } from "../../lib/firestoreService";
import { getFirestore_ } from "../../lib/firebase";
import { useAuthStore } from "../../stores/authStore";
import { useEntriesStore } from "../../stores/entriesStore";

export default function EntryDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { user } = useAuthStore();
  const { deleteEntry } = useEntriesStore();
  const params = route.params as { entryId: string; tripId: string };
  const [entry, setEntry] = useState<Entry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  console.log("entry-detail route:", route);
  console.log("entry-detail route.params:", route.params);
  console.log("entry-detail params:", params);
  console.log("entry-detail entryId:", params?.entryId);
  console.log("entry-detail tripId:", params?.tripId);

  useEffect(() => {
    if (!user?.id || !params.entryId || !params.tripId) return;

    setIsLoading(true);

    // Subscribe to real-time updates of this entry
    const unsubscribe = onSnapshot(
      doc(getFirestore_(), "users", user.id, "trips", params.tripId, "entries", params.entryId),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const entryData = {
            id: docSnapshot.id,
            ...docSnapshot.data(),
            date: docSnapshot.data().date?.toDate?.() || docSnapshot.data().date,
          } as Entry;
          setEntry(entryData);
        }
        setIsLoading(false);
      },
      (error) => {
        console.error("Failed to listen to entry:", error);
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user?.id, params.entryId, params.tripId]);

  const handleDelete = () => {
    Alert.alert("Delete Entry", "Delete this entry permanently?", [
      { text: "Cancel" },
      {
        text: "Delete",
        onPress: async () => {
          if (!user?.id) return;
          try {
            await deleteEntry(user.id, params.tripId, params.entryId);
            navigation.goBack();
          } catch (error: any) {
            Alert.alert("Error", error.message);
          }
        },
        style: "destructive",
      },
    ]);
  };

  if (isLoading || !entry) {
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
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: "#1A1A1A",
              marginBottom: 8,
            }}
          >
            {entry.placeName}
          </Text>
          <Text style={{ fontSize: 14, color: "#999", marginBottom: 4 }}>
            {format(
              entry.date instanceof Date
                ? entry.date
                : entry.date?.toDate?.() || new Date(),
              "MMMM dd, yyyy",
            )}
          </Text>
          {entry.locationName && (
            <Text style={{ fontSize: 13, color: "#7A9B76" }}>
              📍 {entry.locationName}
            </Text>
          )}
        </View>

        {/* Stats */}
        <View
          style={{
            flexDirection: "row",
            gap: 12,
            marginBottom: 24,
          }}
        >
          {entry.isFavorite && (
            <View
              style={{
                backgroundColor: "#FFE6CC",
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 6,
              }}
            >
              <Text
                style={{ fontSize: 12, fontWeight: "600", color: "#FF9500" }}
              >
                ⭐ Favorite
              </Text>
            </View>
          )}
          <Text style={{ fontSize: 12, color: "#999" }}>
            {entry.photos?.length || 0} photo
            {entry.photos?.length !== 1 ? "s" : ""}
          </Text>
        </View>

        {/* Description */}
        {entry.description && (
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#1A1A1A",
                marginBottom: 8,
              }}
            >
              Notes
            </Text>
            <View
              style={{
                backgroundColor: "#FFF",
                borderRadius: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: "#E0DDD9",
              }}
            >
              <Text style={{ fontSize: 14, color: "#1A1A1A", lineHeight: 20 }}>
                {entry.description}
              </Text>
            </View>
          </View>
        )}

        {/* Highlights */}
        {entry.highlightTags.length > 0 && (
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
              {entry.highlightTags.map((tag, i) => (
                <View
                  key={`${i}-${tag}`}
                  style={{
                    backgroundColor: "#FFF5F2",
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderWidth: 1,
                    borderColor: "#F0D9D5",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: "#C85A3E",
                    }}
                  >
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Photos */}
        {entry.photos && entry.photos.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#1A1A1A",
                marginBottom: 8,
              }}
            >
              Photos
            </Text>
            <View style={{ gap: 12 }}>
              {entry.photos.map((photo, i) => (
                <Image
                  key={`${i}-${photo.id}`}
                  source={{ uri: photo.url }}
                  style={{
                    width: "100%",
                    height: 200,
                    borderRadius: 12,
                    backgroundColor: "#E0DDD9",
                  }}
                />
              ))}
            </View>
          </View>
        )}

        {/* Location */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#1A1A1A",
              marginBottom: 8,
            }}
          >
            Location
          </Text>
          <View
            style={{
              backgroundColor: "#FFF",
              borderRadius: 12,
              padding: 12,
              borderWidth: 1,
              borderColor: "#E0DDD9",
            }}
          >
            <Text style={{ fontSize: 14, color: "#1A1A1A", marginBottom: 8 }}>
              {entry.latitude.toFixed(4)}, {entry.longitude.toFixed(4)}
            </Text>
            <Text style={{ fontSize: 12, color: "#999" }}>
              Tap to open in maps
            </Text>
          </View>
        </View>

        {/* Delete Button */}
        <TouchableOpacity
          onPress={handleDelete}
          style={{
            backgroundColor: "#E8CCCC",
            borderRadius: 12,
            paddingVertical: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#C85A3E", fontSize: 16, fontWeight: "600" }}>
            Delete Entry
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
