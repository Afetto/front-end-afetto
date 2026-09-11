import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  mensagem: string;
  onTentarNovamente: () => void;
};

/** Estado de erro padrão para telas com dados remotos (lista cheia). */
export function EstadoErro({ mensagem, onTentarNovamente }: Props) {
  return (
    <View className="flex-1 items-center justify-center bg-surface gap-3 px-8">
      <Ionicons name="cloud-offline-outline" size={48} color="#9E9589" />
      <Text className="text-muted text-sm text-center">{mensagem}</Text>
      <TouchableOpacity onPress={onTentarNovamente}>
        <Text className="text-amber font-semibold">Tentar novamente</Text>
      </TouchableOpacity>
    </View>
  );
}
