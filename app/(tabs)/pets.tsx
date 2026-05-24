import { Ionicons } from "@expo/vector-icons";
import { useSession } from "@/context/SessionContext";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Pet = {
  id: number;
  nome: string;
  especie: string;
  raca: string;
  idade: string;
  peso: string;
  sexo: "M" | "F";
  saudavel: boolean;
};

const ESPECIES_ICON: Record<string, string> = {
  Cachorro: "🐶",
  Gato: "🐱",
  Coelho: "🐰",
  Pássaro: "🐦",
  Réptil: "🦎",
  Outro: "🐾",
};

const PETS_MOCK: Pet[] = [
  { id: 1, nome: "Bolinha", especie: "Cachorro", raca: "Golden Retriever", idade: "3 anos", peso: "28kg", sexo: "M", saudavel: true },
  { id: 2, nome: "Mimi", especie: "Gato", raca: "Siamês", idade: "1 ano", peso: "4kg", sexo: "F", saudavel: false },
  { id: 3, nome: "Fofão", especie: "Coelho", raca: "Mini Rex", idade: "2 anos", peso: "2kg", sexo: "M", saudavel: true },
];

export default function PetsScreen() {
  const { completeStep } = useSession();
  const [loading, setLoading] = useState(false);
  const [pets] = useState<Pet[]>(PETS_MOCK);

  async function handleConcluir() {
    setLoading(true);
    try {
      await completeStep("petRegistered");
      router.back();
    } finally {
      setLoading(false);
    }
  }

  function renderCard({ item }: { item: Pet }) {
    const icone = ESPECIES_ICON[item.especie] ?? "🐾";

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
      >
        <View className="flex-row items-center gap-3">
          <View
            style={{ backgroundColor: "#1F3B30" }}
            className="w-14 h-14 rounded-full items-center justify-center"
          >
            <Text style={{ fontSize: 26 }}>{icone}</Text>
          </View>

          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text className="text-base font-bold text-primary">{item.nome}</Text>
              <Text className="text-xs text-muted">
                {item.sexo === "M" ? "♂" : "♀"}
              </Text>
              {item.saudavel ? (
                <View
                  style={{ backgroundColor: "#A8C5A022", borderColor: "#A8C5A0" }}
                  className="px-2 py-0.5 rounded-full border"
                >
                  <Text style={{ color: "#2D4A3E" }} className="text-xs font-medium">
                    Em dia ✓
                  </Text>
                </View>
              ) : (
                <View
                  style={{ backgroundColor: "#E8A83822", borderColor: "#E8A838" }}
                  className="px-2 py-0.5 rounded-full border"
                >
                  <Text style={{ color: "#B07A0A" }} className="text-xs font-medium">
                    Atenção ⚠
                  </Text>
                </View>
              )}
            </View>

            <Text className="text-xs text-muted mt-0.5">
              {item.especie} • {item.raca}
            </Text>

            <View className="flex-row gap-3 mt-2">
              <View className="flex-row items-center gap-1">
                <Ionicons name="calendar-outline" size={12} color="#9A9585" />
                <Text className="text-xs text-muted">{item.idade}</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Ionicons name="barbell-outline" size={12} color="#9A9585" />
                <Text className="text-xs text-muted">{item.peso}</Text>
              </View>
            </View>
          </View>

          <Ionicons name="chevron-forward" size={18} color="#9A9585" />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View className="flex-1 bg-surface">
      <View style={{ backgroundColor: "#1F3B30" }} className="px-5 pt-14 pb-5">
        <Text className="text-xl font-bold text-white">
          Meus Pets
        </Text>
        <Text className="text-sm mt-1" style={{ color: "#A8C5A0" }}>
          {pets.length} {pets.length === 1 ? "pet cadastrado" : "pets cadastrados"}
        </Text>
      </View>

      <FlatList
        data={pets}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderCard}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center mt-16 gap-3">
            <Ionicons name="paw-outline" size={48} color="#9A9585" />
            <Text className="text-muted text-sm text-center">
              Você ainda não tem pets cadastrados.
            </Text>
          </View>
        }
      />

      <View className="absolute bottom-0 left-0 right-0 px-6 pb-10 gap-3"
        style={{ backgroundColor: "#F5F0E8", paddingTop: 12, borderTopWidth: 1, borderTopColor: "#e0ddd5" }}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          style={{ borderColor: "#E8A838" }}
          className="items-center justify-center py-3 rounded-2xl border"
        >
          <View className="flex-row items-center gap-2">
            <Ionicons name="add-circle-outline" size={18} color="#B07A0A" />
            <Text style={{ color: "#B07A0A" }} className="text-sm font-semibold">
              Adicionar novo pet
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleConcluir}
          disabled={loading}
          activeOpacity={0.85}
          className={`items-center justify-center py-4 rounded-2xl ${
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
    </View>
  );
}