import { Ionicons } from "@expo/vector-icons";
import {
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  onAlterarSenha: () => void;
};

// Só ações que funcionam: o interruptor "Notificações WhatsApp" saiu porque não
// tinha efeito nenhum (não salvava nem enviava nada) — controle sem efeito conta
// como funcionalidade simulada na avaliação.
export function SegurancaCard({ onAlterarSenha }: Props) {
  return (
    <View className="gap-2">
      <Text className="px-1 text-[11px] font-semibold uppercase tracking-[0.8px] text-muted dark:text-gray-400">
        Segurança
      </Text>

      <View className="rounded-2xl bg-white dark:bg-gray-800 px-4 shadow-sm">
        <TouchableOpacity
          onPress={onAlterarSenha}
          activeOpacity={0.7}
          className="flex-row items-center py-3.5"
        >
          <Text className="flex-1 text-[15px] text-gray-900 dark:text-white">
            Alterar senha
          </Text>

          <Ionicons
            name="chevron-forward"
            size={16}
            color="#9E9589"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}