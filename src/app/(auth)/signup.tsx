import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { signUpWithEmail } from "../../lib/authService";
import { useAuthStore } from "../../stores/authStore";
import { Modal } from "react-native";

export default function SignupScreen() {
  const router = useRouter();
  const { setUser, setIsLoading, setError } = useAuthStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setScreenLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Missing Fields", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters");
      return;
    }

    setScreenLoading(true);
    try {
      const authUser = await signUpWithEmail({ email, password, name });
      setUser(authUser);
      setShowSuccessModal(true); // Show success modal
    } catch (error: any) {
      Alert.alert("Sign Up Failed", error.message);
      setError(error.message);
    } finally {
      setScreenLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push("/(auth)/login");
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#FAF8F5" }}
      contentContainerStyle={{
        flexGrow: 1,
        padding: 20,
        justifyContent: "center",
      }}
    >
      <View style={{ marginBottom: 40 }}>
        <Text
          style={{
            fontSize: 32,
            fontWeight: "bold",
            color: "#1A1A1A",
            marginBottom: 8,
          }}
        >
          Create Account
        </Text>
        <Text style={{ fontSize: 16, color: "#7A9B76" }}>
          Start your travel journey
        </Text>
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: "#1A1A1A",
            marginBottom: 8,
          }}
        >
          Name
        </Text>
        <TextInput
          placeholder="Your Name"
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

      <View style={{ marginBottom: 24 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: "#1A1A1A",
            marginBottom: 8,
          }}
        >
          Email
        </Text>
        <TextInput
          placeholder="your@email.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
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

      <View style={{ marginBottom: 24 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: "#1A1A1A",
            marginBottom: 8,
          }}
        >
          Password
        </Text>
        <TextInput
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
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

      <View style={{ marginBottom: 24 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: "#1A1A1A",
            marginBottom: 8,
          }}
        >
          Confirm Password
        </Text>
        <TextInput
          placeholder="••••••••"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
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

      <TouchableOpacity
        onPress={handleSignUp}
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
            Create Account
          </Text>
        )}
      </TouchableOpacity>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#666", fontSize: 14 }}>
          Already have an account?{" "}
        </Text>
        <TouchableOpacity onPress={handleBackToLogin} disabled={isLoading}>
          <Text style={{ color: "#C85A3E", fontSize: 14, fontWeight: "600" }}>
            Sign In
          </Text>
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: "#FFF",
              borderRadius: 16,
              padding: 24,
              alignItems: "center",
              width: "80%",
              maxWidth: 300,
            }}
          >
            <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 12 }}>
              ✅
            </Text>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: "#1A1A1A",
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              Account Created!
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#666",
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              Welcome to Wanderlogs, {name}! Your account is ready.
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowSuccessModal(false);
                router.push("/(auth)/login");
              }}
              style={{
                backgroundColor: "#C85A3E",
                borderRadius: 12,
                paddingVertical: 12,
                paddingHorizontal: 24,
                width: "100%",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "600" }}>
                Get started!
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
