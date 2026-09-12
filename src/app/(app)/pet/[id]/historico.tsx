import { EstadoErro } from "@/components/EstadoErro";
import { usePet } from "@/hooks/usePets";
import { useDeletarVacina, useVacinasPet } from "@/hooks/useVacinas";
import { Vacina } from "@/schemas/vacina.schema";
import { converterDataParaBR } from "@/utils/data";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

function ehFutura(dataIso: string): boolean {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const data = new Date(dataIso);
  data.setHours(0, 0, 0, 0);
  return data.getTime() >= hoje.getTime();
}

function ordenar(vacinas: Vacina[]): Vacina[] {
  return [...vacinas].sort((a, b) => {
    const aFutura = ehFutura(a.dataAplicacao);
    const bFutura = ehFutura(b.dataAplicacao);
    if (aFutura !== bFutura) return aFutura ? -1 : 1;

    const diffA = new Date(a.dataAplicacao).getTime();
    const diffB = new Date(b.dataAplicacao).getTime();
    return aFutura ? diffA - diffB : diffB - diffA;
  });
}

export default function TelaHistoricoVacinas() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: pet } = usePet(id);
  const { data: vacinas, isLoading, isError, refetch } = useVacinasPet(id);
  const { mutate: deletarVacina } = useDeletarVacina(id);

  function aoExcluir(vacina: Vacina) {
    Alert.alert(
      "Excluir vacina",
      `Tem certeza que deseja excluir "${vacina.nomeVacina}"? Esta ação não pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => deletarVacina(vacina.id),
        },
      ]
    );
  }

  const vacinasOrdenadas = ordenar(vacinas ?? []);

  return (
    <View className="flex-1 bg-surface">
      <View className="flex-row items-center gap-3 px-6 pt-14 pb-4">
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color="#1E3A2F" />
        </TouchableOpacity>
        <Text className="flex-1 text-lg font-bold text-gray-900" numberOfLines={1}>
          Histórico de {pet?.nome ?? "pet"}
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#E8A838" size="large" />
        </View>
      ) : isError ? (
        <EstadoErro
          mensagem="Erro ao carregar o histórico de vacinas. Tente novamente."
          onTentarNovamente={() => refetch()}
        />
      ) : (
        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {vacinasOrdenadas.length === 0 ? (
            <View className="items-center justify-center py-16 gap-2 px-8">
              <Ionicons name="medkit-outline" size={40} color="#9E9589" />
              <Text className="text-muted text-sm text-center">
                Nenhuma vacina cadastrada. Adicione a primeira na aba Cuidados.
              </Text>
            </View>
          ) : (
            <View className="gap-3 pb-24">
              {vacinasOrdenadas.map((vacina) => {
                const futura = ehFutura(vacina.dataAplicacao);
                return (
                  <View key={vacina.id} className="bg-white rounded-2xl p-4 gap-2 shadow-sm">
                    <View className="flex-row items-start justify-between gap-2">
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-gray-900">
                          {vacina.nomeVacina}
                        </Text>
                        <Text className="text-xs text-muted mt-0.5">
                          {converterDataParaBR(vacina.dataAplicacao)}
                        </Text>
                      </View>
                      <View
                        className={`rounded-full px-2 py-1 ${
                          futura ? "bg-blue-100" : "bg-green-medium"
                        }`}
                      >
                        <Text
                          className={`text-[10px] font-semibold ${
                            futura ? "text-blue-700" : "text-primary-dark"
                          }`}
                        >
                          {futura ? "Futura" : "Aplicada"}
                        </Text>
                      </View>
                    </View>

                    {vacina.lote && (
                      <Text className="text-xs text-gray-600">Lote: {vacina.lote}</Text>
                    )}
                    {vacina.observacoes && (
                      <Text className="text-xs text-gray-600">{vacina.observacoes}</Text>
                    )}

                    <View className="flex-row gap-4 mt-1">
                      <TouchableOpacity
                        onPress={() =>
                          // `as any`: expo-router typedRoutes não tipa querystring dinâmica.
                          router.push(`/pet/${id}/cuidados?vacinaId=${vacina.id}` as any)
                        }
                        className="flex-row items-center gap-1"
                        hitSlop={8}
                      >
                        <Ionicons name="pencil-outline" size={16} color="#1E3A2F" />
                        <Text className="text-xs font-medium text-primary">Editar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => aoExcluir(vacina)}
                        className="flex-row items-center gap-1"
                        hitSlop={8}
                      >
                        <Ionicons name="trash-outline" size={16} color="#ef4444" />
                        <Text className="text-xs font-medium text-red-500">Excluir</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}

      <TouchableOpacity
        onPress={() => router.push(`/pet/${id}/cuidados`)}
        activeOpacity={0.85}
        className="absolute bottom-8 right-6 w-14 h-14 rounded-full bg-primary items-center justify-center shadow-lg"
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}
