import { opcoesCabecalhoNativo } from "@/utils/cabecalho";
import { Stack } from "expo-router";
import { useColorScheme } from "nativewind";

export default function LayoutAutenticacao() {
  // O cabeçalho nativo acompanha o tema escolhido no app (Claro/Escuro/Sistema)
  const { colorScheme } = useColorScheme();

  return (
    <Stack screenOptions={opcoesCabecalhoNativo(colorScheme === "dark")}>
      <Stack.Screen name="login" options={{ title: "" }} />
      <Stack.Screen name="cadastro" options={{ title: "" }} />
      <Stack.Screen name="esqueci-senha" options={{ title: "" }} />
      {/* Sucessos: cartão sobre a tela anterior (componente ModalSucesso) */}
      <Stack.Screen
        name="cadastro-sucesso"
        options={{
          headerShown: false,
          presentation: "transparentModal",
          animation: "fade",
        }}
      />
      <Stack.Screen
        name="senha-alterada"
        options={{
          headerShown: false,
          presentation: "transparentModal",
          animation: "fade",
        }}
      />
    </Stack>
  );
}
