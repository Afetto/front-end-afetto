import ConcentricCircles from "@/components/ConcentricCircles";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function OnboardingScreen() {
  return (
    <View className="flex-1 bg-primary">
      {/* Conteúdo principal */}
      <View className="flex-1 justify-center gap-6 px-8">
        {/* Título com "tto" destacado */}
        <Text className="text-4xl font-bold text-white text-center leading-tight">
          Seja bem-vindo ao Afe
          <Text className="text-golden">tto</Text>
        </Text>

        {/* Subtítulo */}
        <Text className="text-base text-white/70 text-center leading-relaxed">
          Acompanhando a saúde e o bem-estar do seu pet de forma{" "}
          <Text className="italic">simples</Text> e{" "}
          <Text className="italic">inteligente.</Text>
        </Text>

        {/* Botões */}
        <View className="gap-4 mt-6">
          <TouchableOpacity
            onPress={() => router.push("/register")}
            activeOpacity={0.85}
            className="bg-golden items-center justify-center py-4 rounded-2xl"
          >
            <Text className="text-white text-lg font-semibold">
              Criar Conta
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/login")}
            activeOpacity={0.7}
            className="items-center justify-center py-2"
          >
            <Text className="text-golden text-lg font-semibold">Entrar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ConcentricCircles />
    </View>
  );
}
