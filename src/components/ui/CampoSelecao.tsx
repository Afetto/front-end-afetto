import { Text, TouchableOpacity, View } from "react-native";

type OpcaoSelecao = { label: string; value: string };

type CampoSelecaoProps = {
  label: string;
  opcoes: OpcaoSelecao[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
};


export function CampoSelecao({ label, opcoes, value, onChange, error }: CampoSelecaoProps) {
  return (
    <View className="gap-1">
      <Text className="text-sm text-gray-700 dark:text-gray-300 font-medium">{label}</Text>
      <View className="flex-row gap-2 flex-wrap">
        {opcoes.map((opcao) => {
          const selecionado = value === opcao.value;
          return (
            <TouchableOpacity
              key={opcao.value}
              onPress={() => onChange(opcao.value)}
              activeOpacity={0.8}
              className={`flex-1 items-center justify-center py-3 rounded-2xl border ${selecionado
                  ? "bg-primary border-primary"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                }`}
            >
              <Text
                className={`text-sm font-medium ${selecionado ? "text-white" : "text-gray-600 dark:text-gray-400"
                  }`}
              >
                {opcao.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {error && (
        <Text className="text-red-500 text-xs mt-0.5">{error}</Text>
      )}
    </View>
  );
}
