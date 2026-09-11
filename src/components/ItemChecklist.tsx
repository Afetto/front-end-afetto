import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  titulo: string;
  subtitulo: string;
  concluido: boolean;
  opcional?: boolean;
  onPress?: () => void;
};

export function ItemChecklist({
  titulo,
  subtitulo,
  concluido,
  opcional,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={concluido ? 1 : 0.7}
      onPress={onPress}
      className="bg-white rounded-2xl px-4 py-4 flex-row items-center gap-4 shadow-sm"
    >
      {concluido ? (
        <View className="w-8 h-8 rounded-full bg-green-medium items-center justify-center">
          <Ionicons name="checkmark" size={16} color="#fff" />
        </View>
      ) : (
        <View className="w-8 h-8 rounded-full bg-amber/10 items-center justify-center">
          <Ionicons name="time-outline" size={18} color="#E8A838" />
        </View>
      )}

      <View className="flex-1">
        <View className="flex-row items-center gap-2 flex-wrap">
          <Text className="text-sm font-semibold text-gray-900">{titulo}</Text>
          {opcional && (
            <View className="bg-golden-pale px-2 py-0.5 rounded-full">
              <Text className="text-xs text-golden">opcional</Text>
            </View>
          )}
        </View>
        <Text className="text-xs text-muted mt-0.5">{subtitulo}</Text>
      </View>

      {!concluido && <Ionicons name="chevron-forward" size={16} color="#9E9589" />}
    </TouchableOpacity>
  );
}
