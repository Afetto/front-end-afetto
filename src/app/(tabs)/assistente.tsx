import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

export default function TelaAssistente() {
  return (
    <View className="flex-1 bg-surface dark:bg-gray-900">
      <View className="px-5 pt-14 pb-5 bg-primary">
        <Text className="text-xl font-bold text-white">Assistente</Text>
      </View>

      <View className="flex-1 items-center justify-center gap-3 px-8">
        <Ionicons name="chatbubble-ellipses" size={48} color="#E8A838" />
        <Text className="text-sm text-muted dark:text-gray-400 text-center">
          Em breve você poderá conversar com o assistente aqui.
        </Text>
      </View>
    </View>
  );
}
