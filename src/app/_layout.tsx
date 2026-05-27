// Dev-only: suppress noisy deprecated `props.pointerEvents` warning from
// react-native-web / navigation libraries while we update dependencies.
// This only runs in web environments and silences that specific warning.
if (typeof document !== 'undefined' && typeof console !== 'undefined') {
  const _warn = console.warn;
  // eslint-disable-next-line no-console
  console.warn = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('props.pointerEvents is deprecated')) return;
    // @ts-ignore
    _warn.apply(console, args);
  };
}

import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { useColorScheme } from "react-native";

import { AuthProvider } from "@/context/AuthContext";
import { onAuthStateChange } from "@/lib/authService";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const unsubscribe = onAuthStateChange((user) => {
      setIsLoggedIn(!!user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          {isLoggedIn ? (
            <Stack.Screen name="(app)" options={{ gestureEnabled: false }} />
          ) : (
            <Stack.Screen name="(auth)" options={{ gestureEnabled: false }} />
          )}
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}
