import { Stack } from "expo-router";

export default function LayoutApp() {
  return (
    <Stack>
      <Stack.Screen name="completar-perfil" options={{ title: "" }} />
      <Stack.Screen name="perfil" options={{ headerShown: false }} />
      <Stack.Screen name="pet/cadastrar" options={{ headerShown: false }} />
      <Stack.Screen name="pet/[id]/index" options={{ headerShown: false }} />
      <Stack.Screen name="pet/[id]/editar" options={{ headerShown: false }} />
      <Stack.Screen name="pet/[id]/historico" options={{ headerShown: false }} />
      <Stack.Screen name="pet/[id]/cuidados" options={{ headerShown: false }} />
      <Stack.Screen name="pet/[id]/calendario" options={{ headerShown: false }} />
    </Stack>
  );
}
