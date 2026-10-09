import { CabecalhoOla } from "@/components/CabecalhoOla";
import { CardPetResumo } from "@/components/CardPetResumo";
import { EstadoErro } from "@/components/EstadoErro";
import { useConsultasPet } from "@/hooks/useConsultas";
import { useRemoverPet, usePet } from "@/hooks/usePets";
import { useRemediosPet } from "@/hooks/useRemedios";
import { useVacinasPet } from "@/hooks/useVacinas";
import { proximosCuidados as calcularProximosCuidados } from "@/utils/cuidados";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from "react-native";

function BotaoAcessoRapido({
  icone,
  texto,
  onPress,
}: {
  icone: React.ComponentProps<typeof Ionicons>["name"];
  texto: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="flex-1 items-center justify-center gap-2 bg-amber rounded-2xl py-4"
    >
      <Ionicons name={icone} size={22} color="#FFFFFF" />
      <Text className="text-white text-xs font-semibold">{texto}</Text>
    </TouchableOpacity>
  );
}

export default function TelaPrincipalPet() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: pet, isLoading: carregandoPet, isError: erroPet, refetch: refazerPet } = usePet(id);
  const { data: vacinas, isLoading: carregandoVacinas } = useVacinasPet(id);
  const { data: remedios, isLoading: carregandoRemedios } = useRemediosPet(id);
  const { data: consultas, isLoading: carregandoConsultas } = useConsultasPet(id);
  const { mutate: removerPet, isPending: excluindo } = useRemoverPet();

  function aoExcluir() {
    if (!pet) return;

    Alert.alert(
      "Excluir pet",
      `Tem certeza que deseja excluir ${pet.nome}? Esta ação não pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () =>
            removerPet(id, {
              onSuccess: () => router.replace("/(tabs)/pets"),
            }),
        },
      ]
    );
  }

  if (carregandoPet) {
    return (
      <View className="flex-1 items-center justify-center bg-surface dark:bg-gray-900">
        <ActivityIndicator color="#E8A838" size="large" />
      </View>
    );
  }

  if (erroPet || !pet) {
    return (
      <EstadoErro
        mensagem="Erro ao carregar os dados do pet. Tente novamente."
        onTentarNovamente={() => refazerPet()}
      />
    );
  }

  // Vacinas agendadas, remédios em uso ou que vão começar e consultas agendadas (ver utils/cuidados.ts)
  const proximosCuidados = calcularProximosCuidados(vacinas ?? [], remedios ?? [], consultas ?? []);

  return (
    <View className="flex-1 bg-surface dark:bg-gray-900">
      <CabecalhoOla mostrarVoltar />

      <View className="flex-1 px-6 gap-6 -mt-8">
        {/* Card do pet — sobrepõe o header, como no Figma */}
        <CardPetResumo pet={pet} onEditar={() => router.push(`/pet/${id}/editar`)} />

        {/* Acesso rápido */}
        <View className="gap-3">
          <Text className="text-sm font-semibold text-muted dark:text-gray-400">Acesso rápido</Text>
          <View className="flex-row gap-3">
            <BotaoAcessoRapido
              icone="heart-outline"
              texto="Cuidados"
              onPress={() => router.push(`/pet/${id}/cuidados`)}
            />
            <BotaoAcessoRapido
              icone="document-text-outline"
              texto="Histórico"
              onPress={() => router.push(`/pet/${id}/historico`)}
            />
            <BotaoAcessoRapido
              icone="calendar-outline"
              texto="Calendário"
              onPress={() => router.push(`/pet/${id}/calendario`)}
            />
          </View>
        </View>

        {/* Próximos cuidados */}
        <View className="gap-3">
          <Text className="text-base font-bold text-gray-900 dark:text-white">Próximos cuidados</Text>

          {carregandoVacinas || carregandoRemedios || carregandoConsultas ? (
            <ActivityIndicator color="#E8A838" />
          ) : proximosCuidados.length === 0 ? (
            <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
              <Text className="text-sm text-muted dark:text-gray-400">Nenhum cuidado agendado</Text>
            </View>
          ) : (
            <View className="gap-2">
              {proximosCuidados.map((cuidado) => (
                <View
                  key={cuidado.chave}
                  className="flex-row items-center gap-3 bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm"
                >
                  <View
                    className={`w-11 h-11 rounded-xl items-center justify-center ${
                      cuidado.destaque ? "bg-golden-pale" : "bg-green-medium"
                    }`}
                  >
                    <Ionicons
                      name="medkit-outline"
                      size={18}
                      color={cuidado.destaque ? "#D4921E" : "#1E3A2F"}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                      {cuidado.titulo}
                    </Text>
                    <Text className="text-xs text-muted dark:text-gray-400">{cuidado.subtitulo}</Text>
                  </View>
                  <View
                    className={`rounded-full px-2 py-1 ${
                      cuidado.destaque ? "bg-golden-pale" : "bg-green-medium"
                    }`}
                  >
                    <Text
                      className={`text-[10px] font-bold ${
                        cuidado.destaque ? "text-golden" : "text-primary-dark"
                      }`}
                    >
                      {cuidado.selo}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            onPress={() => router.push(`/pet/${id}/cuidados`)}
            activeOpacity={0.85}
            className="self-center items-center justify-center w-11 h-11 rounded-2xl bg-white dark:bg-gray-800 border border-border dark:border-gray-700 mt-1"
          >
            <Ionicons name="add" size={22} color="#1E3A2F" />
          </TouchableOpacity>
        </View>

        {/* Sugestões */}
        <View className="gap-2">
          <Text className="text-base font-bold text-gray-900 dark:text-white">Sugestões</Text>
          <Text className="text-sm text-muted dark:text-gray-400 leading-relaxed">
            Sem sugestões no momento. Em breve a IA do Afetto irá analisar o histórico do seu pet.
          </Text>
        </View>

        <TouchableOpacity
          onPress={aoExcluir}
          disabled={excluindo}
          activeOpacity={0.7}
          className="items-center justify-center py-3 rounded-2xl border border-red-500 mb-8"
        >
          {excluindo ? (
            <ActivityIndicator color="#ef4444" />
          ) : (
            <Text className="text-red-500 font-semibold">Excluir pet</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
