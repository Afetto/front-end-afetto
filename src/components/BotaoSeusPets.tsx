import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity } from "react-native";

type Props = {
  /** Quantidade de pets vinda da API. `undefined` enquanto carrega ou se a busca falhou. */
  quantidade?: number;
  onPress: () => void;
};

function rotuloQuantidade(quantidade: number): string {
  if (quantidade === 0) return "Nenhum pet";
  return quantidade === 1 ? "1 pet" : `${quantidade} pets`;
}

export function BotaoSeusPets({ quantidade, onPress }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      className="bg-primary flex-row items-center px-5 py-4 rounded-2xl"
      onPress={onPress}
    >
      <Ionicons name="paw" size={22} color="#E8A838" />
      <Text className="flex-1 text-white text-base font-semibold ml-3">
        Seus <Text className="text-amber">Pets</Text>
      </Text>
      {quantidade !== undefined && (
        <Text className="text-sm text-white/80 mr-2">
          {rotuloQuantidade(quantidade)}
        </Text>
      )}
      <Ionicons name="chevron-forward" size={18} color="#E8A838" />
    </TouchableOpacity>
  );
}
