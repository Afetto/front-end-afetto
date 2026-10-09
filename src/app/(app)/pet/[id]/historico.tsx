import { mensagemDaApi } from "@/api/erros";
import { CabecalhoOla } from "@/components/CabecalhoOla";
import { CardPetResumo } from "@/components/CardPetResumo";
import { EstadoErro } from "@/components/EstadoErro";
import { useCancelarConsulta, useConsultasPet, useDeletarConsulta } from "@/hooks/useConsultas";
import { usePet } from "@/hooks/usePets";
import { useDeletarRemedio, useRemediosPet } from "@/hooks/useRemedios";
import { useDeletarVacina, useVacinasPet } from "@/hooks/useVacinas";
import { converterDataParaBR } from "@/utils/data";
import { EventoHistorico, montarHistorico, SituacaoEvento } from "@/utils/historico";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

// Vacinas, consultas e remédios do pet, todos vindos da API
const FILTROS = [
  { chave: "todos", label: "Todos", disponivel: true },
  { chave: "vacinas", label: "Vacinas", disponivel: true },
  { chave: "consultas", label: "Consultas", disponivel: true },
  { chave: "remedios", label: "Remédios", disponivel: true },
] as const;

type ChaveFiltro = (typeof FILTROS)[number]["chave"];

function passaNoFiltro(evento: EventoHistorico, filtro: ChaveFiltro): boolean {
  if (filtro === "vacinas") return evento.tipo === "vacina";
  if (filtro === "remedios") return evento.tipo === "remedio";
  if (filtro === "consultas") return evento.tipo === "consulta";
  return true;
}

const COR_DO_PONTO: Record<SituacaoEvento, string> = {
  atual: "bg-amber",
  futuro: "bg-blue-400",
  passado: "bg-green-medium",
};

function estiloDoSelo(evento: EventoHistorico): { fundo: string; texto: string } {
  if (evento.cancelada) return { fundo: "bg-gray-200", texto: "text-gray-600" };
  if (evento.tipo === "remedio") return { fundo: "bg-golden-pale", texto: "text-golden" };
  return evento.situacao === "futuro"
    ? { fundo: "bg-blue-100", texto: "text-blue-700" }
    : { fundo: "bg-green-medium", texto: "text-primary-dark" };
}

const TITULO_EXCLUIR = { vacina: "Excluir vacina", remedio: "Excluir remédio", consulta: "Excluir consulta" };

