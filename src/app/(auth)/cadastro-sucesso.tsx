import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

export default function TelaCadastroSucesso() {
  const scale = useSharedValue(0.7);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 14, mass: 0.8 });
    opacity.value = withTiming(1, { duration: 250 });

    const timer = setTimeout(() => {
      router.replace("/login");
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const estiloCartao = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View className="flex-1 bg-black/60 items-center justify-center px-8">
      <Animated.View
        style={estiloCartao}
        className="bg-white dark:bg-gray-800 rounded-3xl p-8 items-center gap-5 w-full"
      >
        <View className="w-20 h-20 rounded-full bg-green-medium items-center justify-center">
          <Ionicons name="checkmark" size={44} color="#fff" />
        </View>

        <View className="items-center gap-2">
          <Text className="text-2xl font-bold text-primary dark:text-white text-center">
            Conta criada!
          </Text>
          <Text className="text-sm text-muted dark:text-gray-400 text-center leading-relaxed">
            Conta criada com sucesso!{"\n"}
            Agora faça login para entrar no Afe
            <Text className="text-amber font-semibold">tto</Text>.
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.replace("/login")}
          activeOpacity={0.85}
          className="bg-primary items-center justify-center py-3 px-8 rounded-2xl w-full"
        >
          <Text className="text-white text-base font-semibold">Fazer login</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
