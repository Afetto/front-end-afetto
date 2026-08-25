import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

export default function AssistenteScreen() {
  return (
    <View className="flex-1 bg-surface items-center justify-center gap-3">
      <Ionicons name="chatbubble-ellipses" size={48} color="#E8A838" />
      <Text className="text-xl font-bold text-primary">Assistente</Text>
      <Text className="text-sm text-muted">Em breve você poderá conversar com o assistente aqui.</Text>
    </View>
  );
}
