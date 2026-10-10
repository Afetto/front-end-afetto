import { COR_TIPO_CALENDARIO } from "@/components/CalendarioMes";
import { useAgendaDoTutor } from "@/hooks/useCalendario";
import { EventoCalendario } from "@/services/calendario.service";
import { formatarDataISO, resumirAgenda, rotuloDia } from "@/utils/calendario";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

// Quantos dias à frente a Home olha
export const DIAS_AGENDA_INICIO = 14;

const ROTULO_TIPO: Record<string, string> = {
  CONSULTA: "Consulta",
  VACINA: "Vacina",
  PROXIMA_DOSE: "Próxima dose",
  REMEDIO: "Remédio",
};

type NomeIcone = React.ComponentProps<typeof Ionicons>["name"];

function Atalho({ icone, texto, onPress }: { icone: NomeIcone; texto: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="flex-1 items-center justify-center gap-2 bg-amber rounded-2xl py-4"
    >
      <Ionicons name={icone} size={22} color="#FFFFFF" />
      <Text className="text-white text-xs font-semibold text-center">{texto}</Text>
    </TouchableOpacity>
  );
}

function linhaDoEvento(evento: EventoCalendario): string {
  return [evento.nomePet, ROTULO_TIPO[evento.tipo], evento.hora && `às ${evento.hora}`, evento.tipo === "CONSULTA" && evento.detalhe]
    .filter(Boolean)
    .join(" · ");
}

type Props = {
  idUsuario: string;
  /** Pet para o atalho "Adicionar cuidado" quando o tutor tem um só; senão vai para a lista de pets. */
  idPetUnico?: string;
};

/**
 * Corpo da Home depois do onboarding: atalhos, os próximos compromissos de
 * todos os pets (14 dias) e os remédios em tratamento hoje.
 */
export function AgendaInicio({ idUsuario, idPetUnico }: Props) {
  const hoje = new Date();
  const inicio = formatarDataISO(hoje);
  const fim = formatarDataISO(new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + DIAS_AGENDA_INICIO));

  const { data: eventos, isLoading, isError, refetch } = useAgendaDoTutor(idUsuario, inicio, fim);
  const { proximos, emTratamento } = resumirAgenda(eventos ?? [], inicio);

  return (
    <View className="gap-6">
      {/* Atalhos */}
      <View className="flex-row gap-3">
        <Atalho icone="calendar-outline" texto="Agendar consulta" onPress={() => router.push("/(tabs)/clinica")} />
        <Atalho
          icone="add-circle-outline"
          texto="Adicionar cuidado"
          // `as any`: rota gerada por template literal, fora do que o typedRoutes infere.
          onPress={() => router.push((idPetUnico ? `/pet/${idPetUnico}/cuidados` : "/(tabs)/pets") as any)}
        />
      </View>

      {/* Próximos compromissos */}
      <View className="gap-3">
        <Text className="text-base font-semibold text-gray-800 dark:text-gray-200">
          Próximos {DIAS_AGENDA_INICIO} dias
        </Text>

        {isLoading ? (
          <ActivityIndicator color="#E8A838" />
        ) : isError ? (
          <TouchableOpacity onPress={() => refetch()} className="items-center py-2">
            <Text className="text-sm text-muted dark:text-gray-400">Não foi possível carregar a agenda.</Text>
            <Text className="text-amber font-semibold mt-1">Tentar novamente</Text>
          </TouchableOpacity>
        ) : proximos.length === 0 ? (
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm gap-1">
            <Text className="text-sm font-semibold text-gray-900 dark:text-white">Nada marcado por enquanto</Text>
            <Text className="text-xs text-muted dark:text-gray-400">
              Consultas, vacinas e próximas doses dos seus pets aparecem aqui.
            </Text>
          </View>
        ) : (
          <View className="gap-2">
            {proximos.map((evento, indice) => (
              <TouchableOpacity
                key={`${evento.tipo}-${evento.idReferencia}-${indice}`}
                // `as any`: rota gerada por template literal, fora do que o typedRoutes infere.
                onPress={() => router.push(`/pet/${evento.idPet}/calendario` as any)}
                activeOpacity={0.85}
                className="flex-row items-center gap-3 bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm"
              >
                <View className="w-14 items-center">
                  <Text className="text-xs font-bold text-primary dark:text-amber">{rotuloDia(evento.data)}</Text>
                </View>
                <View className={`w-1.5 self-stretch rounded-full ${COR_TIPO_CALENDARIO[evento.tipo]}`} />
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-900 dark:text-white">{evento.titulo}</Text>
                  <Text className="text-xs text-muted dark:text-gray-400">{linhaDoEvento(evento)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#9E9589" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Remédios em tratamento */}
      {emTratamento.length > 0 && (
        <View className="gap-3">
          <Text className="text-base font-semibold text-gray-800 dark:text-gray-200">Em tratamento hoje</Text>
          <View className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-2 shadow-sm">
            {emTratamento.map((remedio) => (
              <View key={remedio.idReferencia} className="flex-row items-center gap-3 py-2">
                <Ionicons name="medkit-outline" size={18} color="#E8A838" />
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-900 dark:text-white">{remedio.titulo}</Text>
                  <Text className="text-xs text-muted dark:text-gray-400">
                    {[remedio.nomePet, remedio.detalhe].filter(Boolean).join(" · ")}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
