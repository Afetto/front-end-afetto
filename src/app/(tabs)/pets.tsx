import { CardPet } from "@/components/CardPet";
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
    return <CardPet pet={item} />;
  }

  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <View className="px-5 pt-14 pb-5 bg-primary">
        <Text className="text-xl font-bold text-white">Meus Pets</Text>
        <Text className="text-sm mt-1 text-green-medium">
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
      <View className="absolute bottom-0 left-0 right-0 px-6 pb-10 pt-3 gap-3 bg-surface border-t border-border">
        <TouchableOpacity
          onPress={() => router.push("/pet/cadastrar" as any)}
          activeOpacity={0.85}
          className="items-center justify-center py-3 rounded-2xl border border-amber"
        >
          <View className="flex-row items-center gap-2">
            <Ionicons name="add-circle-outline" size={18} color="#B07A0A" />
            <Text className="text-sm font-semibold text-amber-dark">
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
