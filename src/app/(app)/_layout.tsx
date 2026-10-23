import { RotaProtegida } from "@/components/RotaProtegida";
import { opcoesCabecalhoNativo } from "@/utils/cabecalho";
import { Stack } from "expo-router";
import { useColorScheme } from "nativewind";

export default function LayoutApp() {
  // Só "Finalize seu cadastro" mostra o cabeçalho nativo; ele acompanha o tema do app
  const { colorScheme } = useColorScheme();

  return (
    <RotaProtegida>
      <Stack screenOptions={opcoesCabecalhoNativo(colorScheme === "dark")}>
        <Stack.Screen name="completar-perfil" options={{ title: "" }} />
        <Stack.Screen name="perfil" options={{ headerShown: false }} />
        <Stack.Screen name="pet/cadastrar" options={{ headerShown: false }} />
        <Stack.Screen name="pet/[id]/index" options={{ headerShown: false }} />
        <Stack.Screen name="pet/[id]/editar" options={{ headerShown: false }} />
        <Stack.Screen name="pet/[id]/historico" options={{ headerShown: false }} />
        <Stack.Screen name="pet/[id]/cuidados" options={{ headerShown: false }} />
        <Stack.Screen name="pet/[id]/remedio" options={{ headerShown: false }} />
        <Stack.Screen name="pet/[id]/consulta" options={{ headerShown: false }} />
        <Stack.Screen name="pet/[id]/calendario" options={{ headerShown: false }} />
        <Stack.Screen name="clinica/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="agendamento/[idClinica]" options={{ headerShown: false }} />
        <Stack.Screen name="sobre" options={{ headerShown: false }} />
      </Stack>
    </RotaProtegida>
  );
}
