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
    // Subscribe to Firebase auth state changes on app startup
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // User is signed in
          setFirebaseUser(firebaseUser);
          const authUser: AuthUser = {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            avatarUrl: firebaseUser.photoURL,
            createdAt: new Date(firebaseUser.metadata.creationTime || ""),
          };
          setUser(authUser);

          // Subscribe to real-time data
          subscribeToTrips(firebaseUser.uid);
          subscribeToAllEntries(firebaseUser.uid);
        } else {
          // User is signed out
          setUser(null);
          setFirebaseUser(null);

          // Cleanup subscriptions
          unsubscribeFromTrips();
          unsubscribeFromAllEntries();
        }
      } catch (err) {
        console.error("Auth state change error:", err);
      } finally {
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribe();
      unsubscribeFromTrips();
      unsubscribeFromAllEntries();
    };
  }, [
    setUser,
    setFirebaseUser,
    setIsLoading,
    subscribeToTrips,
    unsubscribeFromTrips,
    subscribeToAllEntries,
    unsubscribeFromAllEntries,
  ]);

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
