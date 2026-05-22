import { useAuthStore } from "@/stores/authStore";
import { Redirect } from "expo-router";
import React from "react";

export default function RootIndex() {
  const { isAuthenticated } = useAuthStore();

  // Will be handled by _layout.tsx based on auth state
  // This is just a fallback
  if (isAuthenticated) {
    return <Redirect href="/(app)/journal" />;
  }

  return <Redirect href="/(auth)/login" />;
}
