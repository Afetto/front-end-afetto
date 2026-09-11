import { Ionicons } from "@expo/vector-icons";
import {
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  onSair: () => void;
};

export function ContaCard({ onSair }: Props) {
  return (
    <View className="gap-2">
      <Text className="px-1 text-[11px] font-semibold uppercase tracking-[0.8px] text-muted">
        Conta
      </Text>

      <View className="rounded-2xl bg-white px-4 shadow-sm">
        <TouchableOpacity
          activeOpacity={0.8}
          className="my-2 flex-row items-center justify-center gap-2 rounded-xl border-[1.5px] border-amber py-3.5"
        >
          <Ionicons
            name="star"
            size={16}
            color="#E8A838"
          />

          <Text className="text-[15px] font-semibold text-amber">
            Upgrade para Afetto Plus
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onSair}
          activeOpacity={0.7}
          className="items-center py-3.5"
        >
          <Text className="text-sm font-medium text-red">
            Sair da conta
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}