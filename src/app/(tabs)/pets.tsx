import { PetsVazio } from "@/components/PetsVazio";
import { useSessao } from "@/context/SessaoContext";
import { usePets } from "@/hooks/usePets";
import { Pet } from "@/schemas/pet.schema";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ICONE_ESPECIE: Record<string, string> = {
  CACHORRO: "🐶",
  GATO: "🐱",
  COELHO: "🐰",
  AVE: "🐦",
  REPTIL: "🦎",
  ROEDOR: "🐹",
  PORCO: "🐷",
  MACACO: "🐵",
  CAVALO: "🐴",
  PEIXE: "🐟",
  INSETO: "🐛",
  OUTRO: "🐾",
};

const LABEL_ESPECIE: Record<string, string> = {
  CACHORRO: "Cachorro",
  GATO: "Gato",
  COELHO: "Coelho",
  AVE: "Ave",
  REPTIL: "Réptil",
  ROEDOR: "Roedor",
  PORCO: "Porco",
  MACACO: "Macaco",
  CAVALO: "Cavalo",
  PEIXE: "Peixe",
  INSETO: "Inseto",
  OUTRO: "Outro",
};

function calcularIdade(dataNasc: string): string {
  if (!dataNasc) return "—";
  const nascimento = new Date(dataNasc); // formato ISO YYYY-MM-DD
  if (Number.isNaN(nascimento.getTime())) return "—";
  const hoje = new Date();
  let anos = hoje.getFullYear() - nascimento.getFullYear();
  const m = hoje.getMonth() - nascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) anos--;
  return anos <= 0 ? "< 1 ano" : `${anos} ${anos === 1 ? "ano" : "anos"}`;
}

export default function TelaPets() {
  const { concluirEtapa } = useSessao();
  const { data: pets = [], isLoading: carregando, isError: temErro, refetch } = usePets();
  const [concluindo, setConcluindo] = useState(false);

  async function aoConcluir() {
    setConcluindo(true);
    try {
      await concluirEtapa("petCadastrado");
      router.back();
    } finally {
      setConcluindo(false);
    }
  }

  if (carregando) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator color="#E8A838" size="large" />
      </View>
    );
  }

  // Sem pets (ou falha ao carregar) → estado vazio com CTA para cadastrar.
  if (pets.length === 0) {
    return <PetsVazio erro={temErro} aoTentarNovamente={() => refetch()} />;
  }

  function renderizarCartao({ item }: { item: Pet }) {
    const icone = ICONE_ESPECIE[item.especie] ?? "🐾";
    const idade = calcularIdade(item.dataNasc);

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
              {item.sexo && (
                <Text className="text-xs text-muted">
                  {item.sexo === "MACHO" ? "♂" : "♀"}
                </Text>
              )}
              {/* TODO: status de saúde ainda não vem da API — placeholder fixo */}
              <View
                style={{ backgroundColor: "#A8C5A022", borderColor: "#A8C5A0" }}
                className="px-2 py-0.5 rounded-full border"
              >
                <Text style={{ color: "#2D4A3E" }} className="text-xs font-medium">
                  Em dia ✓
                </Text>
              </View>
            </View>

            <Text className="text-xs text-muted mt-0.5">
              {LABEL_ESPECIE[item.especie] ?? item.especie}
              {item.raca ? ` • ${item.raca}` : ""}
            </Text>

            {(idade !== "—" || item.peso != null) && (
              <View className="flex-row gap-3 mt-2">
                {idade !== "—" && (
                  <View className="flex-row items-center gap-1">
                    <Ionicons name="calendar-outline" size={12} color="#9A9585" />
                    <Text className="text-xs text-muted">{idade}</Text>
                  </View>
                )}
                {item.peso != null && (
                  <View className="flex-row items-center gap-1">
                    <Ionicons name="barbell-outline" size={12} color="#9A9585" />
                    <Text className="text-xs text-muted">{item.peso} kg</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          <Ionicons name="chevron-forward" size={18} color="#9A9585" />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <View style={{ backgroundColor: "#1F3B30" }} className="px-5 pt-14 pb-5">
        <Text className="text-xl font-bold text-white">Meus Pets</Text>
        <Text className="text-sm mt-1" style={{ color: "#A8C5A0" }}>
          {pets.length} {pets.length === 1 ? "pet cadastrado" : "pets cadastrados"}
        </Text>
      </View>

      {/* Lista */}
      <FlatList
        data={pets}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderizarCartao}
        contentContainerStyle={{ padding: 16, paddingBottom: 160 }}
      />

      {/* Footer — só aparece quando tem pets */}
      <View
        className="absolute bottom-0 left-0 right-0 px-6 pb-10 gap-3"
        style={{ backgroundColor: "#F5F0E8", paddingTop: 12, borderTopWidth: 1, borderTopColor: "#e0ddd5" }}
      >
        <TouchableOpacity
          onPress={() => router.push("/pet/cadastrar" as any)}
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
          onPress={aoConcluir}
          disabled={concluindo}
          activeOpacity={0.85}
          className={`items-center justify-center py-4 rounded-2xl ${concluindo ? "bg-primary/70" : "bg-primary"
            }`}
        >
          {concluindo ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-lg font-semibold">Concluir</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
