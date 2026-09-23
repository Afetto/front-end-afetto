import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

type Props = {
  icone: React.ComponentProps<typeof Ionicons>["name"];
  texto: string;
};

export function TituloSecao({ icone, texto }: Props) {
  return (
    <View className="flex-row items-center gap-2">
      <Ionicons name={icone} size={16} color="#E8A838" />
      <Text className="text-sm font-semibold text-primary dark:text-white">{texto}</Text>
    </View>
  );
}
