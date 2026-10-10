import { mensagemDaApi } from "@/api/erros";
import { CardClinica } from "@/components/CardClinica";
import { EstadoErro } from "@/components/EstadoErro";
import { EstadoVazio } from "@/components/EstadoVazio";
import { useAlternarFavorita, useClinicas } from "@/hooks/useClinicas";
import { usePerfilCompleto } from "@/hooks/usePerfilCompleto";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";

// Espera o tutor parar de digitar antes de buscar (evita uma chamada por letra)
const ESPERA_BUSCA_MS = 400;

const FILTROS = [
  { chave: "todas", label: "Todas" },
  { chave: "favoritas", label: "Favoritas" },
] as const;

type Filtro = (typeof FILTROS)[number]["chave"];

export default function TelaClinica() {
  const [texto, setTexto] = useState("");
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todas");

  useEffect(() => {
    const espera = setTimeout(() => setBusca(texto), ESPERA_BUSCA_MS);
    return () => clearTimeout(espera);
  }, [texto]);

  const { data: clinicas, isLoading, isError, refetch } = useClinicas({
    nome: busca,
    favoritas: filtro === "favoritas",
  });
  const { data: perfil } = usePerfilCompleto();
  const { mutate: alternarFavorita } = useAlternarFavorita();

  function aoAlternarFavorita(id: string, favorita: boolean) {
    alternarFavorita(
      { id, favorita },
      { onError: (erro) => Alert.alert("Não deu para salvar", mensagemDaApi(erro)) }
    );
  }

  // "Perto de você" usa o endereço do "Finalize seu cadastro" (ver clinica.service.ts)
  const semEndereco = perfil !== undefined && !perfil.endereco;

  return (
    <View className="flex-1 bg-surface dark:bg-gray-900">
      <View className="px-5 pt-14 pb-5 bg-primary gap-3">
        <View>
          <Text className="text-xl font-bold text-white">Clínicas Parceiras</Text>
          <Text className="text-sm mt-1 text-green-medium">As mais perto de você aparecem primeiro</Text>
        </View>

        <View className="flex-row items-center bg-white dark:bg-gray-800 rounded-xl px-3">
          <Ionicons name="search-outline" size={18} color="#9E9589" />
          <TextInput
            value={texto}
            onChangeText={setTexto}
            placeholder="Buscar clínica pelo nome"
            placeholderTextColor="#9E9589"
            autoCorrect={false}
            className="flex-1 py-3 px-2 text-base text-gray-900 dark:text-white"
          />
          {!!texto && (
            <TouchableOpacity onPress={() => setTexto("")} hitSlop={8} accessibilityLabel="Limpar busca">
              <Ionicons name="close-circle" size={18} color="#9E9589" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View className="flex-row gap-2 px-5 pt-4">
        {FILTROS.map((item) => {
          const ativo = filtro === item.chave;
          return (
            <TouchableOpacity
              key={item.chave}
              onPress={() => setFiltro(item.chave)}
              activeOpacity={0.8}
              className={`px-3 py-2 rounded-full border ${
                ativo ? "bg-amber border-amber" : "bg-white dark:bg-gray-800 border-border dark:border-gray-700"
              }`}
            >
              <Text className={`text-xs font-semibold ${ativo ? "text-white" : "text-muted dark:text-gray-400"}`}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {semEndereco && (
        <TouchableOpacity
          onPress={() => router.push("/completar-perfil")}
          className="mx-5 mt-3 flex-row items-center gap-2 bg-golden-pale rounded-xl p-3"
        >
          <Ionicons name="location-outline" size={16} color="#D4921E" />
          <Text className="flex-1 text-xs text-golden">
            Salve seu endereço em &quot;Finalize seu cadastro&quot; para ver as clínicas perto de você.
          </Text>
        </TouchableOpacity>
      )}

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#E8A838" size="large" />
        </View>
      ) : isError ? (
        <EstadoErro mensagem="Erro ao carregar as clínicas. Tente novamente." onTentarNovamente={() => refetch()} />
      ) : (
        <FlatList
          data={clinicas ?? []}
          keyExtractor={(clinica) => clinica.id}
          contentContainerStyle={{ padding: 20, flexGrow: 1 }}
          renderItem={({ item }) => (
            <CardClinica
              clinica={item}
              // `as any`: rota gerada por template literal, fora do que o typedRoutes infere.
              onPress={() => router.push(`/clinica/${item.id}` as any)}
              onAlternarFavorita={() => aoAlternarFavorita(item.id, item.favorita)}
            />
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-16">
              <EstadoVazio
                icone={filtro === "favoritas" ? "heart-outline" : "business-outline"}
                titulo={filtro === "favoritas" ? "Nenhuma favorita ainda" : "Nenhuma clínica encontrada"}
                subtitulo={
                  filtro === "favoritas"
                    ? "Toque no coração de uma clínica para guardá-la aqui."
                    : busca
                      ? "Tente outro nome."
                      : undefined
                }
              />
            </View>
          }
        />
      )}
    </View>
  );
}
