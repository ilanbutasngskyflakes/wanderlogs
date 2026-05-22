import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import EntryFormScreen from "../entry-form";
import TripFormScreen from "../trip-form";

const Stack = createNativeStackNavigator();

export default function ModalsLayout() {
  return (
    <Stack.Navigator
      screenOptions={{
        presentation: "modal",
        headerShown: false,
      }}
    >
      <Stack.Screen name="trip-form-modal" component={TripFormScreen} />
      <Stack.Screen name="entry-form-modal" component={EntryFormScreen} />
    </Stack.Navigator>
  );
}
