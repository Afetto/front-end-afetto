import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  versao: string;
  onAbrir: () => void;
};

// Entrada para a tela "Sobre o App" (versão e hash do commit)
export function SobreAppCard({ versao, onAbrir }: Props) {
  return (
    <View className="gap-2">
      <Text className="px-1 text-[11px] font-semibold uppercase tracking-[0.8px] text-muted dark:text-gray-400">
        Aplicativo
      </Text>

      <View className="rounded-2xl bg-white dark:bg-gray-800 px-4 shadow-sm">
        <TouchableOpacity onPress={onAbrir} activeOpacity={0.7} className="flex-row items-center py-3.5">
          <Text className="flex-1 text-[15px] text-gray-900 dark:text-white">Sobre o App</Text>
          <Text className="mr-1 text-sm text-muted dark:text-gray-400">v{versao}</Text>
          <Ionicons name="chevron-forward" size={16} color="#9E9589" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
