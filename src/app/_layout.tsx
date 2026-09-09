import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { AppState } from "react-native";
import { useReactQueryDevTools } from "@dev-plugins/react-query";
import { focusManager, QueryClientProvider } from "@tanstack/react-query";
import "react-native-reanimated";
import "../global.css";

import { queryClient } from "@/api/queryClient";
import { SessaoProvider } from "@/context/SessaoContext";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "index",
};

SplashScreen.preventAutoHideAsync();

export default function LayoutRaiz() {
  const [fontesCarregadas, erroFontes] = useFonts({
    SpaceMono: require("../../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // AppState — refetch quando app volta ao foco
  useEffect(() => {
    const inscricao = AppState.addEventListener("change", (status) => {
      focusManager.setFocused(status === "active");
    });
    return () => inscricao.remove();
  }, []);

  useEffect(() => {
    if (erroFontes) throw erroFontes;
  }, [erroFontes]);

  useEffect(() => {
    if (fontesCarregadas) SplashScreen.hideAsync();
  }, [fontesCarregadas]);

  if (!fontesCarregadas) return null;

  return <LayoutRaizNav />;
}

function LayoutRaizNav() {
  useReactQueryDevTools(queryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <SessaoProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </SessaoProvider>
    </QueryClientProvider>
  );
}
