import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";

type Props = {
  /** Nota de 0 a 5 (aceita meia estrela na exibição, ex.: 4.5). */
  nota: number;
  tamanho?: number;
  /** Com `onChange`, as estrelas viram botões para escolher a nota (1 a 5). */
  onChange?: (nota: number) => void;
};

/** Estrelas de avaliação — só exibição (lista, comentários) ou escolha da nota. */
export function Estrelas({ nota, tamanho = 14, onChange }: Props) {
  return (
    <View className="flex-row items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((posicao) => {
        const icone = nota >= posicao ? "star" : nota >= posicao - 0.5 ? "star-half" : "star-outline";
        const estrela = <Ionicons name={icone} size={tamanho} color="#E8A838" />;

        if (!onChange) return <View key={posicao}>{estrela}</View>;

        return (
          <TouchableOpacity
            key={posicao}
            onPress={() => onChange(posicao)}
            hitSlop={4}
            accessibilityLabel={`${posicao} ${posicao === 1 ? "estrela" : "estrelas"}`}
          >
            {estrela}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
