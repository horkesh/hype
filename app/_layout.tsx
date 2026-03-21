
import "react-native-reanimated";
import React, { useEffect } from "react";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  DarkTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { AppProvider } from "@/contexts/AppContext";
import {
  useFonts as useDMSans,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import {
  useFonts as useDMSerif,
  DMSerifDisplay_400Regular,
} from "@expo-google-fonts/dm-serif-display";

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

const LookDarkTheme: Theme = {
  ...DarkTheme,
  colors: {
    primary: "#D4A056",
    background: "#121212",
    card: "#1E1E1E",
    text: "#F5F5F5",
    border: "#2A2A2A",
    notification: "#D4A056",
  },
};

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const [dmSansLoaded] = useDMSans({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  const [dmSerifLoaded] = useDMSerif({
    DMSerifDisplay_400Regular,
  });

  useEffect(() => {
    if (loaded && dmSansLoaded && dmSerifLoaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded, dmSansLoaded, dmSerifLoaded]);

  if (!loaded || !dmSansLoaded || !dmSerifLoaded) {
    return null;
  }

  return (
    <>
      <StatusBar style="light" animated />
      <ThemeProvider value={LookDarkTheme}>
        <AppProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack
              screenOptions={{
                animation: "slide_from_right",
                animationDuration: 300,
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <SystemBars style="light" />
          </GestureHandlerRootView>
        </AppProvider>
      </ThemeProvider>
    </>
  );
}
