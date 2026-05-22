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

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();

function TabNavigator() {
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
        component={JournalScreen}
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

export default function AppLayout() {
  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <RootStack.Screen
        name="tabs"
        component={TabNavigator}
      />
      <RootStack.Screen
        name="trip-form"
        component={TripFormScreen}
        options={{
          presentation: "card",
        }}
      />
      <RootStack.Screen
        name="trip-detail"
        component={TripDetailScreen}
        options={{
          presentation: "card",
        }}
      />
      <RootStack.Screen
        name="entry-form"
        component={EntryFormScreen}
        options={{
          presentation: "card",
        }}
      />
      <RootStack.Screen
        name="photo-upload"
        component={PhotoUploadScreen}
        options={{
          presentation: "card",
        }}
      />
    </RootStack.Navigator>
  );
}
