import { CalendarioMes, COR_TIPO_CALENDARIO } from "@/components/CalendarioMes";
import { EstadoErro } from "@/components/EstadoErro";
import { useCalendarioPet } from "@/hooks/useCalendario";
import { usePet } from "@/hooks/usePets";
import { EventoCalendario, TipoEventoCalendario } from "@/services/calendario.service";
import {
  agruparPorData,
  diaInicial,
  formatarDataISO,
  MesCalendario,
  mesDe,
  NOMES_MESES,
  periodoDoMes,
  somarMeses,
} from "@/utils/calendario";
import { converterDataParaBR } from "@/utils/data";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";

const LEGENDA: { tipo: TipoEventoCalendario; texto: string }[] = [
  { tipo: "CONSULTA", texto: "Consulta" },
  { tipo: "PROXIMA_DOSE", texto: "Próxima dose" },
  { tipo: "VACINA", texto: "Vacina" },
  { tipo: "REMEDIO", texto: "Remédio" },
];

const ROTULO_TIPO: Record<TipoEventoCalendario, string> = {
  VACINA: "VACINA",
  PROXIMA_DOSE: "PRÓXIMA DOSE",
  REMEDIO: "REMÉDIO",
  CONSULTA: "CONSULTA",
};

function detalheDoEvento(evento: EventoCalendario, hoje: string): string {
  const partes: string[] = [];
  if (evento.hora) partes.push(`às ${evento.hora}`);
  // A API chama de "Vacina aplicada" também a que ainda vai acontecer
  if (evento.tipo === "VACINA" && evento.data > hoje) partes.push("Aplicação agendada");
  else if (evento.detalhe) partes.push(evento.detalhe);
  if (evento.status === "AGENDADO") partes.push("agendada");
  if (evento.status === "CONCLUIDO") partes.push("realizada");
  return partes.join(" · ");
}

// Abre a edição do cuidado de onde o evento veio
function abrirEvento(idPet: string, evento: EventoCalendario) {
  // `as any`: expo-router typedRoutes não tipa querystring dinâmica.
  if (evento.tipo === "REMEDIO") {
    router.push(`/pet/${idPet}/remedio?remedioId=${evento.idReferencia}` as any);
  } else if (evento.tipo === "CONSULTA") {
    router.push(`/pet/${idPet}/consulta?consultaId=${evento.idReferencia}` as any);
  } else {
    router.push(`/pet/${idPet}/cuidados?vacinaId=${evento.idReferencia}` as any);
  }
}

export default function TelaCalendarioPet() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const hoje = formatarDataISO(new Date());

  const [mes, setMes] = useState<MesCalendario>(() => mesDe(new Date()));
  const [diaSelecionado, setDiaSelecionado] = useState(() => diaInicial(mesDe(new Date())));

  const { data: pet } = usePet(id);
  const { inicio, fim } = periodoDoMes(mes);
  const { data: eventos, isLoading, isError, refetch } = useCalendarioPet(id, inicio, fim);

  const eventosPorDia = agruparPorData(eventos ?? []);
  const tiposPorDia = Object.fromEntries(
    Object.entries(eventosPorDia).map(([dia, lista]) => [dia, lista.map((evento) => evento.tipo)])
  );
  const eventosDoDia = eventosPorDia[diaSelecionado] ?? [];

  function trocarMes(quantidade: number) {
    const novo = somarMeses(mes, quantidade);
    setMes(novo);
    setDiaSelecionado(diaInicial(novo));
  }

  return (
    <View className="flex-1 bg-surface dark:bg-gray-900">
      <View className="flex-row items-center gap-3 px-6 pt-14 pb-4">
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color="#1E3A2F" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900 dark:text-white">Calendário</Text>
          {pet && <Text className="text-xs text-muted dark:text-gray-400">Cuidados de {pet.nome}</Text>}
        </View>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Mês */}
        <View className="flex-row items-center justify-between mb-3">
          <TouchableOpacity onPress={() => trocarMes(-1)} hitSlop={8} accessibilityLabel="Mês anterior">
            <Ionicons name="chevron-back-circle-outline" size={28} color="#E8A838" />
          </TouchableOpacity>
          <Text className="text-base font-bold text-gray-900 dark:text-white">
            {NOMES_MESES[mes.mes]} {mes.ano}
          </Text>
          <TouchableOpacity onPress={() => trocarMes(1)} hitSlop={8} accessibilityLabel="Próximo mês">
            <Ionicons name="chevron-forward-circle-outline" size={28} color="#E8A838" />
          </TouchableOpacity>
        </View>

        {isError ? (
          <EstadoErro
            mensagem="Erro ao carregar o calendário. Tente novamente."
            onTentarNovamente={() => refetch()}
          />
        ) : (
          <>
            <CalendarioMes
              mes={mes}
              tiposPorDia={tiposPorDia}
              diaSelecionado={diaSelecionado}
              hoje={hoje}
              onSelecionarDia={setDiaSelecionado}
            />

            {/* Legenda */}
            <View className="flex-row flex-wrap gap-x-4 gap-y-1 mt-3">
              {LEGENDA.map((item) => (
                <View key={item.tipo} className="flex-row items-center gap-1">
                  <View className={`w-2 h-2 rounded-full ${COR_TIPO_CALENDARIO[item.tipo]}`} />
                  <Text className="text-[11px] text-muted dark:text-gray-400">{item.texto}</Text>
                </View>
              ))}
            </View>

            {/* Cuidados do dia escolhido */}
            <Text className="text-base font-bold text-gray-900 dark:text-white mt-6 mb-3">
              {diaSelecionado === hoje ? "Hoje" : converterDataParaBR(diaSelecionado)}
            </Text>

            {isLoading ? (
              <ActivityIndicator color="#E8A838" />
            ) : eventosDoDia.length === 0 ? (
              <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
                <Text className="text-sm text-muted dark:text-gray-400">Nenhum cuidado neste dia.</Text>
              </View>
            ) : (
              <View className="gap-2 pb-10">
                {eventosDoDia.map((evento, indice) => (
                  <TouchableOpacity
                    key={`${evento.tipo}-${evento.idReferencia}-${indice}`}
                    onPress={() => abrirEvento(id, evento)}
                    activeOpacity={0.85}
                    className="flex-row items-center gap-3 bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm"
                  >
                    <View className={`w-2 self-stretch rounded-full ${COR_TIPO_CALENDARIO[evento.tipo]}`} />
                    <View className="flex-1 gap-0.5">
                      <Text className="text-[10px] font-bold text-muted dark:text-gray-400">
                        {ROTULO_TIPO[evento.tipo]}
                      </Text>
                      <Text className="text-sm font-semibold text-gray-900 dark:text-white">{evento.titulo}</Text>
                      <Text className="text-xs text-muted dark:text-gray-400">{detalheDoEvento(evento, hoje)}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#9E9589" />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
