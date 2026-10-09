import { ESPECIES_PET, EspeciePet } from "@/schemas/pet.schema";
import { ICONE_ESPECIE, LABEL_ESPECIE } from "@/utils/pet";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  value?: EspeciePet;
  onChange: (value: EspeciePet) => void;
  error?: string;
};

export function SeletorEspecie({ value, onChange, error }: Props) {
  return (
    <View className="gap-1">
      <Text className="text-sm text-gray-700 dark:text-gray-300 font-medium">Espécie</Text>
      <View className="flex-row flex-wrap gap-2">
        {ESPECIES_PET.map((esp) => {
          const selecionado = value === esp;
          return (
            <TouchableOpacity
              key={esp}
              onPress={() => onChange(esp)}
              activeOpacity={0.8}
              className={`w-[23%] items-center justify-center gap-1 rounded-2xl border py-3 px-1 ${
                selecionado ? "border-2 border-amber bg-amber/10" : "border-border dark:border-gray-700 bg-white dark:bg-gray-800"
              }`}
            >
              <Text className="text-2xl">{ICONE_ESPECIE[esp]}</Text>
              <Text className="text-center text-xs font-medium text-primary dark:text-white">
                {LABEL_ESPECIE[esp]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {error && <Text className="mt-1 text-xs text-red-500">{error}</Text>}
    </View>
  );
}
