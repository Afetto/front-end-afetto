import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

// Cada tipo de cuidado tem a sua tela de cadastro; este seletor fica no topo
// delas (só ao adicionar, não ao editar) e troca de uma para a outra.
const TIPOS = [
  { chave: "vacina", label: "Vacina", icone: "shield-checkmark-outline", rota: "cuidados" },
  { chave: "remedio", label: "Remédio", icone: "medkit-outline", rota: "remedio" },
  { chave: "consulta", label: "Consulta", icone: "calendar-outline", rota: "consulta" },
] as const;

export type TipoCuidado = (typeof TIPOS)[number]["chave"];

type Props = {
  idPet: string;
  atual: TipoCuidado;
};

export function SeletorTipoCuidado({ idPet, atual }: Props) {
  return (
    <View className="flex-row gap-2">
      {TIPOS.map((tipo) => {
        const selecionado = tipo.chave === atual;
        return (
          <TouchableOpacity
            key={tipo.chave}
            disabled={selecionado}
            // `as any`: rota gerada por template literal, fora do que o typedRoutes infere.
            onPress={() => router.replace(`/pet/${idPet}/${tipo.rota}` as any)}
            activeOpacity={0.8}
            className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-2xl border ${
              selecionado
                ? "bg-primary border-primary"
                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            }`}
          >
            <Ionicons name={tipo.icone} size={16} color={selecionado ? "#FFFFFF" : "#9E9589"} />
            <Text
              className={`text-sm font-medium ${
                selecionado ? "text-white" : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {tipo.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
