import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import EntryDetailScreen from "./entry-detail";
import EntryFormScreen from "./entry-form";
import HighlightsScreen from "./highlights";
import JournalScreen from "./journal";
import MapScreen from "./map";
import PhotoUploadScreen from "./photo-upload";
import ProfileScreen from "./profile";
import TripDetailScreen from "./trip-detail";
import TripFormScreen from "./trip-form";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function JournalStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="journal-list" component={JournalScreen} />
      <Stack.Screen name="trip-form" component={TripFormScreen} />
      <Stack.Screen name="trip-detail" component={TripDetailScreen} />
      <Stack.Screen name="entry-form" component={EntryFormScreen} />
      <Stack.Screen name="entry-detail" component={EntryDetailScreen} />
      <Stack.Screen name="photo-upload" component={PhotoUploadScreen} />
    </Stack.Navigator>
  );
}

export default function AppLayout() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#C85A3E",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          backgroundColor: "#FFF",
          borderTopColor: "#E0DDD9",
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tab.Screen
        name="journal"
        component={JournalStack}
        options={{
          title: "Journal",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="book-open-variant"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="map"
        component={MapScreen}
        options={{
          title: "Map",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="map" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="highlights"
        component={HighlightsScreen}
        options={{
          title: "Highlights",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="star" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="profile"
        component={ProfileScreen}
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
