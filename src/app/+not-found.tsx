import { EstadoVazio } from "@/components/EstadoVazio";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function TelaNaoEncontrada() {
  return (
    <View className="flex-1 items-center justify-center bg-surface dark:bg-gray-900 gap-4">
      <EstadoVazio
        icone="alert-circle-outline"
        titulo="Página não encontrada"
        subtitulo="O link que você acessou não existe ou foi movido."
      />

      <TouchableOpacity
        onPress={() => router.replace("/")}
        activeOpacity={0.85}
        className="items-center justify-center rounded-2xl bg-primary px-8 py-3"
      >
        <Text className="text-white text-base font-semibold">Voltar ao início</Text>
      </TouchableOpacity>
    </View>
  );
}
