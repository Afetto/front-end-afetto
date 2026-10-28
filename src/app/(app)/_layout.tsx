import { RotaProtegida } from "@/components/RotaProtegida";
import { opcoesCabecalhoNativo } from "@/utils/cabecalho";
import { Stack } from "expo-router";
import { useColorScheme } from "nativewind";

export default function LayoutApp() {
  // O cabeçalho nativo acompanha o tema escolhido no app (Claro/Escuro/Sistema)
  const { colorScheme } = useColorScheme();

  return (
    <RotaProtegida>
      {/* As telas têm cabeçalho próprio; só "Finalize seu cadastro" usa o nativo */}
      <Stack screenOptions={{ ...opcoesCabecalhoNativo(colorScheme === "dark"), headerShown: false }}>
        <Stack.Screen name="completar-perfil" options={{ headerShown: true, title: "" }} />
        <Stack.Screen name="perfil" />
        <Stack.Screen name="pet/cadastrar" />
        <Stack.Screen name="pet/[id]/index" />
        <Stack.Screen name="pet/[id]/editar" />
        <Stack.Screen name="pet/[id]/historico" />
        <Stack.Screen name="pet/[id]/cuidados" />
        <Stack.Screen name="pet/[id]/remedio" />
        <Stack.Screen name="pet/[id]/consulta" />
        <Stack.Screen name="pet/[id]/calendario" />
        <Stack.Screen name="clinica/[id]" />
        <Stack.Screen name="agendamento/[idClinica]" />
        <Stack.Screen name="sobre" />
      </Stack>
    </RotaProtegida>
  );
}
