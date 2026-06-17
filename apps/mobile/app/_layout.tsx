
import "react-native-reanimated";
import React, { useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";
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
import { ErrorBoundary } from "@/components/ErrorBoundary";
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
import { WEB_APP_MAX_WIDTH } from "@/utils/webLayout";

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
  const [dmSansLoaded] = useDMSans({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  const [dmSerifLoaded] = useDMSerif({
    DMSerifDisplay_400Regular,
  });

  useEffect(() => {
    if (dmSansLoaded && dmSerifLoaded) {
      SplashScreen.hideAsync();
    }
  }, [dmSansLoaded, dmSerifLoaded]);

  if (!dmSansLoaded || !dmSerifLoaded) {
    return null;
  }

  const appShell = (
    <View style={Platform.OS === "web" ? rootStyles.webFrame : rootStyles.flex}>
      <Stack
        screenOptions={{
          animation: "slide_from_right",
          animationDuration: 300,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="venue/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="event/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="series/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="heritage/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="wellness" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <SystemBars style="light" />
    </View>
  );

  return (
    <>
      <StatusBar style="light" animated />
      <ThemeProvider value={LookDarkTheme}>
        <ErrorBoundary>
          <AppProvider>
            <GestureHandlerRootView
              style={[rootStyles.flex, Platform.OS === "web" && rootStyles.webHost]}
            >
              {appShell}
            </GestureHandlerRootView>
          </AppProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </>
  );
}

const rootStyles = StyleSheet.create({
  flex: { flex: 1 },
  webHost: {
    alignItems: "center",
    backgroundColor: "#121212",
  },
  webFrame: {
    flex: 1,
    width: "100%",
    maxWidth: WEB_APP_MAX_WIDTH,
    alignSelf: "center",
    backgroundColor: "#121212",
  },
});
