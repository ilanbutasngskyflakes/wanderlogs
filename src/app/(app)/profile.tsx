import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View, Modal } from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleConfirmSignOut = async () => {
    setIsSigningOut(true);
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsSigningOut(false);
      setShowSignOutModal(false);
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

        {/* Sign Out Button */}
        <TouchableOpacity
          onPress={() => setShowSignOutModal(true)}
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

        {/* Sign Out Confirmation Modal */}
        <Modal visible={showSignOutModal} transparent animationType="fade" onRequestClose={() => setShowSignOutModal(false)}>
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" }}>
            <View style={{ width: "84%", backgroundColor: "#FFF", borderRadius: 12, padding: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: "700", color: "#1A1A1A", marginBottom: 8 }}>Are you sure?</Text>
              <Text style={{ color: "#444", marginBottom: 20 }}>Are you sure you want to sign out?</Text>
              <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                <TouchableOpacity onPress={() => setShowSignOutModal(false)} disabled={isSigningOut} style={{ paddingVertical: 10, paddingHorizontal: 14, marginRight: 8 }}>
                  <Text style={{ color: "#666" }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleConfirmSignOut} disabled={isSigningOut} style={{ backgroundColor: "#C85A3E", borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14 }}>
                  <Text style={{ color: "#FFF", fontWeight: "700" }}>{isSigningOut ? "Signing out..." : "Sign Out"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
}
