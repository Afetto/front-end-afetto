import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import Animated from "react-native-reanimated";
import { Text } from "react-native";

type Props = {
  // O estilo animado (opacidade) vem de useAnimatedStyle na tela; o tipo é o
  // mesmo que o Animated.View aceita em `style`
  estilo: ComponentProps<typeof Animated.View>["style"];
};

export function ToastSucesso({ estilo }: Props) {
  return (
    <Animated.View
      style={estilo}
      pointerEvents="none"
      className="absolute left-5 right-5 top-14 flex-row items-center gap-2 rounded-xl bg-green-medium px-4 py-3 shadow-sm"
    >
      <Ionicons
        name="checkmark-circle"
        size={18}
        color="#ffffff"
      />

      <Text className="flex-1 text-sm font-medium text-white">
        Salvo com sucesso!
      </Text>
    </Animated.View>
  );
}