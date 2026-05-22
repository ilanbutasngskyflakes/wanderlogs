import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import EntryDetailScreen from "./entry-detail";

const Stack = createNativeStackNavigator();

export default function ModalsLayout() {
  return (
    <Stack.Navigator
      screenOptions={{
        presentation: "modal",
        headerShown: false,
      }}
    >
      <Stack.Screen name="entry-detail" component={EntryDetailScreen} />
    </Stack.Navigator>
  );
}
