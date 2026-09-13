import { CardClinica } from "@/components/CardClinica";
import { EstadoVazio } from "@/components/EstadoVazio";
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
  View,
} from "react-native";

export default function TelaClinica() {
  const { sessao, concluirEtapa } = useSessao();
  const {
    data: clinicas = [],
    isLoading: carregando,
    isError: temErro,
  } = useClinicas();
  const { mutate: vincular, isPending: vinculando } = useVincularClinica();
  const [busca, setBusca] = useState("");

  const clinicasFiltradas = clinicas.filter((c) =>
    c.nome.toLowerCase().includes(busca.toLowerCase())
  );

  function aoVincular(clinicaId: string) {
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

  function renderizarCartao({ item }: { item: Clinica }) {
    return (
      <CardClinica clinica={item} vinculando={vinculando} onVincular={aoVincular} />
    );
  }

  if (carregando) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator color="#E8A838" size="large" />
      </View>
    );
  }

  // A API real (confirmada em GET /v3/api-docs) ainda não expõe nenhum
  // endpoint de clínica — não é uma falha temporária de rede, então mostramos
  // um estado permanente de "em breve" em vez de um botão "tentar novamente"
  // que nunca vai funcionar (ver clinica.service.ts).
  if (temErro) {
    return (
      <View className="flex-1 bg-surface">
        <View className="px-5 pt-14 pb-5 bg-primary">
          <Text className="text-xl font-bold text-white">Clínicas Parceiras</Text>
          <Text className="text-sm mt-1 text-green-medium">
            Vincule seu pet a uma clínica
          </Text>
        </View>

        <View className="flex-1 items-center justify-center">
          <EstadoVazio
            icone="business-outline"
            tamanhoIcone={48}
            titulo="Em breve"
            subtitulo="A vinculação com clínicas parceiras estará disponível em uma próxima versão do Afetto."
          />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface">
      <View className="px-5 pt-14 pb-5 bg-primary">
        <Text className="text-xl font-bold text-white">Clínicas Parceiras</Text>
        <Text className="text-sm mt-1 text-green-medium">
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
        renderItem={renderizarCartao}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View className="mt-16">
            <EstadoVazio icone="search-outline" titulo="Nenhuma clínica encontrada" tamanhoIcone={40} />
          </View>
        }
      />
    </View>
  );
}
