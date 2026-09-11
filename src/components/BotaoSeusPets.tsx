import { Ionicons } from "@expo/vector-icons";
import { Switch, Text, TouchableOpacity } from "react-native";

type Props = {
  ativo: boolean;
  onAtivoChange: (value: boolean) => void;
  onPress: () => void;
};

export function BotaoSeusPets({ ativo, onAtivoChange, onPress }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      className="bg-primary flex-row items-center px-5 py-4 rounded-2xl"
      onPress={onPress}
    >
      <Ionicons name="paw" size={22} color="#E8A838" />
      <Text className="flex-1 text-white text-base font-semibold ml-3">
        Seus <Text className="text-amber">Pets</Text>
      </Text>
      <Switch
        value={ativo}
        onValueChange={onAtivoChange}
        trackColor={{ false: "rgba(255,255,255,0.25)", true: "#E8A838" }}
        thumbColor="#fff"
      />
    </TouchableOpacity>
  );
}
