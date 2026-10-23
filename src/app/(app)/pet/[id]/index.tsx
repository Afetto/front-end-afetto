import { CabecalhoOla } from "@/components/CabecalhoOla";
import { CardPetResumo } from "@/components/CardPetResumo";
import { EstadoErro } from "@/components/EstadoErro";
import { useConsultasPet } from "@/hooks/useConsultas";
import { useRemoverPet, usePet } from "@/hooks/usePets";
import { useRemediosPet } from "@/hooks/useRemedios";
import { useVacinasPet } from "@/hooks/useVacinas";
import { proximosCuidados as calcularProximosCuidados, ProximoCuidado } from "@/utils/cuidados";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

type NomeIcone = React.ComponentProps<typeof Ionicons>["name"];

// Os mesmos ícones do SeletorTipoCuidado (Vacina | Remédio | Consulta)
const ICONE_TIPO: Record<ProximoCuidado["tipo"], NomeIcone> = {
  vacina: "shield-checkmark-outline",
  remedio: "medkit-outline",
  consulta: "calendar-outline",
};

function BotaoAcessoRapido({
  icone,
  texto,
  onPress,
}: {
  icone: NomeIcone;
  texto: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="flex-1 items-center justify-center gap-2 bg-amber rounded-2xl py-4"
    >
      {/* Verde-escuro sobre o âmbar: branco ali ficava com contraste de 2:1 */}
      <Ionicons name={icone} size={22} color="#152B22" />
      <Text className="text-primary-dark text-xs font-semibold">{texto}</Text>
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
    // Tela inteira rola (o header junto): com três cuidados na lista, o
    // "Excluir pet" ficava cortado no fim da tela em celulares menores
    <ScrollView
      className="flex-1 bg-surface dark:bg-gray-900"
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <CabecalhoOla mostrarVoltar comCardSobreposto />

      <View className="px-6 gap-6 -mt-8">
        {/* Card do pet — sobrepõe o header, como no Figma */}
        <CardPetResumo
          pet={pet}
          onEditar={() => router.push({ pathname: "/pet/[id]/editar", params: { id } })}
        />

        {/* Acesso rápido */}
        <View className="gap-3">
          <Text className="text-sm font-semibold text-muted dark:text-gray-400">Acesso rápido</Text>
          <View className="flex-row gap-3">
            <BotaoAcessoRapido
              icone="heart-outline"
              texto="Cuidados"
              onPress={() => router.push({ pathname: "/pet/[id]/cuidados", params: { id } })}
            />
            <BotaoAcessoRapido
              icone="document-text-outline"
              texto="Histórico"
              onPress={() => router.push({ pathname: "/pet/[id]/historico", params: { id } })}
            />
            <BotaoAcessoRapido
              icone="calendar-outline"
              texto="Calendário"
              onPress={() => router.push({ pathname: "/pet/[id]/calendario", params: { id } })}
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
                      name={ICONE_TIPO[cuidado.tipo]}
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

          {/* Botão com texto no lugar do "+" solto, no mesmo estilo do "Adicionar novo pet" */}
          <TouchableOpacity
            onPress={() => router.push({ pathname: "/pet/[id]/cuidados", params: { id } })}
            activeOpacity={0.85}
            className="flex-row items-center justify-center gap-2 py-3 rounded-2xl border border-amber"
          >
            <Ionicons name="add-circle-outline" size={18} color="#B07A0A" />
            <Text className="text-sm font-semibold text-amber-dark">Adicionar cuidado</Text>
          </TouchableOpacity>
        </View>

        {/* Ação destrutiva no fim da tela, com menos peso que as ações principais */}
        <TouchableOpacity
          onPress={aoExcluir}
          disabled={excluindo}
          activeOpacity={0.7}
          className="flex-row items-center justify-center gap-2 py-3 mt-2"
        >
          {excluindo ? (
            <ActivityIndicator color="#ef4444" />
          ) : (
            <>
              <Ionicons name="trash-outline" size={16} color="#ef4444" />
              <Text className="text-red-500 font-semibold">Excluir pet</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
