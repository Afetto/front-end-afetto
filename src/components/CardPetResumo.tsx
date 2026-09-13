import { Pet } from "@/schemas/pet.schema";
import { calcularIdade } from "@/utils/data";
import { ICONE_ESPECIE, LABEL_ESPECIE } from "@/utils/pet";
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  pet: Pet;
  onEditar?: () => void;
};

/** Card do pet (avatar + nome + raça/idade + badge) que sobrepõe o header
 * verde — usado na tela principal do pet e no histórico de vacinas. */
export function CardPetResumo({ pet, onEditar }: Props) {
  const icone = ICONE_ESPECIE[pet.especie] ?? "🐾";
  const idade = calcularIdade(pet.dataNasc ?? "");
  const racaOuEspecie = pet.raca || LABEL_ESPECIE[pet.especie] || pet.especie;

  return (
    <View className="bg-white rounded-2xl p-4 flex-row items-center gap-3 shadow-md">
      <View className="w-16 h-16 rounded-2xl items-center justify-center bg-amber">
        <Text className="text-[30px]">{icone}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-lg font-bold text-gray-900">{pet.nome}</Text>
        <Text className="text-xs text-muted mt-0.5">
          {racaOuEspecie} • {idade}
        </Text>
        <View className="self-start bg-green-medium rounded-full px-3 py-1 mt-1.5">
          <Text className="text-xs font-semibold text-primary-dark">✓ Saúde em dia!</Text>
        </View>
      </View>
      {onEditar && (
        <TouchableOpacity onPress={onEditar} hitSlop={8}>
          <Ionicons name="pencil" size={18} color="#9E9589" />
        </TouchableOpacity>
      )}
    </View>
  );
}
