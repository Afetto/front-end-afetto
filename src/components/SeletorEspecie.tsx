import { ESPECIES_PET, EspeciePet } from "@/schemas/pet.schema";
import { LABEL_ESPECIE } from "@/utils/pet";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  value?: EspeciePet;
  onChange: (value: EspeciePet) => void;
  error?: string;
};

export function SeletorEspecie({ value, onChange, error }: Props) {
  return (
    <View className="gap-1">
      <Text className="text-sm text-gray-700 font-medium">Espécie</Text>
      <View className="flex-row flex-wrap gap-2">
        {ESPECIES_PET.map((esp) => {
          const selecionado = value === esp;
          return (
            <TouchableOpacity
              key={esp}
              onPress={() => onChange(esp)}
              activeOpacity={0.8}
              className={`px-3 py-2 rounded-full border ${
                selecionado ? "bg-primary border-primary" : "bg-white border-gray-200"
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  selecionado ? "text-white" : "text-gray-600"
                }`}
              >
                {LABEL_ESPECIE[esp]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {error && <Text className="text-red-500 text-xs mt-0.5">{error}</Text>}
    </View>
  );
}
