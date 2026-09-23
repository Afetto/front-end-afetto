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
      className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 shadow-sm"
    >
      <View className="flex-row items-center gap-3">
        <View className="w-16 h-16 rounded-2xl items-center justify-center bg-amber">
          <Text className="text-[30px]">{icone}</Text>
        </View>

        <View className="flex-1">
          <Text className="text-base font-bold text-gray-900 dark:text-white">{pet.nome}</Text>
          <Text className="text-xs text-muted dark:text-gray-400 mt-0.5">
            {racaOuEspecie}
            {idade !== "—" ? ` • ${idade}` : ""}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={18} color="#9E9589" />
      </View>
    </TouchableOpacity>
  );
}
