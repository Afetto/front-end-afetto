import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

export default function RegisterSuccessScreen() {
  const scale = useSharedValue(0.7);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 14, mass: 0.8 });
    opacity.value = withTiming(1, { duration: 250 });

    const timer = setTimeout(() => {
      router.replace("/(tabs)");
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View className="flex-1 bg-black/60 items-center justify-center px-8">
      <Animated.View
        style={cardStyle}
        className="bg-white rounded-3xl p-8 items-center gap-5 w-full"
      >
        <View className="w-20 h-20 rounded-full bg-green-medium items-center justify-center">
          <Ionicons name="checkmark" size={44} color="#fff" />
        </View>

        <View className="items-center gap-2">
          <Text className="text-2xl font-bold text-primary text-center">
            Conta criada!
          </Text>
          <Text className="text-sm text-muted text-center leading-relaxed">
            Bem-vindo ao Afe
            <Text className="text-amber font-semibold">tto</Text>.{"\n"}
            Vamos configurar o perfil do seu pet!
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}
