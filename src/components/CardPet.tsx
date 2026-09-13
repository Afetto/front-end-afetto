import { Pet } from "@/schemas/pet.schema";
import { calcularIdade } from "@/utils/data";
import { ICONE_ESPECIE, LABEL_ESPECIE } from "@/utils/pet";
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  pet: Pet;
  onPress?: () => void;
};

export function CardPet({ pet, onPress }: Props) {
  const icone = ICONE_ESPECIE[pet.especie] ?? "🐾";
  const idade = calcularIdade(pet.dataNasc);

  const racaOuEspecie = pet.raca || LABEL_ESPECIE[pet.especie] || pet.especie;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
    >
      <View className="flex-row items-center gap-3">
        <View className="w-16 h-16 rounded-2xl items-center justify-center bg-amber">
          <Text className="text-[30px]">{icone}</Text>
        </View>

        <View className="flex-1">
          <Text className="text-base font-bold text-gray-900">{pet.nome}</Text>
          <Text className="text-xs text-muted mt-0.5">
            {racaOuEspecie}
            {idade !== "—" ? ` • ${idade}` : ""}
          </Text>

          {/* ⚠️ A API não expõe status de saúde do pet — badge fixo, sem
              lógica real (mesmo placeholder já usado em pet/[id]/index.tsx). */}
          <View className="self-start bg-green-medium rounded-full px-3 py-1 mt-2">
            <Text className="text-xs font-semibold text-primary-dark">✓ Saúde em dia!</Text>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={18} color="#9E9589" />
      </View>
    </TouchableOpacity>
  );
}
