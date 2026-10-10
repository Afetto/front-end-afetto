import {
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  onSair: () => void;
};

// O botão "Upgrade para Afetto Plus" saiu: não tinha ação (não existe plano pago)
export function ContaCard({ onSair }: Props) {
  return (
    <View className="gap-2">
      <Text className="px-1 text-[11px] font-semibold uppercase tracking-[0.8px] text-muted dark:text-gray-400">
        Conta
      </Text>

      <View className="rounded-2xl bg-white dark:bg-gray-800 px-4 shadow-sm">
        <TouchableOpacity
          onPress={onSair}
          activeOpacity={0.7}
          className="items-center py-3.5"
        >
          <Text className="text-sm font-medium text-red-500">
            Sair da conta
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}