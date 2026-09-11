import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  icone: React.ComponentProps<typeof Ionicons>["name"];
  titulo: string;
  subtitulo?: string;
  textoAcao?: string;
  onAcao?: () => void;
  tamanhoIcone?: number;
};

/** Estado vazio padrão para telas com listagens sem itens. */
export function EstadoVazio({
  icone,
  titulo,
  subtitulo,
  textoAcao,
  onAcao,
  tamanhoIcone = 48,
}: Props) {
  return (
    <View className="items-center justify-center gap-2 px-8">
      <Ionicons name={icone} size={tamanhoIcone} color="#9E9589" />
      <Text className="text-primary font-bold text-base text-center">{titulo}</Text>
      {subtitulo && (
        <Text className="text-muted text-sm text-center">{subtitulo}</Text>
      )}
      {textoAcao && onAcao && (
        <TouchableOpacity
          onPress={onAcao}
          activeOpacity={0.85}
          className="flex-row items-center gap-2 mt-2 px-6 py-3 rounded-2xl border border-amber"
        >
          <Ionicons name="add-circle-outline" size={18} color="#B07A0A" />
          <Text className="text-sm font-semibold text-amber-dark">{textoAcao}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
