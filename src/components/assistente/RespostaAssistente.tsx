import { Resposta } from "@/utils/assistente";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  resposta: Resposta;
  onAcao: () => void;
};

/** Balão de resposta do Assistente: texto, linhas de detalhe e o botão para a tela relacionada. */
export function RespostaAssistente({ resposta, onAcao }: Props) {
  // Âmbar escuro no balão branco (o âmbar claro ficava com contraste de 2:1); no escuro, âmbar
  const { colorScheme } = useColorScheme();
  const corAcao = colorScheme === "dark" ? "#E8A838" : "#B07A0A";

  return (
    <View className="self-start mr-10 bg-white dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 gap-2 shadow-sm">
      <Text className="text-sm text-gray-900 dark:text-white">{resposta.texto}</Text>

      {resposta.detalhes.map((linha, indice) => (
        <View key={`${indice}-${linha}`} className="flex-row gap-2">
          <Text className="text-sm text-amber">•</Text>
          <Text className="flex-1 text-sm text-gray-700 dark:text-gray-300">{linha}</Text>
        </View>
      ))}

      <TouchableOpacity
        onPress={onAcao}
        activeOpacity={0.7}
        hitSlop={8}
        className="self-start mt-1 flex-row items-center gap-1"
      >
        <Text className="text-sm font-semibold text-amber-dark dark:text-amber">{resposta.acao.rotulo}</Text>
        <Ionicons name="chevron-forward" size={14} color={corAcao} />
      </TouchableOpacity>
    </View>
  );
}
