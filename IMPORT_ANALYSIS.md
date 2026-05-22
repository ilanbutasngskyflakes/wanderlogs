# WanderLogs Codebase - Complete Import Analysis

**Analysis Date:** May 23, 2026  
**Workspace:** c:\Users\Angel\Documents\WanderLogs

---

## Summary

### Packages in package.json (25 dependencies)

All these dependencies are properly declared and installed:

- @react-navigation/bottom-tabs ^7.15.5
- @react-navigation/elements ^2.9.10
- @react-navigation/native ^7.1.33
- date-fns ^3.0.0
- expo ~55.0.26
- expo-constants ~55.0.16
- expo-device ~55.0.17
- expo-font ~55.0.8
- expo-glass-effect ~55.0.11
- expo-image ~55.0.11
- expo-linking ~55.0.15
- expo-router ~55.0.16
- expo-splash-screen ~55.0.21
- expo-status-bar ~55.0.6
- expo-symbols ~55.0.9
- expo-system-ui ~55.0.18
- expo-web-browser ~55.0.16
- react 19.2.0
- react-dom 19.2.0
- react-native 0.83.6
- react-native-gesture-handler ~2.30.0
- react-native-reanimated 4.2.1
- react-native-safe-area-context ~5.6.2
- react-native-screens ~4.23.0
- react-native-web ~0.21.0
- react-native-worklets 0.7.4

### Packages USED but NOT in package.json (⚠️ CRITICAL ISSUE)

| Package                                    | Used In                                                                | Import Type           |
| ------------------------------------------ | ---------------------------------------------------------------------- | --------------------- |
| **@react-native-community/datetimepicker** | src/app/(app)/entry-form.tsx (L2)<br/>src/app/(app)/trip-form.tsx (L1) | Named import          |
| **react-native-maps**                      | src/app/(app)/map.tsx (L17-21)                                         | Conditional require() |
| **expo-location**                          | src/app/(app)/entry-form.tsx (L4)                                      | Namespace import      |

---

## Complete Import Breakdown by File

### Authentication & Services

#### src/lib/firebase.ts

```typescript
import Constants from "expo-constants";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  connectFirestoreEmulator,
  getFirestore,
  initializeFirestore,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
```

#### src/lib/authService.ts

```typescript
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithCredential,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { AuthUser } from "../stores/authStore";
import { auth, firestore } from "./firebase";
```

#### src/lib/firestoreService.ts

```typescript
import {
  DocumentReference,
  DocumentSnapshot,
  Query,
  addDoc,
  collection,
  connectFirestoreEmulator,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { firestore, storage } from "./firebase";
```

#### src/lib/photoService.ts

```typescript
import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "./firebase";
```

### State Management & Stores

#### src/stores/authStore.ts

```typescript
import { User as FirebaseUser } from "firebase/auth";
import { create } from "zustand";
```

#### src/stores/entriesStore.ts

```typescript
import { DocumentSnapshot } from "firebase/firestore";
import { create } from "zustand";
import {
  createEntry,
  deleteEntry,
  fetchAllEntriesForUser,
  fetchEntriesForTrip,
  fetchEntriesByTag,
  listenToAllEntries,
  updateEntry,
} from "../lib/firestoreService";
```

#### src/stores/tripsStore.ts

```typescript
import { DocumentSnapshot } from "firebase/firestore";
import { create } from "zustand";
import {
  createTrip,
  deleteTrip,
  fetchTripsForUser,
  getTrip,
  listenToTrips,
  updateTrip,
} from "../lib/firestoreService";
```

#### src/stores/highlightsStore.ts

```typescript
import { create } from "zustand";
```

### Context

#### src/context/AuthContext.tsx

```typescript
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { logoutUser, onAuthStateChange } from "../lib/authService";
import { AuthUser, useAuthStore } from "../stores/authStore";
import { useEntriesStore } from "../stores/entriesStore";
import { useTripsStore } from "../stores/tripsStore";
```

### Screens & Routes

#### src/app/\_layout.tsx

```typescript
import {
  NavigationContainer,
  ThemeProvider,
  useTheme as useNavTheme,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { AuthProvider } from "@/context/AuthContext";
import { onAuthStateChange } from "@/lib/authService";
```

#### src/app/index.tsx

```typescript
import { useAuthStore } from "@/stores/authStore";
import { Redirect } from "expo-router";
import React from "react";
```

#### src/app/explore.tsx

```typescript
import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ExternalLink } from "@/components/external-link";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Collapsible } from "@/components/ui/collapsible";
import { WebBadge } from "@/components/web-badge";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
```

#### src/app/(auth)/\_layout.tsx

```typescript
import { Stack } from "expo-router";
```

#### src/app/(auth)/login.tsx

```typescript
import { useRouter } from "expo-router";
// (other imports)
```

#### src/app/(auth)/signup.tsx

```typescript
import { useRouter } from "expo-router";
// (other imports)
```

#### src/app/(app)/\_layout.tsx

```typescript
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import EntryFormScreen from "./entry-form";
import HighlightsScreen from "./highlights";
import JournalScreen from "./journal";
import MapScreen from "./map";
import PhotoUploadScreen from "./photo-upload";
import ProfileScreen from "./profile";
import TripDetailScreen from "./trip-detail";
import TripFormScreen from "./trip-form";
```

#### src/app/(app)/entry-detail.tsx

