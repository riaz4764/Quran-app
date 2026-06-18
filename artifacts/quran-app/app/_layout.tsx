import {
  Amiri_400Regular,
  Amiri_700Bold,
  useFonts as useAmiriFonts,
} from "@expo-google-fonts/amiri";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { BookmarkProvider } from "@/context/BookmarkContext";
import { QuranProvider } from "@/context/QuranContext";
import { initAsync } from "@/utils/quranData";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="surah" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [interLoaded, interError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [amiriLoaded, amiriError] = useAmiriFonts({
    Amiri_400Regular,
    Amiri_700Bold,
  });

  const [dataReady, setDataReady] = useState(false);
  const [dataError, setDataError] = useState(false);

  const fontsLoaded = interLoaded && amiriLoaded;
  const fontError = interError || amiriError;

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
      initAsync()
        .then(() => setDataReady(true))
        .catch(() => setDataError(true));
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  if (!dataReady && !dataError) {
    return (
      <View style={styles.splash}>
        <Text style={styles.bismillah}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
        <ActivityIndicator size="large" color="#C9A84C" style={styles.spinner} />
        <Text style={styles.loadingLabel}>Loading Quran…</Text>
      </View>
    );
  }

  if (dataError) {
    return (
      <View style={styles.splash}>
        <Text style={styles.errorText}>
          Failed to load Quran data.{"\n"}Please check your connection and restart.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QuranProvider>
          <BookmarkProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <KeyboardProvider>
                <RootLayoutNav />
              </KeyboardProvider>
            </GestureHandlerRootView>
          </BookmarkProvider>
        </QuranProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 32,
  },
  bismillah: {
    fontSize: 26,
    color: "#C9A84C",
    fontFamily: "Amiri_400Regular",
    textAlign: "center",
    marginBottom: 8,
  },
  spinner: {
    marginVertical: 8,
  },
  loadingLabel: {
    color: "#888",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
});
