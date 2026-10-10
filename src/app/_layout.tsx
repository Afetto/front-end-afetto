import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { AppState, LogBox } from "react-native";
import { useReactQueryDevTools } from "@dev-plugins/react-query";
import { focusManager, QueryClientProvider } from "@tanstack/react-query";
import { useColorScheme } from "nativewind";
import "react-native-reanimated";
import "../global.css";

import { queryClient } from "@/api/queryClient";
import { SessaoProvider } from "@/context/SessaoContext";
import { TemaProvider } from "@/context/TemaContext";
import { useNotificacoes } from "@/hooks/useNotificacoes";

// No Expo Go para Android (SDK 53+), o expo-notifications avisa com um console.error,
// ao ser carregado, que o push REMOTO saiu do Expo Go. O app só usa notificações
// locais (lembrete de vacina), que continuam funcionando — então o aviso não vira
// a tela vermelha do LogBox. No terminal do Expo ele continua aparecendo.
LogBox.ignoreLogs(["expo-notifications: Android Push notifications"]);

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
  const { colorScheme } = useColorScheme();

  // Toque num lembrete de vacina → histórico do pet. Sem sessão, o
  // <RotaProtegida> do grupo (app) manda para o login.
  useNotificacoes({
    aoAbrirPet: (idPet) =>
      router.push({ pathname: "/pet/[id]/historico", params: { id: idPet } }),
  });

  return (
    <QueryClientProvider client={queryClient}>
      <TemaProvider>
        <SessaoProvider>
          <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(app)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </SessaoProvider>
      </TemaProvider>
    </QueryClientProvider>
  );
}
