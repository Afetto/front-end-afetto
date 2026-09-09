import { Stack } from "expo-router";

export default function LayoutApp() {
  return (
    <Stack>
      <Stack.Screen name="completar-perfil" options={{ title: "" }} />
      <Stack.Screen name="perfil" options={{ headerShown: false }} />
    </Stack>
  );
}