```typescript
import { format } from "date-fns";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Entry, getEntry } from "../../lib/firestoreService";
import { useAuthStore } from "../../stores/authStore";
import { useEntriesStore } from "../../stores/entriesStore";
```

#### src/app/(app)/entry-form.tsx

```typescript
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker"; // ❌ NOT IN package.json
import * as Location from "expo-location"; // ✓ IN package.json
import { useLocalSearchParams, useRouter } from "expo-router";
// ... more imports
```

#### src/app/(app)/trip-form.tsx

```typescript
import DateTimePicker from "@react-native-community/datetimepicker"; // ❌ NOT IN package.json
import React, { useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
// ... more imports
```

#### src/app/(app)/map.tsx

```typescript
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// Conditional requires:
const MapView =
  Platform.OS !== "web" ? require("react-native-maps").default : null; // ❌ NOT IN package.json
const Marker =
  Platform.OS !== "web" ? require("react-native-maps").Marker : null; // ❌ NOT IN package.json
const PROVIDER_GOOGLE =
  Platform.OS !== "web" ? require("react-native-maps").PROVIDER_GOOGLE : null; // ❌ NOT IN package.json
```

#### src/app/(app)/journal.tsx

```typescript
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// ... more imports
```

#### src/app/(app)/highlights.tsx

```typescript
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
// ... more imports
```

#### src/app/(app)/profile.tsx

```typescript
import { MaterialCommunityIcons } from "@expo/vector-icons";
// ... more imports
```

#### src/app/(app)/photo-upload.tsx

```typescript
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
// ... more imports
```

#### src/app/(app)/trip-detail.tsx

```typescript
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
// ... more imports
```

#### src/app/(app)/(modals)/\_layout.tsx

```typescript
import { createNativeStackNavigator } from "@react-navigation/native-stack";
```

#### src/app/(app)/(modals)/entry-detail.tsx

```typescript
import { useLocalSearchParams, useRouter } from "expo-router";
// ... more imports
```

### Components

#### src/components/animated-icon.tsx

```typescript
import { Image } from "expo-image";
import { useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, { Easing, Keyframe } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
```

#### src/components/animated-icon.web.tsx

```typescript
import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";
import Animated, { Keyframe, Easing } from "react-native-reanimated";
import classes from "./animated-icon.module.css";
```

#### src/components/app-tabs.tsx

```typescript
import { NativeTabs } from "expo-router/unstable-native-tabs";
```

#### src/components/app-tabs.web.tsx

```typescript
import { Tabs } from "expo-router/ui";
import { SymbolView } from "expo-symbols";
```

#### src/components/external-link.tsx

```typescript
import { Href, Link } from "expo-router";
import {
  openBrowserAsync,
  WebBrowserPresentationStyle,
} from "expo-web-browser";
```

#### src/components/ui/collapsible.tsx

```typescript
import { SymbolView } from "expo-symbols";
import React, { useState } from "react";
import Animated, { FadeIn } from "react-native-reanimated";
```

#### src/components/web-badge.tsx

```typescript
import React from "react";
import { Image } from "expo-image";
```

### Hooks

#### src/hooks/use-color-scheme.ts

```typescript
export { useColorScheme } from "react-native";
```

#### src/hooks/use-color-scheme.web.ts

```typescript
import { useEffect, useState } from "react";
import { useColorScheme as useRNColorScheme } from "react-native";
```

#### src/hooks/use-theme.ts

```typescript
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
```

### Constants

#### src/constants/theme.ts

```typescript
import "@/global.css";
import { Platform } from "react-native";
```

### Build Scripts

#### scripts/reset-project.js

```javascript
const fs = require("fs");
const path = require("path");
const readline = require("readline");
```

---

## Summary Statistics

| Category                           | Count |
| ---------------------------------- | ----- |
| Total dependencies in package.json | 25    |
| Missing dependencies used in code  | 3     |
| Firebase sub-packages              | 3     |
| Expo sub-packages                  | 15+   |
| React Navigation sub-packages      | 2     |
| Zustand                            | 1     |
| Date-fns                           | 1     |

---

## Critical Issues Found

### ❌ Missing Dependencies (3 packages)

1. **@react-native-community/datetimepicker**
   - Required for date/time input in entry and trip forms
   - Used in 2 files (entry-form.tsx, trip-form.tsx)
   - **Action Needed:** Add to package.json and install

2. **react-native-maps**
   - Required for map functionality in the map screen
   - Conditionally loaded (Platform.OS !== "web")
   - Used in 1 file (map.tsx)
   - **Action Needed:** Add to package.json and install

3. **expo-location**
   - Required for geolocation features in entry form
   - Used in 1 file (entry-form.tsx)
   - **Action Needed:** Add to package.json and install

---

## Recommendations

1. **Update package.json** to include the 3 missing dependencies
2. **Run npm install** or **expo install** after updating package.json
3. **Verify all imports** are resolved before next build
4. **Consider using expo install** command which handles Expo-specific packages better:
   ```
   expo install @react-native-community/datetimepicker
   expo install react-native-maps
   expo install expo-location
   ```

---

## Firebase Modules Used

The application imports from these Firebase sub-packages:

- `firebase/app` - Core Firebase initialization
- `firebase/auth` - Authentication
- `firebase/firestore` - Firestore database
- `firebase/storage` - Cloud storage

All Firebase SDKs are imported but the `firebase` package itself is NOT listed in package.json. This works because Firebase is installed via Expo, but consider explicitly adding `firebase` as a dependency for clarity.

---

**Report Generated:** May 23, 2026
