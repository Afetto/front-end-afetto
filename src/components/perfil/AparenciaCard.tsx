import { PreferenciaTema, useTema } from "@/context/TemaContext";
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

const OPCOES: { valor: PreferenciaTema; rotulo: string; icone: keyof typeof Ionicons.glyphMap }[] = [
  { valor: "light", rotulo: "Claro", icone: "sunny-outline" },
  { valor: "dark", rotulo: "Escuro", icone: "moon-outline" },
  { valor: "system", rotulo: "Sistema", icone: "phone-portrait-outline" },
];

export function AparenciaCard() {
  const { tema, definirTema } = useTema();

  return (
    <View className="gap-2">
      <Text className="px-1 text-[11px] font-semibold uppercase tracking-[0.8px] text-muted dark:text-gray-400">
        Aparência
      </Text>

      <View className="flex-row gap-2 rounded-2xl bg-white dark:bg-gray-800 p-2 shadow-sm">
        {OPCOES.map((opcao) => {
          const selecionado = tema === opcao.valor;
          return (
            <TouchableOpacity
              key={opcao.valor}
              onPress={() => definirTema(opcao.valor)}
              activeOpacity={0.8}
              className={`flex-1 items-center justify-center gap-1 rounded-xl py-3 ${
                selecionado ? "bg-primary" : ""
              }`}
            >
              <Ionicons
                name={opcao.icone}
                size={18}
                color={selecionado ? "#fff" : "#9E9589"}
              />
              <Text
                className={`text-xs font-medium ${
                  selecionado ? "text-white" : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {opcao.rotulo}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
