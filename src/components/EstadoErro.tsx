import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  mensagem: string;
  onTentarNovamente: () => void;
};

/** Estado de erro padrão para telas com dados remotos (lista cheia). */
export function EstadoErro({ mensagem, onTentarNovamente }: Props) {
  return (
    <View className="flex-1 items-center justify-center bg-surface dark:bg-gray-900 gap-3 px-8">
      <Ionicons name="cloud-offline-outline" size={48} color="#9E9589" />
      <Text className="text-muted dark:text-gray-400 text-sm text-center">{mensagem}</Text>
      {/* Mesmo botão de contorno do EstadoVazio: área de toque maior que um link solto */}
      <TouchableOpacity
        onPress={onTentarNovamente}
        activeOpacity={0.85}
        className="flex-row items-center gap-2 mt-1 px-6 py-3 rounded-2xl border border-amber"
      >
        <Ionicons name="refresh" size={16} color="#B07A0A" />
        <Text className="text-sm font-semibold text-amber-dark dark:text-amber">Tentar novamente</Text>
      </TouchableOpacity>
    </View>
  );
}
