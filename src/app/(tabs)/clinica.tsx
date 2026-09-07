import { useSessao } from "@/context/SessaoContext";
import { useClinicas, useVincularClinica } from "@/hooks/useClinicas";
import { Clinica } from "@/schemas/clinica.schema";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const BADGE_COLORS: Record<string, string> = {
  "Clínica Geral": "#A8C5A0",
  "24h": "#E8A838",
  "Exóticos": "#9A9585",
  "Cirurgia": "#2D4A3E",
};

export default function TelaClinica() {
  const { sessao, concluirEtapa } = useSessao();
  const {
    data: clinicas = [],
    isLoading: carregando,
    isError: temErro,
    refetch,
  } = useClinicas();
  const { mutate: vincular, isPending: vinculando } = useVincularClinica();
  const [busca, setBusca] = useState("");

  const clinicasFiltradas = clinicas.filter((c) =>
    c.nome.toLowerCase().includes(busca.toLowerCase())
  );

  function handleVincular(clinicaId: number) {
    if (!sessao?.id) return;

    vincular(
      { clinicaId, usuarioId: sessao.id },
      {
        onSuccess: async () => {
          await concluirEtapa("clinicaVinculada");
        },
      }
    );
  }

  function renderCard({ item }: { item: Clinica }) {
    const inicial = item.nome.charAt(0).toUpperCase();
    const badgeColor = BADGE_COLORS[item.especialidade] ?? "#9A9585";

    return (
      <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
        <View className="flex-row items-center gap-3">
          <View
            style={{ backgroundColor: "#E8A838" }}
            className="w-12 h-12 rounded-full items-center justify-center"
          >
            <Text className="text-white font-bold text-lg">{inicial}</Text>
          </View>

          <View className="flex-1">
            <Text className="text-base font-bold text-primary">{item.nome}</Text>
            <Text className="text-xs text-muted mt-0.5">
              {item.bairro}, {item.cidade}
            </Text>
            <View
              style={{ backgroundColor: badgeColor + "22", borderColor: badgeColor }}
              className="self-start mt-1 px-2 py-0.5 rounded-full border"
            >
              <Text style={{ color: badgeColor }} className="text-xs font-medium">
                {item.especialidade}
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-3">
          {item.vinculada ? (
            <View className="flex-row items-center justify-center gap-1 py-2 rounded-xl bg-green-50 border border-green-300">
              <Ionicons name="checkmark-circle" size={16} color="#A8C5A0" />
              <Text className="text-sm font-medium" style={{ color: "#2D4A3E" }}>
                Vinculada
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => handleVincular(item.id)}
              disabled={vinculando}
              style={{ borderColor: "#E8A838" }}
              className="py-2 rounded-xl border items-center"
            >
              {vinculando ? (
                <ActivityIndicator size="small" color="#E8A838" />
              ) : (
                <Text style={{ color: "#B07A0A" }} className="text-sm font-medium">
                  Vincular
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  if (carregando) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator color="#E8A838" size="large" />
      </View>
    );
  }

  if (temErro) {
    return (
      <View className="flex-1 items-center justify-center bg-surface gap-3 px-8">
        <Ionicons name="cloud-offline-outline" size={48} color="#9A9585" />
        <Text className="text-muted text-sm text-center">
          Erro ao carregar clínicas. Tente novamente.
        </Text>
        <TouchableOpacity onPress={() => refetch()}>
          <Text className="text-amber font-semibold">Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface">
      <View style={{ backgroundColor: "#1F3B30" }} className="px-5 pt-14 pb-5">
        <Text className="text-xl font-bold text-white" style={{ fontFamily: "Fraunces" }}>
          Clínicas Parceiras
        </Text>
        <Text className="text-sm mt-1" style={{ color: "#A8C5A0" }}>
          Vincule seu pet a uma clínica
        </Text>

        <View className="flex-row items-center bg-white/10 rounded-xl px-3 mt-4 gap-2">
          <Ionicons name="search" size={18} color="#A8C5A0" />
          <TextInput
            value={busca}
            onChangeText={setBusca}
            placeholder="Buscar clínica..."
            placeholderTextColor="#A8C5A0"
            className="flex-1 py-3 text-sm text-white"
          />
        </View>
      </View>

      <FlatList
        data={clinicasFiltradas}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderCard}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View className="items-center justify-center mt-16 gap-2">
            <Ionicons name="search-outline" size={40} color="#9A9585" />
            <Text className="text-muted text-sm">Nenhuma clínica encontrada</Text>
          </View>
        }
      />
    </View>
  );
}