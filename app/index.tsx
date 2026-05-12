import { router } from "expo-router";
import {
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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

      {/* Decoração inferior — círculos concêntricos */}
      {/* TODO: substituir por Image quando assets forem enviados */}
      <View style={{ height: 200, alignItems: "center", overflow: "hidden" }}>
        <View style={{
          position: "absolute", bottom: -300,
          width: 500, height: 500, borderRadius: 250,
          backgroundColor: "rgba(210, 200, 140, 0.25)",
        }} />
        <View style={{
          position: "absolute", bottom: -240,
          width: 400, height: 400, borderRadius: 200,
          backgroundColor: "rgba(220, 195, 100, 0.35)",
        }} />
        <View style={{
          position: "absolute", bottom: -185,
          width: 300, height: 300, borderRadius: 150,
          backgroundColor: "rgba(225, 180, 70, 0.55)",
        }} />
        <View style={{
          position: "absolute", bottom: -135,
          width: 210, height: 210, borderRadius: 105,
          backgroundColor: "#D4921E",
        }} />
      </View>
    </View>
  );
}