export default function TelaHistorico() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: pet } = usePet(id);
  const vacinas = useVacinasPet(id);
  const remedios = useRemediosPet(id);
  const consultas = useConsultasPet(id);
  const { mutate: deletarVacina } = useDeletarVacina(id);
  const { mutate: deletarRemedio } = useDeletarRemedio(id);
  const { mutate: deletarConsulta } = useDeletarConsulta(id);
  const { mutate: cancelarConsulta } = useCancelarConsulta(id);
  const [filtro, setFiltro] = useState<ChaveFiltro>("todos");

  const carregando = vacinas.isLoading || remedios.isLoading || consultas.isLoading;
  const comErro = vacinas.isError || remedios.isError || consultas.isError;

  function tentarDeNovo() {
    if (vacinas.isError) vacinas.refetch();
    if (remedios.isError) remedios.refetch();
    if (consultas.isError) consultas.refetch();
  }

  function aoEditar(evento: EventoHistorico) {
    // `as any`: expo-router typedRoutes não tipa querystring dinâmica.
    if (evento.tipo === "vacina") {
      router.push(`/pet/${id}/cuidados?vacinaId=${evento.id}` as any);
    } else if (evento.tipo === "remedio") {
      router.push(`/pet/${id}/remedio?remedioId=${evento.id}` as any);
    } else {
      router.push(`/pet/${id}/consulta?consultaId=${evento.id}` as any);
    }
  }

  function aoExcluir(evento: EventoHistorico) {
    const excluir = { vacina: deletarVacina, remedio: deletarRemedio, consulta: deletarConsulta }[evento.tipo];
    Alert.alert(
      TITULO_EXCLUIR[evento.tipo],
      `Tem certeza que deseja excluir "${evento.titulo}"? Esta ação não pode ser desfeita.`,
      [
        { text: "Voltar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: () => excluir(evento.id) },
      ]
    );
  }

  // Cancelar mantém a consulta no histórico, marcada como cancelada
  function aoCancelar(evento: EventoHistorico) {
    Alert.alert("Cancelar consulta", `Cancelar "${evento.titulo}"?`, [
      { text: "Voltar", style: "cancel" },
      {
        text: "Cancelar consulta",
        style: "destructive",
        onPress: () =>
          cancelarConsulta(evento.id, {
            onError: (erro) => Alert.alert("Não deu para cancelar", mensagemDaApi(erro)),
          }),
      },
    ]);
  }

  const eventos = montarHistorico(vacinas.data ?? [], remedios.data ?? [], consultas.data ?? []).filter(
    (evento) => passaNoFiltro(evento, filtro)
  );
  const totalConcluidos = eventos.filter((evento) => evento.situacao === "passado").length;
  const totalAtivos = eventos.length - totalConcluidos;

  const textoVazio = {
    todos: "Nenhum cuidado cadastrado.",
    vacinas: "Nenhuma vacina cadastrada.",
    consultas: "Nenhuma consulta cadastrada.",
    remedios: "Nenhum remédio cadastrado.",
  }[filtro];

  return (
    <View className="flex-1 bg-surface dark:bg-gray-900">
      <CabecalhoOla mostrarVoltar />

      <View className="px-6 -mt-8">{pet && <CardPetResumo pet={pet} />}</View>

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
                    ? "bg-white dark:bg-gray-800 border-border dark:border-gray-700"
                    : "bg-white dark:bg-gray-800 border-border dark:border-gray-700 opacity-40"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${ativo ? "text-white" : "text-muted dark:text-gray-400"}`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {carregando ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#E8A838" size="large" />
        </View>
      ) : comErro ? (
        <EstadoErro
          mensagem="Erro ao carregar o histórico de cuidados. Tente novamente."
          onTentarNovamente={tentarDeNovo}
        />
      ) : (
        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {/* Estatísticas — do que está no filtro escolhido */}
          <View className="flex-row gap-3 mt-4">
            <View className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-3 items-center shadow-sm">
              <Text className="text-xl font-bold text-gray-900 dark:text-white">{eventos.length}</Text>
              <Text className="text-[10px] text-muted dark:text-gray-400 text-center mt-0.5">
                eventos registrados
              </Text>
            </View>
            <View className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-3 items-center shadow-sm">
              <Text className="text-xl font-bold text-gray-900 dark:text-white">{totalConcluidos}</Text>
              <Text className="text-[10px] text-muted dark:text-gray-400 text-center mt-0.5">concluídos</Text>
            </View>
            <View className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-3 items-center shadow-sm">
              <Text className="text-xl font-bold text-gray-900 dark:text-white">{totalAtivos}</Text>
              <Text className="text-[10px] text-muted dark:text-gray-400 text-center mt-0.5">
                em uso ou próximos
              </Text>
            </View>
          </View>

          {/* Linha do tempo */}
          {eventos.length === 0 ? (
            <View className="items-center justify-center py-16 gap-2 px-8">
              <Ionicons name="medkit-outline" size={40} color="#9E9589" />
              <Text className="text-muted dark:text-gray-400 text-sm text-center">
                {textoVazio} Adicione no botão +.
              </Text>
            </View>
          ) : (
            <View className="mt-5 pb-24">
              {eventos.map((evento, indice) => {
                const ultimo = indice === eventos.length - 1;
                const selo = estiloDoSelo(evento);
                return (
                  <View key={evento.chave} className="flex-row gap-3">
                    {/* Linha do tempo (data + ponto + trilho) */}
                    <View className="items-center w-16">
                      <Text className="text-[10px] text-muted dark:text-gray-400 text-center">
                        {converterDataParaBR(evento.data)}
                      </Text>
                      <View
                        className={`w-3 h-3 rounded-full mt-1 ${
                          evento.cancelada ? "bg-gray-300" : COR_DO_PONTO[evento.situacao]
                        }`}
                      />
                      {!ultimo && <View className="flex-1 w-px bg-border dark:bg-gray-700 mt-1" />}
                    </View>

                    {/* Card do evento */}
                    <View className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-4 gap-1.5 shadow-sm mb-4">
                      <View className={`self-start rounded-full px-2 py-0.5 ${selo.fundo}`}>
                        <Text className={`text-[10px] font-bold ${selo.texto}`}>{evento.selo}</Text>
                      </View>

                      <Text className="text-base font-bold text-gray-900 dark:text-white">
                        {evento.titulo}
                      </Text>
                      <Text className="text-xs text-muted dark:text-gray-400">{evento.descricao}</Text>

                      {evento.extra && (
                        <Text className="text-[11px] text-muted dark:text-gray-400 mt-1">{evento.extra}</Text>
                      )}

                      <View className="flex-row flex-wrap gap-4 mt-2">
                        {evento.podeEditar && (
                          <TouchableOpacity
                            onPress={() => aoEditar(evento)}
                            className="flex-row items-center gap-1"
                            hitSlop={8}
                          >
                            <Ionicons name="pencil-outline" size={14} color="#1E3A2F" />
                            <Text className="text-xs font-medium text-primary dark:text-amber">Editar</Text>
                          </TouchableOpacity>
                        )}
                        {evento.podeCancelar && (
                          <TouchableOpacity
                            onPress={() => aoCancelar(evento)}
                            className="flex-row items-center gap-1"
                            hitSlop={8}
                          >
                            <Ionicons name="close-circle-outline" size={14} color="#9E9589" />
                            <Text className="text-xs font-medium text-muted dark:text-gray-400">Cancelar</Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          onPress={() => aoExcluir(evento)}
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
