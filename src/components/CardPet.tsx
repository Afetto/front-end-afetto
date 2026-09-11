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

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
    >
      <View className="flex-row items-center gap-3">
        <View className="w-14 h-14 rounded-full items-center justify-center bg-primary">
          <Text className="text-[26px]">{icone}</Text>
        </View>

        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-base font-bold text-primary">{pet.nome}</Text>
            {pet.sexo && (
              <Text className="text-xs text-muted">
                {pet.sexo === "MACHO" ? "♂" : "♀"}
              </Text>
            )}
            {/* TODO: status de saúde ainda não vem da API — placeholder fixo */}
            <View className="px-2 py-0.5 rounded-full border bg-green-medium/10 border-green-medium">
              <Text className="text-xs font-medium text-primary">Em dia ✓</Text>
            </View>
          </View>

          <Text className="text-xs text-muted mt-0.5">
            {LABEL_ESPECIE[pet.especie] ?? pet.especie}
            {pet.raca ? ` • ${pet.raca}` : ""}
          </Text>

          {(idade !== "—" || pet.peso != null) && (
            <View className="flex-row gap-3 mt-2">
              {idade !== "—" && (
                <View className="flex-row items-center gap-1">
                  <Ionicons name="calendar-outline" size={12} color="#9E9589" />
                  <Text className="text-xs text-muted">{idade}</Text>
                </View>
              )}
              {pet.peso != null && (
                <View className="flex-row items-center gap-1">
                  <Ionicons name="barbell-outline" size={12} color="#9E9589" />
                  <Text className="text-xs text-muted">{pet.peso} kg</Text>
                </View>
              )}
            </View>
          )}
        </View>

        <Ionicons name="chevron-forward" size={18} color="#9E9589" />
      </View>
    </TouchableOpacity>
  );
}
