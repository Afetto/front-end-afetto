import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function TelaCalendarioPet() {
  return (
    <View className="flex-1 bg-surface dark:bg-gray-900">
      <View className="flex-row items-center gap-3 px-6 pt-14 pb-4">
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color="#1E3A2F" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900 dark:text-white">Calendário</Text>
      </View>

      <View className="flex-1 items-center justify-center gap-3 px-8">
        <Ionicons name="calendar-outline" size={48} color="#9E9589" />
        <Text className="text-gray-900 dark:text-white font-semibold text-base text-center">Em breve</Text>
        <Text className="text-muted dark:text-gray-400 text-sm text-center">
          O calendário de cuidados do seu pet estará disponível em uma próxima versão do Afetto.
        </Text>
      </View>
    </View>
  );
}
