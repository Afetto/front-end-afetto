import { Stack } from "expo-router";

export default function LayoutAutenticacao() {
  return (
    <Stack>
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
