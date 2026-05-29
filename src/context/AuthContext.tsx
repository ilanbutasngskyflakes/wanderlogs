import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { logoutUser, onAuthStateChange } from "../lib/authService";
import { useRouter } from "expo-router";
import { AuthUser, useAuthStore } from "../stores/authStore";
import { useEntriesStore } from "../stores/entriesStore";
import { useTripsStore } from "../stores/tripsStore";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  logout: () => Promise<void>;
}

export const AuthContext = React.createContext<AuthContextType | undefined>(
  undefined,
);

export interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const {
    user,
    firebaseUser,
    isLoading,
    isAuthenticated,
    error,
    setUser,
    setFirebaseUser,
    setIsLoading,
    logout: storeLogout,
  } = useAuthStore();
  const router = useRouter();
  const { subscribeToTrips, unsubscribeFromTrips } = useTripsStore();
  const { subscribeToAllEntries, unsubscribeFromAllEntries } =
    useEntriesStore();

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChange((firebaseUser) => {
        if (firebaseUser) {
          // User is authenticated - fetch their profile data
          setFirebaseUser(firebaseUser);
          // Set user data from Firestore will be handled separately
        } else {
          // User logged out
          setUser(null);
          setFirebaseUser(null);
        }
        setIsLoading(false);
      });
      return () => unsubscribe();
    } catch (error) {
      console.warn("Auth state change error:", error);
      setIsLoading(false);
    }
  }, []);

  const logout = async () => {
    try {
      await logoutUser();
      storeLogout();
      // Ensure app navigates back to auth screens after logout
      try {
        router.replace("/(auth)/login");
      } catch (e) {
        // ignore router errors during logout
      }
    } catch (err) {
      console.error("Logout error:", err);
      throw err;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    error,
    logout,
  };

  // Show loading screen while initializing auth
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context
 */
export function useAuth(): AuthContextType {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
