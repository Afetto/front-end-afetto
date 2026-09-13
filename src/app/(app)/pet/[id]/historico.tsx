import { CabecalhoOla } from "@/components/CabecalhoOla";
import { CardPetResumo } from "@/components/CardPetResumo";
import { EstadoErro } from "@/components/EstadoErro";
import { usePet } from "@/hooks/usePets";
import { useDeletarVacina, useVacinasPet } from "@/hooks/useVacinas";
import { Vacina } from "@/schemas/vacina.schema";
import { converterDataParaBR } from "@/utils/data";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

// A API só expõe o recurso "vacina" hoje — "Consultas" e "Remédios" ficam
// desabilitados na UI (sem dado real para mostrar) em vez de exibir algo
// fictício. Ver vacina.service.ts.
const FILTROS = [
  { chave: "todos", label: "Todos", disponivel: true },
  { chave: "vacinas", label: "Vacinas", disponivel: true },
  { chave: "consultas", label: "Consultas", disponivel: false },
  { chave: "remedios", label: "Remédios", disponivel: false },
] as const;

type ChaveFiltro = (typeof FILTROS)[number]["chave"];

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
  const [filtro, setFiltro] = useState<ChaveFiltro>("todos");

  function aoExcluir(vacina: Vacina) {
    Alert.alert(
      "Excluir vacina",
      `Tem certeza que deseja excluir "${vacina.nomeVacina}"? Esta ação não pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: () => deletarVacina(vacina.id) },
      ]
    );
  }

  const todasVacinas = vacinas ?? [];
  const vacinasOrdenadas = ordenar(todasVacinas);
  const totalAplicadas = todasVacinas.filter((v) => !ehFutura(v.dataAplicacao)).length;
  const totalProximas = todasVacinas.filter((v) => ehFutura(v.dataAplicacao)).length;

  return (
    <View className="flex-1 bg-surface">
      <CabecalhoOla mostrarVoltar />

      <View className="px-6 -mt-8">{pet && <CardPetResumo pet={pet} />}</View>

      {/* Filtros — só "Todos"/"Vacinas" têm dado real por trás */}
      <View className="flex-row gap-2 px-6 pt-5">
        {FILTROS.map((item) => {
          const ativo = filtro === item.chave;
          return (
            <TouchableOpacity
              key={item.chave}
              disabled={!item.disponivel}
              onPress={() => setFiltro(item.chave)}
              activeOpacity={0.8}
              className={`px-3 py-2 rounded-full border ${
                ativo
                  ? "bg-amber border-amber"
                  : item.disponivel
                    ? "bg-white border-border"
                    : "bg-white border-border opacity-40"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${ativo ? "text-white" : "text-muted"}`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
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
          {/* Estatísticas — derivadas só de dado real (vacinas do pet) */}
          <View className="flex-row gap-3 mt-4">
            <View className="flex-1 bg-white rounded-2xl p-3 items-center shadow-sm">
              <Text className="text-xl font-bold text-gray-900">{todasVacinas.length}</Text>
              <Text className="text-[10px] text-muted text-center mt-0.5">
                eventos registrados
              </Text>
            </View>
            <View className="flex-1 bg-white rounded-2xl p-3 items-center shadow-sm">
              <Text className="text-xl font-bold text-gray-900">{totalAplicadas}</Text>
              <Text className="text-[10px] text-muted text-center mt-0.5">aplicadas</Text>
            </View>
            <View className="flex-1 bg-white rounded-2xl p-3 items-center shadow-sm">
              <Text className="text-xl font-bold text-gray-900">{totalProximas}</Text>
              <Text className="text-[10px] text-muted text-center mt-0.5">
                eventos próximos
              </Text>
            </View>
          </View>

          {/* Linha do tempo */}
          {vacinasOrdenadas.length === 0 ? (
            <View className="items-center justify-center py-16 gap-2 px-8">
              <Ionicons name="medkit-outline" size={40} color="#9E9589" />
              <Text className="text-muted text-sm text-center">
                Nenhuma vacina cadastrada. Adicione a primeira na aba Cuidados.
              </Text>
            </View>
          ) : (
            <View className="mt-5 pb-24">
              {vacinasOrdenadas.map((vacina, indice) => {
                const futura = ehFutura(vacina.dataAplicacao);
                const ultimo = indice === vacinasOrdenadas.length - 1;
                return (
                  <View key={vacina.id} className="flex-row gap-3">
                    {/* Linha do tempo (dot + trilho) */}
                    <View className="items-center w-16">
                      <Text className="text-[10px] text-muted text-center">
                        {converterDataParaBR(vacina.dataAplicacao)}
                      </Text>
                      <View
                        className={`w-3 h-3 rounded-full mt-1 ${
                          futura ? "bg-blue-400" : "bg-green-medium"
                        }`}
                      />
                      {!ultimo && <View className="flex-1 w-px bg-border mt-1" />}
                    </View>

                    {/* Card do evento */}
                    <View className="flex-1 bg-white rounded-2xl p-4 gap-1.5 shadow-sm mb-4">
                      <View
                        className={`self-start rounded-full px-2 py-0.5 ${
                          futura ? "bg-blue-100" : "bg-green-medium"
                        }`}
                      >
                        <Text
                          className={`text-[10px] font-bold ${
                            futura ? "text-blue-700" : "text-primary-dark"
                          }`}
                        >
                          VACINA
                        </Text>
                      </View>

                      <Text className="text-base font-bold text-gray-900">
                        {vacina.nomeVacina}
                      </Text>
                      <Text className="text-xs text-muted">
                        {vacina.observacoes ||
                          (futura
                            ? "Próxima aplicação agendada."
                            : "Aplicada — sem observações registradas.")}
                      </Text>

                      {(vacina.fabricante || vacina.lote) && (
                        <Text className="text-[11px] text-muted mt-1">
                          {[
                            vacina.fabricante && `Fabricante: ${vacina.fabricante}`,
                            vacina.lote && `Lote: ${vacina.lote}`,
                          ]
                            .filter(Boolean)
                            .join(" • ")}
                        </Text>
                      )}

                      <View className="flex-row gap-4 mt-2">
                        <TouchableOpacity
                          onPress={() =>
                            // `as any`: expo-router typedRoutes não tipa querystring dinâmica.
                            router.push(`/pet/${id}/cuidados?vacinaId=${vacina.id}` as any)
                          }
                          className="flex-row items-center gap-1"
                          hitSlop={8}
                        >
                          <Ionicons name="pencil-outline" size={14} color="#1E3A2F" />
                          <Text className="text-xs font-medium text-primary">Editar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => aoExcluir(vacina)}
                          className="flex-row items-center gap-1"
                          hitSlop={8}
                        >
                          <Ionicons name="trash-outline" size={14} color="#ef4444" />
                          <Text className="text-xs font-medium text-red-500">Excluir</Text>
                        </TouchableOpacity>
                      </View>
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
