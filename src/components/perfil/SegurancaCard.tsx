import { Ionicons } from "@expo/vector-icons";
import {
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  notifWhatsapp: boolean;
  onNotifWhatsappChange: (value: boolean) => void;
  onAlterarSenha: () => void;
};

export function SegurancaCard({
  notifWhatsapp,
  onNotifWhatsappChange,
  onAlterarSenha,
}: Props) {
  return (
    <View className="gap-2">
      <Text className="px-1 text-[11px] font-semibold uppercase tracking-[0.8px] text-muted">
        Segurança
      </Text>

      <View className="rounded-2xl bg-white px-4 shadow-sm">
        <TouchableOpacity
          onPress={onAlterarSenha}
          activeOpacity={0.7}
          className="flex-row items-center border-b border-border py-3.5"
        >
          <Text className="flex-1 text-[15px] text-gray-900">
            Alterar senha
          </Text>

          <Ionicons
            name="chevron-forward"
            size={16}
            color="#9E9589"
          />
        </TouchableOpacity>

        <View className="flex-row items-center py-3.5">
          <Text className="flex-1 text-[15px] text-gray-900">
            Notificações WhatsApp
          </Text>

          <Switch
            value={notifWhatsapp}
            onValueChange={onNotifWhatsappChange}
            trackColor={{
              false: "rgba(0,0,0,0.15)",
              true: "#E8A838",
            }}
            thumbColor="#ffffff"
          />
        </View>
      </View>
    </View>
  );
}