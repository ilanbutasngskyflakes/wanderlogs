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
import { loginWithEmail } from "../../lib/authService";
import { useAuthStore } from "../../stores/authStore";

export default function LoginScreen() {
  const router = useRouter();
  const { setUser, setIsLoading, setError } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setScreenLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please enter both email and password");
      return;
    }

    setScreenLoading(true);
    try {
      const authUser = await loginWithEmail({ email, password });
      setUser(authUser);
      // Navigation handled automatically by auth state change in root layout
    } catch (error: any) {
      Alert.alert("Login Failed", error.message);
      setError(error.message);
    } finally {
      setScreenLoading(false);
    }
  };

  const handleSignUp = () => {
    router.push("/(auth)/signup");
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
          WanderLogs
        </Text>
        <Text style={{ fontSize: 16, color: "#7A9B76" }}>
          Travel Journal & Memory Keeper
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

      <TouchableOpacity
        onPress={handleLogin}
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
            Sign In
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
          Don't have an account?{" "}
        </Text>
        <TouchableOpacity onPress={handleSignUp} disabled={isLoading}>
          <Text style={{ color: "#C85A3E", fontSize: 14, fontWeight: "600" }}>
            Sign Up
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
