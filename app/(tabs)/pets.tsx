import { Ionicons } from "@expo/vector-icons";
import { useSession } from "@/context/SessionContext";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

export default function PetsScreen() {
  const { completeStep } = useSession();
  const [loading, setLoading] = useState(false);

  async function handleConcluir() {
    setLoading(true);
    try {
      await completeStep("petRegistered");
      router.back();
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-surface px-6">
      <View className="flex-1 items-center justify-center gap-3">
        <Ionicons name="paw" size={56} color="#E8A838" />
        <Text className="text-xl font-bold text-primary text-center">
          Seus Pets
        </Text>
        <Text className="text-sm text-muted text-center">
          Em breve você poderá cadastrar seus pets aqui.
        </Text>
      </View>

      <TouchableOpacity
        onPress={handleConcluir}
        disabled={loading}
        activeOpacity={0.85}
        className={`items-center justify-center py-4 rounded-2xl mb-10 ${
          loading ? "bg-primary/70" : "bg-primary"
        }`}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-lg font-semibold">Concluir</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
